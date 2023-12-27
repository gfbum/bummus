(class Plugin {
    constructor() {
        this.name = "Character Counter";
        this.id = "charcounter";
        this.version = "v1.0.2";
        this.author = "Jiiks, square";
    }
    Load() {
        console.log("Loaded wow!");
    }
    Unload() {
        console.log("Wow");
    }
})