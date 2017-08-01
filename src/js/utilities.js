( function(_m) {
var REMOVE_ALL_EXIST_TAG_REGEX = new RegExp("([^\\x00-\\xFF]*)", "gm");
var RECOVER_ALL_EXIST_TAG_REGEX = new RegExp("&amp;#\\([^\\)]{1,}\\);", "gm");
_m.tagCSS = {};
_m.tag = {};

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

/*
 * ERROR_HANDLER will be moved when all io functions are ported to io package
 */
var ERROR_HANDLER = function(e) {
    console.log('Error: ' + e.message);
};

var REX_STRING_INSIDE_TAG = new RegExp("(<[^>]*>)", "gm");
var PINGYIN_CACHE = pinyinEngine.cache();

_m.util = {
    /*
      Todo: need to decide either return null or return empty string if there is no param appeared
    
    */
    convertToEscapeUnicode: convertToEscapeUnicode,
    converBackToUnicode: converBackToUnicode,
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

    urlParam: function(param) {
        var results = new RegExp('[\\?&]' + param + '=([^&#]*)').exec(window.location.href);
        if (results === null) {
            return null;
        } else {
            return results[1] || 0;
        }
    },
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
    removeDuplicatedTags: function(container) {
        
        $(container).find(".markup > .markup").filter(function() {
            var parent = $(this).parent();
            return ($(this).text() === parent.text() && $(this).attr("type") === parent.attr("type"));
        }).contents().unwrap();
    },

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

    recoverAllExistTag: function(txt) {

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
    /*
     *  Depecrated 
     */

    setup_reader: markus.io.readFile,
    saveAndMove: function(page) {
        var fileName = $(".doc").attr("fileName");
        markus.io.removeFile(fileName + ".html", function() {
            markus.io.save(fileName, function() {
                window.location = page + ".html?file=" + $(".doc").attr("fileName");
            });

        });
    },


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


var clickedMarkup = null;
$(document).on("click", ".doc", function() {
    $(".selected").removeClass("selected");
    $(".popover").hide();
    clickedMarkup = null;

    $(".justSelected.markup").removeClass("justSelected");
    // $(".justExtended").contents().unwrap();
    $(".justSelected,.justExtended").contents().unwrap();
});
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

