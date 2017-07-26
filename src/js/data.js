( function(_m) {


_m.data = {
    getMarkupsArray: function(withPassage, withSupportText, noOfChars) {

        var content = [];
        var withPassage = withPassage || false;
        var noOfChars = noOfChars || 10;
        var withSupportText = withSupportText || false;
        var count = 0;

        if (withSupportText) {
            $(".doc").find(".markup[type]").each(function() {
                $(this).attr("data-MARKUS-randomID", count++);
            });

        }

        if (withPassage && $(".doc").find(".passage,.entry").length > 0) {
            $(".doc").find(".passage,.entry").each(function() {
                var text = $(this).html().replace(/\n/gm, "");
                if (!$(this).hasClass("hidden") && !$(this).hasClass("halfTransparent")) {
                    var passageId = $(this).attr("id");
                    $(this).find(".markup[type]").each(function() {

                        var type = $(this).attr("type");
                        var tag = $(this).text();
                        var id = $(this).attr("cbdbid") || $(this).attr(type + "_id") || "";
                        var obj = {
                            passageId: passageId,
                            type: type,
                            id: markus.util.converBackToUnicode(id)
                        };
                        if (withSupportText) {
                            var headAndTail = text.split($(this)[0].outerHTML);
                            obj["textBeforeTag"] = (headAndTail.length > 0) ? (headAndTail[0]).replace(/<[^>]*>/gm, "").slice(-noOfChars) : "";
                            obj.tag = tag;
                            obj["textAfterTag"] = (headAndTail.length > 1) ? (headAndTail[1]).replace(/<[^>]*>/gm, "").slice(0, noOfChars) : "";
                        } else {
                            obj.tag = tag;
                        }

                        content.push(obj);
                    });

                    $(this).find(".commentContainer").each(function() {
                        var comments = $.parseJSON(markus.util.converBackToUnicode($(this).attr("value")));
                        var type = "comment";
                        for (var i = 0; i < comments.length; i++) {
                            var tag = comments[i];
                            var id = i;
                            var obj = {
                                passageId: passageId,
                                type: type,
                                id: id
                            };
                            if (withSupportText) {
                                obj["textBeforeTag"] = "";
                                obj.tag = tag;
                                obj["textAfterTag"] = "";
                            } else {
                                obj.tag = tag;
                            }

                            content.push(obj);
                        }

                    });

                }

            });
        } else {
            $(".doc").find(".markup[type]").each(function() {
                var type = $(this).attr("type");
                var tag = $(this).text();
                var id = $(this).attr("cbdbid") || $(this).attr(type + "_id") || "";
                var obj = {
                    type: type,
                    id: markus.util.converBackToUnicode(id)
                };
                if (withSupportText) {
                    var headAndTail = text.split($(this)[0].outerHTML);
                    obj["textBeforeTag"] = (headAndTail.length > 0) ? (headAndTail[0]).replace(/<[^>]*>/gm, "").slice(-noOfChars) : "";
                    obj.tag = tag;
                    obj["textAfterTag"] = (headAndTail.length > 1) ? (headAndTail[1]).replace(/<[^>]*>/gm, "").slice(0, noOfChars) : "";
                } else {
                    obj.tag = tag;
                }

                content.push(obj);
            });
        }

        $(".doc").find(".markup[type]").removeAttr("data-MARKUS-randomID");

        return content;
    },

    objArrayToCSV: function(objArray) {
        var content = [];
        if (objArray.length > 0) {
            var keys = [];
            var header = [];
            for (var k in objArray[0]) {
                keys.push(k);
                header.push(k.replace(/,/gm, '\,'));
            }

            content.push(header.join(","));
            for (var dIndex in objArray) {
                var _temp = objArray[dIndex];
                var _row = [];
                for (var kIndex in keys) {
                    _row.push('"' + ("" + _temp[keys[kIndex]]).replace(/"/gm, '""') + '"');
                }
                content.push(_row.join(","));
            }

        }
        return content.join("\n");
    },

    objArrayToTSV: function(objArray) {
        var content = [];
        if (objArray.length > 0) {
            var keys = [];
            var header = [];
            for (var k in objArray[0]) {
                keys.push(k); header.push(k.replace(/\t/gm, '_'));
            }

            content.push(header.join("\t"));
            for (var dIndex in objArray) {
                var _temp = objArray[dIndex];
                var _row = [];
                for (var kIndex in keys) {
                    _row.push('"' + ("" + _temp[keys[kIndex]]).replace(/"/gm, '""') + '"');
                }
                content.push(_row.join("\t"));
            }
        }
        return content.join("\n");
    },

    objArrayToHTML: function(objArray) {
        var content = [];
        if (objArray.length > 0) {
            content.push("<table id='exportTable' class='export'>");
            var keys = [];
            content.push("<thead><tr>");
            for (var k in objArray[0]) {
                keys.push(k);
                content.push("<td>" + k + "</td>");
            }
            content.push("</tr></thead><tbody>");
            for (var dIndex in objArray) {
                var _temp = objArray[dIndex];
                content.push("<tr>");
                for (var kIndex in keys) {
                    content.push("<td>" + _temp[keys[kIndex]] + "</td>");
                }
                content.push("</tr>");
            }
            content.push("</tbody></table>");
        }
        return content.join("");
    }

};


} )(markus);
