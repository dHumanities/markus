( function(_m) {


var markupToTSV = function(dataArray) {
    return _m.data.objArrayToTSV(dataArray);
}


var markupToCSV = function(dataArray) {
    return _m.data.objArrayToCSV(dataArray);
}


var markupToHTML = function(dataArray) {
    return _m.data.objArrayToHTML(dataArray);
}


var markupTypeUniqueAndQuantitySummary = function(markupArray) {
    var summary = {};
    for (var index in markupArray) {
        var tag = markupArray[index];
        // console.log(tag.type);
        var typeCount = summary[tag.type] || {
                unique: 0,
                count: 0
            };
        var tagCount = typeCount[tag.tag];
        if (!tagCount) {
            tagCount = {
                count: 0
            };
            typeCount.unique++;
        }
        tagCount.count++;
        typeCount.count++;
        typeCount[tag.tag] = tagCount;
        summary[tag.type] = typeCount;
    }
    return summary;
}


var exportCSV = function(csvFn, dataArray, fileType) {
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        fs.root.getFile($('.doc').attr('filename') + ".data." + fileType, {
            create: false
        }, function(fileEntry) {

            fileEntry.remove(function() {
                console.log('File removed.');
                saveCSV(csvFn, dataArray, fileType);
            }, function() {
                saveCSV(csvFn, dataArray, fileType);
            });
        }, function() {
            saveCSV(csvFn, dataArray, fileType);
        });
    }, function() {
        saveCSV(csvFn, dataArray, fileType);
    });
}


var save = function(blobFn, dataArray, fileType) {
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        console.log("exporting file");
        fs.root.getFile($('.doc').attr('filename') + ".data.xlsx", {
            create: true
        }, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
                var blob = blobFn(dataArray);
                fileWriter.addEventListener("writeend", function() {

                    $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + ".data." + fileType)
                    $('#export')[0].click();
                }, false);
                fileWriter.write(blob);
            }, _m.util.errorHandler);
        }, _m.util.errorHandler);
    }, _m.util.errorHandler);
}


var genXLSX = function(dataArray) {
    $("body").prepend($("<span id='saving_temp' style='display:none'>" + markupToHTML(dataArray) + "</span>"));
    var theTable = document.getElementById("exportTable");
    var oo = generateArray(theTable);
    var ranges = oo[1];

    /* original data */
    var data = oo[0];
    var ws_name = "MARKUS_EXPORT";
    // console.log(data);

    var wb = new Workbook();
    var ws = sheet_from_array_of_arrays(data);

    /* add ranges to worksheet */
    ws['!merges'] = ranges;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

    var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    });
    $("#saving_temp").remove();
    return new Blob([s2ab(wbout)], {
        type: "application/octet-stream"
    });

}


var saveCSV = function(csvFn, dataArray, fileType) {
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        console.log("exporting file");
        fs.root.getFile($('.doc').attr('filename') + ".data." + fileType, {
            create: true
        }, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
                var blob = new Blob([csvFn(dataArray)]);
                fileWriter.addEventListener("writeend", function() {

                    $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + ".data." + fileType)
                    $('#export')[0].click();
                }, false);
                fileWriter.write(blob);
            }, _m.util.errorHandler);
        }, _m.util.errorHandler);
    }, _m.util.errorHandler);
};

_m.summary = {
    outputXLSX: function(withPassage, withSupportText, noOfChars) {
        var dataArray = _m.data.getMarkupsArray(withPassage, withSupportText, noOfChars);
        save(genXLSX, dataArray, "xlsx");
    },
    dataArray: [],
    summaryArray: [],
    docTagSummary: function() {
        var dataArray = this.dataArray = _m.data.getMarkupsArray(true, false);
        var content = "";
        var summary = this.summaryArray = markupTypeUniqueAndQuantitySummary(dataArray);
        content = "<table class='table table-bordered table-condensed'><thead><tr><td>Type</td><td>Unique</td><td>Total</td></tr></thead><tbody>"

        for (var type in summary) {
            content += "<tr><td class='" + type + "'>" + type + "</td><td>" + summary[type].unique + "</td><td>" + summary[type].count + "</td></tr>";
        }
        content += "</tbody></table>"

        return content;
    },

    outputCSV: function(withPassage, withSupportText, noOfChars) {
        var dataArray = _m.data.getMarkupsArray(withPassage, withSupportText, noOfChars);
        exportCSV(markupToCSV, dataArray, "csv");
    },
    outputTSV: function(withPassage, withSupportText, noOfChars) {
        var dataArray = _m.data.getMarkupsArray(withPassage, withSupportText, noOfChars);
        exportCSV(markupToTSV, dataArray, "txt");

    },
    outputHTML: function(withPassage, withSupportText, noOfChars) {
        var dataArray = _m.data.getMarkupsArray(withPassage, withSupportText, noOfChars);
        exportCSV(markupToHTML, dataArray, "html");
    }


};



} )(markus);

