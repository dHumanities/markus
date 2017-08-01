/**
 * io.js base file.
 * @module io.js
 */

 /**
 The class that holds the variables and functions created in the namespace of this file.
 The constrcutor of this object is only called once, because it is an anonymous function.

 The functions defined in this class are later added to the MARKUS global object and can
 from that point on be called as `markus.io.FUNCTION_NAME`

 @class io.js_anonymous
 @constructor
 @param {Object}  _m a reference to the Markus Configuration Object is passed
 **/
( function(_m) {
/**
 * Creates an error Handler function. This function prints out the error message
 * prefaced by 'Error', to make it easier to spot in the console log.
 *
 * @method ERROR_HANDLER
 * @param  {Error} e The error that has happened
 */
var ERROR_HANDLER = function(e) {
    console.log('Error: ' + e.message);
};

/**
 * Updates the color switchers for the tagNames. This is called on load. It
 * hides or shows buttons depending on their visibility and changes the color-switcher-class
 * based on their status
 *
 * This method is defined in the io.js anonymous function but later attached to the `markus.io` object
 *
 * @for IO
 * @method updateSwitchers
 */
var updateSwitchers = function() {
    //If there are buttons on the buttonsRow
    if ($("#buttonsRow").length > 0) {

        //For each of the tagNames that have been defined in the markus tag module
        for (var tagName in _m.tag) {
            //Either use the predefined buttonName or just the tagname and get the status of the tag
            var buttonName = _m.tag[tagName]["buttonName"] || tagName;
            var status = _m.tag[tagName]["status"] || "";

            //If we can't find the color-switcher-class for that tagName
            if ($("#buttonsRow").find("button[color-switcher-class='" + tagName + "']").length == 0) {
                //We add a color-switcher-class for that tagName
                $("#buttonsRow").prepend('<button type="button" class="btn btn-sm switcher ' + tagName + ' ' + status + '" color-switcher-class="' + tagName + '" data-toggle="tooltip" data-placement="auto" title="" data-original-title="click to change color">' + buttonName + '</button> ');
            } else {
                if (_m.tag[tagName]["buttonName"]) {
                  //Else just update the class and add 'status'
                    $("#buttonsRow").find("button[color-switcher-class='" + tagName + "']").text(buttonName).addClass(status);
                }
            }

            //If the current tag is visible
            var visible = _m.tag[tagName]["visible"];
            if (!visible) {
                //If the button is not visible, hide it
                $("#buttonsRow").find("button[color-switcher-class='" + tagName + "']").hide();
            }
        }
    } else {
        //If there are no buttons yet, try again in 3 seconds
        setTimeout(updateSwitchers, 3000);
    }
};


/**
 * Updates the .singleTagContent in the manualPopover. It handles their visibility
 * based on the 'visible' property and sets the button text according to either
 * the tagName or a predefined buttonName that can override the tagName.
 *
 * This method is defined in the io.js anonymous function but later attached to the `markus.io` object
 *
 * @for IO
 * @method updateManualPopover
 */
var updateManualPopover = function() {
    //For each of the tagNames defined in the markus.tag module
    for (var tagName in _m.tag) {
        //get the predefined buttonName or just use the tagName
        var buttonName = _m.tag[tagName]["buttonName"] || tagName;

        //If it cant find a button witht the type of tagName in the manualPopover
        if ($("#manualPopover .singleTagContent").find("button[_type='" + tagName + "']").length == 0) {
            //We add one if it can't be found
            $("#manualPopover .singleTagContent").prepend('<button type="button" _type="' + tagName + '" class="btn btn-xs switch ' + tagName + ' switcher noColor">' + buttonName + '</button>');
        } else {
            if (_m.tag[tagName]["buttonName"]) {
                //If it can be found we set the buttonName if it has been explicitly set (predefined)
                $("#manualPopover .singleTagContent").find("button[_type='" + tagName + "']").text(buttonName);
            }
        }

        //Hide or show the button based on their 'visible' status
        var visible = _m.tag[tagName]["visible"];
        if (!visible) {
            $("#manualPopover .singleTagContent").find("button[_type='" + tagName + "']").hide();
        }
    }
};

/*
var attr = $(this).attr('name');

// For some browsers, `attr` is undefined; for others,
// `attr` is false.  Check for both.
if (typeof attr !== typeof undefined && attr !== false) {
    // ...
}
*/

/**
 * This method generates all the necessary CSS classes for a new tagType. It will Also
 * overwrite already existing definitions so you can use this to redefine the styling of existing
 * tags too.
 *
 * This method is defined in the io.js anonymous function but later attached to the `markus.io` object
 *
 * @for IO
 * @method newTagCSS
 * @param  {String} tagName    the name of the tagClass we want to generate in CSS
 * @param  {String} buttonName the name we want the button to have for this tagCSS
 * @param  {String} tagColor   16 bit hex color (e.g. ``#FF0000` = red.) you can use css shortcuts like `red` or `#f00`
 */
var newTagCSS = function(tagName, buttonName, tagColor) {
    //before adding a new tagCSS definition, remove any already existing definition for this tagName
    removeTagCSS(tagName);
    buttonName = buttonName || tagName;
    _m.tag = _m.tag || {};

    //If the tag has not been defined yet, we define an object for it in the markus.tag global object
    if (_m.tag[tagName] == null) {
        _m.tag[tagName] = {
            color: tagColor,
            buttonName: buttonName,
            visible: true,
            status: ""
        };
    } else {
        //If it has already been defined, overwrite the color setting to the color we apparently want.
        _m.tag[tagName].color = tagColor;
    }

    //Set the markus.tagCSS object to an empty array that we're going to redefine
    _m.tagCSS[tagName] = [];

    //we set both the border and background for this button to the provided tagColor
    $.stylesheet('button.' + tagName, ['background-color', 'border-color'], tagColor);
    //set the foreground color (i.e. text) to white
    $.stylesheet('button.' + tagName, ['color'], "#fff");

    //Also push the foreground color rule into the markus.tagCSS array
    _m.tagCSS[tagName].push({
        tagName: 'button.' + tagName,
        cssKey: ["color"],
        cssValue: "#fff"
    });
    //Now push the background and border color rule into the markus.tagCSS array
    _m.tagCSS[tagName].push({
        tagName: 'button.' + tagName,
        cssKey: ['background-color', 'border-color'],
        cssValue: tagColor
    });

    // tagCSS['.'+tagName].push($.stylesheet('.'+tagName).rules()[0].cssText);

    //We set the color for any element that just has the class of `tagName` to the tagColor
    $.stylesheet('.' + tagName, {
        "color": tagColor
    });
    //Duplicate the above rule into the markus.tagCSS array
    _m.tagCSS[tagName].push({
        tagName: '.' + tagName,
        cssKey: ["color"],
        cssValue: tagColor
    });


    //set the background color and border color of a selected and tagName element to tagColor
    $.stylesheet('.selected.' + tagName, ['background-color', 'border-color'], tagColor);
    //Duplicate the above rule into the markus.tagCSS array
    _m.tagCSS[tagName].push({
        tagName: '.selected.' + tagName,
        cssKey: ['background-color', 'border-color'],
        cssValue: tagColor
    });

    //Set the border color of the 'bordered' and tagname element to the provided tagColor
    $.stylesheet('.bordered.' + tagName, ['border-color'], tagColor);
    //Duplicate the above rule into the markus.tagCSS array
    _m.tagCSS[tagName].push({
        tagName: '.bordered.' + tagName,
        cssKey: ['border-color'],
        cssValue: tagColor
    });

};

/**
 * Called before defining new CSS rules for a tagType. This removes any pre-existing rules for
 * the provided tagType from the markus.tag and markus.tagCSS objects.
 *
 * This method is defined in the io.js anonymous function but later attached to the `markus.io` object
 *
 * @for IO
 * @method removeTagCSS
 * @param  {String} tagName The tag you want to remove
 */
var removeTagCSS = function(tagName) {
    //Remove the CSS for the reference from both the markus.tagCSS and markus.tag object
    delete _m.tagCSS[tagName]
    ;
    delete _m.tag[tagName]
    ;
};

/**
 * This function handles the loading of the CSS rules from the saved HTML document using
 * the tag and tagCSS attributes. It has a couple of failsafes in case the data is missing
 * and also contains the defaults for the standard tagNames (i.e. placeName, officialTitle, timePeriod etc.)
 *
 * This method is defined in the io.js anonymous function but later attached to the `markus.io` object
 *
 * @for IO
 * @method loadCSSFromCSS_TagAtt
 */
var loadCSSFromCSS_TagAtt = function() {
    //find the tagCSS and tag attributes of the doc
    var tagCSSAttr = $(".doc").attr("tagCSS");
    var tagAttr = $(".doc").attr("tag");

    //If the found the tagCSS variables are indeed actually populated with data, we try to populate them
    //But at the same time, the tag attribute for the CSS has not been set yet, so we need to redefine those
    if ((typeof tagCSSAttr !== typeof undefined && tagCSSAttr !== false) && (typeof tagAttr === typeof undefined || tagAttr === false || tagAttr === "{}")) {
        //Read the tagCSS by evaluating JSON from the tagCSS attr.
        var tagCSS = _m.tagCSS = $.evalJSON($(".doc").attr("tagCSS"));
        var tagRebuilt = {};

        //For each of the predefined tags we re-add them back to the stylesheet
        for (var tag in _m.tagCSS) {
            var cssArray = tagCSS[tag];
            for (var cssIndex in cssArray) {
                css = cssArray[cssIndex];
                //We re-create the css rules
                if (css.tagName == "." + tag) {
                    newTagCSS(css.tagName, css.tagName, css.cssValue);
                }
            }
        }
        //redefine the document attribute tag to the JSON stringified version of the markus.tag object
        $(".doc").attr("tag", JSON.stringify(_m.tag));
        tagAttr = $(".doc").attr("tag");
    }

    //If we find tagCSS attribute we also add the stuff to the styleSheet in the same manner as above
    if (typeof tagCSSAttr !== typeof undefined && tagCSSAttr !== false) {
        var tagCSS = _m.tagCSS = $.evalJSON($(".doc").attr("tagCSS"));
        var cssArray;
        var css;
        for (var tag in tagCSS) {
            cssArray = tagCSS[tag];
            for (var cssIndex in cssArray) {
                css = cssArray[cssIndex];
                $.stylesheet(css.tagName, css.cssKey, css.cssValue);
            //style += $.stylesheet(css.tagName).rules()[0].cssText;
            }
        }
    }

    //If we found a tagAttribute we load its definitions into the markus.tag object using JQuery.evalJSON
    //Converting escaped Unicode Characters back
    if (typeof tagAttr !== typeof undefined && tagAttr !== false) {
        _m.tag = $.evalJSON(markus.util.converBackToUnicode($(".doc").attr("tag")));

        //For each of the tagNames defined in the markus.tag object
        //We write the css class to the markus.tagCSS object and the JQuery stylesheet
        for (var tagName in _m.tag) {
            var tagColor = _m.tag[tagName].color;
            _m.tagCSS[tagName] = [];

            //Set the foreground color for the .tagName class
            $.stylesheet('.' + tagName, {
                "color": tagColor
            });
            //Duplicate into CSS
            _m.tagCSS[tagName].push({
                tagName: '.' + tagName,
                cssKey: ["color"],
                cssValue: tagColor
            });

            //Set the selected.tagName class' background and border color to the provided tagColor
            $.stylesheet('.selected.' + tagName, ['background-color', 'border-color'], tagColor);
            //Duplicate into the markus.tagCSS array
            _m.tagCSS[tagName].push({
                tagName: '.selected.' + tagName,
                cssKey: ['background-color', 'border-color'],
                cssValue: tagColor
            });

            //Set the .bordered.tagName class' border-color to the tagColor
            $.stylesheet('.bordered.' + tagName, ['border-color'], tagColor);
            //Duplicate into the markus.tagCSS array
            _m.tagCSS[tagName].push({
                tagName: '.bordered.' + tagName,
                cssKey: ['border-color'],
                cssValue: tagColor
            });

            //Set the button.tagName class' back and border color to the provided tagColor
            $.stylesheet('button.' + tagName, ['background-color', 'border-color'], tagColor);
            //Set the foreground color for the button.tagName class to the provided tagColor
            $.stylesheet('button.' + tagName, ['color'], "#fff");
            //Duplicate into the markus.tagCSS array
            _m.tagCSS[tagName].push({
                tagName: 'button.' + tagName,
                cssKey: ["color"],
                cssValue: "#fff"
            });
            //Duplicate into the markus.tagCSS array
            _m.tagCSS[tagName].push({
                tagName: 'button.' + tagName,
                cssKey: ['background-color', 'border-color'],
                cssValue: tagColor
            });
        }

    }

    //Check if the definition for fullName exists, if not, redefine it
    _m.tag["fullName"] = _m.tag["fullName"] || {
        buttonName: "姓名",
        visible: true,
        color: "#d9534f",
        status: ""
    };
    //Check if the definition for partialName exists, if not, redefine it
    _m.tag["partialName"] = _m.tag["partialName"] || {
        buttonName: "別名",
        visible: true,
        color: "#f0ad4e",
        status: ""
    };
    //Check if the definition for placeName exists, if not, redefine it
    _m.tag["placeName"] = _m.tag["placeName"] || {
        buttonName: "地名",
        visible: true,
        color: "#428bca",
        status: ""
    };
    //Check if the definition for officialTitle exists, if not, redefine it
    _m.tag["officialTitle"] = _m.tag["officialTitle"] || {
        buttonName: "官名",
        visible: true,
        color: "#5bc0de",
        status: ""
    };
    //Check if the definition for timePeriod exists, if not, redefine it
    _m.tag["timePeriod"] = _m.tag["timePeriod"] || {
        buttonName: "時間",
        visible: true,
        color: "green",
        status: ""
    };

    //Update the switchers and the manualPopovers
    updateSwitchers();
    updateManualPopover();
};

/**
 * Calling this method automates the download/export of the file. This generates
 * a click event on the `#export` button
 *
 * @for io.js_anonymous
 * @method autoDownload
 * @param  {Object} fileEntry The fileEntry object that contains the file
 * @param  {String} suffix    Filetype extension as String, or just a suffix
 */
var autoDownload = function(fileEntry, suffix) {
    $("#saving_temp").remove();
    $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + suffix);
    $('#export')[0].click();
};

/**
 * Calling this method will clean the data from the document into a newly spawned,
 * temporary element to use JQuery to clean it from unwanted elements and classes
 *
 * @for io.js_anonymous
 * @method saveSave
 * @param  {String} filename the fileName for the new File
 * @param  {Object} _fn      The fileEntry object
 */
var saveSave = function(filename, _fn) {
    //Prepends the temporary saving span, this is an invisible span
    $("body").prepend($("<span id='saving_temp' style='display:none'></span>"));

    //Gets a jquery ref to the just prepened element
    var div = $("#saving_temp");

    // Set the html content of this temp element to the document outerHTML.
    div.html(($(".doc")[0]).outerHTML);

    //Remove all instances of .notSave and iframes
    div.find(".notSave,iframe").remove();
    //If we find a .justSelected or .justExtend instance, remove that class
    div.find(".justSelected,.justExtended").removeClass("justSelected").removeClass("justExtended");
    //If there is any markup left with the randomID, remove that attribute
    div.find(".markup[randomID]").removeAttr("randomID");

    //get the saveContent, now that it is cleaned before saving back from the temp element
    var saveContent = $("#saving_temp").html();

    //Call the saveFile function
    saveFile(filename, _m.util.recoverAllExistTag(saveContent), _fn);

    //Now that we're done with the temporary element, remove it from the doc
    $("#saving_temp").remove();

};

/**
 * Generates a TEI XML document from the HTML document that is generated in the browser.
 *
 * @for io.js_anonymous
 * @method saveTEI
 * @param  {String} filename the fileName for the new File
 */
var saveTEI = function(filename) {
    //Define the TEI head
    var head = '<?xml version="1.0" encoding="UTF-8"?><TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:xi="http://www.w3.org/2001/XInclude"><teiHeader><fileDesc><titleStmt><title>' + filename + '</title></titleStmt><publicationStmt><p/></publicationStmt><sourceDesc><p/></sourceDesc></fileDesc></teiHeader><text><body>';
    //The closing tags needed to close of the TEI document
    var tail = "</body></text></TEI>";
    //Concatenate the head, content and tail
    var saveContent = head + convertTEI(($(".doc")[0]).outerHTML) + tail;

    //Call the saveFile function
    saveFile(filename, saveContent, function(fileEntry) {
        $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + "_tei.xml");
        $('#export')[0].click();
    });
};

