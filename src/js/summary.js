/**
 * summary.js base file.
 * @module summary.js
 */

 /**
 The class that holds the variables and functions created in the namespace of this file.
 The constrcutor of this object is only called once, because it is an anonymous function.

 @class summary.js_anonymous
 @constructor
 @param {Object}  _m a reference to the Markus Configuration Object is passed
 **/
( function(_m) {

/**
 * Converts an array of objects into TSV data to be saved. Shortcut to
 * `markus.data.objArrayToTSV`
 *
 * @method markupToTSV
 * @param  {Array} dataArray the data to be converted
 * @return {String}          the string that contains the converted TSV data
 */
var markupToTSV = function(dataArray) {
    return _m.data.objArrayToTSV(dataArray);
}


/**
 * Converts an array of objects into CSV data to be saved. Shortcut to
 * `markus.data.objArrayToCSV`
 *
 * @method markupToCSV
 * @param  {Array} dataArray the data to be converted
 * @return {String}          the string that contains the converted CSV data
 */
var markupToCSV = function(dataArray) {
    return _m.data.objArrayToCSV(dataArray);
}


/**
 * Converts an array of objects into HTML data to be saved. Shortcut to
 * `markus.data.objArrayToHTML`
 *
 * @method markupToHTMl
 * @param  {Array} dataArray the data to be converted
 * @return {String}          the string that contains the converted HTML data
 */
var markupToHTML = function(dataArray) {
    return _m.data.objArrayToHTML(dataArray);
}

/**
 * This function analyses the provided markupArray. It counts every type
 * or tag and saves these statistics in the returned `summary` object. For each
 * type or tag we count the unique and total occurences.
 *
 * @method markupTypeUniqueAndQuantitySummary
 * @param  {Array} markupArray contains the markup data to be analyzed
 * @return {Object}            contains the analysis data ordered by markup type
 */
var markupTypeUniqueAndQuantitySummary = function(markupArray) {
    var summary = {};
    for (var index in markupArray) {
        var tag = markupArray[index];
        // console.log(tag.type);

        //either continue counting if it is a known type, or initialize counting
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
        //Increase the occurence amount
        tagCount.count++;
        typeCount.count++;
        //Save the data in the saveObject for this type
        typeCount[tag.tag] = tagCount;
        //Save that object into the result object to be returned at the end
        summary[tag.type] = typeCount;
    }
    return summary;
}

/**
 * Exports the provided `dataArray` to a file ending in the provided `fileType`
 * extension using the provided `csvFn` function to create the data.
 *
 * @method exportCSV
 * @param  {Function} csvFn    the function that will transform the data to CSV
 * @param  {Array} dataArray  the data Array to be converted
 * @param  {String} fileType  the fileType extension of the file to save
 */
var exportCSV = function(csvFn, dataArray, fileType) {
  //Request a location to save the file.
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
      //Try to find the file for the file we're working on
        fs.root.getFile($('.doc').attr('filename') + ".data." + fileType, {
            create: false
        }, function(fileEntry) {
            //If it exists, remove it
            fileEntry.remove(function() {
                console.log('File removed.');
                //and write a new version
                saveCSV(csvFn, dataArray, fileType);
            }, function() {
              //If it can't be removed, just write
                saveCSV(csvFn, dataArray, fileType);
            });
        }, function() {
          //If the file doesn't exist, just write
            saveCSV(csvFn, dataArray, fileType);
        });
    }, function() {
      //If we can't get access to the FS, just write
        saveCSV(csvFn, dataArray, fileType);
    });
}

/**
 * Writes the provided `dataArray` to a file with the `fileType` extension that
 * was provided using the `bloblFn` function to convert the `dataArray` to a
 * binary blob.
 *
 * @method save
 * @param  {Function} blobFn   the method to convert a dataArray to a Blob
 * @param  {Array} dataArray  the array containing the data
 * @param  {String} fileType  the fileType extension for the resulting saved file
 */
var save = function(blobFn, dataArray, fileType) {
  //Request acces to the fileSystem
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

              //If we don't get WRITE access, log the error using the default error handler
            }, _m.util.errorHandler);

            //If we don't get access, log the error using the default error handler
        }, _m.util.errorHandler);
        //If we don't get access, log the error using the default error handler
    }, _m.util.errorHandler);
}

