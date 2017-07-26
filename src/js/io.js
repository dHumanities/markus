( function(_m) {
var ERROR_HANDLER = function(e) {
    console.log('Error: ' + e.message);
};

var updateSwitchers = function() {
    if ($("#buttonsRow").length > 0) {
        for (var tagName in _m.tag) {
            var buttonName = _m.tag[tagName]["buttonName"] || tagName;
            var status = _m.tag[tagName]["status"] || "";
            if ($("#buttonsRow").find("button[color-switcher-class='" + tagName + "']").length == 0) {
                $("#buttonsRow").prepend('<button type="button" class="btn btn-sm switcher ' + tagName + ' ' + status + '" color-switcher-class="' + tagName + '" data-toggle="tooltip" data-placement="auto" title="" data-original-title="click to change color">' + buttonName + '</button> ');
            } else {
                if (_m.tag[tagName]["buttonName"]) {
                    $("#buttonsRow").find("button[color-switcher-class='" + tagName + "']").text(buttonName).addClass(status);
                }
            }
            var visible = _m.tag[tagName]["visible"];
            if (!visible) {
                $("#buttonsRow").find("button[color-switcher-class='" + tagName + "']").hide();
            }
        }
    } else {
        setTimeout(updateSwitchers, 3000);
    }
};




var updateManualPopover = function() {
    for (var tagName in _m.tag) {
        var buttonName = _m.tag[tagName]["buttonName"] || tagName;
        if ($("#manualPopover .singleTagContent").find("button[_type='" + tagName + "']").length == 0) {
            $("#manualPopover .singleTagContent").prepend('<button type="button" _type="' + tagName + '" class="btn btn-xs switch ' + tagName + ' switcher noColor">' + buttonName + '</button>');
        } else {
            if (_m.tag[tagName]["buttonName"]) {
                $("#manualPopover .singleTagContent").find("button[_type='" + tagName + "']").text(buttonName);
            }
        }
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

var newTagCSS = function(tagName, buttonName, tagColor) {
    removeTagCSS(tagName);
    buttonName = buttonName || tagName;
    _m.tag = _m.tag || {};
    if (_m.tag[tagName] == null) {
        _m.tag[tagName] = {
            color: tagColor,
            buttonName: buttonName,
            visible: true,
            status: ""
        };
    } else {
        _m.tag[tagName].color = tagColor;
    }
    _m.tagCSS[tagName] = [];
    $.stylesheet('button.' + tagName, ['background-color', 'border-color'], tagColor);
    $.stylesheet('button.' + tagName, ['color'], "#fff");
    _m.tagCSS[tagName].push({
        tagName: 'button.' + tagName,
        cssKey: ["color"],
        cssValue: "#fff"
    });
    _m.tagCSS[tagName].push({
        tagName: 'button.' + tagName,
        cssKey: ['background-color', 'border-color'],
        cssValue: tagColor
    });

    // tagCSS['.'+tagName].push($.stylesheet('.'+tagName).rules()[0].cssText);
    $.stylesheet('.' + tagName, {
        "color": tagColor
    });
    _m.tagCSS[tagName].push({
        tagName: '.' + tagName,
        cssKey: ["color"],
        cssValue: tagColor
    });


    // $ss.css(,tagColor);
    // console.log('.selected.'+tagName+"'");
    $.stylesheet('.selected.' + tagName, ['background-color', 'border-color'], tagColor);


    _m.tagCSS[tagName].push({
        tagName: '.selected.' + tagName,
        cssKey: ['background-color', 'border-color'],
        cssValue: tagColor
    });

    $.stylesheet('.bordered.' + tagName, ['border-color'], tagColor);


    _m.tagCSS[tagName].push({
        tagName: '.bordered.' + tagName,
        cssKey: ['border-color'],
        cssValue: tagColor
    });

};






var removeTagCSS = function(tagName) {
    delete _m.tagCSS[tagName]
    ;
    delete _m.tag[tagName]
    ;
};





var loadCSSFromCSS_TagAtt = function() {
    var tagCSSAttr = $(".doc").attr("tagCSS");
    var tagAttr = $(".doc").attr("tag");

    if ((typeof tagCSSAttr !== typeof undefined && tagCSSAttr !== false) && (typeof tagAttr === typeof undefined || tagAttr === false || tagAttr === "{}")) {
        var tagCSS = _m.tagCSS = $.evalJSON($(".doc").attr("tagCSS"));
        var tagRebuilt = {};

        for (var tag in _m.tagCSS) {
            var cssArray = tagCSS[tag];
            for (var cssIndex in cssArray) {
                css = cssArray[cssIndex];
                if (css.tagName == "." + tag) {
                    newTagCSS(css.tagName, css.tagName, css.cssValue);

                }
            }
        }
        $(".doc").attr("tag", JSON.stringify(_m.tag));
        tagAttr = $(".doc").attr("tag");
    }
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
    if (typeof tagAttr !== typeof undefined && tagAttr !== false) {
        _m.tag = $.evalJSON(markus.util.converBackToUnicode($(".doc").attr("tag")));

        for (var tagName in _m.tag) {
            var tagColor = _m.tag[tagName].color;
            _m.tagCSS[tagName] = [];
            $.stylesheet('.' + tagName, {
                "color": tagColor
            });
            _m.tagCSS[tagName].push({
                tagName: '.' + tagName,
                cssKey: ["color"],
                cssValue: tagColor
            });
            $.stylesheet('.selected.' + tagName, ['background-color', 'border-color'], tagColor);
            _m.tagCSS[tagName].push({
                tagName: '.selected.' + tagName,
                cssKey: ['background-color', 'border-color'],
                cssValue: tagColor
            });
            $.stylesheet('.bordered.' + tagName, ['border-color'], tagColor);
            _m.tagCSS[tagName].push({
                tagName: '.bordered.' + tagName,
                cssKey: ['border-color'],
                cssValue: tagColor
            });
            $.stylesheet('button.' + tagName, ['background-color', 'border-color'], tagColor);
            $.stylesheet('button.' + tagName, ['color'], "#fff");
            _m.tagCSS[tagName].push({
                tagName: 'button.' + tagName,
                cssKey: ["color"],
                cssValue: "#fff"
            });
            _m.tagCSS[tagName].push({
                tagName: 'button.' + tagName,
                cssKey: ['background-color', 'border-color'],
                cssValue: tagColor
            });
        }




    }
    _m.tag["fullName"] = _m.tag["fullName"] || {
        buttonName: "姓名",
        visible: true,
        color: "#d9534f",
        status: ""
    };
    _m.tag["partialName"] = _m.tag["partialName"] || {
        buttonName: "別名",
        visible: true,
        color: "#f0ad4e",
        status: ""
    };
    _m.tag["placeName"] = _m.tag["placeName"] || {
        buttonName: "地名",
        visible: true,
        color: "#428bca",
        status: ""
    };
    _m.tag["officialTitle"] = _m.tag["officialTitle"] || {
        buttonName: "官名",
        visible: true,
        color: "#5bc0de",
        status: ""
    };
    _m.tag["timePeriod"] = _m.tag["timePeriod"] || {
        buttonName: "時間",
        visible: true,
        color: "green",
        status: ""
    };
    updateSwitchers();
    updateManualPopover();

};

var autoDownload = function(fileEntry, suffix) {
    $("#saving_temp").remove();
    $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + suffix);
    $('#export')[0].click();
};

var saveSave = function(filename, _fn) {
    
    $("body").prepend($("<span id='saving_temp' style='display:none'></span>"));

    var div = $("#saving_temp");
    // $("#saving_temp").html($("#content").html());
    div.html(($(".doc")[0]).outerHTML);
    div.find(".notSave,iframe").remove();
    div.find(".justSelected,.justExtended").removeClass("justSelected").removeClass("justExtended");
    div.find(".markup[randomID]").removeAttr("randomID");

    var saveContent = $("#saving_temp").html();
    saveFile(filename, _m.util.recoverAllExistTag(saveContent), _fn

    
    );
    $("#saving_temp").remove();

};

var saveTEI = function(filename) {
    var head = '<?xml version="1.0" encoding="UTF-8"?><TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:xi="http://www.w3.org/2001/XInclude"><teiHeader><fileDesc><titleStmt><title>' + filename + '</title></titleStmt><publicationStmt><p/></publicationStmt><sourceDesc><p/></sourceDesc></fileDesc></teiHeader><text><body>';
    var tail = "</body></text></TEI>";
    var saveContent = head + convertTEI(($(".doc")[0]).outerHTML) + tail;
    saveFile(filename, saveContent, function(fileEntry) {
        $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + "_tei.xml");
        $('#export')[0].click();
    });
};

var saveHTML = function(filename) {
    var head = "<html><head><meta charset='utf-8'/></head><link rel='stylesheet' href='http://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css'><style>.noCBDBID{border-bottom:thin solid red}.previous{display:none}name,persName{background:red}pre{white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word}.unsolved{font-size:large}.fullName{color:#b94a48}.partialName{color:orange}.nianhao{color:green}.markup .markup.unsolved{border-right:medium dotted red}.placeName{color:#428bca}.doc{padding:10px}.moreThanOneId{border-bottom:medium dotted red}.moreThanOneId.wrong{border-bottom:0}#drop_zone{border:2px dashed #fff;-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5px;padding:25px;text-align:center;font:20pt bold Vollkorn;color:#fff}#content{padding-top:20px}div.layout{text-align:center}div.centre{text-align:left;width:10px;display:block;margin-left:auto;margin-right:auto}.stop-scrolling{height:100%;overflow:hidden}.markup.noColor{color:inherit}.officialTitle{color:#5f9ea0}.btn.noColor{background-color:silver;border-color:rgba(0,0,0,0);color:inherit}.markup.selected{padding-right:5px;padding-left:5px;line-height:1.5;border-radius:3px;color:#fff}.selected .markup{color:#fff}.fullName.selected{background-color:#d9534f;border-color:#d43f3a}.partialName.selected{background-color:#f0ad4e;border-color:#eea236}.nianhao.selected{background-color:#5cb85c;border-color:#4cae4c}.placeName.selected{background-color:#428bca;border-color:#357ebd}.officialTitle.selected{background-color:#5bc0de;border-color:#46b8da}#helpModal .modal-header{display:none}.popover .btn{color:#fff}.hidden {display:none}.halfTransparent {opacity:0.3}</style>";
    var style = "<style>";
    var bodyhead = "<body><div class='container'><div class='row row-offcanvas row-offcanvas-right'>";
    var bodytail = "</div></div>";
    var tail = "</body></html>";
    var tagCSS = _m.tagCSS;
    for (var tag in tagCSS) {
        cssArray = tagCSS[tag];
        for (var cssIndex in cssArray) {
            css = cssArray[cssIndex];
            $.stylesheet(css.tagName, css.cssKey, css.cssValue);
            style += $.stylesheet(css.tagName).rules()[0].cssText;
        }
    }

    style += "</style>";
    $("body").prepend($("<span id='saving_temp' style='display:none'></span>"));

    var div = $("#saving_temp");
    // $("#saving_temp").html($("#content").html());
    div.html(_m.util.converBackToUnicode(($(".doc")[0]).outerHTML));
    div.find(".notSave,iframe").remove();
    div.find(".justSelected,.justExtended").removeClass("justSelected").removeClass("justExtended");
    div.find(".markup[randomID]").removeAttr("randomID");

    // $.copyAttrs($("#content .doc"),div);

    var saveContent = head + style + bodyhead + $("#saving_temp").html() + bodytail + tail;
    console.log($("#saving_temp").html());
    saveFile(filename, saveContent, function(fileEntry) {
        $("#saving_temp").remove();
        $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + "_layout.html");
        $('#export')[0].click();
    });
};


var saveFile = function(filename, text, _fn, errorHandler) {
    if (errorHandler === null) {
        errorHandler = ERROR_HANDLER;
    }
    console.log("exporting start");
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        console.log("exporting file");
        fs.root.getFile(filename, {
            create: true
        }, function(fileEntry) {
            // fileEntry.remove(function(){}, function(){});
            fileEntry.createWriter(function(fileWriter) {
                // console.log($("#temp").html());
                var blob = new Blob([text], {
                    type: 'text/plain'
                });

                fileWriter.addEventListener("writeend", function() {
                    if (_fn) {
                        _fn(fileEntry);
                    }
                }, false);
                fileWriter.write(blob);
            }, ERROR_HANDLER);
        }, ERROR_HANDLER);
    }, ERROR_HANDLER);
};