/**
 * Generates a standalone HTML document that you can view offline. This has all the data from the
 * document stored in it, including the stylesheet CSS rules that have been parsed into one single
 * `<style>` tag in the head of the HTML document.
 *
 * @for io.js_anonymous
 * @method saveHTML
 * @param  {String} filename the name of the new file
 */
var saveHTML = function(filename) {
    //Define the head of the document for a standalone HTML document
    var head = "<html><head><meta charset='utf-8'/></head><link rel='stylesheet' href='http://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css'><style>.noCBDBID{border-bottom:thin solid red}.previous{display:none}name,persName{background:red}pre{white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word}.unsolved{font-size:large}.fullName{color:#b94a48}.partialName{color:orange}.nianhao{color:green}.markup .markup.unsolved{border-right:medium dotted red}.placeName{color:#428bca}.doc{padding:10px}.moreThanOneId{border-bottom:medium dotted red}.moreThanOneId.wrong{border-bottom:0}#drop_zone{border:2px dashed #fff;-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5px;padding:25px;text-align:center;font:20pt bold Vollkorn;color:#fff}#content{padding-top:20px}div.layout{text-align:center}div.centre{text-align:left;width:10px;display:block;margin-left:auto;margin-right:auto}.stop-scrolling{height:100%;overflow:hidden}.markup.noColor{color:inherit}.officialTitle{color:#5f9ea0}.btn.noColor{background-color:silver;border-color:rgba(0,0,0,0);color:inherit}.markup.selected{padding-right:5px;padding-left:5px;line-height:1.5;border-radius:3px;color:#fff}.selected .markup{color:#fff}.fullName.selected{background-color:#d9534f;border-color:#d43f3a}.partialName.selected{background-color:#f0ad4e;border-color:#eea236}.nianhao.selected{background-color:#5cb85c;border-color:#4cae4c}.placeName.selected{background-color:#428bca;border-color:#357ebd}.officialTitle.selected{background-color:#5bc0de;border-color:#46b8da}#helpModal .modal-header{display:none}.popover .btn{color:#fff}.hidden {display:none}.halfTransparent {opacity:0.3}</style>";
    //Define some more tails and heads for needed HMTL structure
    var bodyhead = "<body><div class='container'><div class='row row-offcanvas row-offcanvas-right'>";
    var bodytail = "</div></div>";
    var tail = "</body></html>";

    //Turn all of the styleTags that have been created into a single style tag embedded in the document
    var style = "<style>";
    var tagCSS = _m.tagCSS;
    for (var tag in tagCSS) {
        cssArray = tagCSS[tag];
        for (var cssIndex in cssArray) {
            css = cssArray[cssIndex];
            $.stylesheet(css.tagName, css.cssKey, css.cssValue);
            style += $.stylesheet(css.tagName).rules()[0].cssText;
        }
    }
    //append the closing style tag, completing the style element.
    style += "</style>";

    //Add the invisible temporary saving element that holds the data while it is being cleaned
    $("body").prepend($("<span id='saving_temp' style='display:none'></span>"));

    //Get a ref to the temp element
    var div = $("#saving_temp");

    //Get the HTML and convert it back to unicode
    div.html(_m.util.converBackToUnicode(($(".doc")[0]).outerHTML));

    //Remove any classes and elements we don't want to end up in the finished product
    div.find(".notSave,iframe").remove();
    div.find(".justSelected,.justExtended").removeClass("justSelected").removeClass("justExtended");
    div.find(".markup[randomID]").removeAttr("randomID");

    //Concatentate, the head, style, bodyhead, content, bodytail and tail to create the saveContent
    var saveContent = head + style + bodyhead + $("#saving_temp").html() + bodytail + tail;

    //Log the data to be saved for debugging purposes
    console.log($("#saving_temp").html());

    //Call the saveFile function with the following parameters
    saveFile(filename, saveContent, function(fileEntry) {
        $("#saving_temp").remove();
        $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + "_layout.html");
        $('#export')[0].click();
    });
};

