(class Plugin {
    constructor() {
        this.name = "Autogif";
        this.id = "autogif";
        this.version = "v1.1.0";
        this.author = "noodlebox";
        this.gifInterval = null;
    }
    Load() {
        this.gifInterval = setInterval(() => {
            //not the best way but the original code is fucked

            let images = $("span.image");

            if (images.length > 0) {
                for(var image of images) {
                    let node = $(image);
                    let src = $(node.children()[0]).attr('src');

                    if ($(`img.image[src="${src}"]`).length == 0) {
                        $(image).html(`<img class="image" src="${src}" href="${src}">`);
                    }
                }
            }

            /*

            let avatars = $(`div[class~="avatar-small"]`);
            let avatars2 = $(`div[class~="avatar-large"]`);

            avatars.push(...avatars2);

            if (avatars.length > 0) {
                for(var avatar of avatars) {
                    let node = $(avatar);
                    let style = node.attr('style');
                    let image = style.replace(`background-image: url("`, ``).replace(`");`, ``);
                    let beforeExt = image.split('.png')[0];

                    if (image && image.includes(".png") && !node.hasClass('donttryagain')) {
                        node.attr('style', `background-image: url("${beforeExt}.gif?size=256");`).on('error', function () {
                            console.log("error called1");

                            $(this).attr('style', `background-image: url("${beforeExt}.png?size=256");`).addClass('donttryagain');
                        });
                    }
                }
            }

            */

            //Super buggy, wouldn't count on it
        }, 50);
    }
    Unload() {
        clearInterval(this.gifInterval);
    }
})