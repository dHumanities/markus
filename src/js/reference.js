/**
 * reference.js base file.
 * @module reference.js
 */

/**
 * Registers the resize handler for the WebDictionary and registers the webDictionary
 * afterwards using the `markus.webDict.registWebDictionary()` function.
 *
 * @for Global
 * @method registWebDictionary
 */
var registWebDictionary = function() {
  //Resize handler
    markus.webDict.resize = function(obj) {
        $(obj).height($(window).height() - $("#content").offset().top - $("#buttonsRow").outerHeight() - 100);
    };
    markus.webDict.registWebDictionary();
};

/**
 * This method searches the CBDB using the input value of the provided webdictionary. If
 * there are multiple matches, display just one and create switcher buttons for the other matches.
 * When you click such a button `Global.searchCBDBID` is called
 *
 * @for Global
 * @method searchCBDB
 * @param  {Element} dictionary the dictionary element. Used to grab its `<input>` element
 */
var searchCBDB = function(dictionary) {
    //get the DB query
    var query = $(dictionary.input).val();
    //Hide the cbdbIDRef
    $("#cbdbIDRef").hide();

    //Find one or more digits
    if (query.match(/\d+/g)) {
        //If there are multiple, they are split along the '|' mark
        var cbdbids = query.split("|");

        //The markus webDictionary opens the url from the cbdb
        markus.webDict.openURL(dictionary, 'http://cbdb.fas.harvard.edu/cbdbapi/person.php?id=' + cbdbids[0]);

        //If there are multiple matches
        if (cbdbids.length > 1) {
            var txt = "";
            for (var i = 0; i < cbdbids.length; i++) {
                var cbdbid = cbdbids[i];
                //Create a button, if you click it. It searches for that person by ID
                txt += '<label class="btn btn-danger ' + ((i === 0) ? 'active' : 'noColor') + '" onclick="searchCBDBID(\'' + cbdbid + '\')"><input type="radio" name="options" id="' + cbdbid + '" >' + cbdbid + '</label>'
            }

            //Show the generated HTML text
            $("#cbdbIDRef").html(txt).show();
        }
    } else {
      //If it wasn't just digits, try `encodeURI` on it as a URL variable
        markus.webDict.openURL(dictionary, 'http://cbdb.fas.harvard.edu/cbdbapi/person.php?name=' + encodeURI(query));
    }


};

/**
 * Looks for a match in the CBDB using the idRef contained in the provided webdictionary.
 *
 * @for Global
 * @method searchByID
 * @param  {Element} dictionary reference to the webdictionary, used to grab its `<input>`
 */
var searchByID = function(dictionary) {
    //get the query from the input holder
    var query = $(dictionary.input).val();
    //get a reference to the idRef
    var idRef = $(dictionary.holder).find(".IDRef");
    //and hide it
    idRef.hide();

    //regex in the dictionary
    var regex = new RegExp(dictionary.idRegex);

    if (query.match(regex)) {
      //Once again, if there are multiple id's, split them on '|'
        var ids = query.split("|");
        //Open the first id
        markus.webDict.openURL(dictionary, dictionary.idSrc.replace(dictionary.param, ids[0]));

        //Generate buttons to switch to that id if there are multiple id's
        if (ids.length > 1) {
            var txt = "";
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                txt += '<label class="btn btn-danger ' + ((i === 0) ? 'active' : 'noColor') + '" onclick="searchFromID(\'' + dictionary.dictionary_name + '\',\'' + id + '\')"><input type="radio" name="options" id="' + id + '" >' + id + '</label>';
            }
            //Show the generated HTML containing the buttons
            idRef.html(txt).show();
        }
    } else {
      //Just open the url using the webdictionary
        markus.webDict.openURL(dictionary, dictionary.src.replace(dictionary.param, encodeURI($(dictionary.input).val())));
    }

};

/**
 * Opens the provided id in the dictionary referenced by the provided dictionary_name
 * as a string. Matches for that ID in the containing dictionary element are
 * given the `active` class
 *
 * @for Global
 * @method searchFromID
 * @param  {String} dictionary_name the name of the dictionary to find
 * @param  {String} id              the id to look for in the CBDB
 */
var searchFromID = function(dictionary_name, id) {
    //get the dictionary by name using JQUery and the name attribute
    var dictionary = $(".web-dictionary[web-dictionary-name='" + dictionary_name + "']");

    //Get each of the labels, containing a cbdbid
    $(dictionary).find("label").each(function() {
        //If we found a match to the id we're looking for
        if ($(this).find("#" + id).length > 0) {
            $(this).removeClass("noColor").addClass("active");
        } else {
            $(this).removeClass("active").addClass("noColor");
        }

    });

    //Returns the dictionary by that name
    dictionary = markus.webDict.getDictionary(dictionary_name);

    //Opens the url in that dictionary
    markus.webDict.openURL(dictionary, dictionary.idSrc.replace(dictionary.param, id));
};

/**
 * Searches trough the `#cbdbIDRef`. Finds matches for the provided id. If found
 * matches are given the `active` class. Then opens the url in the standard cbdb dictionary.
 *
 * @for Global
 * @method searchCBDBID
 * @param  {String} id the id of the cbdbid we're trying to match/find
 */
var searchCBDBID = function(id) {
    //Go through the cbdbdIdRef element and find each label for a match.
    $("#cbdbIDRef").find("label").each(function() {
      //If there is a match, make it active, else just display it without a color
        if ($(this).find("#" + id).length > 0) {
            $(this).removeClass("noColor").addClass("active");
        } else {
            $(this).removeClass("active").addClass("noColor");
        }
    });

    //Returns the dictionary that contains cbdb
    var dictionary = markus.webDict.getDictionary("cbdb");
    //Opens the url using that dictionary
    markus.webDict.openURL(dictionary, 'http://cbdb.fas.harvard.edu/cbdbapi/person.php?id=' + id);

};
