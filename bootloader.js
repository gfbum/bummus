window.whatDoesThisDo = function (e) {
    return e && e.__esModule ? e : {
        "default": e
    }
}

window.hookedFunctions = [];

function waitForSelector(selector, callback, oneoff = false, timeout = 100) {
    var intervalId = setInterval(function() {
      if ($(selector).length > 0) {
        if (oneoff) { clearInterval(intervalId); }
        callback();
      }
    }, timeout);
}

window.BHStrings = {
    CurrentVersion: "V1.0"
};

window.BHApi = {
    Plugins: [{
        name: "Message Logger",
        id: "msg-logger",
        version: "v1.0",
        author: "yeah",
        enabled: true
    }],
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
    FindModuleByExport: function (name) {
        for (let i = 0; i < window.sortedModules.length; i++) {
            let mod = window.sortedModules[i];
    
            let module_id = mod[0];
    
            let n_thing = window.NThing(module_id);
            let default_thing = window.whatDoesThisDo(n_thing).default;
    
            if (typeof (default_thing) !== 'function' && default_thing) {
                if (default_thing[name] != undefined) {
                    if (window.hookedFunctions[name] != undefined) {
                        let original_method = default_thing[name];
    
                        default_thing[name] = function () {
                            let data = {
                                thisObject: this,
                                methodArguments: arguments,
                                originalMethod: original_method,
                                callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
                            };
    
                            return window.hookedFunctions[name](data);
                        }
    
                        return default_thing;
                    } else {
                        return default_thing;
                    }
                }
            }
        }
    
        return null;
    },
    HookExport: function (name, override) {
        let exported = window.BHApi.FindModuleByExport(name)[name];
    
        if (exported == null) {
            return false;
        }
    
        window.hookedFunctions[name] = override;
    
        return true;
    },
    HookExportV2: function (name, override) {
        if (!window.BHApi.HookExport(name, override)) {
            return false;
        }
    
        window.BHApi.FindModuleByExport(name)[name];
    
        return true;
    },
    OnLoaded: function() {
        window.BHApi.Toast(`BetterHummus ${window.BHStrings.CurrentVersion}`, "Loaded", 5000);

        waitForSelector(`form[class="form settings user-settings-modal"]`, function () {
            if (!document.querySelector(".betterhummus-management")) {
                if (!document.querySelector(".betterhummus-info")) {
                    $(`div[class="tab-bar SIDE"]`).append(`<div class="betterhummus-info"><h1>BetterHummus</h1><p>${window.BHStrings.CurrentVersion}</p><p>2 plugins loaded</p></div>`);
                }

                let experimentsButton = $("#app-mount > div > div:nth-child(6) > div.modal > div > form > div.settings-header > div > div.tab-bar-item:nth-child(12)");

                experimentsButton.addClass("betterhummus-management");
                experimentsButton.html(`BetterHummus`);

                experimentsButton.on('click', () => {
                    waitForSelector(`#app-mount > div > div:nth-child(6) > div.modal > div > form > div.settings-right > div.settings-inner > div > div`, function () {
                        let experimentsContent = $("#app-mount > div > div:nth-child(6) > div.modal > div > form > div.settings-right > div.settings-inner > div > div");
                        let pluginsHtml = ``;

                        for(var plugin of window.BHApi.Plugins) {
                            pluginsHtml += `<li><div class="checkbox" id="plugin-control-${plugin.id}"><div class="checkbox-inner"><input type="checkbox" value="on" ${plugin.enabled ? 'checked=""' : ''} id="${plugin.id}"><span></span></div><span>${plugin.name}</span>
                            </div></li>`;

                            waitForSelector(`#plugin-control-${plugin.id}`, () => {
                                $(`#plugin-control-${plugin.id}`).on('click', function () {
                                    plugin.enabled = !plugin.enabled;
    
                                    console.log("uhm event?");
    
                                    plugin.enabled ? window.BHApi.LoadPlugin(plugin.id, true) : window.BHApi.UnloadPlugin(plugin.id);
    
                                    plugin.enabled ? $(`#${plugin.id}`).attr("checked", "") : $(`#${plugin.id}`).removeAttr("checked");
                                });
                            }, true, 10);
                        }
        
                        experimentsContent.html(`<div class="control-groups" id="plugins"><div class="control-group"><label>Plugins</label><ul class="checkbox-group">${pluginsHtml}</ul></div></div>`)
                    }, true, 1);
                });
            }
        });
    }
}

setTimeout(() => {
    let token = document.body.appendChild(document.createElement `iframe`).contentWindow.localStorage.token;

    token = token.replace(/"/g, '');
    
    window.BHApi.FindModuleByExport('dispatch').dispatch({type:"LOGIN_SUCCESS",token:token}); // quick fix for my autism webpack modules hack consequence

    window.BHApi.HookExportV2("dispatch", function(dispatch) {
        /*
        if (dispatch.methodArguments[0].type == 'MESSAGE_DELETE') {
            let channelId = dispatch.methodArguments[0].channelId;
            let messageId = dispatch.methodArguments[0].id;
            let message = window.findModuleByExport('getMessages').getMessages(channelId)._map[messageId];

            console.log(`[LOG] Message deleted alert WHOA!! "${message.content}" SENT BY ${message.author.username}`);

            return;
        }
        */
    
        return dispatch.callOriginalMethod(dispatch.methodArguments);
    });

    window.addEventListener("devtoolschange", () => {
        console.clear();

        console.log("%c" + `BetterHummus (${window.BHStrings.CurrentVersion})`, "color: #7289DA; -webkit-text-stroke: 2px black; font-size: 72px; font-weight: bold;"),
        console.log("%c" + "bla bla dont paste code u dont know what it does in here", "font-size: 16px;"),
        console.log("%c" + "pew pew", "font-size: 18px; font-weight: bold; color: red;"),
        console.log("%c" + "check out the official server here: https://hummus.sys42.net/invite/Xnamt3u", "font-size: 16px;")
    })

    console.clear();

    waitForSelector(`div[class="friends-icon"]`, function () {
        window.BHApi.OnLoaded();
    }, true);
}, 1000);