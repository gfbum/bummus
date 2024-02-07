(class Plugin {
    constructor() {
        this.name = "Copy Code Plugin";
        this.id = "copycode";
        this.version = "v2.0";
        this.author = "Finicalmist";
        this.observer = null; // To store the reference to the mutation observer
    }

    Inject() {
        $("code.hljs").each(function() {
            if (!$(this).find('.copybutton').length) {
                $(this).css({
                    "position": "relative"
                });

                var button = $("<button>Copy</button>").addClass("copybutton").css({
                    "color": "#839496",
                    "border": "2px solid #282b30",
                    "background-color": "#2e3136",
                    "position": "absolute",
                    "right": "0",
                    "bottom": "0"
                });

                button.click(function() {
                    $(this).hide();
                    
                    var text = $(this).parent()[0];
                    var range = document.createRange();

                    range.selectNode(text);
                    window.getSelection().addRange(range);
                    
                    try {
                        document.execCommand('copy');
                    } catch (err) {}

                    window.getSelection().removeAllRanges();

                    $(this).show();
                });

                $(this).append(button);
            }
        });
    }

    observeMutations() {
        // Create a new mutation observer instance
        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check if a new code.hljs element has been added
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if ($(node).is('code.hljs')) {
                            // If a new code.hljs element is added, call Inject() to add the copy button
                            this.Inject();
                        }
                    }
                }
            });
        });

        // Start observing mutations in the document body
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    Load() {
        // Call Inject() to add the copy button to existing code.hljs elements
        this.Inject();
        // Start observing mutations
        this.observeMutations();
    }

    Unload() {
        $("code.hljs").css({
            "position": ""
        });

        $(".copybutton").remove();

        // Disconnect the mutation observer when unloading the plugin
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
});