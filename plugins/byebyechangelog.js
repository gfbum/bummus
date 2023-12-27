(class Plugin {
    constructor() {
        this.name = "Bye Bye Changelog";
        this.id = "byebyechangelog";
        this.version = "v1.0";
        this.author = "noia.site";
    }
    Load() {

    }
    OnSettingsOpen() {
        if (document.querySelector(`div[class="change-log-button-container"]`)) {
            document.querySelector(`div[class="change-log-button-container"]`).remove();
        }
    }
    Unload() {
        console.log("Wow");
    }
})