/**
 * Saves a file using the FileSystem. It requests write access and in return Gets
 * a fileEntry (basically a filePointer) that can be written to. Once we have that object
 * we write all the data that needs to be saved to there and call the callback function once the
 * writing of data is complete
 *
 * @for IO
 * @method saveFile
 * @param  {String} filename     the name of the file we want to create
 * @param  {String} text         the textdata of the file we want to create
 * @param  {Function} _fn        the callback function, called once the file has been written
 * @param  {Function} errorHandler A custom errorHandler, does not need to specified, can also be kept default
 */
var saveFile = function(filename, text, _fn, errorHandler) {
    //If an errorHandler has not explicitly set, use the default one
    if (errorHandler === null) {
        errorHandler = ERROR_HANDLER;
    }
    //Saying we're started in the console, for debugging purposes
    console.log("exporting start");

    //Request access to the fileSystem
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        //Logging that we got this far, debugging purposes
        console.log("exporting file");

        //With access to the fileSystem, say we want to create a file
        fs.root.getFile(filename, {
            create: true
        }, function(fileEntry) {
            //At this point we have a fileEntry object, which is a filepointer

            // fileEntry.remove(function(){}, function(){});
            //We then create a writer that can write to this fileEntry
            fileEntry.createWriter(function(fileWriter) {
                //This blob variable holds the text we want to save
                var blob = new Blob([text], {
                    type: 'text/plain'
                });

                //once we're done with saving, call the callback function
                fileWriter.addEventListener("writeend", function() {
                    if (_fn) {
                        _fn(fileEntry);
                    }
                }, false);

                //Start writing the blob data to the file
                fileWriter.write(blob);

                //ALL the error handlers in case something goes to hell
            }, ERROR_HANDLER);
        }, ERROR_HANDLER);
    }, ERROR_HANDLER);
};