var removeFile = function(filename, _fn, errorHandler) {
    if (errorHandler === null) {
        errorHandler = ERROR_HANDLER;
    }
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        fs.root.getFile(filename, {
            create: false
        }, function(fileEntry) {

            fileEntry.remove(function() {
                if (_fn) {
                    _fn(fileEntry);
                }
            }, errorHandler);

        }, errorHandler);
    }, errorHandler);
};

_m.io = {
    removeFile: removeFile,
    saveFile: saveFile,
    readFile: function(_file, _fn, errorHandler) {
        if (errorHandler === null) {
            errorHandler = ERROR_HANDLER;
        }
        function onInitFs(fs) {
            fs.root.getFile(_file, {}, function(fileEntry) {
                // fs.root.getFile(file+'.html', {}, function(fileEntry) {
                // Get a File object representing the file,
                // then use FileReader to read its contents.
                fileEntry.file(function(_file) {
                    var reader = new FileReader();
                    reader.onloadend = ( function(file) {
                        return function(evt) {
                            if (_fn) {
                                _fn(this.result, file);
                                loadCSSFromCSS_TagAtt();
                            }
                        };
                    } )(_file);
                    reader.readAsText(_file);
                }, errorHandler);

            }, errorHandler);

        }
        window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
    },
    exportSave: function(filename) {
        $(".doc").attr("tag", _m.util.convertToEscapeUnicode($.toJSON(_m.tag)));
        $(".doc").removeAttr("tagCSS");
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
    exportTEI: function(filename) {
        $(".doc").attr("tag", _m.util.convertToEscapeUnicode($.toJSON(_m.tag)));
        $(".doc").removeAttr("tagCSS");
        removeFile(filename + "_tei.xml", function() {
            saveTEI(filename + "_tei.xml");
        }, function() {
            saveTEI(filename + "_tei.xml");
        });
    },
    exportHTML: function(filename) {
        $(".doc").attr("tag", _m.util.convertToEscapeUnicode($.toJSON(_m.tag)));
        $(".doc").removeAttr("tagCSS");
        removeFile(filename + "_layout.html", function() {
            saveHTML(filename + "_layout.html");
        }, function() {
            saveHTML(filename + "_layout.html");
        });
    },
    save: function(filename, _fn) {

        if (Object.keys(_m.tag).length > 0) {
            $(".doc").attr("tag", _m.util.convertToEscapeUnicode($.toJSON(_m.tag)));
        }

        $(".doc").removeAttr("tagCSS");
        removeFile(filename + ".html", function() {
            saveSave(filename + ".html", _fn);
        }, function() {
            saveSave(filename + ".html", _fn);
        });
    },
    newTagCSS: newTagCSS,
    removeTagCSS: removeTagCSS,
    updateSwitchers: updateSwitchers,
    updateManualPopover: updateManualPopover,
    loadCSSFromCSS_TagAtt: loadCSSFromCSS_TagAtt


};

} )(markus);