/**
 * Generates Microsoft Excel data from the provided `dataArray`.
 *
 * @method genXLSX
 * @param  {Array} dataArray the array to be converted into XLSX
 * @return {Blob}           a Blob containing the XLSX data
 */
var genXLSX = function(dataArray) {
  //Temporary HTML holder where we can store the HTML data generated by the markupToHTML function
    $("body").prepend($("<span id='saving_temp' style='display:none'>" + markupToHTML(dataArray) + "</span>"));
    var theTable = document.getElementById("exportTable");
    //Object array generated from the exporttable
    var oo = generateArray(theTable);
    var ranges = oo[1];

    /* original data */
    var data = oo[0];
    var ws_name = "MARKUS_EXPORT";
    // console.log(data);

    //Create a new Workbook, Excel file
    var wb = new Workbook();
    //Generate a sheet from array
    var ws = sheet_from_array_of_arrays(data);

    /* add ranges to worksheet */
    ws['!merges'] = ranges;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    //Attach the sheet to the workbook
    wb.Sheets[ws_name] = ws;

    //Generate a about workbook
    var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    });
    //Remove the temporary HTML holder for the data now that we're done
    $("#saving_temp").remove();

    //Return a new blob containing the output of the XLSX write function
    return new Blob([s2ab(wbout)], {
        type: "application/octet-stream"
    });

}

/**
 * Saves the provided `dataArray` to a file with the `fileType` extension using
 * the `csvFn` function.
 *
 * @method saveCSV
 * @param  {Function} csvFn     the funtion to convert array to csv
 * @param  {Array} dataArray the array of data
 * @param  {String} fileType  the extension of the saveFile
 */
var saveCSV = function(csvFn, dataArray, fileType) {
  //Request access to the FS
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        console.log("exporting file");
        //Try to get reference to the file
        fs.root.getFile($('.doc').attr('filename') + ".data." + fileType, {
            create: true
        }, function(fileEntry) {
          //Try to get write access to the file
            fileEntry.createWriter(function(fileWriter) {
                var blob = new Blob([csvFn(dataArray)]);
                fileWriter.addEventListener("writeend", function() {

                    $('#export').attr("href", fileEntry.toURL()).attr("download", $('.doc').attr('filename') + ".data." + fileType)
                    $('#export')[0].click();
                }, false);
                //Finally write to the file
                fileWriter.write(blob);
                //If there is an error along the way, log it with the default error handler
            }, _m.util.errorHandler);
        }, _m.util.errorHandler);
    }, _m.util.errorHandler);
};

/**
 * Defines the functions and variables availabe to the code outside of this file through
 * the `markus.summary` object. Uses some functions that have been defined in the summary.js_anonymous
 * namespace.
 *
 * @class Summary
 */
