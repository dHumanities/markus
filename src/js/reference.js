var registWebDictionary = function() {
    markus.webDict.resize = function(obj) {
        $(obj).height($(window).height() - $("#content").offset().top - $("#buttonsRow").outerHeight() - 100);
    };
    markus.webDict.registWebDictionary();
};

var searchCBDB = function(dictionary) {
    var query = $(dictionary.input).val();
    $("#cbdbIDRef").hide();

    if (query.match(/\d+/g)) {
        var cbdbids = query.split("|");

        markus.webDict.openURL(dictionary, 'http://cbdb.fas.harvard.edu/cbdbapi/person.php?id=' + cbdbids[0]);

        if (cbdbids.length > 1) {
            var txt = "";
            for (var i = 0; i < cbdbids.length; i++) {
                var cbdbid = cbdbids[i];
                txt += '<label class="btn btn-danger ' + ((i === 0) ? 'active' : 'noColor') + '" onclick="searchCBDBID(\'' + cbdbid + '\')"><input type="radio" name="options" id="' + cbdbid + '" >' + cbdbid + '</label>'
            }

            $("#cbdbIDRef").html(txt).show();
        }
    } else {
        markus.webDict.openURL(dictionary, 'http://cbdb.fas.harvard.edu/cbdbapi/person.php?name=' + encodeURI(query));

    }


};

var searchByID = function(dictionary) {

    var query = $(dictionary.input).val();
    var idRef = $(dictionary.holder).find(".IDRef");
    idRef.hide();

    var regex = new RegExp(dictionary.idRegex);

    if (query.match(regex)) {
        var ids = query.split("|");
        markus.webDict.openURL(dictionary, dictionary.idSrc.replace(dictionary.param, ids[0]));

        if (ids.length > 1) {
            var txt = "";
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                txt += '<label class="btn btn-danger ' + ((i === 0) ? 'active' : 'noColor') + '" onclick="searchFromID(\'' + dictionary.dictionary_name + '\',\'' + id + '\')"><input type="radio" name="options" id="' + id + '" >' + id + '</label>';
            }

            idRef.html(txt).show();
        }
    } else {


        markus.webDict.openURL(dictionary, dictionary.src.replace(dictionary.param, encodeURI($(dictionary.input).val())));

    }

};
var searchFromID = function(dictionary_name, id) {
    var dictionary = $(".web-dictionary[web-dictionary-name='" + dictionary_name + "']");
    $(dictionary).find("label").each(function() {
        if ($(this).find("#" + id).length > 0) {
            $(this).removeClass("noColor").addClass("active");
        } else {
            $(this).removeClass("active").addClass("noColor");
        }

    });

    dictionary = markus.webDict.getDictionary(dictionary_name);

    
    markus.webDict.openURL(dictionary, dictionary.idSrc.replace(dictionary.param, id));    
    
    


};


var searchCBDBID = function(id) {

    $("#cbdbIDRef").find("label").each(function() {
        if ($(this).find("#" + id).length > 0) {
            $(this).removeClass("noColor").addClass("active");
        } else {
            $(this).removeClass("active").addClass("noColor");
        }

    });

    var dictionary = markus.webDict.getDictionary("cbdb");
    markus.webDict.openURL(dictionary, 'http://cbdb.fas.harvard.edu/cbdbapi/person.php?id=' + id);

};