var registeTagManageUI = function() {
    $("#manageTagModal").on("show.bs.modal", function() {
        var tbody = $("#manageTagModal .modal-body .manageTagTable");
        tbody.empty();


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
    $("#setManageTagBtn").on("click", function() {
        $("#manageTagModal .modal-body .tagSetting").each(function() {

            var tagSwitcher = $(this).attr("color-switcher-class");
            var fix = ($("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").attr("data-markus-default") == "true");
            var buttonName = $(this).find("input.form-control[data-markus-value='color-switcher-class']").val();
            var tagName = markus.util.chineseToPingYin($(this).find("input.form-control[data-markus-value='tagName']").val()).trim();

            if (buttonName.trim() === "") {
                buttonName = "　";
            }

            if (tagName != tagSwitcher) {
                var tagColor = markus.tag[tagSwitcher].color;
                markus.io.removeTagCSS(tagSwitcher);
                markus.io.newTagCSS(tagName, tagColor);

                $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").removeClass(tagSwitcher).addClass(tagName).attr("color-switcher-class", tagName);
                $("#manualPopover .singleTagContent button." + tagSwitcher).removeClass(tagSwitcher).addClass(tagName).attr("_type", tagName);
                $(".doc ." + tagSwitcher).removeClass(tagSwitcher).addClass(tagName).attr("type", tagName);
            }

            markus.tag[tagSwitcher] = markus.tag[tagSwitcher] || {
                color: tagColor,
                buttonName: buttonName,
                status: ""
            };
            markus.tag[tagSwitcher].buttonName = buttonName;
            var visble = markus.tag[tagSwitcher]["visible"] = $(this).find("input[data-markus-action='shortcut']").is(":checked");
            if (visble) {
                $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").show();
                $("#manualPopover .singleTagContent button." + tagSwitcher).show();
                $("#buttonsRow [color-switcher-class='" + tagSwitcher + "']").text(buttonName);
                $("#manualPopover .singleTagContent button." + tagSwitcher).text(buttonName);

            } else {
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
    $("#newTagBtn").on("click", function() {
        var tagName = markus.util.chineseToPingYin($("#manageTagModal .newTagTable [data-markus-value='tagName']").val()).trim();
        var buttonName = $("#manageTagModal .newTagTable [data-markus-value='color-switcher-class']").val();
        if (buttonName.trim() === "") {
            buttonName = "　";
        }
        var tagColor = $("#manageTagModal .tagColor").val();

        markus.io.newTagCSS(tagName, buttonName, tagColor);
        $("#manageTagModal .newTagTable [data-markus-value='tagName']").val("");
        $("#manageTagModal .newTagTable [data-markus-value='color-switcher-class']").val("");
        markus.io.updateSwitchers();
        markus.io.updateManualPopover();
        $("#manageTagModal").modal("toggle");



    });
};