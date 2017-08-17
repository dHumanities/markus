/**
 * ui.js base file.
 * @module ui.js
 */

 /**
 The class that holds the variables and functions created in the namespace of this file.
 The constrcutor of this object is only called once, because it is an anonymous function.

 Some of the functions defined in this class are later added to the MARKUS global object and can
 from that point on be called as `markus.ui.FUNCTION_NAME`

 @class ui.js_anonymous
 @constructor
 @param {Object}  _m a reference to the Markus Configuration Object is passed
 **/
( function(_m) {

/*
  require keypress.js
*/
/**
 * Create a new keyPress listener that listens to all keypresses in the whole window,
 * regardless of focus element. This object holds that listener
 *
 * @for UI
 * @property listener
 * @type {Listener}
 */
var listener = new window.keypress.Listener();

//Define the CTRL+S = save keyPresss
listener.simple_combo("meta s", function() {
    $("#save").trigger("click");
});
//Define the CTRL+' = edit document keyPress
listener.simple_combo("meta '", function() {
    $("#editDocBtn").trigger("click");
});
//Define the CTRL+J = show modal keypress
listener.simple_combo("meta j", function() {
    $("#showGotoModalBtn").trigger("click");
});
//Define the CTRL+D = Go through all the markups and remove them??
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

listener.simple_combo("meta =", function() {   
      
    var fontSize = $(".doc pre").css('font-size');
    
    if (fontSize){
        fontSize = parseInt(fontSize) + 1;

    } else {
        fontSize = "14";
        
    }
    $(".doc pre").css('font-size',fontSize+"px");
    return false;
});

listener.simple_combo("meta -", function() {   
    
    var fontSize = $(".doc pre").css('font-size');
    if (fontSize){
        fontSize = Math.max(10,parseInt(fontSize) - 1);

    } else {
        fontSize = "12";
        
    }
    $(".doc pre").css('font-size',fontSize+"px");
    return false;
});

/**
 * This method will transfer your focus from the currently selected markup instance
 * to the next one in the document with the same type.
 *
 * @for ui.js_anonymous
 * @method nextSameTypeMarkup
 */
function nextSameTypeMarkup(){
    //If there is an element selected we can find the next markup type
    if ($(".selected").length > 0){
      var countIndex = -1;
      var nextIndex = -1;

      //find the type of the markup we have selected right now
      var type = $(".doc .selected").attr("type");
      //get all the markups of that type
      var markups = $(".doc .markup."+type);

      //For each of the markups, find the one that is next to the selected one
      markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex +1}});

      //If the length is not longer than the array length
      if (markups.length > nextIndex) {
          //retrieve the markup that is the next one to the one we have currently selected
          var obj = $(markups[nextIndex]);
          //Trigger a click on it
          $(obj).trigger("click");
          //If it is not on screen yet, we animat to it
          if (!$(obj).isOnScreen()){
              $('html, body').animate({
                  scrollTop: $(obj).offset().top - 100
              }, 200);
          }
      }
    //If we have nothing selected, but we do have markup, we go to the first markup instance
    } else if ($(".doc .markup").length > 0){
      $($(".doc .markup")[0]).trigger("click");
    }
}

/**
 * Finds the next markup after the currently selected markup instance and will transfer
 * the focus by generating a click on the next element. This is markup_type agnostic.
 *
 * @for ui.js_anonymous
 * @method nextMarkup
 * @param  {Boolean} _sameType This Parameter is currently unused. TODO: Remove it, or fix it
 */
function nextMarkup(_sameType){
  //If we have an element selected, we start to look for the next element
  if ($(".selected").length > 0){
    var countIndex = -1;
    var nextIndex = -1;

    //Find all the generic markups
    var markups = $(".doc .markup");
    //Go through all of the markups and find the one that is selected, find the one after that
    markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex +1}});

    //Check if the nextIndex is actually a valid index in the array (index < array.length)
    if (markups.length > nextIndex) {
        //get the objet that must be the next markup
        var obj = $(markups[nextIndex]);
        //trigger a click on it
        $(obj).trigger("click");

        //and if it is not onscreen, smoothly scroll to it now
        if (!$(obj).isOnScreen()){
            $('html, body').animate({
                scrollTop: $(obj).offset().top - 100
            }, 200);
        }
    }
  //If we don't have any element selected, we just go to the first markup element and
  //trigger a click on it
  } else if ($(".doc .markup").length > 0){
    $($(".doc .markup")[0]).trigger("click");
  }
}

