window.BHStrings = {
    CurrentVersion: "V1.2"
};

window.BHApi = {
    Plugins: [],
    CachedExports: [],
    WpRequire: null,
    ClearCSS: function(id) {
        if (document.querySelector(id)) {
            document.querySelector(id).remove();
        }
    },
    InjectCSS: function(id, css) {
        var styleElement = document.createElement('style');

        styleElement.type = 'text/css';
        styleElement.id = id;

        styleElement.appendChild(document.createTextNode(css));

        document.head.appendChild(styleElement);
    },
    Toast: function (header, message, fadeOut = 300) {
        var toast_thing = $('<div>', {
            class: 'popout popout-top betterhummus-toast',
            style: 'overflow: hidden; visibility: visible; left: 190px; top: 884px; width: 216px; transform: translateY(-100%) translateX(-50%) translateZ(0px);',
            html: `<div class="status-picker popout-menu"><div class="popout-menu-item" style="background: #282b30; color: white;"><div class="status-icon-text"><span class="status status-online" style="margin-right: 14px;"></span><div class="status-text">${header}</div></div><div class="helper">${message}</div></div></div>`
        });

        var themeDark = $(`div[class="theme-dark"]`);

        themeDark.append(toast_thing);

        toast_thing.fadeOut(fadeOut);
    },
    WaitForSelector: function(selector, callback, oneoff = false, timeout = 100) {
        var intervalId = setInterval(function() {   
            if ($(selector).length > 0) {
              if (oneoff) { clearInterval(intervalId); }
              callback();
            }
        }, timeout);
    },
    SetupWebpackShit: function() {
        let wpRequire = webpackJsonp([], [(module, exports, require) => { module.exports = require }])

        const filterModules = (modules, single = false) => (filter) => {
            let foundModules = [];

            for (const mod in modules) {
                if (modules.hasOwnProperty(mod)) {
                    const module = modules[mod].exports;

                    if (!module) continue;

                    if (module.default && module.__esModule && filter(module.default)) {
                        if (single) return module.default;
                        foundModules.push(module.default);
                    }

                    if (filter(module)) {
                        if (single) return module;
                        else foundModules.push(module);
                    }
                }
            }
            if (!single) return foundModules;
        };

        let modules = wpRequire.c

        const find = filterModules(modules, true);
        const findAll = filterModules(modules);

        const propsFilter = (props) => (m) => props.every((p) => m[p] !== undefined);
        const dNameFilter = (name, defaultExp) => (defaultExp ? (m) => m.displayName === name : (m) => m?.default?.displayName === name);

        const findByProps = (...props) => find(propsFilter(props));
        const findByPropsAll = (...props) => findAll(propsFilter(props));
        const findByDisplayName = (name, defaultExp = true) => find(dNameFilter(name, defaultExp));
        const findByDisplayNameAll = (name, defaultExp = true) => findAll(dNameFilter(name, defaultExp));

        window.WebpackTools = {
            find,
            findAll,
            findByProps,
            findByPropsAll,
            findByDisplayName,
            findByDisplayNameAll,
        }
    },
    MonkeyPatch: function(what, methodName, newFunc) {
        //full credits to joe27g for this function - rip ED:
        //https://github.com/joe27g/EnhancedDiscord/blob/9e53d4860fb6b58cc3a36f0c2eafdcdb66401cf1/dom_shit.js

        if (!what || typeof what !== 'object')
            return console.error(`[BH] Failed to monkey patch method: ${methodName}`);

        const displayName = what.displayName || what.name || what.constructor.displayName || what.constructor.name;
        const origMethod = what[methodName];
        const cancel = () => {
            what[methodName] = origMethod;

            console.log(`%c[Modules]`, 'color: red;', `Unpatched ${methodName}`);

            return true;
        };

        what[methodName] = function() {
            const data = {
                thisObject: this,
                methodArguments: arguments,
                cancelPatch: cancel,
                originalMethod: origMethod,
                callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
            };
            return newFunc(data);
        };

        what[methodName].__monkeyPatched = true;
        what[methodName].displayName = 'patched ' + (what[methodName].displayName || methodName);
        what[methodName].unpatch = cancel;

        console.log(`%c[Modules]`, 'color: red;', `Patched ${methodName}`);

        return true;
    },
    ImportPlugin: function (url) {
        try {
            fetch(url).then(function (response) {
                return response.text();
            }).then(function (data) {
                if (!data.toLowerCase().includes("(class plugin") && !data.toLowerCase().includes("load")) {
                    let error = $(`<div class="account-warning" style="margin-top: 10px; margin-bottom: 10px;"><h3>An error occurred while loading your plugin!</h3><p>Be careful of what external URLs of .js code you paste in here!</p><b>It can potentially steal your Hummus account!</b></div>`);

                    error.insertBefore("#loadplugin").prev();
                    
                    error.fadeOut(5000);

                    return;
                }

                const Plugin = eval(data);
                const Instance = new Plugin();

                let alreadyImported = window.BHApi.Plugins.find(x => x.id == Instance.id);

                if (alreadyImported) {
                    let error = $(`<div class="account-warning" style="margin-top: 10px; margin-bottom: 10px;"><h3>An error occurred while loading your plugin!</h3><p>Be careful of what external URLs of .js code you paste in here!</p><b>It can potentially steal your Hummus account!</b></div>`);

                    error.insertBefore("#loadplugin").prev();
                    
                    error.fadeOut(5000);

                    console.error("[BH] Already imported this plugin. Ignoring.");
                    return;
                }

                window.BHApi.Plugins.push(Instance);

                window.BHApi.LoadPlugin(Instance.id);
            }).catch(function (error) {
                console.error(`[BH] Failed to import plugin: ${url}`);
                console.log(error);
            });
        }
        catch(error) {
            console.error(`[BH] Failed to import plugin: ${url}`);
            console.log(error);
        }
    },
    LoadPlugin: function(id) {
        try {
            let plugin = window.BHApi.Plugins.find(x => x.id.toLowerCase() == id.toLowerCase());

            if (!plugin) {
                console.error(`[BH] Failed to load plugin ID: ${id} as it isn't imported.`);
    
                return;
            }

            plugin.enabled = true;

            plugin.Load();

            console.log(`[BH] Loaded plugin: ${plugin.name} (ID: ${plugin.id}) by ${plugin.author} ${plugin.version}`);

            window.BHApi.Toast("Loaded Plugin", `${plugin.name} (ID: ${plugin.id}) by ${plugin.author} ${plugin.version}`, 15 * 1000);
        }
        catch(error) {
            console.error(`[BH] Failed to load plugin ID: ${id}`);
            console.log(error);
        }
    },
    LoadTheme: function(url) {
        try {
            fetch(url).then(function (response) {
                return response.text();
            }).then(function (data) {
                if (document.querySelector(`#custom-theme`)) {
                    window.BHApi.ClearCSS('#custom-theme');
                }

                window.BHApi.InjectCSS('custom-theme', data);
            }).catch(function (error) {
                console.error(`[BH] Failed to load theme: ${url}`);
                console.log(error);
            });
        }
        catch(error) {
            console.error(`[BH] Failed to load theme: ${url}`);
            console.log(error);
        }
    },
    UnloadPlugin: function (id, hard = false) {
        try {
            let plugin = window.BHApi.Plugins.find(x => x.id.toLowerCase() == id.toLowerCase());

            if (!plugin) {
                console.error(`[BH] Failed to unload plugin ID: ${id} as it isn't loaded.`);
    
                return;
            }
    
            plugin.Unload();

            console.log(`[BH] Unloaded plugin: ${id}`);

            if (hard) {
                window.BHApi.Plugins.splice(window.BHApi.Plugins.indexOf(plugin), 1);
            }
        }
        catch(error) {
            console.error(`[BH] Failed to unload plugin ID: ${id}`);
            console.log(error);
        }
    },
    OnLoaded: function() {
        window.BHApi.SetupWebpackShit();

        window.BHApi.Toast(`BetterHummus ${window.BHStrings.CurrentVersion}`, "Loaded", 5000);

        window.BHApi.WaitForSelector(`form[class="form settings user-settings-modal"]`, function () {
            if (!document.querySelector(".betterhummus-management")) {
                window.BHApi.Plugins.forEach(_ => _ && _.enabled && _.OnSettingsOpen && _.OnSettingsOpen());

                if (!document.querySelector(".betterhummus-info")) {
                    $(`div[class="tab-bar SIDE"]`).append(`<div class="betterhummus-info"><h1>BetterHummus</h1><p>${window.BHStrings.CurrentVersion}</p><p>${window.BHApi.Plugins.length} plugin(s) loaded</p></div>`);
                }

                let experimentsButton = $("#app-mount > div > div:nth-child(6) > div.modal > div > form > div.settings-header > div > div.tab-bar-item:nth-child(12)");

                experimentsButton.addClass("betterhummus-management");
                experimentsButton.html(`BetterHummus`);

                experimentsButton.on('click', () => {
                    window.BHApi.WaitForSelector(`#app-mount > div > div:nth-child(6) > div.modal > div > form > div.settings-right > div.settings-inner > div > div`, function () {

                        let experimentsContent = $("#app-mount > div > div:nth-child(6) > div.modal > div > form > div.settings-right > div.settings-inner > div > div");
                        let pluginsHtml = ``;

                        for(var plugin of window.BHApi.Plugins) {
                            pluginsHtml += `<li><div class="checkbox" id="plugin-control-${plugin.id}"><div class="checkbox-inner"><input type="checkbox" value="on" ${plugin.enabled ? 'checked=""' : ''} id="${plugin.id}"><span></span></div><span>${plugin.name}</span>
                            </div></li>`;

                            window.BHApi.WaitForSelector(`#plugin-control-${plugin.id}`, () => {
                                $(`#plugin-control-${plugin.id}`).on('click', function () {
                                    plugin.enabled = !plugin.enabled;
    
                                    plugin.enabled ? window.BHApi.LoadPlugin(plugin.id, true) : window.BHApi.UnloadPlugin(plugin.id);
    
                                    plugin.enabled ? $(`#${plugin.id}`).attr("checked", "") : $(`#${plugin.id}`).removeAttr("checked");
                                });
                            }, true, 10);
                        }
                        
                        if (window.BHApi.Plugins.length > 0) {
                            experimentsContent.html(`<div class="control-groups" id="plugins"><div class="control-group"><label>Plugins</label><ul class="checkbox-group">${pluginsHtml}</ul></div></div><div class="control-groups" id="loadplugin"><div class="control-group"><label>Load plugin from URL</label><input type="text" id="pluginURL" style="margin-bottom: 18px;" placeholder="https://betterhummus.com/plugins/example.js"><button type="button" class="btn btn-primary" style="width: 100%;" id="loadplugin-btn">Load</button></div><div class="control-group" style="margin-top: -140px;"><label>Load theme from URL</label><input type="text" id="themeURL" style="margin-bottom: 18px;" placeholder="https://betterhummus.com/themes/example.css"><div style="    width: 100%;    display: flex;    align-content: flex-start;    align-items: flex-start;"><button type="button" class="btn btn-primary" style="width: 50%;margin-bottom: 15px;margin-right: 5px;" id="resettheme-btn">Reset theme to default</button><button type="button" class="btn btn-primary" style="width: 50%;margin-left: 0px;" id="loadtheme-btn">Load</button></div></div></div>`)
                        } else {
                            experimentsContent.html(`<div class="control-groups" id="plugins"><div class="control-group"><label>Plugins</label><p>No plugins found.</p></div></div><div class="control-group"><label>Load plugin from URL</label><input type="text" id="pluginURL" style="margin-bottom: 18px;" placeholder="https://betterhummus.com/plugins/example.js"><button type="button" class="btn btn-primary" style="width: 100%;" id="loadplugin-btn">Load</button></div><div class="control-group" style="margin-top: -140px;"><label>Load theme from URL</label><input type="text" id="themeURL" style="margin-bottom: 18px;" placeholder="https://betterhummus.com/themes/example.css"><div style="    width: 100%;    display: flex;    align-content: flex-start;    align-items: flex-start;"><button type="button" class="btn btn-primary" style="width: 50%;margin-bottom: 15px;margin-right: 5px;" id="resettheme-btn">Reset theme to default</button><button type="button" class="btn btn-primary" style="width: 50%;margin-left: 0px;" id="loadtheme-btn">Load</button></div></div></div>`)
                        }

                        $(`#loadplugin-btn`).on('click', function () {
                            let pluginURL = $("#pluginURL").val();

                            window.BHApi.ImportPlugin(pluginURL);
                        });

                        $(`#resettheme-btn`).on('click', function () {
                            window.BHApi.ClearCSS('#custom-theme');
                        });

                        $(`#loadtheme-btn`).on('click', function () {
                            let themeURL = $("#themeURL").val();

                            window.BHApi.LoadTheme(themeURL);
                        });
                    }, true, 1);
                });
            }
        });
    }
}

window.addEventListener("devtoolschange", () => {
    console.clear();

    console.log("%c" + `BetterHummus (${window.BHStrings.CurrentVersion})`, "color: #7289DA; -webkit-text-stroke: 2px black; font-size: 72px; font-weight: bold;"),
    console.log("%c" + "bla bla dont paste code u dont know what it does in here", "font-size: 16px;"),
    console.log("%c" + "pew pew", "font-size: 18px; font-weight: bold; color: red;"),
    console.log("%c" + "check out the official server here: https://hummus.sys42.net/invite/Xnamt3u", "font-size: 16px;")
})

console.clear();

window.BHApi.WaitForSelector(`div[class="friends-icon"]`, function () {
    window.BHApi.OnLoaded();
}, true, 5000);