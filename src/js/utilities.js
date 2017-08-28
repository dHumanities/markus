/**
 * utilities.js base file.
 * @module utilities.js
 */

/**
The class that holds the variables and functions created in the namespace of this file.
The constrcutor of this object is only called once, because it is an anonymous function.

@class utilities.js_anonymous
@constructor
@param {Object}  _m a reference to the Markus Configuration Object is passed
**/
( function(_m) {
//Regular expressions used to find tags
var REMOVE_ALL_EXIST_TAG_REGEX = new RegExp("([^\\x00-\\xFF]*)", "gm");
var RECOVER_ALL_EXIST_TAG_REGEX = new RegExp("&amp;#\\([^\\)]{1,}\\);", "gm");

//defines the tagCSS and tag objects.
_m.tagCSS = {};
_m.tag = {};

/**
 * Escapes all unicode characters in the source that is passed as parameter and
 * returns the modified string.
 *
 * @for Util
 * @method convertToEscapeUnicode
 * @param  {String} source source
 * @return {String}        the unicode escaped string
 */
var convertToEscapeUnicode = function(source) {
    var result = [];
    for (var i = 0, j = source.length; i < j; i++) {
        if (source[i].match(/^[\x00-\xFF]*$/)) {
            result.push(source[i]);
        } else {
            result.push('&#(' + source.charCodeAt(i) + ');');
        }

    }
    return result.join("");
};

/**
 * Converts a unicode-escaped string generated using the `convertToEscapeUnicode` function back
 * to its unicode original. Pass a unicode-escaped string and get the unicode encoded string back.
 *
 * @for Util
 * @method converBackToUnicode
 * @param  {String} text the unicode-escaped string
 * @return {String}   the string containing unicode characters once again
 */
var converBackToUnicode = function(text) {
    var newValue = "";
    if (text.match(new RegExp("&(?:amp;){0,1}#\\(([^\\)]{1,})\\);", "gm"))) {

        newValue = text.replace(new RegExp("&(?:amp;){0,1}#\\(([^\\)]{1,})\\);", "gm"), function($0, $1, $2) {
            return String.fromCharCode($1);
        });
    } else {
        newValue = text;
    }
    return newValue;
};

/**
 * This is the default error handler. According to previous code documentation this function should be
 * moved to the `IO` package. This function does nothing but print 'Error: ' in front of the logging message
 * in the console.
 *
 * @method ERROR_HANDLER
 * @param  {Error} e the error that is encountered.
 */
var ERROR_HANDLER = function(e) {
    console.log('Error: ' + e.message);
};

//Find a String inside a tag
var REX_STRING_INSIDE_TAG = new RegExp("(<[^>]*>)", "gm");
//Working with PingYin.
var PINGYIN_CACHE = pinyinEngine.cache();

/**
The class that holds all the utility functions. This class is only declared once (technically a singleton).

@class Util
**/
_m.util = {
    /*
      Todo: need to decide either return null or return empty string if there is no param appeared

    */

   //defined above
    convertToEscapeUnicode: convertToEscapeUnicode,
  //defined above
    converBackToUnicode: converBackToUnicode,
    /**
     * This method will convert a Chinese character string to Ping Yin.
     *
     * @method chineseToPingYin
     * @param  {String} chineseString A string of Chinese Characters
     * @return {String} A string of Chinese annotated in Ping Yin
     */
    chineseToPingYin: function(chineseString) {
        var pingYin = [];
        for (var i = 0, j = chineseString.length; i < j; i++) {
            var pingYinChar;
            console.log(PINGYIN_CACHE[chineseString[i]]);
            if (!PINGYIN_CACHE[chineseString[i]]) {
                pingYinChar = chineseString[i];
            } else {
                var _temp = PINGYIN_CACHE[chineseString[i]][0];
                pingYinChar = _temp.charAt(0).toUpperCase() + _temp.slice(1);
            }
            pingYin.push(pingYinChar);
        }

        return pingYin.join("").split(' ').join('_');
    },

    /**
     * Reads the URL parameters that are included in the location (A.K.A the URL request bar
     * in the top of your browser. The address bar). Using this function you can request `GET` variables
     *
     * @method urlParam
     * @param  {String} param the name of the parameter we want to extract from the GET variables
     * @return {String}       the value of the parameter (probably URL encoded) as a String.
     */
    urlParam: function(param) {
        var results = new RegExp('[\\?&]' + param + '=([^&#]*)').exec(window.location.href);
        if (results === null) {
            return null;
        } else {
            return results[1] || 0;
        }
    },

    /**
     * Used to sort two comparable regex strings. This function is called  by
     * `array.sort`
     *
     * @method sortMergerdRegex
     * @param  {String} a Compare part A
     * @param  {String} b Compare part B
     * @return {Integer}   a number signifying if a should be before or after b
     */
    sortMergerdRegex: function(a, b) {
        var alength = a.indexOf("|");
        var blength = b.indexOf("|");
        if (alength < 0) {
            alength = a.length;
        }
        if (blength < 0) {
            blength = b.length;
        }
        return blength - alength;
    },

    /**
     * Removes duplicates from the passed array and returns only the unique
     * values found in that array.
     *
     * @method unique
     * @param  {Array} array the array to check for doubles
     * @return {Array}        the array that only contains the unique values from the input array
     */
    unique: function(array) {

        var temp = [];
        var result = [];
        for (var i = 0, j = array.length; i < j; i++) {
            temp[array[i]] = "";
        }
        for (var key in temp) {
            result.push(key);
        }
        return result;
    },

    /**
     * Makes sure that no embedded markup and tags can be created. Unwraps them using
     * JQuery.
     *
     * @method removeDuplicatedTags
     * @param  {Element} container The container to check for embedded markup
     */
    removeDuplicatedTags: function(container) {
        //finds instances of double markup embedding
        $(container).find(".markup > .markup").filter(function() {
            var parent = $(this).parent();
            return ($(this).text() === parent.text() && $(this).attr("type") === parent.attr("type"));
        }).contents().unwrap();
    },

    /**
     * Removes all remnants of tags using some more Regex magic
     *
     * @method removeAllExistTag
     * @param  {String} txt the text to remove the tags from
     * @return {String}     the cleaned string
     */
    removeAllExistTag: function(txt) {
        var newValue = txt.replace(
            REX_STRING_INSIDE_TAG, function($0, $1, $2) {
                if ($1.match(/^[\x00-\xFF]*$/)) {
                    return $1;
                } else {
                    return $1.replace(REMOVE_ALL_EXIST_TAG_REGEX, function($0, $1, $2) {
                        return convertToEscapeUnicode($1);
                    });
                }

            }
        );

        return newValue;
    },

    /**
     * Recovers all the existing tags using some Regex magic.
     *
     * @method recoverAllExistTag
     * @param  {String} txt the string we want to recover tags from
     * @return {String}     returns the newValue string in which the existing tags have been replaced
     */
    recoverAllExistTag: function(txt) {
        //Caching in a new object is not needed. Probably best to just
        //return the result of `txt.replace`
        var newValue = txt.replace(
            REX_STRING_INSIDE_TAG, function($0, $1, $2) {
                if ($1.match(RECOVER_ALL_EXIST_TAG_REGEX)) {

                    return $1.replace(new RegExp("&#\\(([^\\)]{1,})\\);", "gm"), function($0, $1, $2) {
                        return String.fromCharCode($1);
                    });
                } else {
                    return $1;
                }

            }
        );

        return newValue;
    },

    /**
     * Short hand for `markus.io.readFile`. Deprecated.
     *
     * @deprecated Use `markus.io.readFile`
     * @method setup_reader
     */
    setup_reader: markus.io.readFile,

    /**
     * Saves the current document and moves it to a new location. Another Shorthand
     * form, also deprecated?
     *
     * @method saveAndMove
     * @param  {String} page the url of the page you want to move to
     */
    saveAndMove: function(page) {
        var fileName = $(".doc").attr("fileName");
        markus.io.removeFile(fileName + ".html", function() {
            markus.io.save(fileName, function() {
                window.location = page + ".html?file=" + $(".doc").attr("fileName");
            });

        });
    },

    /**
     * Searches through all functions and tries to return it using the provided
     * pnamed parameter. It passes the function in its context. I.e:
     * You pass the string `"markus.io.readFile"` and as a return you get
     * the function `readFile` as a member of the `markus.io` object.
     *
     * @method searchFunctionByName
     * @param  {String} functionName Name of the function, preferred including the namespace.
     * @param  {Object} context     The object we're looking in.
     * @return {Function}           Returns the string you queried by name as a member of its context.
     */
    searchFunctionByName: function(functionName, context) {
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for (var i = 0, j = namespaces.length; i < j; i++) {
            context = context[namespaces[i]];
        }
        return context[func];
    }

};

} )(markus);

/**
 * A reference to the last clicked markup. Should this be in the Global namespace?
 * @for Global
 * @type {Object}
 * @property clickedMarkup
 */
var clickedMarkup = null;

/**
 * A click handler for the `.doc` class from the document scope. It
 * removes any `.selected` class and hides the `popover`.
 */
$(document).on("click", ".doc", function() {
    $(".selected").removeClass("selected");
    $(".popover").hide();
    clickedMarkup = null;

    $(".justSelected.markup").removeClass("justSelected");
    // $(".justExtended").contents().unwrap();
    $(".justSelected,.justExtended").contents().unwrap();
});

/**
 * Handles the application cache events. If the application cache is ready for
 * an update, the application cache is swapped and the location is reloaded.
 *
 * @for Global
 * @method handleAppCache
 */
var handleAppCache = function() {
    if (applicationCache === undefined) {
        return;
    }

    if (applicationCache.status == applicationCache.UPDATEREADY) {
        applicationCache.swapCache();
        location.reload();
        return;
    }

    applicationCache.addEventListener('updateready', handleAppCache, false);
};