/**
 * Finds the previous markup before the currently selected markup instance and will transfer
 * the focus by generating a click on the previous element. This is markup_type agnostic.
 *
 * @for ui.js_anonymous
 * @method lastMarkup
 */
function lastMarkup(){
  //If we currently have something selected
  if ($(".selected").length > 0){
    var countIndex = -1;
    var nextIndex = -1;
    //Find all the markups in the document
    var markups = $(".doc .markup");

    //Go through all the markups and find the one that is the selected, go back one after that
    markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex -1}});
    //Check if that index is valid
    if (nextIndex > -1) {
        //Get the object at that index
        var obj = $(markups[nextIndex]);
        //Trigger a click on this markup
        $(obj).trigger("click");

        //If it is not currently onScreen, smoothly scroll to it
        if (!$(obj).isOnScreen()){
            $('html, body').animate({
                scrollTop: $(obj).offset().top - 100
            }, 200);
        }
    }
    //IF there is no current selection, we just focus on the first markup instance
  }else if ($(".doc .markup").length > 0){
    $($(".doc .markup")[0]).trigger("click");
  }
}

/**
 * Finds the previous markup before the currently selected markup instance and will transfer
 * the focus by generating a click on the previous element. This will only go through the instances
 * of the same markup_type.
 *
 * @for ui.js_anonymous
 * @method lastSameTypeMarkup
 */
function lastSameTypeMarkup(){
  //If we currently have an element selected
  if ($(".selected").length > 0){
    var countIndex = -1;
    var nextIndex = -1;
    //Find the type of the markup
    var type = $(".doc .selected").attr("type");
    //Find all the markups of that type
    var markups = $(".doc .markup."+type)

    //Go through all of them, find the selected one. go back one index to find the previous markup.
    markups.each(function(){countIndex++; if ($(this).hasClass("selected")){nextIndex = countIndex -1}});

    //If this is still a valid array index
    if (nextIndex > -1) {
        //Get the markup from the array
        var obj = $(markups[nextIndex]);
        //trigger a click on it
        $(obj).trigger("click");

        //If the markup is not on screen, smoothly scroll to it
        if (!$(obj).isOnScreen()){
            $('html, body').animate({
                scrollTop: $(obj).offset().top - 100
            }, 200);
        }
    }
    //If we didn't have anything selected right now
  }else if ($(".doc .markup").length > 0){
    //Just trigger a click on the first markup
    $($(".doc .markup")[0]).trigger("click");
  }
}

//Define that CTRL+RIGHT = goto next markup in the document
listener.register_combo({
    "keys"              : "meta right",
    "on_keyup"          : nextMarkup,
    "prevent_default"   : true,
    "is_exclusive"      : true
});

//Define that CTRL+SHIFT+RIGHT = goto next markup with same type in the document
listener.register_combo({
    "keys"              : "meta shift right",
    "on_keyup"          : nextSameTypeMarkup,
    "prevent_default"   : true,
    "is_exclusive"      : true
});
//Define that CTRL+LEFT = goto previous markup in the document
listener.register_combo({
    "keys"              : "meta left",
    "on_keyup"          : lastMarkup,
    "prevent_default"   : true,
    "is_exclusive"      : true
});
//Define that CTRL+SHIFT+LEFT = goto previous markup with same type in the document
listener.register_combo({
    "keys"              : "meta shift left",
    "on_keyup"          : lastSameTypeMarkup,
    "prevent_default"   : true,
    "is_exclusive"      : true
});


/**
 * Creates the markus.ui object and associates its member varaible listener with
 * the predefined listener variable from the ui.js_anonymous class. You can use this
 * class to gain access to the keyPress listener that was registered here.
 *
 * @class UI
 */

 if (_m.ui == null) {
    _m.ui = {};
 }
_m.ui.listener = listener;

} )(markus);