/**
 * Removes the specified file from the fileSystem.
 *
 * @for IO
 * @method removeFile
 * @param  {String} filename     the name of the file we want to remove
 * @param  {Function} _fn          the callback function, called once the file has successfully been removed
 * @param  {Function} errorHandler the errorHandler, does not need to be defined, can fallback to default handler
 */
var removeFile = function(filename, _fn, errorHandler) {
    //If the error handler has not explicitly been set, use the default errorHandler
    if (errorHandler === null) {
        errorHandler = ERROR_HANDLER;
    }

    //Request access to the fileSystem.
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        fs.root.getFile(filename, {
            create: false
        }, function(fileEntry) {
            //Once we have a FilePoitner to work with, we remove it and call the callBack function
            fileEntry.remove(function() {
                if (_fn) {
                    _fn(fileEntry);
                }
            }, errorHandler);

        }, errorHandler);
    }, errorHandler);
};

/**
 * Defines the `markus.io` object that can be accessed globally. Uses some functions that have
 * been defined in the io.js anonymous namespace, but also defines some functions in the object
 * creation itself.
 *
 * @class IO
 * @constructor
 */
_m.io = {
    removeFile: removeFile,
    saveFile: saveFile,
    /**
     * Defines the readFile function. This allows you to read a file specified by the fileName
     * and calls the callback on succes
     *
     * @method readFile
     * @param  {String} _file        the fileName as a String
     * @param  {Function} _fn          The callBack function
     * @param  {Function} errorHandler custom error handler
     */
    readFile: function(_file, _fn, errorHandler) {
        //If the errorHnadler has not been explicitly set, use the default one
        if (errorHandler === null) {
            errorHandler = ERROR_HANDLER;
        }

        //Define the onInitFS function, use right below this function
        function onInitFs(fs) {
            fs.root.getFile(_file, {}, function(fileEntry) {
                // fs.root.getFile(file+'.html', {}, function(fileEntry) {
                // Get a File object representing the file,
                // then use FileReader to read its contents.
                fileEntry.file(function(_file) {
                    //Defines a new FileReader.
                    var reader = new FileReader();
                    //Once we are finished loading call the callback with the resulting data
                    //and start parsing the CSS from the css TagAttr
                    reader.onloadend = ( function(file) {
                        return function(evt) {
                            if (_fn) {
                                _fn(this.result, file);
                                loadCSSFromCSS_TagAtt();
                            }
                        };
                    } )(_file);

                    //Start reading the file
                    reader.readAsText(_file);
                }, errorHandler);

            }, errorHandler);

        }
        //Request acces to the fileSystem to kick the whole process off
        window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
    },

    /**
     * Exports a MARKUS save file and automatically saves it
     *
     * @method exportSave
     * @param  {String} filename the fileName of the file you download
     */
    exportSave: function(filename) {
        //Set the tag attribute to the JSON version of markus.tag
        $(".doc").attr("tag", _m.util.convertToEscapeUnicode($.toJSON(_m.tag)));
        //Remove the tagCSS attribute
        $(".doc").removeAttr("tagCSS");

        //First removes the file and then saves the file, triggering an autoDownload
        removeFile(filename + ".html", function() {
            saveSave(filename + ".html", function(fileEntry) {
                autoDownload(fileEntry, "_markus.html");
            });
        }, function() {
            saveSave(filename + ".html", function(fileEntry) {
                autoDownload(fileEntry, "_markus.html");
            });
        });
    },

    /**
     * Exports a TEI save file of the document and automatically saves it
     *
     * @method exportTEI
     * @param  {String} filename the fileName of the file you download
     */
    exportTEI: function(filename) {
        //Set the tag attribute to the JSON version of markus.tag
        $(".doc").attr("tag", _m.util.convertToEscapeUnicode($.toJSON(_m.tag)));
        //Remove the tagCSS attribute
        $(".doc").removeAttr("tagCSS");

        //First removes the file and then saves the file, triggering an autoDownload
        removeFile(filename + "_tei.xml", function() {
            saveTEI(filename + "_tei.xml");
        }, function() {
            saveTEI(filename + "_tei.xml");
        });
    },

    /**
     * Exports a HTML save of the document and its layout and automatically saves it
     *
     * @method exportHTML
     * @param  {String} filename the fileName of the file you download
     */
    exportHTML: function(filename) {
        //Set the tag attribute to the JSON version of markus.tag
        $(".doc").attr("tag", _m.util.convertToEscapeUnicode($.toJSON(_m.tag)));
        //Remove the tagCSS attribute
        $(".doc").removeAttr("tagCSS");

        //First removes the file and then saves the file, triggering an autoDownload
        removeFile(filename + "_layout.html", function() {
            saveHTML(filename + "_layout.html");
        }, function() {
            saveHTML(filename + "_layout.html");
        });
    },

    /**
     * A simple basic save to the normal MARKUS format. Cleans the data, processes it
     * for download and then automatically downloads it.
     *
     * @param  {String} filename The filename of the new file we want to create
     * @param  {Function} _fn     The callback function called uppon completion
     */
    save: function(filename, _fn) {
        //If there are any defined tags in `markus.tag`
        if (Object.keys(_m.tag).length > 0) {
            //Add them to the tag attribute of the doc
            $(".doc").attr("tag", _m.util.convertToEscapeUnicode($.toJSON(_m.tag)));
        }
        //Remove the tagCSS attribute
        $(".doc").removeAttr("tagCSS");

        //After that it removes the file and then uses the basic save
        removeFile(filename + ".html", function() {
            saveSave(filename + ".html", _fn);
        }, function() {
            saveSave(filename + ".html", _fn);
        });
    },

    //Define these markus.io functions by pointing to the functions that have
    //been defined in the anonymous namespace above
    newTagCSS: newTagCSS,
    removeTagCSS: removeTagCSS,
    updateSwitchers: updateSwitchers,
    updateManualPopover: updateManualPopover,
    loadCSSFromCSS_TagAtt: loadCSSFromCSS_TagAtt
};
} )(markus);

