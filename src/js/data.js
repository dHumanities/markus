/**
 * data.js base file.
 * @module data.js
 */

/**
 * Here the Markus.Data methods are defined and added to the Global Markus Singleton.
 * The Data methods handle mostly data conversion
 *
 * @class Data
 * @constructor
 */
_m.data = {

    /**
     * Returns an array that, depending on the provided parameters will return the
     * markups in the passage or in the whole document. And depending on the Boolean flag
     * withSupportText it returns its surrounding text.
     *
     * @method getMarkupsArray
     * @param  {Boolean} withPassage     Do we want to include the passage
     * @param  {Boolean} withSupportText Do we want to include support Text
     * @param  {int} noOfChars       The number of chars to get
     * @return {Array}                 An Array of markups
     */
    getMarkupsArray: function(withPassage, withSupportText, noOfChars) {
        //Defines the variables used, and checks data that has been passed
        var content = [];
        var withPassage = withPassage || false;
        var noOfChars = noOfChars || 10;
        var withSupportText = withSupportText || false;
        var count = 0;

        //If we want the `withSupportText`, then we increase the randomID.
        if (withSupportText) {
            $(".doc").find(".markup[type]").each(function() {
                $(this).attr("data-MARKUS-randomID", count++);
            });

        }

        //If we want to find a specific passage and the passage and entry do exist
        if (withPassage && $(".doc").find(".passage,.entry").length > 0) {
            //For each of the found passages
            $(".doc").find(".passage,.entry").each(function() {
                //get the text
                var text = $(this).html().replace(/\n/gm, "");

                //If this object is not hidden or halfTransparent
                if (!$(this).hasClass("hidden") && !$(this).hasClass("halfTransparent")) {
                    //We get its passageID
                    var passageId = $(this).attr("id");

                    //For each of the markup class instances found
                    $(this).find(".markup[type]").each(function() {
                        //Get its type, tag and id
                        var type = $(this).attr("type");
                        var tag = $(this).text();
                        var id = $(this).attr("cbdbid") || $(this).attr(type + "_id") || "";
                        var obj = {
                            passageId: passageId,
                            type: type,
                            id: markus.util.converBackToUnicode(id)
                        };
                        //If we want to include supportText, we give before and after text
                        if (withSupportText) {
                            var headAndTail = text.split($(this)[0].outerHTML);
                            obj["textBeforeTag"] = (headAndTail.length > 0) ? (headAndTail[0]).replace(/<[^>]*>/gm, "").slice(-noOfChars) : "";
                            obj.tag = tag;
                            obj["textAfterTag"] = (headAndTail.length > 1) ? (headAndTail[1]).replace(/<[^>]*>/gm, "").slice(0, noOfChars) : "";
                        } else {
                            obj.tag = tag;
                        }

                        //Push this one markup record into the content array
                        content.push(obj);
                    });

                    //For each of the commentContainers
                    $(this).find(".commentContainer").each(function() {
                        //We get all the comments in that container
                        var comments = $.parseJSON(markus.util.converBackToUnicode($(this).attr("value")));
                        var type = "comment";

                        //For each of those comments
                        for (var i = 0; i < comments.length; i++) {
                            //We once again get its tag, id and create an object out of it
                            var tag = comments[i];
                            var id = i;
                            var obj = {
                                passageId: passageId,
                                type: type,
                                id: id
                            };
                            //If we need support text, we add that, but that is not possible in this case.
                            if (withSupportText) {
                                obj["textBeforeTag"] = "";
                                obj.tag = tag;
                                obj["textAfterTag"] = "";
                            } else {
                                obj.tag = tag;
                            }

                            //Add the created comment record to the array of content.
                            content.push(obj);
                        }

                    });

                }

            });
        } else {
          //ELSE we are looking through the complete document

            //For each of the markups found
            $(".doc").find(".markup[type]").each(function() {
                //We record the type, tag, id and create an object out of it
                var type = $(this).attr("type");
                var tag = $(this).text();
                var id = $(this).attr("cbdbid") || $(this).attr(type + "_id") || "";
                var obj = {
                    type: type,
                    id: markus.util.converBackToUnicode(id)
                };

                //We grab some supporting text surrounding it according to the flag.
                if (withSupportText) {
                    var headAndTail = text.split($(this)[0].outerHTML);
                    obj["textBeforeTag"] = (headAndTail.length > 0) ? (headAndTail[0]).replace(/<[^>]*>/gm, "").slice(-noOfChars) : "";
                    obj.tag = tag;
                    obj["textAfterTag"] = (headAndTail.length > 1) ? (headAndTail[1]).replace(/<[^>]*>/gm, "").slice(0, noOfChars) : "";
                } else {
                    obj.tag = tag;
                }

                //And once the record of the markup is done we add it to the content list.
                content.push(obj);
            });
        }

        //From all the markup types remove the attribute data-MARKUS-randomID
        $(".doc").find(".markup[type]").removeAttr("data-MARKUS-randomID");

        //Now that we have created this array, return it to the requestor
        return content;
    },

    /**
     * Turns an array of objects into a CSV array.
     *
     * @method objArrayToCSV
     * @param  {Array} objArray the array to turn into a CSV
     * @return {String}         The CSV data string
     */
    objArrayToCSV: function(objArray) {
        //Will hold the CSV data lines
        var content = [];

        //If there are actually objects to parse
        if (objArray.length > 0) {
            var keys = [];
            var header = [];
            //for each key in the objArray, add it to the header Array
            for (var k in objArray[0]) {
                keys.push(k);
                header.push(k.replace(/,/gm, '\,'));
            }

            //Add the header as the first line, describing the CSV format
            content.push(header.join(","));

            //For each of the data indeces in the objArray
            for (var dIndex in objArray) {
                //Get a temp array index
                var _temp = objArray[dIndex];
                var _row = [];
                for (var kIndex in keys) {
                    //Write a row of CSV data
                    _row.push('"' + ("" + _temp[keys[kIndex]]).replace(/"/gm, '""') + '"');
                }
                //Join it on a ',' and add it to the CSV lines
                content.push(_row.join(","));
            }

        }

        //Return the contentArray after joining it on newlines.
        return content.join("\n");
    },

    /**
     * Turns an array of objects into a TSV array.
     *
     * @method objArrayToTSV
     * @param  {Array} objArray the array to turn into a TSV
     * @return {String}         The TSV data string
     */
    objArrayToTSV: function(objArray) {
        //Will hold the CSV data lines
        var content = [];

        //If there are acutally any objects to parse
        if (objArray.length > 0) {
            var keys = [];
            var header = [];
            //For each of the keys in the first line
            for (var k in objArray[0]) {
                keys.push(k); header.push(k.replace(/\t/gm, '_'));
            }

            //Push the first dataline, being the data header line. Joined on a '\t'
            content.push(header.join("\t"));
            for (var dIndex in objArray) {
                var _temp = objArray[dIndex];
                var _row = [];
                for (var kIndex in keys) {
                    //Write a single data line
                    _row.push('"' + ("" + _temp[keys[kIndex]]).replace(/"/gm, '""') + '"');
                }
                content.push(_row.join("\t"));
            }
        }
        //Join all the datalines on a newline and return the resulting TSV string
        return content.join("\n");
    },

    /**
     * Returns the provided array as a HTML table.
     *
     * @method objArrayToHTML
     * @param  {Array} objArray the array of objects we want to convert
     * @return {String}        the table of the array
     */
    objArrayToHTML: function(objArray) {
        var content = [];
        //If we have any objects to parse
        if (objArray.length > 0) {
            //First create the table, and on top of it create the data header
            content.push("<table id='exportTable' class='export'>");
            var keys = [];
            content.push("<thead><tr>");
            for (var k in objArray[0]) {
                keys.push(k);
                content.push("<td>" + k + "</td>");
            }

            //Now create the actualy data body lines. These are the actual data objects
            content.push("</tr></thead><tbody>");
            for (var dIndex in objArray) {
                var _temp = objArray[dIndex];
                content.push("<tr>");
                for (var kIndex in keys) {
                    //Write the keys into table cells
                    content.push("<td>" + _temp[keys[kIndex]] + "</td>");
                }
                content.push("</tr>");
            }
            //Add the closing of the tableBody and table.
            content.push("</tbody></table>");
        }
        //Return the resulting HTML table
        return content.join("");
    }

};


} )(markus);
