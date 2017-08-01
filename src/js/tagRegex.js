/**
 * tagRegex.js base file.
 * @module tagRegex.js
 */

 /**
 The class that holds the variables and functions created in the namespace of this file.
 The constrcutor of this object is only called once, because it is an anonymous function.

 @class tagRegex.js_anonymous
 @constructor
 @param {Object}  _m a reference to the Markus Configuration Object is passed
 **/
(function(_m) {
    /**
     * A function that returns a regular expresion based on the input
     *
     * @method tagRegexReplace
     * @param  {String} a UNUSED
     * @param  {String} b The tag name
     */
    var tagRegexReplace = function(a, b) {
        return "<[^>]{0,}" + b + "[^>]{0,}>[^<]{0,}<[^>]{0,}span>";
    };

    /**
     * Holds the regular expression pattern used to match against
     *
     * @property tagRegexPat
     * @type {Regex}
     */
    var tagRegexPat = /<([^>]{1,})>/g;

    /**
     * Creates the Regex class, that holds just one function: `translate`.
     * This translate function assembles a regular Expression based on the input.
     *
     * @class Regex
     */
    _m.regex = {

        /**
         * Translates one regular expression into another by replacing parts of it.
         *
         * @method translate
         * @param  {Regex} tagRegex the unmodified regular expression you want to translate
         */
        translate: function(tagRegex) {
            var regex = tagRegex.replace(tagRegexPat, tagRegexReplace);
            return regex;
        }
    };

})(markus);
