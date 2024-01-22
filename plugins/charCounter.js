(class Plugin {
    constructor() {
        this.name = "Character Counter";
        this.id = "charcounter";
        this.version = "v1.0.2";
        this.author = "Jiiks, square";
        this.switchObserver = null;
    }
    Load() {
        this.InjectCSS();

        var ta = $(".content textarea").parent();

        if( !ta.length || $("#charcounter").length ) return;

        ta.append( $("<span/>", { 'id': 'charcounter', 'text': `${$(".content textarea").val().length}/4000` }));

        $(".content textarea").off("keyup.charcounter").on("keyup.charCounter", e =>
          $("#charcounter").text(`${e.target.value.length}/4000`)
        );

        this.InitObserver();
    }
    Unload() {
      $(".content textarea").off("keyup.charcounter");
      window.BHApi.ClearCSS("charCounter");
      this.switchObserver.disconnect();
    }
    InjectCSS() {
        window.BHApi.ClearCSS("charCounter");
        window.BHApi.InjectCSS("charCounter",
          `.chat form > :first-child {
            z-index: 1;
          }
          #charcounter {
            display: block;
            position: absolute;
            right: 0; bottom: -1.1em;
            opacity: .5;
        }`);
    }
    InitObserver() {
        var target;
        
        this.switchObserver = new MutationObserver(function(mutations) {
            if(Array.prototype.some.call(mutations, function({addedNodes}) {
                return Array.prototype.some.call(addedNodes, function(node) {
                    return node.classList != null && (node.classList.contains("chat") || node.classList.contains("messages-wrapper"));
                });
            }));

            var ta = $(".content textarea").parent();

            if( !ta.length || $("#charcounter").length ) return;
    
            ta.append( $("<span/>", { 'id': 'charcounter', 'text': `${$(".content textarea").val().length}/4000` }));
    
            $(".content textarea").off("keyup.charcounter").on("keyup.charCounter", e =>
              $("#charcounter").text(`${e.target.value.length}/4000`)
            );
        });

        if ((target = document.querySelector("#friends, .chat, .activityFeed-HeiGwL")) != null) {
            this.switchObserver.observe(target.parentNode, {childList: true, subtree: true});
        }
    }
})