_m.summary = {
    /**
     * Saves the data filtered by the provided boolean flags to a XLSX file.
     * First calls `markus.data.getMarkupsArray` with the provided parameters,
     * then calls the `save` function from the summary.js_anonymous namespace
     * using the generated dataArray
     *
     * @method outputXLSX
     * @param  {boolean} withPassage     if we want the passage that contains the markup
     * @param  {boolean} withSupportText if we want surrounding text
     * @param  {number} noOfChars       the number of chars to include
     */
    outputXLSX: function(withPassage, withSupportText, noOfChars) {
        var dataArray = _m.data.getMarkupsArray(withPassage, withSupportText, noOfChars);
        save(genXLSX, dataArray, "xlsx");
    },
    /**
     * Array that holds data that can be saved. Empty by default.
     *
     * @type {Array}
     */
    dataArray: [],

    /**
     * Array that holds a summary of all the tag types. Empty by default
     *
     * @type {Array}
     */
    summaryArray: [],

    /**
     * Creates a summary of the document tags in a HTML table. Returns the generated HTML
     * upon completion.
     *
     * @return {String} the generated HTML table containing the document tag summary.
     */
    docTagSummary: function() {
        var dataArray = this.dataArray = _m.data.getMarkupsArray(true, false);
        var content = "";
        //Generate the summary using the markupTypeUniqueAndQuantitySummary function
        var summary = this.summaryArray = markupTypeUniqueAndQuantitySummary(dataArray);
        content = "<table class='table table-bordered table-condensed'><thead><tr><td>Type</td><td>Unique</td><td>Total</td></tr></thead><tbody>"

        //For each type we add a new row in the table
        for (var type in summary) {
            content += "<tr><td class='" + type + "'>" + type + "</td><td>" + summary[type].unique + "</td><td>" + summary[type].count + "</td></tr>";
        }
        //Finish of the table
        content += "</tbody></table>"

        //Return the generated data
        return content;
    },

    /**
     * Exports the markupsArray that is generated according to the provided parameters
     * (i.e. the two boolean flags and the number of characters requirement). Internally
     * uses the `markus.data.getMarkupsArray` function and the `exportCSV` function defined
     * in the summary.js_anonymous namespace.
     *
     * @method outputCSV
     * @param  {boolean} withPassage    Should we include the passage
     * @param  {boolean} withSupportText Should we include the supporting text
     * @param  {Integer} noOfChars       How many characters should we include
     */
    outputCSV: function(withPassage, withSupportText, noOfChars) {
        var dataArray = _m.data.getMarkupsArray(withPassage, withSupportText, noOfChars);
        exportCSV(markupToCSV, dataArray, "csv");
    },
    /**
     * Exports the markupsArray that is generated according to the provided parameters
     * (i.e. the two boolean flags and the number of characters requirement). Internally
     * uses the `markus.data.getMarkupsArray` function and the `exportCSV` function defined
     * in the summary.js_anonymous namespace.
     *
     * @method outputTSV
     * @param  {boolean} withPassage    Should we include the passage
     * @param  {boolean} withSupportText Should we include the supporting text
     * @param  {Integer} noOfChars       How many characters should we include
     */
    outputTSV: function(withPassage, withSupportText, noOfChars) {
        var dataArray = _m.data.getMarkupsArray(withPassage, withSupportText, noOfChars);
        exportCSV(markupToTSV, dataArray, "txt");
    },
    /**
     * Exports the markupsArray that is generated according to the provided parameters
     * (i.e. the two boolean flags and the number of characters requirement). Internally
     * uses the `markus.data.getMarkupsArray` function and the `exportCSV` function defined
     * in the summary.js_anonymous namespace.
     *
     * @method outputHTML
     * @param  {boolean} withPassage    Should we include the passage
     * @param  {boolean} withSupportText Should we include the supporting text
     * @param  {Integer} noOfChars       How many characters should we include
     */
    outputHTML: function(withPassage, withSupportText, noOfChars) {
        var dataArray = _m.data.getMarkupsArray(withPassage, withSupportText, noOfChars);
        exportCSV(markupToHTML, dataArray, "html");
    }

};

} )(markus);

/**
 * Registers the click handlers for the following buttons:
 * `#exportDataToCSV`, `#exportDataToTSV`, `#exportDataToHTML` and
 * `exportDataToXLSX`.
 *
 * Also defines the click behaviour of the show summary button that
 * shows a summary of the tag-usage of the document in a modal window.
 *
 * @for Global
 * @method registMarkupSummary
 */
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

/**
 * Returns the egdes of the tags in an array.
 *
 * @method tagToEdges
 * @return {Array} array that holds the edges
 */
var tagToEdges = function() {
    var edges = [];
    var objArray = tagToJSON();
    var uniqueObjArray = [];
    //Generate an array of only the unique elements in the objArray variable
        var obj = objArray[index];
        for (var index in objArray) {
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
    //Log both the lenghts
    console.log(objArray.length);
    console.log(uniqueObjArray.length);

    //If there are items in the uniqueObjArray
    if (uniqueObjArray.length > 0) {
        var perviousPassageId = null;
        var processedObjects = [];
        //For each of the items in the array
        for (var index in uniqueObjArray) {
            var obj = uniqueObjArray[index];

            //We get its passageId. If the previous passage is null or the passageID is not identical
            //to the previousPassageId, we reset it (i.e. we switch passage).
            var passageId = obj.passageId || "";
            if (perviousPassageId == null || passageId != perviousPassageId) {
                processedObjects = [];
                perviousPassageId = passageId;
            }
            ///For each of the entries in processedObjects
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
    //The edge cases .
    return edges;
}
