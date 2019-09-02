/**
 * Anonymous function to keep global namespace clean
 */
(function (_c) {

    /**
     * Holds all the text objects as objects under their keys
     */
    var texts = {};

    /**
     * The publicly accesible text module.
     */
    _c.text = {
        /**
         * Numerical value that keeps track of the number of texts that still need to be decorated
         */
        toDecorate: 0,

        /**
         * Adds a new text to the text storage
         */
        add: function (text_id, text_name, text_content, text_plain) {
            texts[text_id] = {
                name: text_name,    //the name of the text
                data: text_content, //the html content of the text precleaned
                plain: text_plain,  //the plain text without tags
                clean: ""           //the cleaned text
            }
            //Then change the ui now that we've saved it
            comparativus.ui.addFileTab(text_id, text_name, text_content);
            //Also register that the text is now loaded
            comparativus.file.setLoadedStatus(text_id, true);
        },

        /**
         * Sets the clean text of a specified text
         */
        setByID: function (id, clean) {
            texts[id].clean = clean;
        },

        /**
         * Returns the text with the provided ID
         * @param {String} id   the id of the text you want to retrieve 
         */
        getByID: function (id) {
            return texts[id];
        },

        /**
         * Returns the text associated with the provided name
         * @param {String} name the name of the text you want to retrieve
         */
        getByName: function (name) {
            var ids = Object.keys(texts), id;
            for (var i = 0; i < ids.length; i++) {
                id = ids[i];
                if (texts[id].name == name) return texts[id];
            }
        },

        /**
         * Returns all the ids in an array.
         */
        getAllIDs: function () {
            return Object.keys(texts);
        },

        /**
         * Returns an array of the selectedMatches in the selectionsummary
         */
        getSelectedMatches: function(){
            //Make an empty selection of matches we want to export
            var selectedMatches = [];

            //First get the complete selection of matches that we want to export
            $('#selectionOverview .selectionSummary').each(function (index, summary) {
                var cells = $(summary).find('.border-right');
                var cellA = cells.eq(0);
                var cellB = cells.eq(1);
                var cMatch = {
                    idA: cellA.attr('text-id'),
                    idB: cellB.attr('text-id'),
                    textA: cellA.attr('text'),
                    textB: cellB.attr('text'),
                    l: cellA.attr('length'),
                    r: cellA.attr('ratio'),
                    indexA: cellA.attr('index'),
                    indexB: cellB.attr('index'),
                    urnA: cellA.attr('match-urn'),
                    urnB: cellB.attr('match-urn'),
                }
                cMatch.compA = cMatch.idA + "@" + cMatch.urnA;
                cMatch.compB = cMatch.idB + "@" + cMatch.urnB;
                selectedMatches.push(cMatch);
            });

            //Now return the result Array
            return selectedMatches;
        },


        /**
         * Returns the original HTML file now inculding the tags we wanted to export
         */
        getSaved: function () {
            //Make an empty selection of matches we want to export
            var selectedMatches = [];
            //List of texts we're exporting to
            var usedTexts = [];

            //First get the complete selection of matches that we want to export
            $('#selectionOverview .selectionSummary').each(function (index, summary) {
                var cells = $(summary).find('.border-right');
                var cellA = cells.eq(0);
                var cellB = cells.eq(1);
                var cMatch = {
                    idA: cellA.attr('text-id'),
                    idB: cellB.attr('text-id'),
                    urnA: cellA.attr('match-urn'),
                    urnB: cellB.attr('match-urn'),
                }
                cMatch.compA = cMatch.idA + "@" + cMatch.urnA;
                cMatch.compB = cMatch.idB + "@" + cMatch.urnB;
                selectedMatches.push(cMatch);
                //Add the id's of the two texts if they haven't been added yet
                if (usedTexts.indexOf(cMatch.idA) == -1) usedTexts.push(cMatch.idA);
                if (usedTexts.indexOf(cMatch.idB) == -1) usedTexts.push(cMatch.idB);
            });

            //Now load each of the used texts into a temporary object
            var texts = {};
            for(var i = 0; i < usedTexts.length; i++){
                texts[usedTexts[i]] = comparativus.text.getByID(usedTexts[i]).data;
            }
            
            //Now go through all selectedMatches and add them to the text
            for(var i = 0; i < selectedMatches.length; i++){
                var cMatch = selectedMatches[i];
                var textA = texts[cMatch.idA];
                var textB = texts[cMatch.idB];
                //Then convert it to indeces in that text
                var indecesA = comparativus.urn.toIndeces(textA, cMatch.urnA);
                var indecesB = comparativus.urn.toIndeces(textB, cMatch.urnB);

                //Get the opening and closing match marks
                var openA = comparativus.ui.getMarkusMark(true, cMatch.compA, cMatch.compB);
                var openB = comparativus.ui.getMarkusMark(true, cMatch.compB, cMatch.compA);
                var closeA = comparativus.ui.getMarkusMark(false, cMatch.compA, cMatch.compB);
                var closeB = comparativus.ui.getMarkusMark(false, cMatch.compB, cMatch.compA);

                //Add the mark to the textA
                texts[cMatch.idA] = comparativus.text.addTagToText(textA, indecesA, openA, closeA, cMatch.compA, cMatch.compB);
                //Add the mark to the textB
                texts[cMatch.idB] = comparativus.text.addTagToText(textB, indecesB, openB, closeB, cMatch.compB, cMatch.compA);
            }
            /*
            //Now that all matches have been added, the texts should be done*/
            var ids = Object.keys(texts);
            for(var i = 0; i < ids.length; i++){
                const id = ids[i];
                comparativus.file.saveByName(comparativus.text.getByID(id).name, texts[id]);
            }
        },

        /**
         * Adds the provided match to the provided text
         * and returns the text once the marks have been added
         */
        addTagToText: function(text, indeces, openMark, closeMark, compA, compB){
            //Get ref to the span and set content
            var sp = comparativus.util.getScratch();
            comparativus.util.setScratch(text);
            //Try to find the tag if it has already been added
            var tag = sp.find('[matchMarkStart_id="' + compA + '"]');

            //Now insert the marks into text A, if the exact same matchmark is not yet in there
            if(tag.length < 1){
                var result =  text.substring(0, indeces[0]) + openMark + text.substring(indeces[0], indeces[1]) + closeMark + text.substring(indeces[1]);
                return result;
            }else{//Add data to the existing tag
                var list = tag.attr('data-comparativuslinks');
                tag.attr('data-comparativuslinks', list + "|" + compB);
                var result = sp.html();
                return result;
            }
        },

        /**
         * REturns a fraction [0-1] of the length this text takes of the totla
         * lenght of all texts compared
         */
        getPercentLength: function (id) {
            var totalLength = 0;
            Object.keys(texts).forEach(function (text_id) {
                totalLength += texts[text_id].clean.length;
            });
            return texts[id].clean.length / totalLength;
        },

        /**
         * Returns a JSON string encoding the length, name and group of every text we have
         */
        getJSON: function () {
            //The array that will hold the text info objects
            var json = [];
            //Enumerate all registered texts
            var ids = Object.keys(texts);
            //Keep a counter of the number of texts for their group number
            var counter = 0, text;
            //For each, append a piece of JSON
            ids.forEach(function (id) {
                text = texts[id];
                json.push(
                    {
                        name: text.name,
                        'id': id,
                        textLength: text.data.length,
                        group: counter
                    }
                )
                counter++;
            });

            return json;
        },

        /**
         * Returns the amount of texts this comparison is made up of
         * It figures this out by coutning the amount of keys in idToNames
         */
        amt: function () {
            return Object.keys(texts).length;
        },

        /**
         * Prepares all text for comparison (stripWhitespace etc)
         */
        prepareAll: function () {
            //Prepare each of the texts
            Object.keys(texts).forEach(function (id) {
                comparativus.worker.prepareText(id);
            });
        },

        /**
         * Decorates the specified text using the provided nodes
         * @param {String} id the id of the text we want to decorate
         * @param {Array} nodes the array of nodes of matches we have in our text
         */
        decorate: function (id, nodes) {
            //Get the original unstripped text
            var text = comparativus.text.getByID(id).data;
            //Prepare the holder for the new indeces
            var indeces, urnid;
            //Now add each node to the text
            nodes.forEach(function (node) {
                indeces = comparativus.urn.toIndeces(text, node.urn);
                urnid = id + node.urn;
                //Now insert the marks
                text = text.substring(0, indeces[0]) + comparativus.ui.getMatchMark(true, urnid)
                    + text.substring(indeces[0], indeces[1]) + comparativus.ui.getMatchMark(false, urnid)
                    + text.substring(indeces[1]);
            });
            //Now set the filepanel to the correct content
            comparativus.ui.setFilePanelContent(id, text);
        },

        /**
         * Returns the color on the D3 ordinal color scale used for the visualization
         * for the index of this text.
         */
        getVisColor: function (id) {
            return comparativus.vis.color(Object.keys(texts).indexOf(id));
        }
    }
})(comparativus);