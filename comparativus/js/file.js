/**
 * Anonymous namespace for this file
 */
(function (_c) {
    /**
     * All the file and data manipulation methods
     */
    _c.file = {

        /**
         * Contains the JSON object returned upon loading the page auth/list_files
         */
        list: undefined,

        /**
         * Contains a list of boolean values with the loaded state of each text id
         */
        loadedStatus: {},

        /**
         * Returns the full filename of the provided text
         */
        getName: function (name) {
            return $('#fInput' + name.toUpperCase()).parent().find('.fileName').html().replace(/\.[^/.]+$/, "");
        },

        /**
         * This function loads the debug test files
         */
        loadDebug: function () {
            var idA = '5a15793ed272f335aab275af'
            comparativus.file.setLoadedStatus(idA, false);
            $.ajax('data/Mencius.txt', {
                cache: false, success: function (data) {
                    comparativus.util.setScratch(data);
                    var sp = comparativus.util.getScratch();
                    comparativus.text.add(idA, comparativus.file.getTitleFromID(idA), data, sp.text());
                }
            });
            var idB = '5a1579a3d272f335aab275b0';
            comparativus.file.setLoadedStatus(idB, false);
            $.ajax('data/ZGZY.txt', {
                cache: false, success: function (data) {
                    comparativus.util.setScratch(data);
                    var sp = comparativus.util.getScratch();
                    comparativus.text.add(idB, comparativus.file.getTitleFromID(idB), data, sp.text());
                }
            });
            var idC = '58d4f09a1873291a029c97e7';
            comparativus.file.setLoadedStatus(idC, false);
            $.ajax('data/Zuozhuan.txt', {
                cache: false, success: function (data) {
                    comparativus.util.setScratch(data);
                    var sp = comparativus.util.getScratch();
                    comparativus.text.add(idC, comparativus.file.getTitleFromID(idC), data, sp.text());
                }
            });
        },

        /**
         * Adds a file to be uploaded
         * @param {String} data the data of the file
         * @param {String} title the name of the file
         */
        addUploadFile: function(data, title){
            comparativus.util.setScratch(data);
            var sp = comparativus.util.getScratch();
            comparativus.text.add((new Date()).getTime(), title, data, sp.text());
        },

        /**
         * Sets the loaded status of a file.
         */
        setLoadedStatus: function (id, status) {
            comparativus.file.loadedStatus[id] = status;
            //If this was a text done loading, check if all texts are done, if so, autoexec check
            if (status) {
                if (comparativus.file.allDoneLoading()) {
                    //Try autoexecuting if the URL variable is set
                    comparativus.autoexec();
                }
            }
        },

        /**
         * Checks if all files are done loading
         */
        allDoneLoading: function () {
            var ids = Object.keys(comparativus.file.loadedStatus);
            for (var i = 0; i < ids.length; i++) {
                //If one file is not done loading, return that
                if (!comparativus.file.doneLoading(ids[i])) return false;
            }
            //No loading file found
            return true;
        },

        /**
         * Checks if the file with the provided id is done loading
         */
        doneLoading: function (id) {
            return comparativus.file.loadedStatus[id];
        },

        /**
         * Reads a single file into the fileInputs
         */
        readSingle: function (e, name) {
            //Check the file
            var file = e.target.files[0];
            if (!file) {
                return;
            }

            //Show that we're loading in case its a big system
            $(e.target.parentNode).find('.fileName').html('Loading...');

            //Create the read and the onload response
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#' + 'text' + name.toUpperCase()).html(e.target.result);
                $('#' + 'info' + name.toUpperCase()).html('Length: ' + e.target.result.length + ' characters');
                $($('#fInput' + name.toUpperCase()).get(0).parentNode).find('.fileName').html(file.name);
            };

            //Start reading the file
            reader.readAsText(file);
        },

        /**
         * Returns the file with the provided ID from the server. The file
         * is returned in the callback as a string. This is due to the asynchronous
         * nature of the file request
         * 
         * Look here for the list of file id for this user
         * http://dh.chinese-empires.eu/auth/list_files >
         * 
         * @param {String} id   the id used for the file in the filesystem
         * @param {Function} callback   takes the file data as a parameter
         */
        loadFromID: function (id, callback) {
            comparativus.file.setLoadedStatus(id, false);
            $.get("https://dh.chinese-empires.eu/auth/get/" + id, function (data) {
                comparativus.util.setScratch(data);
                var sp = comparativus.util.getScratch();
                callback(sp.html(), sp.text());
            });
        },

        /**
         * Saves the file with the provided id back to the markus server.
         */
        saveByName: function (fileName, fileData) {
            //Create a new File Object to send in the POST method
            var blob = new Blob([fileData], {type: "text/plain;charset=utf-8"});
            var file = new File([blob], fileName)

            //Create new FormData to submit
            var uploadData = new FormData();
            uploadData.append("upload", file);

            //Now do the actual AJAX call
            $.ajax({
                url: '/auth/upload',
                type: 'POST',
                data: uploadData,
                cache: false,
                dataType: 'json',
                processData: false, // Don't process the files
                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                success: function (data, textStatus, jqXHR) {
                    console.log("callback uploadFile");
                    console.log(data, textStatus, jqXHR);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("error during file upload");
                    console.log(textStatus, jqXHR, errorThrown);
                }
            });
        },

        /**
         * Returns the fileName that matches this ID
         */
        getTitleFromID: function (id) {
            //We now know for sure that the list of files is loaded
            var file, max = comparativus.file.list.files.length;
            for (var i = 0; i < max; i++) {
                file = comparativus.file.list.files[i];
                if (file._id == id) return file.fileName;
            }
            //If we don't find a match, return that
            return "No Title Found";
        },

        /**
         * 
         * @param {String} text the text to put into the textfield 
         * @param {String} name the name of the text field [a-b]
         */
        populateFileHolder: function (text, name, filename) {
            $('#' + 'text' + name.toUpperCase()).html(text);
            $('#' + 'info' + name.toUpperCase()).html('Length: ' + text.length + ' characters');
            $('#info' + name.toUpperCase()).parent().find('.fileName').html(filename);
        },

        /**
         * Generates the download file name based upon the texts
         * that have been compared and the file type extension provided
         */
        getDownloadName: function (type) {
            var names = "Matches";
            $('.fileName').each(function (i, val) {
                names += '-' + $(val).html().replace(/\.[^/.]+$/, "");
            });
            names += type.toLowerCase();
            return names;
        },

        /**
         * This method takes care of the actual downloading of the file.
         * It does this by creating a link clicking it and immediately destroying it.
         */
        download: function (fileName, href) {
            var link = document.createElement("a");
            link.download = fileName;
            link.href = href;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        /**
         * Creates a JSON file describing the found matches and 
         * the compared texts. Using the second optional boolean parameter
         * you can turn off the automatic download feature and
         * use the file for internal use (D3 visualization).
         */
        createJSON: function (matches, doDownload) {
            //if not specified set to true
            if (doDownload === undefined) doDownload = true;
            if (doDownload) {
                comparativus.file.download(comparativus.file.getDownloadName('.json'),
                    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(matches)));
            }
            //return the json String for internal use
            return jsonFile;
        },

        /**
         * Generates a TSV save file. Use the generated TSV parts to make the
         * file
         */
        createTSV: function (matches) {
            var tsvParts = ["urnA\turnB\ttextA\ttextB\tlength\tratio"];
            matches.forEach(function(match, index){
                const compA = match.idA + "@" + match.urnA;
                const compB = match.idB + "@" + match.urnB;
                tsvParts.push(compA + "\t" + compB + "\t" + match.textA + "\t" + match.textB + "\t" + match.l + "\t" + match.r);
            });
            //Now download the file
            comparativus.file.download(comparativus.file.getDownloadName('.tsv'),
                'data:text/tsv;charset=utf-8,' + encodeURI(tsvParts.join('\n')));
        }
    }
})(comparativus);