(class Plugin {
    constructor() {
        this.name = "Plugin";
        this.id = "plugin";
        this.version = "v1.0";
        this.author = "Plugin guy";
    }
    Load() {
        console.log("Loaded wow!");
    }
    Unload() {
        console.log("Wow");
    }
})