( function(_m) {

/*
  require keypress.js
*/
var listener = new window.keypress.Listener();

        listener.simple_combo("meta s", function() {
            $("#save").trigger("click");
        });
        listener.simple_combo("meta '", function() {
            $("#editDocBtn").trigger("click");
        });
        listener.simple_combo("meta j", function() {            
            $("#showGotoModalBtn").trigger("click");            
        });
        listener.simple_combo("meta d", function() {            
            if ($('#popover').hasClass('in')){
                var countIndex = -1;
                var nextIndex = -1;
                var markups = $(".doc .markup");
                markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex +1}});
                $('#popover .glyphicon-trash').trigger("click");
                var obj = $(markups[nextIndex]);
                $(obj).trigger("click");
                if (!$(obj).isOnScreen()){
                    $('html, body').animate({
                        scrollTop: $(obj).offset().top - 100
                    }, 200);
                }
            }           
        });

function nextSameTypeMarkup(){
          if ($(".selected").length > 0){
            var countIndex = -1;
            var nextIndex = -1;
            var type = $(".doc .selected").attr("type");
            var markups = $(".doc .markup."+type)
            markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex +1}});
            if (markups.length > nextIndex) {
                var obj = $(markups[nextIndex]);
                $(obj).trigger("click");
                if (!$(obj).isOnScreen()){
                    $('html, body').animate({
                        scrollTop: $(obj).offset().top - 100
                    }, 200);
                }
            }

          } else if ($(".doc .markup").length > 0){
            $($(".doc .markup")[0]).trigger("click");
          } 
        }        

        function nextMarkup(_sameType){
          if ($(".selected").length > 0){
            var countIndex = -1;
            var nextIndex = -1;
            var markups = $(".doc .markup");
            markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex +1}});
            if (markups.length > nextIndex) {
                var obj = $(markups[nextIndex]);
                $(obj).trigger("click");
                if (!$(obj).isOnScreen()){
                    $('html, body').animate({
                        scrollTop: $(obj).offset().top - 100
                    }, 200);
                }
            }

          } else if ($(".doc .markup").length > 0){
            $($(".doc .markup")[0]).trigger("click");
          }
        }

        function lastMarkup(){
          if ($(".selected").length > 0){
            var countIndex = -1;
            var nextIndex = -1;
            var markups = $(".doc .markup");
            markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex -1}});
            if (nextIndex > -1) {
                var obj = $(markups[nextIndex]);
                $(obj).trigger("click");
                if (!$(obj).isOnScreen()){
                    $('html, body').animate({
                        scrollTop: $(obj).offset().top - 100
                    }, 200);
                }
            }
          }else if ($(".doc .markup").length > 0){
            $($(".doc .markup")[0]).trigger("click");
          }
        }

        function lastSameTypeMarkup(){
          if ($(".selected").length > 0){
            var countIndex = -1;
            var nextIndex = -1;
            var type = $(".doc .selected").attr("type");
            var markups = $(".doc .markup."+type)
            markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex -1}});
            if (nextIndex > -1) {
                var obj = $(markups[nextIndex]);
                $(obj).trigger("click");
                if (!$(obj).isOnScreen()){
                    $('html, body').animate({
                        scrollTop: $(obj).offset().top - 100
                    }, 200);
                }
            }
          }else if ($(".doc .markup").length > 0){
            $($(".doc .markup")[0]).trigger("click");
          }
        }
        


        listener.register_combo({
            "keys"              : "meta right",
            "on_keyup"          : nextMarkup,
            "prevent_default"   : true,
            "is_exclusive"      : true
        });
        listener.register_combo({
            "keys"              : "meta shift right",
            "on_keyup"          : nextSameTypeMarkup,
            "prevent_default"   : true,
            "is_exclusive"      : true
        });
        listener.register_combo({
            "keys"              : "meta left",
            "on_keyup"          : lastMarkup,
            "prevent_default"   : true,
            "is_exclusive"      : true
        });
        listener.register_combo({
            "keys"              : "meta shift left",
            "on_keyup"          : lastSameTypeMarkup,
            "prevent_default"   : true,
            "is_exclusive"      : true
        });



_m.ui = {
    listener: listener,

};




} )(markus);

