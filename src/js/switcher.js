/**
 * switcher.js base file.
 * @module switcher.js
 */


  /**
  The class that holds the variables and functions created in the namespace of this file.
  The constrcutor of this object is only called once, because it is an anonymous function.

  @class switcher.js_anonymous
  @constructor
  @param {Object}  _m a reference to the Markus Configuration Object is passed
  **/
( function(_m) {
//If the markus.ui object has not been defined yet, define it here
if (_m.ui == null) {
    _m.ui = {};
}


/**
 * Creates the `markus.ui.colorSwitcher` class. This class has only one method:
 * `regist(target, buttonSelector, doc)`.
 *
 * @class ColorSwitcher
 */
_m.ui.colorSwitcher = {
    /**
     * Registers what a color switcher does when it is clicked. When you click a
     * color switcher it switches through the different states of color:
     * `.noColor`, `.bordered`, no CSS class and back to `noColor` to complete the loop.
     *
     * @method regist
     * @param  {Element} target        the colorSwitcher element
     * @param  {String} buttonSelector Selector, only triggers color switch if this one is clicked
     * @param  {Element} doc           Reference to the document to find all other instances of this class
     */
    regist: function(target, buttonSelector, doc) {
      //log the target as a JQuery object
        console.log($(target));
        $(target).on("click", buttonSelector, function() {
            var colorSwitchedClass = $(this).attr("color-switcher-class");

            //If it was set at al
            if (colorSwitchedClass) {

                // noColor -> bordered -> no CSS Class -> no Color. ...

                if ($(this).hasClass("noColor")) {
                  //Remove the noColor class and tagReset from the tag clicked
                    $(this).removeClass("noColor").removeClass("tagReset");
                    $(this).addClass("bordered");
                    //Remove the noColor class and TagReset from all the other tags of this type
                    $(doc).find("." + colorSwitchedClass).removeClass("noColor").removeClass("tagReset");
                    // $(doc).find("." + colorSwitchedClass).removeClass("tagReset");
                    $(doc).find("." + colorSwitchedClass).addClass("bordered");
                    //Set its global status to bordered
                    markus.tag[colorSwitchedClass]["status"] = "bordered";

                } else if ($(this).hasClass("bordered")) {
                    //Remove the noColor and bordered class from the clicked element
                    $(this).removeClass("noColor");
                    $(this).removeClass("bordered");
                    $(this).addClass("tagReset");
                    //Remove the noColor and bordered class from all others of same type
                    $(doc).find("." + colorSwitchedClass).removeClass("noColor").removeClass("bordered");
                    $(doc).find("." + colorSwitchedClass).addClass("tagReset");
                    markus.tag[colorSwitchedClass]["status"] = "tagReset";
                } else if ($(this).hasClass("tagReset")) {
                    // $(this).addClass("noColor");
                    $(this).removeClass("bordered").removeClass("tagReset").removeClass("noColor");
                    $(doc).find("." + colorSwitchedClass).removeClass("bordered").removeClass("tagReset").removeClass("noColor");
                    markus.tag[colorSwitchedClass]["status"] = "";

                } else {
                    $(this).addClass("noColor");
                    $(this).removeClass("bordered").removeClass("tagReset");
                    $(doc).find("." + colorSwitchedClass).removeClass("bordered").removeClass("tagReset");
                    $(doc).find("." + colorSwitchedClass).addClass("noColor");
                    markus.tag[colorSwitchedClass]["status"] = "noColor";
                }
            }
        });
    }
};



} )(markus);


/**
 * Global function that registers the base color switcher
 *
 * @for Global
 * @method registColorSwitcher
 */
var registColorSwitcher = function() {
    markus.ui.colorSwitcher.regist("#buttonsRow", "button.switcher", ".doc");
}
