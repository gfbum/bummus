(class Plugin {
    constructor() {
        this.name = "Owner Tags";
        this.id = "ownertag";
        this.version = "v1.3.2";
        this.author = "noodlebox";
        this.lastGuildDone = null;
    }
    Load() {
        window.ownerTagInterval = setInterval(() => {
            let guildId = location.href.split('/').pop();

            //console.log(guildId + " compared to " + this.lastGuildDone);

            if (document.querySelector(".guild-header") && !document.querySelector("#ownerbadge") && guildId != this.lastGuildDone) {
                let getMembers = window.WebpackTools.findByProps("getMembers");
                let guild = window.WebpackTools.findByProps('getGuild').getGuild(guildId);
                let ownerId = guild.ownerId;
                let results = getMembers.getMembers(guildId);

                for(var result of results) {
                    if (result.userId == ownerId) {
                        $(`div[style*="${result.userId}"]`).parent().children().last().children().first().append(`<span class="bot-tag" id="ownerbadge" title="Guild owner">OWNER</span>`)
                    }
                }

                this.lastGuildDone = guildId;

                console.log(this.lastGuildDone);
            }
        }, 10);
    }
    Unload() {
        $("#ownerbadge").remove();

        clearInterval(window.ownerTagInterval);
    }
})