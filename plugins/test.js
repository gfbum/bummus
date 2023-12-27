(class Plugin {
    constructor() {
        this.name = "Test";
        this.id = "testPlugin";
        this.version = "v1.0";
        this.author = "The man plugin";
    }
    Load() {
        console.log("Loaded wow!");
    }
    Unload() {
        console.log("Wow");
    }
})