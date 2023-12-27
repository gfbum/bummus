(class Plugin {
    constructor() {
        this.name = "Message Logger";
        this.id = "msglogger";
        this.version = "v1.0";
        this.author = "noia.site";
    }
    Load() {
        let dispatch = window.WebpackTools.findByProps("dispatch");

        window.BHApi.MonkeyPatch(dispatch, "dispatch", (dispatch) => {
            return dispatch.callOriginalMethod(dispatch.methodArguments);
        });
    }
    OnSettingsOpen() {
    }
    Unload() {
        window.WebpackTools.findByProps("dispatch").dispatch.unpatch();
    }
})