var registMarkupSummary = function() {
    $("#exportDataToCSV").on("click", function() {
        var withPassage = $(".doc .passage").length > 0;
        var withSupportText = $("#withSupportText").prop("checked");
        var noOfChars = $("#noOfCharacter").val();
        markus.summary.outputCSV(withPassage, withSupportText, noOfChars);
    // $.exportCSV(tagToCSV,"csv");
    });
    $("#exportDataToTSV").on("click", function() {
        var withPassage = $(".doc .passage").length > 0;
        var withSupportText = $("#withSupportText").prop("checked");
        var noOfChars = $("#noOfCharacter").val();
        markus.summary.outputTSV(withPassage, withSupportText, noOfChars);
    // $.exportCSV(tagToTSV,"txt");
    });
    $("#exportDataToHTML").on("click", function() {
        var withPassage = $(".doc .passage").length > 0;
        var withSupportText = $("#withSupportText").prop("checked");
        var noOfChars = $("#noOfCharacter").val();
        markus.summary.outputHTML(withPassage, withSupportText, noOfChars);
    // $.exportCSV(tagToHTML,"html");
    });
    $("#exportDataToXLSX").on("click", function() {
        var withPassage = $(".doc .passage").length > 0;
        var withSupportText = $("#withSupportText").prop("checked");
        var noOfChars = $("#noOfCharacter").val();
        markus.summary.outputXLSX(withPassage, withSupportText, noOfChars);
    // $.exportCSV(tagToHTML,"html");
    });
    $("#showSummaryModalBtn").on("click", function() {
        $('#summaryModal a[href="#summary"]').tab('show');
        $("#summaryModal .tagSummary").html(markus.summary.docTagSummary());
        $("#summaryModal").modal("show");
    });
}


var tagToEdges = function() {
    var edges = [];
    var objArray = tagToJSON();
    var uniqueObjArray = [];
    for (var index in objArray) {
        var obj = objArray[index];
        var found = false;
        for (var _index in uniqueObjArray) {
            if (uniqueObjArray[_index].passageId == obj.passageId &&
                    uniqueObjArray[_index].type == obj.type &&
                    uniqueObjArray[_index].tag == obj.tag &&
                    uniqueObjArray[_index].id == obj.id || uniqueObjArray[_index].id == obj.id) {
                // console.log(uniqueObjArray[_index]);
                // console.log(obj);
                found = true;
                break;
            }
        }
        if (!found) {
            uniqueObjArray.push(obj);
        }
    }
    console.log(objArray.length);
    console.log(uniqueObjArray.length);

    if (uniqueObjArray.length > 0) {
        var perviousPassageId = null;
        var processedObjects = [];
        for (var index in uniqueObjArray) {
            var obj = uniqueObjArray[index];
            var passageId = obj.passageId || "";
            if (perviousPassageId == null || passageId != perviousPassageId) {
                processedObjects = [];
                perviousPassageId = passageId;
            }
            for (var _index in processedObjects) {
                var sourceObj = processedObjects[_index];
                edges.push({
                    sourceType: sourceObj.type,
                    sourceTag: sourceObj.tag,
                    sourceId: sourceObj.id,
                    targetType: obj.type,
                    targetTag: obj.tag,
                    targetId: obj.id,
                    passageId: passageId
                });
            }
            processedObjects.push(obj);
        }
    }
    return edges;
}