/**
 * Global method that registers the Global Tag Management UI, it also takes care of all its
 * event handlers etc.
 *
 * @for Global
 * @method registeTagManageUI
 */
var registeTagManageUI = function() {
    //When we show the manageTag Modal
    $("#manageTagModal").on("show.bs.modal", function() {
        var tbody = $("#manageTagModal .modal-body .manageTagTable");
        tbody.empty();

        //For each of the color-switcher-class we append a table
        $("#buttonsRow [color-switcher-class]").each(function() {
            var fix = ($(this).attr("data-markus-default") == "true");
            var tr = $("<tr class='tagSetting' color-switcher-class='" + $(this).attr("color-switcher-class") + "'' />");
            tr.append("<td><input data-markus-action='shortcut' type='checkbox' " + ($(this).is(":visible") ? "checked" : "") + " /></td>");
            tr.append($("<td/>").append($(this).clone().show()));
            tr.append($("<td><input type='text' class='form-control' data-markus-value='tagName' value='" + $(this).attr("color-switcher-class") + "' " + ((fix ? "disabled" : "") + "></input>") + "</td>"));
            tr.append($("<td><input type='text' class='form-control' data-markus-value='color-switcher-class' value='" + $(this).text() + "''></input></td>"));
            tr.append($("<td><input data-markus-action='remove' type='checkbox' /></td>"));
            tbody.append(tr);
        });
    });

    //When you click the setManageTagBtn
    $("#setManageTagBtn").on("click", function() {
        $("#manageTagModal .modal-body .tagSetting").each(function() {
            //For each of the tagSettings
            var tagSwitcher = $(this).attr("color-switcher-class");
            var fix = ($("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").attr("data-markus-default") == "true");
            var buttonName = $(this).find("input.form-control[data-markus-value='color-switcher-class']").val();
            var tagName = markus.util.chineseToPingYin($(this).find("input.form-control[data-markus-value='tagName']").val()).trim();

            //If the buttonName is just a space, assure that it remains that
            if (buttonName.trim() === "") {
                buttonName = "　";
            }

            //If the tagName and tagSwitcher are not the same
            if (tagName != tagSwitcher) {
                //Get the color from the markus.tag object
                var tagColor = markus.tag[tagSwitcher].color;
                //Remove the CSS and re-add it back
                markus.io.removeTagCSS(tagSwitcher);
                markus.io.newTagCSS(tagName, tagColor);

                //Remove and add the necessary classes
                $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").removeClass(tagSwitcher).addClass(tagName).attr("color-switcher-class", tagName);
                $("#manualPopover .singleTagContent button." + tagSwitcher).removeClass(tagSwitcher).addClass(tagName).attr("_type", tagName);
                $(".doc ." + tagSwitcher).removeClass(tagSwitcher).addClass(tagName).attr("type", tagName);
            }

            //Define the markus.tag[tagSwitcher] object if it not already has been set
            markus.tag[tagSwitcher] = markus.tag[tagSwitcher] || {
                color: tagColor,
                buttonName: buttonName,
                status: ""
            };

            //set the buttonName
            markus.tag[tagSwitcher].buttonName = buttonName;

            //Set the visible status and act upon it
            var visble = markus.tag[tagSwitcher]["visible"] = $(this).find("input[data-markus-action='shortcut']").is(":checked");

            //If it is visible, show the buttons and set the text for the elements
            if (visble) {
                $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").show();
                $("#manualPopover .singleTagContent button." + tagSwitcher).show();
                $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").text(buttonName);
                $("#manualPopover .singleTagContent button." + tagSwitcher).text(buttonName);

            } else {
              //If it is not visible, hide the buttons and manualPopover and text for the elements
                $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").text(buttonName);
                $("#manualPopover .singleTagContent button." + tagSwitcher).text(buttonName);
                $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").hide();
                $("#manualPopover .singleTagContent button." + tagSwitcher).hide();

            }
            if ($(this).find("input[data-markus-action='remove']").is(":checked")) {

                if (fix) {
                    $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").hide();
                    $("#manualPopover .singleTagContent button." + tagSwitcher).hide();

                } else {
                    $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").remove();
                    $("#manualPopover .singleTagContent button." + tagSwitcher).remove();
                }
                $(".doc ." + tagSwitcher).contents().unwrap();
                markus.io.removeTagCSS(tagSwitcher);
            }
        });
        $(".doc").attr("tag", JSON.stringify(markus.tag));
        // $(".doc").attr("tagCSS", "");
        $("#manageTagModal").modal('toggle');
    });

    //Defines what happens when you click the new Tag button
    $("#newTagBtn").on("click", function() {
        //Create a tagname by changing Chinese to pingYin
        var tagName = markus.util.chineseToPingYin($("#manageTagModal .newTagTable [data-markus-value='tagName']").val()).trim();
        //The unchanged version of the tagName
        var buttonName = $("#manageTagModal .newTagTable [data-markus-value='color-switcher-class']").val();
        //If the buttonName is only a space, make sure it remains only a space
        if (buttonName.trim() === "") {
            buttonName = "　";
        }

        //Find the tagColor we want to use
        var tagColor = $("#manageTagModal .tagColor").val();

        //Define the newTag CSS by calling the function to do just that
        markus.io.newTagCSS(tagName, buttonName, tagColor);

        //Reset the newTagTable now that the newTag has been registered
        $("#manageTagModal .newTagTable [data-markus-value='tagName']").val("");
        $("#manageTagModal .newTagTable [data-markus-value='color-switcher-class']").val("");

        //Update the switchers and manualPopover to show the newly added tag
        markus.io.updateSwitchers();
        markus.io.updateManualPopover();

        //Toggle the manageModal
        $("#manageTagModal").modal("toggle");
    });
};
