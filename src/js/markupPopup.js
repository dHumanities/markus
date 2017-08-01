/*

  Note: cbdbIdSameTagSave not work
*/


( function(_m) {

var removeSameTags = [],
    markupEditable = false;

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

var searchMarkup = function() {
    var clickedMarkup = _m.popup.clickedMarkup;
    $("#comment").hide();
    $("#assist").show();
    $(".web-dictionary-input").val(clickedMarkup.text()).trigger("change");




    if (clickedMarkup.hasClass("fullName") || clickedMarkup.hasClass("partialName")) {
        var cbdbid = clickedMarkup.attr("cbdbid");
        if (cbdbid) {
            if (cbdbid.trim().length == 0) {
                cbdbid = $(clickedMarkup).text();
            }
        } else {
            cbdbid = $(clickedMarkup).text();
        }
        $(".web-dictionary[web-dictionary-name='cbdb'] .web-dictionary-input").val(cbdbid).trigger("change");
        //   searchCBDB(clickedMarkup.text(), clickedMarkup.attr("cbdbid"));
        //   showCBDBRef();
        $(".web-dictionary-tab[web-dictionary-name='cbdb']").trigger("click");
    } else if (clickedMarkup.hasClass("placeName")) {
        $(".web-dictionary-tab[web-dictionary-name='chgis']").trigger("click");
    //   showCHGISRef();
    } else if (clickedMarkup.hasClass("ddbcGlossaries")) {
        $(".web-dictionary-tab[web-dictionary-name='ddbcGlossaries']").trigger("click");
    //   showCHGISRef();
    } else if (clickedMarkup.hasClass("ddbcPerson")) {
        $(".web-dictionary[web-dictionary-name='ddbcPerson'] .web-dictionary-input").val(clickedMarkup.attr("ddbcperson_id")).trigger("change");
        $(".web-dictionary-tab[web-dictionary-name='ddbcPerson']").trigger("click");
    //   showCHGISRef();
    } else {
        $(".web-dictionary-tab[web-dictionary-name='zdic']").trigger("click");
    //   showZDICRef();
    }

// _m.popup.clickedMarkup = clickedMarkup = null;
};

var removeAllSameTag = function() {
    $("#removeAllBtn").addClass("fired");
    $("#removeModal").find(".glyphicon-trash:not(.disabled)").each(function() {
        $(this).click();
    });
    $(".justAdd").removeClass("justAdd");
    $(".justExtended").removeClass("justExtended");
    $("#removeModal").trigger("update");
};

var applyAll = function() {
    $("#applyAllBtn").addClass("fired");
    // $("#removeAllBtn").addClass("fired");

    var sourcekey = $("#removeModal").find(".well:first").attr("key");
    var firstTag = $("#removeModal").find(".well:first .markup:first");

    // var child = $(removeSameTags[sourcekey].sameTagChild;
    var tagContent = getTheTagContent(getTheOuterTag(removeSameTags[sourcekey].tag));

    var keys = getAllunLockedKeys();
    for (var index in keys) {
        var key = keys[index];
        if (sourcekey != key) {
            // console.log(key);
            var tag = removeSameTags[key].tag;
            // console.log(tag);
            var outerTag = getTheOuterTag(tag);

            removeSameTags[key].tag = replaceTag(outerTag, tagContent);
            var well = $("#removeModal").find(".well[key='" + key + "']");

            var wrap = well.find(".markup:first").wrap("<p>").parent();
            wrap.contents().remove();
            wrap.append($(firstTag).clone().removeClass("selected"));
            wrap.contents().unwrap();

            // well.find(".markup:first").outerHTML = $(firstTag).clone().removeClass("selected").outerHTML;

            $(well).find(".glyphicon-ok-circle").click();
            $(well).find(".cbdbIds,.glyphicon-floppy-disk,.switch").hide();


        }
    }


    $(".justAdd").removeClass("justAdd");
    $(".justExtended").removeClass("justExtended");
    $("#removeModal").trigger("update");
};

var initialRemoveModal = function() {
    $("#applyAllBtn").removeClass("fired");
    $("#removeAllBtn").removeClass("fired");
};


var updateRemoveModal = function() {

    // console.log($("#removeModal").find(".well").length);
    switch ($("#removeModal").find(".well").length) {
    case 0:
        $("#removeModal").modal("hide");
        break;
    case 1:
        $("#removeAllBtn").hide();
        $("#applyAllBtn").hide();
        break;
    default:
        $("#removeModal").find(".sameTags .well:first").css({
            "border-width": "2px",
            "border-color": "#8D8C8C",
            "background-color": "#D8D5D5"
        });
        if (!$("#removeAllBtn").hasClass("fired")) {
            $("#removeAllBtn").show();
        } else {
            $("#removeAllBtn").fadeOut();
        }
        if (!$("#applyAllBtn").hasClass("fired")) {
            $("#applyAllBtn").show();
        } else {
            $("#applyAllBtn").fadeOut();
        }

    }

};




var getAllunLockedKeys = function() {
    var keys = [];
    $("#removeModal").find(".glyphicon-trash:not(.disabled)").each(function() {
        keys.push($(this).attr("key"));
    });
    // console.log(keys);
    return keys;
};



var getTheOuterTag = function(tag) {
    var parent = $(tag).parent();
    while ($(tag).text() == $(parent).text()) {
        parent = $(parent).parent();
        tag = parent;
    }
    return tag;
};

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

var getTheTagContent = function(tag) {
    var clone = $(tag).clone();
    // var _html = $(clone).removeClass("selected").wrap('<p>').parent().html();
    var _html = $(clone).removeClass("selected")[0].outerHTML;
    clone.remove();
    return _html;
};



var applyAllSameType = function() {

    /* find the clicked in removeSameTags Id. , well, need to change the removeSameTags to others
       or plan another 'types' storing schema
    */
    var clickedMarkup = _m.popup.clickedMarkup;

    $("#applyAllBtn").addClass("fired");

    var cbdbId = markus.util.converBackToUnicode($(clickedMarkup).attr("cbdbid"));
    $("#removeModal").find(".row").each(function() {
        if ($(this).has(".glyphicon-trash:not(.disabled)").length) {
            $(this).find(".cbdbIds").each(function() {
                $(this).find("input").val(cbdbId).parent().find("a").click();
            });
        }
    });

    $("#removeModal").trigger("update");

};


var removeSameTag = function(key) {
    var tag = removeSameTags[key].tag;
    var parent = $(tag).parent();
    var child = $(tag).find(".markup");
    var text = $(tag).text();
    $(tag).addClass("remove");
    if ($(parent).text() == text) {
        $(parent).addClass("remove");
    }
    if ($(child).text() == text) {
        $(child).addClass("remove");
    }

    $(".doc").find(".remove").contents().unwrap();


    $("#removeModal").find(".well[key='" + key + "']").fadeOut({
        complete: function() {
            $("#removeModal").find(".well[key='" + key + "']").remove();
            $("#removeModal").trigger("update");
        }
    });

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
    var clickedMarkup = _m.popup.clickedMarkup;

    var _parent = $(clickedMarkup).parent();
    // console.log("typeSave");
    $("#typePopoverContent").find("button.noColor").each(function() {
        if (_parent) {
            if ($(this).hasClass($(_parent).attr("type"))) {
                $(_parent).contents().unwrap();
                _parent = null;
            }
        }
        if (clickedMarkup) {
            if ($(this).hasClass($(clickedMarkup).attr("type"))) {
                $(clickedMarkup).contents().unwrap();
                clickedMarkup = null;
            }
        }

    });
    $(".popover").hide();
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
    popover: null,
    clickedMarkup: null,

    searchMarkup: searchMarkup,
    showSameMarkup: showSameMarkup,
    registMarkupPopup: function(editable) {
        _m.popup.registPopover($("#popover"));
        markupEditable = editable || false;

        $(document).on("click", ".doc", function() {
            $(".selected").removeClass("selected");
            $(".popover").hide();
            _m.popup.clickedMarkup = null;

            $(".justSelected.markup").removeClass("justSelected");
            // $(".justExtended").contents().unwrap();
            $(".justSelected,.justExtended").contents().unwrap();
        });

        $("#cbdbIdPopoverContent a").on("click", cbdbIdSave);
        $("#typePopoverContent a").on("click", typeSave);
        $("#popover .search a").on("click", showSameMarkup);
        $("#popover .trash a").on("click", removeMarkup);
        $("#popover .glyphicon-book").on("click", searchMarkup);


        $(document).on("click", ".doc .markup", _m.popup.markupClicked);
        $(document).on("click", ".sameTagTypeSave", sameTagTypeSave);


        $(document).on("click", "#typePopoverContent .switch", function() {
            $(this).toggleClass("noColor");
        });

        $("#removeAllBtn").on("click", removeAllSameTag);

        $("#applyAllBtn").on("click", applyAll);

        $("#cancelBtn").on("click", function() {
            $("#removeModal").modal("hide");
        });

        // console.log(_m.util.urlParam('file'));

        $("#removeModal").on("update", updateRemoveModal);
        $("#removeModal").on("initial", initialRemoveModal);

        $("#removeModal").on("hide.bs.modal", function() {
            // var parent = $(".justSelected,.justExtended").parent();
            $(".justSelected,.justExtended").contents().unwrap();

        });
    },


    registPopover: function(popover) {
        this.popover = popover;
    },
    markupClicked: function(event) {
        event.stopPropagation();

        $(".popover").hide();

        var obj = $(this);
        var _parent = obj.parent(),
            offset = obj.offset(),
            tagText = obj.text();

        var otherTags = $(".doc").find(".markup").filter(function(index) {
            return (tagText == $(this).text()) && $(obj).parent() != this && obj != this;
        });

        // remove previous selected tag
        $(".markup.selected").removeClass("selected");

        // update as selected tag
        obj.addClass("selected");

        // console.log($(this));
        _m.popup.clickedMarkup = $(this);

        var popover = _m.popup.popover;
        popover.find(".tagText").hide();




        /*
          start
          Nested multi tags detect and show popup 
        */

        var typePopoverContent = popover.find("#typePopoverContent");
        typePopoverContent.hide();

        typePopoverContent.find("button").removeClass("noColor").removeAttr("disabled").hide();


        var sameTag = false;

        while (_parent.is(".markup") && _parent.text() == tagText) {
            sameTag = true;
            typePopoverContent.find("." + $(_parent).attr("type")).show();
            _parent = _parent.parent();
        }
        if (sameTag) {
            typePopoverContent.find("." + $(this).attr("type")).show();
            typePopoverContent.show();
        } else {
            typePopoverContent.find("." + $(this).attr("type")).attr("disabled", "disabled").show();
            typePopoverContent.show();
        }

        /*
          end nested multi tags
        */




        if (markupEditable) {
            if (otherTags.length > 0) {
                popover.find(".search").show();
                popover.find(".trash").show();
            } else {
                popover.find(".trash").show();
                popover.find(".search").hide();
            }
        } else {
            if (otherTags.length > 0) {
                popover.find(".search").show();
                popover.find(".trash").hide();
            } else {
                popover.find(".trash").hide();
                popover.find(".search").hide();
            }
        }





        popover.show().offset({
            top: offset.top + $(this).height() / 2 - popover.outerHeight() / 2,
            left: offset.left + obj.outerWidth() + 11
        });

        if (obj.hasClass("fullName") || obj.hasClass("partialName") || (obj.hasClass("markup") && (obj.attr(obj.attr("type") + "_id") !== null))) {
            var colorClass = "";
            if (obj.hasClass("fullName")) {
                colorClass = "btn-danger";
                $("#cbdbIdPopoverContent").addClass("has-error").removeClass("has-warning");
            } else {
                colorClass = "btn-warning";
                $("#cbdbIdPopoverContent").addClass("has-warning").removeClass("has-error");
            }

            if (markupEditable) {
                var cbdbIdPopover = $("#cbdbIdPopover");
                var cbdbIdPopoverContent = cbdbIdPopover.find("#cbdbIdPopoverContent");
                var cbdbIdsHTML = "";
                cbdbIdPopoverContent.find("button").remove();

                if (obj.hasClass("fullName") || obj.hasClass("partialName")) {
                    if (!obj.attr("cbdbid")) {

                        obj.attr("cbdbid", "");

                    }
                    if ($(this).attr("cbdbid")) {
                        var cbdbids = $(this).attr("cbdbid").split("|");


                        for (var i = 0; i < cbdbids.length; i++) {
                            if (cbdbids[i].length > 0) {
                                cbdbIdsHTML += "<button class='btn " + colorClass + " btn-xs' style='margin-bottom: 1px;'>" + cbdbids[i] + "</button> ";
                            }
                        }
                    }

                } else {
                    if (!$(this).attr($(this).attr("type") + "_id")) {
                        $(this).attr($(this).attr("type") + "_id", "");
                    }
                    var ids = $(this).attr($(this).attr("type") + "_id").split("|");
                    if (ids.length > 0) {
                        for (var i = 0; i < ids.length; i++) {
                            if (ids[i].length > 0) {
                                cbdbIdsHTML += "<button class='btn " + obj.attr("type") + " btn-xs' style='margin-bottom: 1px;'>" + markus.util.converBackToUnicode(ids[i]) + "</button> ";
                            }

                        }
                        cbdbIdPopover.find("#cbdbIdPopoverContent input").attr("placeholder", "ID");
                    // $("#cbdbIdPopoverContent a").on("click", function() {
                    //     console.log("clicked")
                    // });
                    }

                }

                // console.log('$(this).attr("cbdbid").split("|")');






                // console.log(cbdbIdsHTML);


                $(cbdbIdPopoverContent).prepend(cbdbIdsHTML);
                if (offset.top - cbdbIdPopover.outerHeight() - 11 < $(".doc").offset().top) {

                    cbdbIdPopover.addClass("bottom").removeClass("top").show().offset({
                        top: offset.top + obj.outerHeight() + 11,
                        left: offset.left + obj.outerWidth() / 2 - cbdbIdPopover.outerWidth() / 2
                    });
                } else {

                    cbdbIdPopover.addClass("top").removeClass("bottom").show().offset({
                        top: offset.top - cbdbIdPopover.outerHeight() - 11,
                        left: offset.left + obj.outerWidth() / 2 - cbdbIdPopover.outerWidth() / 2
                    });
                }
                $(cbdbIdPopoverContent).find("button").on("click", function() {

                    $(this).toggleClass("noColor");
                });

            }

        }

    }



};




} )(markus);
