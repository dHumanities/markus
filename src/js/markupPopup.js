/**
 * markupPopup.js base files
 * @module markupPopup.js
 */

/*
  Note: cbdbIdSameTagSave not work
*/

 /**
 The class that holds the variables and functions created in the namespace of this file.
 The constrcutor of this object is only called once, because it is an anonymous function.

 @class markupPopup.js_anonymous
 @constructor
 @param {Object}  _m a reference to the Markus Configuration Object is passed
 **/
( function(_m) {

/**
 * The removeSameTags array. Internal use by functions
 * @type {Array}
 */
var removeSameTags = [];
/**
 * If the markup is editable.
 *
 * @type {Boolean}
 */
var markupEditable = false;

/**
 * Removes the markup that was clicked on. Contained within `markus.popup.clickedMarkup`.
 * It hides the popOver and unwraps the removeTarget. (This basically removes the .markup
 * element around the tag)
 *
 * @method removeMarkup
 */
var removeMarkup = function() {
    var removeTarget = _m.popup.clickedMarkup;
    $(".popover").hide();
    removeTarget.contents().unwrap();

};

var showSameMarkup = function() {
    var clickedMarkup = _m.popup.clickedMarkup;
    $(".popover").hide();
    $("#removeModal").find(".tagText").text($(clickedMarkup).text());
    var onScreen = [],
        sameMarkup = [],
        markupText = $(clickedMarkup).text(),
        _htmlTemp = "";

    removeSameTags = getSameTags(markupText);

    if ($(clickedMarkup).hasClass("justAdd")) {
        for (var key in removeSameTags) {
            if ($(removeSameTags[key].tag).hasClass("justAdd")) {
                _htmlTemp = getSameTagHTML(key) + _htmlTemp;
            }
        }
        for (var key in removeSameTags) {
            if (!$(removeSameTags[key].tag).hasClass("justAdd")) {
                _htmlTemp += getSameTagHTML(key);

            }
        }

    } else {
        for (var key in removeSameTags) {
            if (removeSameTags[key].tag == clickedMarkup[0]) {
                _htmlTemp = getSameTagHTML(key) + _htmlTemp;
            }
        }
        for (var key in removeSameTags) {
            if (removeSameTags[key].tag != clickedMarkup[0]) {
                _htmlTemp += getSameTagHTML(key);
            }

        }

    }

    $("#removeModal").trigger("initial");
    $("#removeModal").find(".sameTags").contents().remove();
    $("#removeModal").find(".sameTags").html(_htmlTemp);

    if (markupEditable) {
        $("#removeModal button.switch").on("click", function() {
            $(this).toggleClass("noColor");
        });

        $("#removeModal .glyphicon-ok-circle").on("click", function() {
            $(this).toggleClass("btn-link").toggleClass("btn-success").toggleClass("glyphicon-lock");
            if ($(this).hasClass("btn-link")) {
                $(this).parent().find(".glyphicon-trash").removeClass("disabled");
            } else {
                $(this).parent().find(".glyphicon-trash").addClass("disabled");
            }

        });

        $("#removeModal .glyphicon-trash").on("click", function() {
            if (!$(this).hasClass("disabled")) {
                removeSameTag($(this).attr("key"));
            }
        });

        $("#removeModal .glyphicon-trash").on("mouseenter", function() {
            if (!$(this).hasClass("disabled")) {
                $(this).removeClass("btn-link").addClass("btn-danger");
            }
        });

        $("#removeModal .glyphicon-trash").on("mouseleave", function() {
            $(this).removeClass("btn-danger").addClass("btn-link");
        });

        $("#removeModal .cbdbIdSameTagSave").on("click", function() {
            if (!$(this).hasClass("disabled")) {
                cbdbIdSameTagSave($(this).attr("key"));
            }
        });
        $("#removeModal .IdSameTagSave").on("click", function() {
            if (!$(this).hasClass("disabled")) {
                // console.log("click: " + $(this).attr("key"));
                IdSameTagSave($(this).attr("key"));
            // cbdbIdSameTagSave($(this).attr("key"));
            }
        });

    } else {
        $("#removeModal .col-xs-1").hide();
        $("#removeModal .col-xs-10").addClass("col-xs-12").removeClass("col-xs-10");
        $("#removeModal .cbdbIds").hide();

        $("#removeModal .modal-footer").hide();

    }



    $("#removeModal").trigger("update");

    $("#removeModal").modal('show');
    $("#removeModal").on("shown.bs.modal", function() {
        $(this).find(".well").each(function() {
            var maxHeight = 0;
            $(this).find("div,span").each(function() {
                maxHeight = Math.max(maxHeight, $(this).height());
            });
            $(this).find("div:not(.btn,.fixHeight)").height(maxHeight);
            // $(this).find(".fixHeight").removeClass("fixHeight");
            $(this).find(".row:not(.all)").each(function() {
                var parent = $(this).parent();
                $(this).offset({
                    top: $(parent).offset().top + $(parent).outerHeight() / 2 - $(this).outerHeight() / 2
                });
            });
        });
    });
};

var getSameTags = function(markupText) {
    var sameTags = [];
    var serialCount = 0;
    $(".doc").find(".markup").each(function() {

        if ($(this).text() == markupText && $($(this).parent()).text() != markupText) {
            $(this).attr("randomID", serialCount++);

            var contents = $(this).parent().contents();

            // var contents = $(".doc").contents();

            var index = contents.index(this),
                onScreen = false,
                headIndex = index - 1,
                tailIndex = index + 1,
                frontText = "",
                endText = "";


            var sameTagChild = $(this).find(".markup").filter(function() {
                return $(this).text() == markupText;
            });

            // console.log(getSurroundText(this));


            var splittedHTML = $(".doc").html().split($(this)[0].outerHTML);



            splittedHTML[0] = splittedHTML[0].replace(/(<([^>]+)>)/ig, "");
            splittedHTML[1] = splittedHTML[1].replace(/(<([^>]+)>)/ig, "");


            frontText = splittedHTML[0].substr(splittedHTML[0].length - 20);
            endText = splittedHTML[1].substr(0, 20);

            sameTags.push({
                tag: this,
                onScreen: $(this).visible(true),
                html: (frontText + $(this)[0].outerHTML + endText),
                sameTagChild: sameTagChild
            });
        // sameTags.push({tag:this,onScreen:$(this).visible(true),html:(frontText +$(this).clone().wrap('<p>').parent().html()+endText),sameTagChild:sameTagChild});
        }
    });
    return sameTags;
};

var getSameTagHTML = function(key) {
    /*
      <button type="button" class="btn btn-xs btn-danger switch fullName" >姓名</button>
              <button type="button" class="btn btn-xs btn-warning switch partialName" >別名</button>
              <button type="button" class="btn btn-xs btn-success switch nianhao" >年號</button>
              <button type="button" class="btn btn-xs btn-primary switch placeName" >地名</button>
              <button type="button" class="btn btn-xs btn-info switch officialTitle" >官職</button>
              <a onclick="typeSave()" class="glyphicon glyphicon-floppy-disk"></a>
      */
    var child = removeSameTags[key].sameTagChild;
    var childHTML = "";
    var cbdbIdsHTML = "";
    for (var i = 0; i < child.length; i++) {
        var type = $(child[i]).attr("type");
        // console.log(type);
        switch (type) {
        case "fullName":
            childHTML += '<button type="button" class="btn btn-xs btn-danger switch fullName" >姓名</button>';
            break;
        case "partialName":
            childHTML += '<button type="button" class="btn btn-xs btn-warning switch partialName" >別名</button>';
            break;
        case "nianhao":
            childHTML += '<button type="button" class="btn btn-xs btn-success switch nianhao" >年號</button>';
            break;
        case "placeName":
            childHTML += '<button type="button" class="btn btn-xs btn-primary switch placeName" >地名</button>';
            break;
        case "officialTitle":
            childHTML += '<button type="button" class="btn btn-xs btn-info switch officialTitle" >官職</button>';
            break;
        case "timePeriod":
            childHTML += '<button type="button" class="btn btn-xs btn-info switch timePeriod" >時間</button>';
            break;
        default:
            childHTML += '<button type="button" class="btn btn-xs btn-info switch ' + type + '" >' + type + '</button>';
            break;
        }
    }

    if (childHTML.length > 0) {
        var type = $(removeSameTags[key].tag).attr("type");
        switch (type) {
        case "fullName":
            childHTML += '<button type="button" class="btn btn-xs btn-danger switch fullName" >姓名</button>';
            break;
        case "partialName":
            childHTML += '<button type="button" class="btn btn-xs btn-warning switch partialName" >別名</button>';
            break;
        case "nianhao":
            childHTML += '<button type="button" class="btn btn-xs btn-success switch nianhao" >年號</button>';
            break;
        case "placeName":
            childHTML += '<button type="button" class="btn btn-xs btn-primary switch placeName" >地名</button>';
            break;
        case "officialTitle":
            childHTML += '<button type="button" class="btn btn-xs btn-info switch officialTitle" >官職</button>';
            break;
        case "timePeriod":
            childHTML += '<button type="button" class="btn btn-xs btn-info switch timePeriod" >時間</button>';
            break;
        default:
            childHTML += '<button type="button" class="btn btn-xs btn-info switch ' + type + '" >' + type + '</button>';
        }
        childHTML += '<div key="' + key + '" class="btn btn-xs btn-link glyphicon glyphicon-floppy-disk sameTagTypeSave"></div>';
    } else {
        var type = $(removeSameTags[key].tag).attr("type");
        if (type == "fullName" || type == "partialName") {
            var inputColorClass = (type == "fullName") ? "has-error" : "has-warning";
            var btnColorClass = (type == "fullName") ? "btn-danger" : "btn-warning";
            // if (!$(removeSameTags[key].tag).attr("cbdbid")) {
            //     $(removeSameTags[key].tag).attr("cbdbid", "");
            // }



            var cbdbIds = markus.util.converBackToUnicode($(removeSameTags[key].tag).attr("cbdbid")).split("|");
            for (var index in cbdbIds) {
                if (cbdbIds[index].length > 0) {
                    cbdbIdsHTML += "<button type='button' class='btn btn-xs " + btnColorClass + " switch'>" + cbdbIds[index] + "</button> ";
                }

            }
            cbdbIdsHTML += '<input style="height:22px;width:100px;display:inline-block;margin-bottom: 1px;"type="text" class="form-control input-sm ' + inputColorClass + '" placeholder="Cbdb ID"></input> <a key="' + key + '" class="glyphicon glyphicon-floppy-disk cbdbIdSameTagSave"></a>';
        } else {
            if ($(removeSameTags[key].tag).attr(type + "_id")) {
                var Ids = markus.util.converBackToUnicode($(removeSameTags[key].tag).attr(type + "_id")).split("|");
                for (var index in Ids) {
                    if (Ids[index].length > 0) {
                        cbdbIdsHTML += "<button type='button' class='btn btn-xs " + type + " switch'>" + Ids[index] + "</button> ";
                    }

                }
                cbdbIdsHTML += '<input style="height:22px;width:100px;display:inline-block;margin-bottom: 1px;"type="text" class="form-control input-sm ' + type + '" placeholder="ID"></input> <a key="' + key + '" class="glyphicon glyphicon-floppy-disk IdSameTagSave"></a>';
            }
        }



    }

    return '<div class="row well well-sm" key="' + key + '"><div><div class="col-xs-10">' + removeSameTags[key].html + '</div><div class="col-xs-1" style="padding-left:0px;">' + childHTML + '</div><div class="col-xs-1" style="padding-right:0px"><div class="row"><span class="btn btn-link glyphicon glyphicon-trash" key="' + key + '"></span> | <span class="btn btn-link glyphicon glyphicon-ok-circle"></span></div></div></div><div class="row all well-sm fixHeight cbdbIds"><div class="col-xs-12 fixHeight">' + cbdbIdsHTML + '</div></div></div>';
};

/**
 * Searches trough the appropriate dictionary for the markup the user just clicked
 * on. Depending on the dictionary type the response varies. Most of the time the
 * web-dictionary is just clicked (to show it), but sometimes an `<input>` on the
 * web-dictionary can be set to the value of the clicked markup (or in case of the CBDB to
 * a CBDBID)
 *
 * @method searchMarkup
 */
var searchMarkup = function() {
    //Get a reference to the clicked markup instance
    var clickedMarkup = _m.popup.clickedMarkup;
    //Hide the comment field, show the assist
    $("#comment").hide();
    $("#assist").show();
    //Set the web-dictionary-input to the value of the clickedMarkup text and trigger a change event on the input.
    $(".web-dictionary-input").val(clickedMarkup.text()).trigger("change");

    //If it is a fullName or partialName
    if (clickedMarkup.hasClass("fullName") || clickedMarkup.hasClass("partialName")) {
      //get the cbdbid attr.
        var cbdbid = clickedMarkup.attr("cbdbid");
        if (cbdbid) { //if it exists, but length = 0, get the id from the clickedMarkup text
            if (cbdbid.trim().length == 0) {
                cbdbid = $(clickedMarkup).text();
            }
        } else {
          //get the id from the clickedMarkup text
            cbdbid = $(clickedMarkup).text();
        }
        //Open the cbdb web-dictionary, set its input to the cbdbid obtained and trigger an update
        $(".web-dictionary[web-dictionary-name='cbdb'] .web-dictionary-input").val(cbdbid).trigger("change");
        //   searchCBDB(clickedMarkup.text(), clickedMarkup.attr("cbdbid"));
        //   showCBDBRef();
        //Trigger a click to show the web-dictionary
        $(".web-dictionary-tab[web-dictionary-name='cbdb']").trigger("click");
    } else if (clickedMarkup.hasClass("placeName")) {
        //If it is a placeName, show the appropriate web-dictionary by triggering a click
        $(".web-dictionary-tab[web-dictionary-name='chgis']").trigger("click");
    //   showCHGISRef();
    } else if (clickedMarkup.hasClass("ddbcGlossaries")) {
        //If it is a ddbcGlossaries, show the appropriate web-dictionary by triggering a click
        $(".web-dictionary-tab[web-dictionary-name='ddbcGlossaries']").trigger("click");
    //   showCHGISRef();
    } else if (clickedMarkup.hasClass("ddbcPerson")) {
          //If it is a ddbcPerson, show the appropriate web-dictionary by triggering a click,
          //but first set the input to the 'ddbcperson_id' attr of the clicked markup
        $(".web-dictionary[web-dictionary-name='ddbcPerson'] .web-dictionary-input").val(clickedMarkup.attr("ddbcperson_id")).trigger("change");
        $(".web-dictionary-tab[web-dictionary-name='ddbcPerson']").trigger("click");
    //   showCHGISRef();
    } else {
      //Else just show the zdic web-dictionary.
        $(".web-dictionary-tab[web-dictionary-name='zdic']").trigger("click");
    //   showZDICRef();
    }

      // _m.popup.clickedMarkup = clickedMarkup = null;
};

/**
 * Defines what happens when you click the `#removeAllBtn` button. When you click this button
 * all the `.glyphicon-trash` elements that are not disabled are clicked (removing the instance with it).
 *
 * @method removeAllSameTag
 */
var removeAllSameTag = function() {
    $("#removeAllBtn").addClass("fired");
    $("#removeModal").find(".glyphicon-trash:not(.disabled)").each(function() {
        $(this).click();
    });
    //Remove all occurences of the justAdd and justExtended class across the doc
    $(".justAdd").removeClass("justAdd");
    $(".justExtended").removeClass("justExtended");
    //Trigger an update on the removeModal
    $("#removeModal").trigger("update");
};

/**
 * Defines what happens when you click the `#applyAll` button. When you click this button
 * the contents of the first well are copied across all the other wells. This is to unify contents
 * of the markup.
 *
 * @method applyAll
 */
var applyAll = function() {
    $("#applyAllBtn").addClass("fired");
    // $("#removeAllBtn").addClass("fired");

    //the key of the first well
    var sourcekey = $("#removeModal").find(".well:first").attr("key");
    //The first tag within the first well
    var firstTag = $("#removeModal").find(".well:first .markup:first");

    // var child = $(removeSameTags[sourcekey].sameTagChild;
    // The HTML content of the tag
    var tagContent = getTheTagContent(getTheOuterTag(removeSameTags[sourcekey].tag));

    //We get all the unlocked keys..
    var keys = getAllunLockedKeys();
    //and for each of them
    for (var index in keys) {
        var key = keys[index];
        //If this is not the same key as the first well
        if (sourcekey != key) {
            // console.log(key);
            var tag = removeSameTags[key].tag;
            // console.log(tag);
            var outerTag = getTheOuterTag(tag);

            //We replace the tag contents to be the same as the tagContent from the source (well:first)
            removeSameTags[key].tag = replaceTag(outerTag, tagContent);
            //Get a ref to the well we're working on right now
            var well = $("#removeModal").find(".well[key='" + key + "']");

            //Wrap the first markup in a paragraph and return its parent
            var wrap = well.find(".markup:first").wrap("<p>").parent();
            //empty the wrap (remove the first markup?)
            wrap.contents().remove();
            //Set them to be identical to this first tag
            wrap.append($(firstTag).clone().removeClass("selected"));
            //Unwrap the wrap again, the wrap was just to allow for easy jquery editing
            wrap.contents().unwrap();

            // well.find(".markup:first").outerHTML = $(firstTag).clone().removeClass("selected").outerHTML;

            //Trigger a click on the ok circle
            $(well).find(".glyphicon-ok-circle").click();
            //Hiden the elements that have any of the following classes
            $(well).find(".cbdbIds,.glyphicon-floppy-disk,.switch").hide();


        }
    }


    //Remove all occurences in the whole document of the 'justAdded' and 'justExtended' class.
    $(".justAdd").removeClass("justAdd");
    $(".justExtended").removeClass("justExtended");
    //Then trigger an update on the removeModal
    $("#removeModal").trigger("update");
};

/**
 * Initializes the removeModal by removing the `.fired` class, if it was present
 * to begin with. This makes sure they actually show up as the `updateRemoveModal` function
 * tells the buttons to fade once they have the `.fired` class.
 *
 * @method initialRemoveModal
 */
var initialRemoveModal = function() {
    $("#applyAllBtn").removeClass("fired");
    $("#removeAllBtn").removeClass("fired");
};

/**
 * Called to update the `#removeModal`. Used to change the contents of this modal
 * depending on its contents.
 *
 * @method updateRemoveModal
 */
var updateRemoveModal = function() {

    // console.log($("#removeModal").find(".well").length);
    // Do something based on the amount of `well` class items found in the removeModal
    switch ($("#removeModal").find(".well").length) {
      //If there are none left, hide the modal
    case 0:
        $("#removeModal").modal("hide");
        break;
    case 1:
      //If there is only one left, hide the 'removeAll' and 'applyAll' buttons
        $("#removeAllBtn").hide();
        $("#applyAllBtn").hide();
        break;
    default:
      //Set the first well with the sameTags class to have the following CSS
        $("#removeModal").find(".sameTags .well:first").css({
            "border-width": "2px",
            "border-color": "#8D8C8C",
            "background-color": "#D8D5D5"
        });

        //If the removeAllButton has the fired class, fade it out, else show it
        if (!$("#removeAllBtn").hasClass("fired")) {
            $("#removeAllBtn").show();
        } else {
            $("#removeAllBtn").fadeOut();
        }
        //If the applyAllBtn has the fired class, fade it out, else show it
        if (!$("#applyAllBtn").hasClass("fired")) {
            $("#applyAllBtn").show();
        } else {
            $("#applyAllBtn").fadeOut();
        }

    }

};



/**
 * Returns an array of all the key attributes of the `glyphicon-trash` icons that do not
 * have a `disabled` class
 *
 * @method getAllunLockedKeys
 * @return {Array} Returns the unlocked keys.
 */
var getAllunLockedKeys = function() {
    var keys = [];
    $("#removeModal").find(".glyphicon-trash:not(.disabled)").each(function() {
        keys.push($(this).attr("key"));
    });
    // console.log(keys);
    return keys;
};


/**
 * Returns the surroundign element of the provided tag. This is done by going up
 * the DOM hierarchy untill we find a parent that does not have the same textcontent
 * as the child. This means we have the first parent that also has different children.
 *
 * @method getTheOuterTag
 * @param  {Element} tag the tag we want to now the containing tag of
 * @return {Element}     the containing tag of the tag we provided
 */
var getTheOuterTag = function(tag) {
    var parent = $(tag).parent();
    while ($(tag).text() == $(parent).text()) {
        parent = $(parent).parent();
        tag = parent;
    }
    return tag;
};

/**
 * Replaces the provided tag with the provided HTML string content.
 *
 * @method replaceTag
 * @param  {Element} tag     The element to replace
 * @param  {String} content  The string that represents the HTML data to replace the tag with
 * @return {Element}         The element after it has been replaced.
 */
var replaceTag = function(tag, content) {

    // var wrapper = $(tag).wrap('<p>').parent();
    // if (tag){
    //   $(tag).remove();
    // }
    // wrapper.html(content);
    // wrapper.find(".markup").each(registMakupAction);
    // tag = wrapper.find(".markup:first");
    // wrapper.contents().unwrap();

    if (tag) {
        $(tag)[0].outerHTML = content;
    // console.log(replaceTag);
    }

    return tag;
};

/**
 * Returns the html content (including itself) of the provided tag. Removes the
 * `selected` class before returning the HTML data string.
 *
 * @method getTheTagContent
 * @param  {Element} tag the tag we want to get the content of
 * @return {String}      the HTML content represented as a string
 */
var getTheTagContent = function(tag) {
    var clone = $(tag).clone();
    // var _html = $(clone).removeClass("selected").wrap('<p>').parent().html();
    var _html = $(clone).removeClass("selected")[0].outerHTML;
    clone.remove();
    return _html;
};

/**
 * Defines what happens when you click the applyAll button. Sets the cbdbId of
 * all the markups contained to the cbdbId of the clickedMarkup
 *
 * @method applyAllSameType
 */
var applyAllSameType = function() {
    /* find the clicked in removeSameTags Id. , well, need to change the removeSameTags to others
       or plan another 'types' storing schema
    */
    //The markup we just clicked
    var clickedMarkup = _m.popup.clickedMarkup;

    //Add the fired class to make it fadeOut afterwards (because ofthe removeModalUpdate)
    $("#applyAllBtn").addClass("fired");

    //Get the cbdbId from the clickedMarkup as an attribute.
    var cbdbId = markus.util.converBackToUnicode($(clickedMarkup).attr("cbdbid"));
    $("#removeModal").find(".row").each(function() {
        //All of the elements that do not have a disabled but do have a glyphicon-trash
        if ($(this).has(".glyphicon-trash:not(.disabled)").length) {
          //Get all of the .cbdbIds and update them and click the link within them.
            $(this).find(".cbdbIds").each(function() {
                $(this).find("input").val(cbdbId).parent().find("a").click();
            });
        }
    });

    //Trigger an update on the removeModal
    $("#removeModal").trigger("update");

};

/**
 * Removes the sametag (spans multiple DOM levels if they are only-child) specified
 * by the provided key. Updates the `#removeModal` afterwards;
 *
 * @param  {String} key the key of the entry we want to delete
 */
var removeSameTag = function(key) {
    //Get the tag of the key we want to remove
    var tag = removeSameTags[key].tag;
    //Get the parent of the tag
    var parent = $(tag).parent();
    //Get the markup child of the tag
    var child = $(tag).find(".markup");
    //Get the text of the tag
    var text = $(tag).text();

    //Add the remove class
    $(tag).addClass("remove");

    //If the parent text is identical to the tag text(the parent has no other children) remove it
    if ($(parent).text() == text) {
        $(parent).addClass("remove");
    }
    //If the child text is identical to the tag-text (the child is only child) remove it.
    if ($(child).text() == text) {
        $(child).addClass("remove");
    }

    //Find all the instances of the .remove class and unwrap their contents (removing the container markup)
    $(".doc").find(".remove").contents().unwrap();

    //We find the well for the key that was provided and fade it out
    $("#removeModal").find(".well[key='" + key + "']").fadeOut({
        complete: function() {
          //Once the fadeout is complete,  remove the well and trigger an update on the
          //#removeModal
            $("#removeModal").find(".well[key='" + key + "']").remove();
            $("#removeModal").trigger("update");
        }
    });

    //Since this key is now removed, remove it from the removeSameTags array
    removeSameTags[key] = null;
};


var sameTagTypeSave = function() {
    var key = $(this).attr("key");
    // console.log(removeSameTags);

    var child = removeSameTags[key].sameTagChild;
    child.push(removeSameTags[key].tag);

    var wellMarkup = $("#removeModal").find(".well[key='" + key + "']").find(".markup");

    $("#removeModal").find(".well[key='" + key + "']").find("button.switch.noColor").each(function() {

        for (var i = 0, j = wellMarkup.length; i < j; i++) {
            if ($(this).hasClass($(wellMarkup[i]).attr("type"))) {
                $(wellMarkup[i]).addClass("remove");
            }
        }

        for (var i = 0, j = child.length; i < j; i++) {
            if ($(this).hasClass($(child[i]).attr("type"))) {
                $(child[i]).addClass("remove");
            }
        }
        $(this).remove();
    });

    if ($(removeSameTags[key].tag).hasClass("remove")) {
        // console.log("removeSameTag remove hooked tag");
        for (var i = 0; i < removeSameTags[key].sameTagChild.length && $(removeSameTags[key].tag).hasClass("remove"); i++) {
            removeSameTags[key].tag = removeSameTags[key].sameTagChild[i];
        }
    }
    var _parent = $(removeSameTags[key].tag).parent();
    while ($(_parent).text() == $(removeSameTags[key].tag).text() && !$(_parent).hasClass("remove")) {
        removeSameTags[key].tag = _parent;
        _parent = $(removeSameTags[key].tag).parent();
    }


    $(".doc").find(".markup.remove").contents().unwrap();

    $("#removeModal").find(".well[key='" + key + "']").find(".markup.remove").contents().unwrap();

    if ($("#removeModal").find(".well[key='" + key + "']").find("button.switch").length === 0) {
        $("#removeModal").find(".well[key='" + key + "']").fadeOut({
            complete: function() {
                $("#removeModal").find(".well[key='" + key + "']").remove();
                if ($("#removeModal").find(".well").length === 0) {
                    $("#removeModal").modal("hide");
                }
            }
        });
    } else {
        var row = $("#removeModal").find(".well[key='" + key + "'] .row");
        $(row).find(".glyphicon-trash").addClass("disabled").addClass("btn-link").removeClass("btn-danger");
        $(row).find(".glyphicon-ok-circle").removeClass("btn-link").addClass("btn-success").addClass("glyphicon-lock").addClass("disabled");
    }
};


var typeSave = function() {
  //Get a reference to the cliked markup
    var clickedMarkup = _m.popup.clickedMarkup;

    //Get its parent
    var _parent = $(clickedMarkup).parent();
    // console.log("typeSave");

    //For each button with a noColor class
    $("#typePopoverContent").find("button.noColor").each(function() {
        if (_parent) {
          //If the parent has a type set identical to the class of this (Backwards compatibility?), unwrap it
            if ($(this).hasClass($(_parent).attr("type"))) {
                $(_parent).contents().unwrap();
                _parent = null;
            }
        }
        //If the clickedMarkup has a type attribute identical to this button, then unwrap it
        if (clickedMarkup) {
            if ($(this).hasClass($(clickedMarkup).attr("type"))) {
                $(clickedMarkup).contents().unwrap();
                clickedMarkup = null;
            }
        }

    });
    //Hide the popOver, now that we have done all this;
    $(".popover").hide();

    //null the reference
    _m.popup.clickedMarkup = clickedMarkup = null;
};

var cbdbIdSave = function() {
    var clickedMarkup = _m.popup.clickedMarkup;
    if (clickedMarkup === null) {
        return;
    }
    var ids = $(clickedMarkup).attr("cbdbid") || $(clickedMarkup).attr($(clickedMarkup).attr("type") + "_id") || "";

    // console.log(ids);
    var cbdbIds = [];
    if (ids.length > 0) {
        cbdbIds = markus.util.converBackToUnicode(ids).split("|");
    }


    // console.log(cbdbIds);
    var cbdbInputVal = $("#cbdbIdPopoverContent").find("input").val();

    /*
        // orginial design is just for CBDB, and CBDBID only contains digital. Now it will disable to allow other type of characters for different IDs

        Todo : ids format need to be designed to filter different kinds of id format


        if (cbdbInputVal.match(/\d+/g)) {
            clickedMarkup.attr("cbdbid", cbdbInputVal);
            clickedMarkup.removeClass("moreThanOneId").removeClass("noCBDBID");
        }

    */

    // if (cbdbInputVal.match(/\d+/g)) {
    //     clickedMarkup.attr("cbdbid", cbdbInputVal);
    //     clickedMarkup.removeClass("moreThanOneId").removeClass("noCBDBID");
    // }

    // console.log(clickedMarkup.attr(clickedMarkup.attr("type") + "_id"));
    // console.log(clickedMarkup);
    cbdbInputVal = cbdbInputVal.replace(/\s+/g);
    if (cbdbInputVal.length > 0 && cbdbInputVal.indexOf("|") == -1) {
        if ($(clickedMarkup).attr($(clickedMarkup).attr("type") + "_id") !== undefined) {
            clickedMarkup.attr(clickedMarkup.attr("type") + "_id", markus.util.convertToEscapeUnicode(cbdbInputVal));
        } else {
            clickedMarkup.attr("cbdbid", markus.util.convertToEscapeUnicode(cbdbInputVal));
        }
        clickedMarkup.removeClass("moreThanOneId").removeClass("noCBDBID");
    } else {

        $("#cbdbIdPopoverContent").find("button.noColor").each(function() {
            var cbdb = $(this).text();
            cbdbIds.splice(cbdbIds.indexOf(cbdb), 1);
        });
        if (cbdbInputVal.length > 0) {
            cbdbIds = cbdbInputVal.split("|");
        }
        switch (cbdbIds.length) {
        case 0:
            clickedMarkup.removeClass("moreThanOneId").addClass("noCBDBID");
            break;
        case 1:
            clickedMarkup.removeClass("moreThanOneId").removeClass("noCBDBID");
            break;
        default:
            clickedMarkup.addClass("moreThanOneId").removeClass("noCBDBID");
        }



        if (clickedMarkup.attr(clickedMarkup.attr("type") + "_id") !== undefined) {
            clickedMarkup.attr(clickedMarkup.attr("type") + "_id", markus.util.convertToEscapeUnicode(cbdbIds.join("|")));
        } else {
            clickedMarkup.attr("cbdbid", markus.util.convertToEscapeUnicode(cbdbIds.join("|")));
        }



    }
    $("#cbdbIdPopoverContent").find("input").val("");
    $(".popover").hide();
    _m.popup.clickedMarkup = clickedMarkup = null;
};

var cbdbIdSameTagSave = function(key) {
    var tag = removeSameTags[key].tag;
    // console.log("cbdbIdSameTagSave");
    var cbdbIds = $(tag).attr("cbdbid").split("|");

    var cbdbInputVal = $("#removeModal").find(".well[key='" + key + "']").find(".cbdbIds input").val();

    if (cbdbInputVal.match(/\d+/g)) {
        $(tag).attr("cbdbid", cbdbInputVal);
        $(tag).removeClass("moreThanOneId").removeClass("noCBDBID");

        $("#removeModal").find(".well[key='" + key + "']").find(".cbdbIds button.switch").each(function() {
            if ($(this).text() == cbdbInputVal) {
                $(this).removeClass("noColor");
            } else {
                $(this).addClass("noColor");
            }

        });

    } else {
        $("#removeModal").find(".well[key='" + key + "']").find(".cbdbIds button.switch.noColor").each(function() {
            var cbdb = $(this).text();
            cbdbIds.splice(cbdbIds.indexOf(cbdb), 1);
        });
        switch (cbdbIds.length) {
        case 0:
            $(tag).removeClass("moreThanOneId").addClass("noCBDBID");
            break;
        case 1:
            $(tag).removeClass("moreThanOneId").removeClass("noCBDBID");
            break;
        default:
            $(tag).addClass("moreThanOneId").removeClass("noCBDBID");
        }
        $(tag).attr("cbdbid", cbdbIds.join("|"));
    }

    var row = $("#removeModal").find(".well[key='" + key + "'] .row");
    $(row).find(".glyphicon-trash").addClass("disabled").addClass("btn-link").removeClass("btn-danger");
    $(row).find(".glyphicon-ok-circle").addClass("glyphicon-lock").removeClass("btn-link").addClass("btn-success");


// $("#removeModal").find(".well[key='"+key+"']").find(".cbdbids input").val("");
// $(".popover").hide();
// clickedMarkup = null;
};


/*
Todo : merge cbdbIdSameTagSave
*/

var IdSameTagSave = function(key) {
    var tag = removeSameTags[key].tag;
    // console.log("IdSameTagSave");
    var ids = $(tag).attr($(tag).attr("type") + "_id").split("|");

    var inputVal = $("#removeModal").find(".well[key='" + key + "']").find("input" + "." + $(tag).attr("type")).val().replace(/\s+/g);



    if (inputVal.length > 0) {
        $(tag).attr($(tag).attr("type") + "_id", inputVal);
        $(tag).removeClass("moreThanOneId").removeClass("noCBDBID");

        $("#removeModal").find(".well[key='" + key + "']").find("button.switch" + "." + $(tag).attr("type")).each(function() {
            if ($(this).text() == inputVal) {
                $(this).removeClass("noColor");
            } else {
                $(this).addClass("noColor");
            }

        });

    } else {
        $("#removeModal").find(".well[key='" + key + "']").find("button.switch.noColor" + "." + $(tag).attr("type")).each(function() {
            var id = $(this).text();
            ids.splice(ids.indexOf(id), 1);
        });
        switch (ids.length) {
        case 0:
            $(tag).removeClass("moreThanOneId").addClass("noCBDBID");
            break;
        case 1:
            $(tag).removeClass("moreThanOneId").removeClass("noCBDBID");
            break;
        default:
            $(tag).addClass("moreThanOneId").removeClass("noCBDBID");
        }
        $(tag).attr($(tag).attr("type") + "_id", ids.join("|"));
    }

    var row = $("#removeModal").find(".well[key='" + key + "'] .row");
    $(row).find(".glyphicon-trash").addClass("disabled").addClass("btn-link").removeClass("btn-danger");
    $(row).find(".glyphicon-ok-circle").addClass("glyphicon-lock").removeClass("btn-link").addClass("btn-success");


// $("#removeModal").find(".well[key='"+key+"']").find(".cbdbids input").val("");
// $(".popover").hide();
// clickedMarkup = null;
};


_m.popup = {
    /**
     * Holds a reference to the popOver element used to make a floating window
     * appear with markup controls in it (remove, search etc.);
     *
     * @type {Element}
     */
    popover: null,
    /**
     * Holds a reference to the markup that was just clicked. May be null!
     *
     * @type {Markup}
     */
    clickedMarkup: null,

    /**
     * Function is defined in the markupPopup.js_anonymous class. Function is exposed
     * using this class (`markus.popup`);
     *
     * @method searchMarkup
     * @type {Function}
     */
    searchMarkup: searchMarkup,

    /**
     * Function is defined in the markupPopup.js_anonymous class. Function is exposed
     * using this class (`markus.popup`);
     *
     * @method showSameMarkup
     * @type {Function}
     */
    showSameMarkup: showSameMarkup,

    /**
     * Registers the popover used for the markup instances. Creates handlers for
     * click, mouseenter and update for the buttons and other content.
     *
     * @method registMarkupPopup
     * @param  {boolean} editable if this markup is editable
     */
    registMarkupPopup: function(editable) {
      //register the popOver used as the popover, i.e. the #popOver element
        _m.popup.registPopover($("#popover"));
        markupEditable = editable || false;

        //When a click happens on the .doc in the document (I.e. unfocus / blur)
        $(document).on("click", ".doc", function() {
            //Unselect any previously selected markups
            $(".selected").removeClass("selected");
            //Hide the popover
            $(".popover").hide();
            //No popup is clicked right now
            _m.popup.clickedMarkup = null;

            //Remove the justSelected class from any markup
            $(".justSelected.markup").removeClass("justSelected");
            // $(".justExtended").contents().unwrap();
            // And unwrap its contents
            $(".justSelected,.justExtended").contents().unwrap();
        });

        //Register the click handlers for the icons in the markup popover
        $("#cbdbIdPopoverContent a").on("click", cbdbIdSave);
        $("#typePopoverContent a").on("click", typeSave);
        $("#popover .search a").on("click", showSameMarkup);
        $("#popover .trash a").on("click", removeMarkup);
        $("#popover .glyphicon-book").on("click", searchMarkup);

        //When you click a markup, you are forwarded to the markupClicked function (click handler)
        $(document).on("click", ".doc .markup", _m.popup.markupClicked);
        //When you click the sameTagTypeSave you are forwarded to the sameTagTypeSave function (click handler)
        $(document).on("click", ".sameTagTypeSave", sameTagTypeSave);

        //If you hit the .switch element in the typePopoverContent, the .noColor class is toggled
        $(document).on("click", "#typePopoverContent .switch", function() {
            $(this).toggleClass("noColor");
        });

        //When you click the removeAllBtn, the removeAllSameTag function is called
        $("#removeAllBtn").on("click", removeAllSameTag);

        //When you click the applyAllBtn, the applyAll function is called
        $("#applyAllBtn").on("click", applyAll);

        //When you hit the cancel button, the #removeModal is hidden
        $("#cancelBtn").on("click", function() {
            $("#removeModal").modal("hide");
        });

        // console.log(_m.util.urlParam('file'));

        //If an update event is request, forward it to the update function (updateremoveModal)
        $("#removeModal").on("update", updateRemoveModal);
        //If we fire the initial event (re-initialzing the modal), forward it to the initialRemoveModal function
        $("#removeModal").on("initial", initialRemoveModal);

        //When the modal is hidden unwrap the justSelected and justExtended contents
        $("#removeModal").on("hide.bs.modal", function() {
            // var parent = $(".justSelected,.justExtended").parent();
            $(".justSelected,.justExtended").contents().unwrap();

        });
    },

    /**
     * Sets the reference variable `markus.popup.popover` to the provided element.
     *
     * @method registPopover
     * @param  {Element} popover the element that is used as the popover
     */
    registPopover: function(popover) {
        this.popover = popover;
    },

    /**
     * Defines what happens when you click on an instance of `.markup`. This shows the popOver,
     * registers it, and fills the popOver with content depending on the type of markup, and
     * the markup content. Also checks for nested multitags.
     *
     * @param  {Event} event the mouseEvent. Just passed to stop it from bubbling
     */
    markupClicked: function(event) {
      //Stop the event from bubbling
        event.stopPropagation();

        //Hide the popOver if it is currently showing
        $(".popover").hide();

        //Get a reference to the object as a JQuery HTML element
        var obj = $(this);
        //Get its parent, offset and text
        var _parent = obj.parent(),
            offset = obj.offset(),
            tagText = obj.text();

        //Find any other .markup tags that have the same text, but not the same parent
        var otherTags = $(".doc").find(".markup").filter(function(index) {
            return (tagText == $(this).text()) && $(obj).parent() != this && obj != this;
        });

        // unselect any previously selected tag
        $(".markup.selected").removeClass("selected");
        // set the currently selected tag as selected
        obj.addClass("selected");
        // console.log($(this));

        //Update the clickedMarkup reference to the just clicked object
        _m.popup.clickedMarkup = $(this);

        //Get the popover and hide the .tagText
        var popover = _m.popup.popover;
        popover.find(".tagText").hide();

        /*
          start
          Nested multi tags detect and show popup
        */

       //Hide the typePopoverContent element, and if it has any buttons, remove their 'noColor' class and disabled attribute
        var typePopoverContent = popover.find("#typePopoverContent");
        typePopoverContent.hide();
        typePopoverContent.find("button").removeClass("noColor").removeAttr("disabled").hide();

        //While the parent text matches the clicked text and the parent is of class markup, we are the sameTag
        var sameTag = false;
        while (_parent.is(".markup") && _parent.text() == tagText) {
            sameTag = true;
            //Show it in the typePopoverContent
            typePopoverContent.find("." + $(_parent).attr("type")).show();
            //Go up through the DOM hierarchy
            _parent = _parent.parent();
        }

        //If they are a nested multitag
        if (sameTag) {
            //Show all of the type of this and show them
            typePopoverContent.find("." + $(this).attr("type")).show();
            typePopoverContent.show();
        } else {
            //Find all of this, set their disabled attribute and show them
            typePopoverContent.find("." + $(this).attr("type")).attr("disabled", "disabled").show();
            typePopoverContent.show();
        }

        /*
          end nested multi tags
        */

       //If we can edit the markup
        if (markupEditable) {
            //If there are other tags
            if (otherTags.length > 0) {
              //Show the search and trash icons
                popover.find(".search").show();
                popover.find(".trash").show();
            } else {
              //if there are no other tags, only show the trash icon, but not the search since there is nothing to find
                popover.find(".trash").show();
                popover.find(".search").hide();
            }
        } else {
          //If we can't edit the markup
            if (otherTags.length > 0) {
              //Only allow searching if there are other tags
                popover.find(".search").show();
                popover.find(".trash").hide();
            } else {
              //If there are no other tags there is nothing meaningful you can do right now
                popover.find(".trash").hide();
                popover.find(".search").hide();
            }
        }

        //Now show the popOVer and set its position
        popover.show().offset({
            top: offset.top + $(this).height() / 2 - popover.outerHeight() / 2,
            left: offset.left + obj.outerWidth() + 11
        });

        //If we have a class of fullName or partialName, or a set type_id attribute
        if (obj.hasClass("fullName") || obj.hasClass("partialName") || (obj.hasClass("markup") && (obj.attr(obj.attr("type") + "_id") !== null))) {
          //set the color class according to the obj class
            var colorClass = "";
            if (obj.hasClass("fullName")) {
                colorClass = "btn-danger";
                $("#cbdbIdPopoverContent").addClass("has-error").removeClass("has-warning");
            } else {
                colorClass = "btn-warning";
                $("#cbdbIdPopoverContent").addClass("has-warning").removeClass("has-error");
            }

            //If we are allowed to edit the markup, we get a ref to the cbdbIdPopover
            if (markupEditable) {
                var cbdbIdPopover = $("#cbdbIdPopover");
                var cbdbIdPopoverContent = cbdbIdPopover.find("#cbdbIdPopoverContent");
                var cbdbIdsHTML = "";
                //We remove all the buttons from it, effectively resetting it
                cbdbIdPopoverContent.find("button").remove();

                //If the object is a name of some kind
                if (obj.hasClass("fullName") || obj.hasClass("partialName")) {
                  //If the object has no attribute of cbdbid, set it to an empty string
                    if (!obj.attr("cbdbid")) {
                        obj.attr("cbdbid", "");
                    }
                    //Get the cbdbid attribute and split it into its parts
                    if ($(this).attr("cbdbid")) {
                        var cbdbids = $(this).attr("cbdbid").split("|");

                        //For each of them create a new button
                        for (var i = 0; i < cbdbids.length; i++) {
                            if (cbdbids[i].length > 0) {
                                cbdbIdsHTML += "<button class='btn " + colorClass + " btn-xs' style='margin-bottom: 1px;'>" + cbdbids[i] + "</button> ";
                            }
                        }
                    }
                } else {
                  //If it doesn;t have this attribute, set it
                    if (!$(this).attr($(this).attr("type") + "_id")) {
                        $(this).attr($(this).attr("type") + "_id", "");
                    }
                    //Split it using the '|' as delimiter.
                    var ids = $(this).attr($(this).attr("type") + "_id").split("|");
                    if (ids.length > 0) {
                      //For each of the  id's add a button
                        for (var i = 0; i < ids.length; i++) {
                            if (ids[i].length > 0) {
                                cbdbIdsHTML += "<button class='btn " + obj.attr("type") + " btn-xs' style='margin-bottom: 1px;'>" + markus.util.converBackToUnicode(ids[i]) + "</button> ";
                            }
                        }
                        //Set the placeHolder attribute of the input to 'ID';
                        cbdbIdPopover.find("#cbdbIdPopoverContent input").attr("placeholder", "ID");
                    // $("#cbdbIdPopoverContent a").on("click", function() {
                    //     console.log("clicked")
                    // });
                    }
                }
                // console.log('$(this).attr("cbdbid").split("|")');
                // console.log(cbdbIdsHTML);
                //Prepend the html to the cbdbIdPopoverContent
                $(cbdbIdPopoverContent).prepend(cbdbIdsHTML);

                //If the popOver is out of the viewable screen on the top
                if (offset.top - cbdbIdPopover.outerHeight() - 11 < $(".doc").offset().top) {
                  //Change its attachment to the object
                    cbdbIdPopover.addClass("bottom").removeClass("top").show().offset({
                        top: offset.top + obj.outerHeight() + 11,
                        left: offset.left + obj.outerWidth() / 2 - cbdbIdPopover.outerWidth() / 2
                    });
                } else {
                  //If its viewable, standard attachment to the clickedMarkup
                    cbdbIdPopover.addClass("top").removeClass("bottom").show().offset({
                        top: offset.top - cbdbIdPopover.outerHeight() - 11,
                        left: offset.left + obj.outerWidth() / 2 - cbdbIdPopover.outerWidth() / 2
                    });
                }

                //Any button will toggle this clicked objects 'noColor' class
                $(cbdbIdPopoverContent).find("button").on("click", function() {

                    $(this).toggleClass("noColor");
                });
            }
        }
    }
};
} )(markus);
