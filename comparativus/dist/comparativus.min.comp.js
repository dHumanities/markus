"use strict";

/**
 * This is the main global comparativus object. This is used
 * to hide all methods, objects and variables from the global 
 * namespace to prevent polluting it.
 */
var comparativus = {
    build: '2.1.1',
    author: "Mees Gelein"
};

(function (_c) {
    /**
     * The minimum lenght a match should be to be added to the results.
     * This read either from the URL Get variables, or parsed from the UI
     */
    _c.minMatchLength = 10;
    /**
     * Contains the array of matches that have been found
     */
    _c.matches = [];
    /**
     * Contains the araray of nodes (unique matches) that have been found. Prevents doubling of data when
     * one sequence has multiple matches in the other document
     */
    _c.nodes = {
        a: [],
        b: []
    }
    /**
     * Data object that holds the dictionaries that have been generated
     */
    _c.dicts = {};

    /**
     * Edits object. When the text is prepared, all the spaces and special
     * characters are removed from the file and are kept in order in this file
     * together with their index. Using this object we can re-add the edits back in.
     */
    _c.edits = {};

    /**
     * Called to start the comparison between the two texts. This
     */
    _c.startComparison = function () {
        //console.log("[comparativus.js]: Start Comparison");
        comparativus.minMatchLength = comparativus.ui.getMinMatchSize();

        comparativus.matches = [];
        comparativus.nodes = {};

        var ids = comparativus.text.getAllIDs();
        //Clear all saved nodes
        for(let i = 0; i < ids.length; i++){
            comparativus.nodes[ids[i]] = [];
        }
        //Empty the result table
        $('#resultTable').html('');
        comparativus.ui.clearSimScores();
        
        //Now check every text against every other text
        for(let i = 0; i < ids.length; i++){
            for(let j = i + 1; j < ids.length; j++){
                //Run a comparison between every selected ID
                console.log("[comparativus.js]: Comparing " + ids[i] + " and " + ids[j]);
                comparativus.runSingleComparison(ids[i], ids[j]);
            }
        }
        //Show the results table of all the matches
        comparativus.ui.showResultTable(comparativus.matches);
        comparativus.text.toDecorate = ids.length;
        //console.log("[comparativus.js]: Starting text decoration");
        for(let i = 0; i < ids.length; i++){
            comparativus.text.decorate(ids[i], comparativus.nodes[ids[i]]);
        }
        //Show that we're done
        comparativus.ui.setComparisonButtonText('(Re)Compare Texts');
        comparativus.ui.showLoadingAnimation(false);
        //Re-add listeners now that we're done with the comparison
        comparativus.ui.init();
        comparativus.vis.draw();
        comparativus.ui.addMatchListeners();
    }

    /**
     * This function is called to check if we need to autoexecute the comparison.
     * It checks a URL var and then decides if the comparison needs to be run,
     * it does this by triggering the comparisonButton
     */
    _c.autoexec = function () {
        $('#comparisonButton').removeClass('disabled');
        if (comparativus.util.getURLVar('autoexec')) $('#comparisonButton').click();
    }

    /**
     * Runs the comparison between a single set of texts signified by their
     * two ids that have been provided below.
     */
    _c.runSingleComparison = function (idA, idB) {
        //console.log("[comparativus.js]: Running comparison on: " + idA + " and " + idB);
        var dictA = comparativus.dicts[idA];
        var dictB = comparativus.dicts[idB];
        var seeds = Object.keys(dictA);
        var seedAmt = seeds.length;
        var overlap = [];
        var overlapSeedAmt = 0;
        var totalSeedAmt = 0;
        //console.log("[comparativus.js]: Found " + seedAmt + " seeds in dictA");
        for (var i = 0; i < seedAmt; i++) {
            totalSeedAmt += dictA[seeds[i]].length;
            if (seeds[i] in dictB) {
                overlapSeedAmt += dictA[seeds[i]].length + dictB[seeds[i]].length;
                overlap.push(seeds[i]);
                //console.log("[comparativus.js]: Expanding all matches");
                comparativus.expandAllMatches(dictA[seeds[i]], dictB[seeds[i]], idA, idB);
            }
        }
        //also add all seeds of text B to the total amount of seeds
        seeds = Object.keys(dictB);
        seedAmt = seeds.length;
        for (var i = 0; i < seedAmt; i++) {
            totalSeedAmt += dictB[seeds[i]].length;
        }
        //console.log('Total seed Amt: ' + totalSeedAmt + ' and overlap seed Amt: ' + overlapSeedAmt + " > Similarity Score: " + overlapSeedAmt / totalSeedAmt);
        //console.log("[comparativus.js]: Comparison done, showing results");
        comparativus.ui.setSimilarityScore(idA, idB, overlapSeedAmt / totalSeedAmt);
    };

    /**
     * Expands a single match from two indeces
     * @param {Integer} iA 
     * @param {Integer} iB 
     */
    var expandMatch = function (iA, iB, idA, idB) {
        //first check if this match is inside another match
        var max = comparativus.matches.length;
        var cMatch;
        for (var i = 0; i < max; i++) {
            cMatch = comparativus.matches[i];
            if ((iA < cMatch.indexA + cMatch.l) && (iA > cMatch.indexA)) {
                if ((iB < cMatch.indexB + cMatch.l) && (iB > cMatch.indexB)) {
                    //console.log("Embedded match, ignore");
                    //this matching seed is inside of a match we already found
                    return;
                }
            }
        }
        //console.log("Expand the match: "+ iA + "; " + iB);

        //Start at a predetermined size of 10, then expand or diminish to fit
        var matchLength = 10;
        var tA = comparativus.text.getByID(idA).clean;
        var tB = comparativus.text.getByID(idB).clean;
        var sA = tA.substr(iA, matchLength);
        var sB = tB.substr(iB, matchLength);
        var strikes = 0;

        //diminish to the left (if the 10 char expansion made the levDist to low)
        while (comparativus.util.levDistRatio(sA, sB) < 0.8 && matchLength > 0) {
            matchLength--;
            sA = tA.substr(iA, matchLength);
            sB = tB.substr(iB, matchLength);
        }

        //expand right
        while (strikes < 3) {
            if (comparativus.util.levDistRatio(sA, sB) < 0.8) {
                strikes++;
            } else {
                strikes = 0;
            }
            matchLength++;
            sA = tA.substr(iA, matchLength);
            sB = tB.substr(iB, matchLength);
            //Build a fail safe in case one of the indeces overflows the text length
            if (iA + matchLength > tA.length || iB + matchLength > tB.length) break;
        }
        //take off the three chars we added to much.
        matchLength -= 3;
        strikes = 0;
        sA = tA.substr(iA, matchLength);
        sB = tB.substr(iB, matchLength);

        //expand left
        while (strikes < 3) {
            if (comparativus.util.levDistRatio(sA, sB) < 0.8) {
                strikes++;
            } else {
                strikes = 0;
            }
            //By increasing lenght and decreasing index we're basically expanding left
            matchLength++;
            iA--;
            iB--;
            if (iA < 0 || iB < 0) {
                iA = iB = 0;
                break;
            }
            sA = tA.substr(iA, matchLength);
            sB = tB.substr(iB, matchLength);
        }
        //return the three chars we add too much
        iA += strikes; iB += strikes;
        matchLength -= strikes;
        sA = tA.substr(iA, matchLength);
        sB = tB.substr(iB, matchLength);

        //now it has been fully expanded. Add it to the matches object if the length
        //is greater than minLength
        if (matchLength >= comparativus.minMatchLength) {
            var m = { l: matchLength, indexA: iA, indexB: iB, textA: sA, textB: sB, r: comparativus.util.levDistRatio(sA, sB) };
            m.urnA = comparativus.urn.fromMatch(tA, m.indexA, m.l);
            m.urnB = comparativus.urn.fromMatch(tB, m.indexB, m.l);
            m.idA = idA;
            m.idB = idB;
            comparativus.matches.push(m);
            comparativus.addNodeFromMatch(m, idA, idB);
        }
    }

    /**
     * Adds new nodes to the list of them. 
     * @param {Match} match 
     */
    _c.addNodeFromMatch = function (match, idA, idB) {
        var nA = { index: match.indexA, urn: match.urnA, 'match': match };
        var nB = { index: match.indexB, urn: match.urnB, 'match': match };
        var i = 0;
        //First check if node A is unique
        var max = comparativus.nodes[idA].length;
        var unique = true;
        for (i = 0; i < max; i++) {
            if (comparativus.nodes[idA][i].index == nA.index) {
                unique = false;
                break;
            }
        }
        if (unique) comparativus.nodes[idA].push(nA);

        //Then check if node B is unique
        max = comparativus.nodes[idB].length;
        unique = true;
        for (i = 0; i < max; i++) {
            if (comparativus.nodes[idB][i].index == nB.index) {
                unique = false;
                break;
            }
        }
        if (unique) comparativus.nodes[idB].push(nB);
    }


    /**
     * Expands all occurrences for a matching seed found in the dictionary
     */
    _c.expandAllMatches = function (occA, occB, idA, idB) {
        var maxA = occA.length;
        var maxB = occB.length;
        var matchAIndex;
        var matchBIndex;
        for (var i = 0; i < maxA; i++) {
            matchAIndex = occA[i];
            for (var j = 0; j < maxB; j++) {
                matchBIndex = occB[j];
                //console.log("[comparativus.js]: Expanding a single match");
                expandMatch(matchAIndex, matchBIndex, idA, idB);
            }
        }
    };

})(comparativus);;(function(_c){
    /**
     * Defines the utility object with some useful
     * functionality
     */
    _c.util = {
        /**
         * Returns the levenSthein ratio [0-1] similarity between
         * the two provided string. 1 means they're identical. 0
         * means they are completely different.
         * 
         * This is basically the normalized levensthein distance.
         */
        levDistRatio : function(sA, sB){
            //instantiate vars and cache length
            var aMax = sA.length;
            var bMax = sB.length;
            var matrix = [];

            //increment the first cell of each row and each column
            for(var i = 0; i <= bMax; i++){matrix[i] = [i];}
            for(var j = 0; j <= aMax; j++){matrix[0][j] = j;}

            //calculate the rest of the matrix
            for(i = 1; i <= bMax; i++){
                for(j = 1; j <= aMax; j++){
                if(sA.charAt(i-1) == sB.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                            Math.min(matrix[i][j-1] + 1, // insertion
                                                    matrix[i-1][j] + 1)); // deletion
                }
                }
            }

            //0 for no likeness. 1 for complete likeness
            return 1 - (matrix[bMax][aMax] / aMax);
        },

        /**
         * Returns the value of the GET variable with the provided name.
         * If no variable was set, undefined is returned. If it is set,
         * its string is URI decoded and returned.
         */
        getURLVar: function(name){
            //for the parts of a GET assignement
            var parts;
            //Loop through each of GET key-value pairs
            var pairs = window.location.search.substring(1).split('&');
            for(var i = 0; i < pairs.length; i++){
                parts = pairs[i].split('=');
                //If this is the key-value pair we want
                if(parts[0] == name){
                    //return the value or true if this only was a key
                    return ((parts[1] === undefined) ? true : decodeURI(parts[1]));
                }
            };
        },

        /**
         * This function will give the jello animation to the provided element and remove it again
         */
        jello: function(elementID){
            $(elementID).addClass('animated jello');
            setTimeout(function(){
                $(elementID).removeClass('animated jello');
            }, 400);
        },

        /**
         * Checks if we're running under a localhost environment
         * @returns {boolean}
         */
        isDebug: function(){
            return (window.location.href.indexOf('localhost') != -1);
        },

        /**
         * Sets the scracthpad div to the provided content string. This is useful for JQuery manipulation
         * @param {String} text the html content to set this div to
         */
        setScratch: function(text){
            $('#scratchpad').html(text);
        },

        /**
         * Returns a JQ ref to the scratchpad div
         */
        getScratch: function(){
            return $('#scratchpad');
        }
    };
})(comparativus);
/**
 * Determines a very useful String.insertAt function. This is a prototype overwrite,
 * but that should be okay in this case. 
 * 
 * @param {Integer} index this is the position you want to inser at
 * @param {String} string the string you want to insert into the string
 */
String.prototype.insertAt = function(index, string){
    //First check if we're inserting at the beginning or the end, this prevents unnecessary function calls
    if(index <= 0){
        return string + this;
    }else if(index => this.length){
        return this + string;
    }else{
        //According to https://gist.github.com/najlepsiwebdesigner/4966627 this is a neccesary fix
        if(string.charCodeAt(0) == 13){
            string = "\n";
        }
            
        //Return the compiled string
        return this.substring(0, index) + string + this.substring(index, this.length);
    }
};/**
 * Namespacing
 */
(function(_c){

    /** 
     * Makes sure the messages are always nicely formatted according to my expectations.
     * Meaing: always define an action and params
     */
    var message = function(action, parameters){
        comparativus.worker.thread.postMessage({'action' : action, 'params' : parameters});
    };

    /**
     * Contains the messaging interface with the workers
     */
    _c.worker = {
        /**
         * Reference to the single thread we're working with
         */
        thread: undefined,

        /**
         * Does all the necessary thread initialization. Creates the new 
         * Webworker and assigns a message handler.
         */
        init: function(){
            //create a new thread (force refresh in debug)
            var workerFileURL = 'js/thread.js';
            if(comparativus.util.isDebug()) workerFileURL += "?v=" + (new Date()).getTime();
            
            //Finally create a worker from the created url
            comparativus.worker.thread = new Worker(workerFileURL);
    
            //And assign the correct handler function for workers
            comparativus.worker.thread.onmessage = comparativus.worker.onmessage;
        },

        /**
         * Messages the worker to prepare the text for usage
         * This function loads data files from disk. Just used for 
         * testing purposes. Don't clean the file again if it is already loaded
         */
        prepareText: function(id){
            var config = {
              'stripWhiteSpace': $('#stripWhiteSpace').val(),
              'stripPunctuation': $('#stripPunctuation').val()
            };
            message('prepareText', {'id': id, 'text': comparativus.text.getByID(id).plain, 'config': config});          
        },

        /**
         * Messages the worker to start building the dictionary.
         * Builds the dictionary for the text that is registered under
         * the provided name
         */
        buildDictionary: function(id){
            message('buildDictionary', {'id':id , text: comparativus.text.getByID(id).clean});
        },

        /**
         * What happens when the main thread recieves a message from the worker. This is all defined 
         * in this function
         */
        onmessage: function(event){
            //it is assumed that any communication from a worker assigns these values
            var action = event.data.action;
            var params = event.data.params;
        
            //Switch based on the action parameter
            switch(action){
                case 'DictDone':
                    comparativus.dicts.toBuild --;
                    comparativus.dicts[params.id] = params.dictionary;
                    if(comparativus.dicts.toBuild == 0){
                        comparativus.startComparison();
                    }
                    break;
                case 'PrepareDone':
                    comparativus.text.setByID(params.id, params.text);
                    $('#info' + params.id).html('Length: ' + params.text.length + ' characters');
                    comparativus.worker.buildDictionary(params.id);
                    break;
            }
        }
    };
           
})(comparativus);;/**
 * Anonymous namespace of this file to prevent polluting of the global namespace
 */
(function(_c){

    _c.ui = {
        /**
         * Holds the HTML for a single matchmark
         */
        matchmark: "",

        /**
         * Holds the HTML for a single matchrow in the resultstable
         */
        matchrow: "",

        /**
         * Holds the HTML for a single matchmark in a markus document that needs to link to multiple other documents
         */
        markusmarkopen: "",

        /**
         * Holds the HTML for a single closing matchmark for Markus export
         */
        markusmarkclose: "",

        /**
         * Holds the HTML for a singlefilerow in the fileSelectionMenu
         */
        filerow: "",

        /**
         * Holds the HTML for a single selection summary in the selectionSummary div
         */
        selectionSummary: "",

        /**
         * This function adds the event listeners to the ui objects
         * and inputs. Basically, all the initialization of the UI
         */
        init: function(){
            //Handler for the comparisonButton
            $('#comparisonButton').unbind('click').click(function(){
                //unbinds the click handler, to prevent more clicking during comparison
                $(this).unbind('click');
            
                comparativus.dicts.toBuild = comparativus.text.amt();
                comparativus.ui.showLoadingAnimation(true);
                comparativus.text.prepareAll();
            });

            //Handler for the show selection but
            $('#showSelectionSummaryButton').unbind('click').click(function(){
                //If this is the chevron down (expand) button
                if($(this).html().indexOf("glyphicon-chevron-down") != -1){
                    comparativus.ui.showSelectionSummary();
                }else{
                    comparativus.ui.hideSelectionSummary();
                }
            });

            //Handler for the reset button
            $('#resetButton').unbind('click').click(function(){
                $('.selected').removeClass('selected');
                //Now a little while later, update the overview
                setTimeout(comparativus.ui.updateOverview, 100);
            });

            //set popover to have with relative to the main body
            $('[data-toggle="popover"]').unbind('popover').popover({
                container: 'body'
            });
            //activate popovers
            $('[data-toggle="popover"]').unbind('popover').popover(); 

            //Load the matchmark template
            $.get({url: './parts/matchmark.html', cache:false}).then(function(data){
                comparativus.ui.matchmark = data;
            });

            //Load the markusmark template
            $.get({url: './parts/markusmarkstart.html', cache:false}).then(function(data){
                comparativus.ui.markusmarkopen = data;
            });
            //Load the markusmark template
            $.get({url: './parts/markusmarkend.html', cache:false}).then(function(data){
                comparativus.ui.markusmarkclose = data;
            });

            //Load the matchrow template
            $.get({url: './parts/matchrow.html', cache:false}).then(function(data){
                comparativus.ui.matchrow = data;
            });

            //Load the fileselection row template
            $.get({url: './parts/filerow.html', cache:false}).then(function(data){
                //Check if we should recall the fileselection show function
                var doCall = comparativus.ui.filerow == "NEEDED";
                //Assign the template data
                comparativus.ui.filerow = data;
                //Then do the call if necessary
                if(doCall) comparativus.ui.showFileSelection();
            });

            //Load the selectionSummary template
            $.get({url: './parts/selectionsummary.html', cache:false}).then(function(data){
                comparativus.ui.selectionSummary = data;
            });

            //Assign the page button event handler
            $('.btn-page').click(comparativus.ui.switchPage);

            //Forward the call to show the settings menu
            $('#settingsButton').click(comparativus.ui.showSettingsMenu);
        },

        /**
         * Fades in the selection summary div
         */
        showSelectionSummary: function(){
            $('#selectionSummary').fadeIn(400, function(){
                $('#showSelectionSummaryButton .glyphicon').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
                var html = $('#showSelectionSummaryButton').html();
                $('#showSelectionSummaryButton').html(html.replace('Show', 'Hide'));
            });
        },

        /**
         * Hides the selectionSummary div
         */
        hideSelectionSummary: function(){
            $('#selectionSummary').fadeOut(400, function(){
                $('#showSelectionSummaryButton .glyphicon').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
                var html = $('#showSelectionSummaryButton').html();
                $('#showSelectionSummaryButton').html(html.replace('Hide', 'Show'));
            });
        },

        /**
         * Shows the settings menu and binds listeners where necessary
         */
        showSettingsMenu: function(event){
            var sh = $('#settingsHolder');
            var et = $(event.target);
            //in case we click the cog
            if(et.attr('id') != "settingsButton") et = et.parent();
            //Start fading it in to make calculations possible using the dimensions of this object
            sh.fadeIn();
            var pos = {
                top: et.offset().top + et.outerHeight() + 2,
                left: et.offset().left - sh.width() + et.outerWidth()
            }
            sh.offset(pos);
            //Now unbind the show action and bind the hide action
            et.unbind('click').click(comparativus.ui.hideSettingsMenu);
            et.parent().addClass('active');
        },

        /**
         * Called to hide the menu again
         */
        hideSettingsMenu: function(event){
            var sh = $('#settingsHolder');
            var et = $(event.target);
            //in case we click the cog
            if(et.attr('id') != "settingsButton") et = et.parent();
            //Fade out the settings holder
            sh.fadeOut(400, function(){sh.offset({top: 0, left: 0})});
            //Don't make the button active anymore
            et.parent().removeClass('active');
            //Rebind the show action
            et.unbind('click').click(comparativus.ui.showSettingsMenu);
        },

        /**
         * Called when a user clicks on one of the page buttons to switch to a different page
         */
        switchPage: function(event){
            //Set the clicked page as the active page
            $('.btn-page').removeClass('active');
            //Set it as active and de-focus asap
            $(event.target).addClass('active').blur();

            //Find the id of the page we're trying to load and the old page
            var newPage = $('#' + $(event.target).text().toLowerCase() + "Page");
            var oldPage = $('.page.active');

            //check if we're not staying on the same page, if so cancel
            if(newPage.attr('id') == oldPage.attr('id')) return;

            //Fade out the old page
            oldPage.removeClass('active').fadeOut();
            newPage.addClass('active').fadeIn();
        },

        /**
         * Switches to the provided page by name (VIS|TEXT|TABLE)
         */
        switchPageByName: function(page){
            $('#' + page.toLowerCase() + "PageButton").click();
        },

        /**
         * Returns the opening or closing matchmark of a match (dependent on the 
         * state of the passed parameter boolean)
         * @param {Boolean} opening if true, this is a astart of a match, if false it is the end
         * @param {String} urnID    the id+urn of this match and text.
         */
        getMatchMark: function(opening, urnID){
            var openingClass = "glyphicon glyphicon-chevron-left";
            var closingClass = "glyphicon glyphicon-chevron-right"
            var mark = comparativus.ui.matchmark.replace(/%MARK%/g, ((opening) ? openingClass : closingClass));
            return mark.replace(/%URN%/g, urnID);
        },

        /**
         * Returns the opeining or closung matchmark of a match (dependent on the state
         * of the passed parameter boolean). Also saves what this matchmark links to
         */
        getMarkusMark: function(opening, urnID, linksTo){
            var mark = opening ? comparativus.ui.markusmarkopen : comparativus.ui.markusmarkclose;
            mark =  mark.replace(/%URN%/g, urnID);
            return mark.replace(/%LINKS%/g, linksTo);
        },

        /**
         * Sets the text on the comparison button to the provided text parameter
         */
        setComparisonButtonText : function(text){
            $('#comparisonButtonText').html(text);
        },

        /**
         * Enables or disables the loading animation on the comparison button
         */
        showLoadingAnimation: function(enabled){
            if(enabled){
                $('#comparisonButtonIcon').removeClass().addClass('glyphicon glyphicon-repeat rotating');
                $('body').addClass('progress');
            }else{
                $('#comparisonButtonIcon').removeClass().addClass('glyphicon glyphicon-refresh');
                $('body').removeClass('progress');
            }
        },

        /**
         * Sets the similarity spane value to the provided value
         */
        setSimilarityScore: function(idA, idB, val){
            const text = "<em>" + comparativus.file.getTitleFromID(idA) + " &amp; " 
            + comparativus.file.getTitleFromID(idB) + ":</em> " + val + "<br>";
            $('#simScore').html($('#simScore').html() + text);
        },

        clearSimScores: function(){
            $('#simScore').html('');
        },

        /**
         * Sets the file panel with the provided name to the provided content
         */
        setFilePanelContent: function(id, content){
            $('#text' + id).html(content);
        },

        /**
         * Adds the listeners for the match selection and highlight events to 
         * all the elements across the page
         */
        addMatchListeners: function(){
            $('[comparativusURN]').unbind('mouseenter mouseleave click').click(function(e){
                comparativus.ui.setSelected($(this).attr('comparativusURN'), !$(this).hasClass('selected'));
                //Do this underneath trick only if we are currently in vis
                if($('#visualisationPage').hasClass('active')){
                    //Briefly set pointer events to none
                    $(this).css('pointer-events', 'none');
                    //Then trigger a click on the next underlying element
                    $(document.elementFromPoint(e.pageX, e.pageY)).click();
                    //Then set back pointer events to auto
                    $(this).css('pointer-events', 'auto');
                }
            }).mouseenter(function(e){
                //Special case for td cells. highlight in matching text color
                if($(this).prop('tagName') == "TD"){
                    var tColor = comparativus.text.getVisColor($(this).attr('textid'));
                    $('[comparativusURN*="' + $(this).attr('comparativusURN') + '"]').attr('style', 'background-color: ' + d3.hsl(tColor).brighter());
                }
                //Then set the active class
                comparativus.ui.setActive($(this).attr('comparativusURN'), true);
            }).mouseleave(function(e){
                //Special case for td cells. empty style attribute inline
                if($(this).prop('tagName') == "TD"){
                    $('[comparativusURN*="' + $(this).attr('comparativusURN') + '"]').attr('style', '');
                }
                comparativus.ui.setActive($(this).attr('comparativusURN'), false);
            });
        },

        /**
         * Toggles the selected class for any element that contains the provided urn as comparativusURN attribute
         */
        toggleSelected: function(urn){
            $('[comparativusURN*="' + urn + '"]').toggleClass('selected');
        },

        /**
         * Sets the selected status of the provided urn
         */
        setSelected: function(urn, enabled){
            if(enabled){
                $('[comparativusURN*="' + urn + '"]').removeClass('selected').addClass('selected');
            }else{
                $('[comparativusURN*="' + urn + '"]').removeClass('selected');
            }
            //Wait a little, then update the selection, seems to prevent bugs
            setTimeout(comparativus.ui.updateOverview, 100);
        },

        /**
         * Adds/removes the active class based on the provided comparativusURN attribute
         */
        setActive: function(urn, enabled){
            if(enabled) $('[comparativusURN*="' + urn + '"]').addClass('active');
            else $('[comparativusURN*="' + urn + '"]').removeClass('active');
        },

        /**
         * Updates the selection overview
         */
        updateOverview: function(){
            //List of all selected matches
            var selectedMatches = [];
            //Go through all matches and find the selected ones
            comparativus.matches.forEach(function(cMatch){
                $('#resultTable .selected').each(function(i, td){
                    const textID = $(td).attr('textid');
                    const compURN = $(td).attr('comparativusurn').replace(textID, '');
                    if(textID == cMatch.idA && compURN == cMatch.urnA
                    || textID == cMatch.idB && compURN == cMatch.urnB){
                        if(selectedMatches.indexOf(cMatch) == -1){
                            selectedMatches.push(cMatch);//Only add a match once
                        }
                    }
                });
            });

            //Go through each of the selected matches 
            var html = "";
            selectedMatches.forEach(function(match){
                var matchTemplate = comparativus.ui.selectionSummary.replace(/%TEXTA%/g, match.textA);
                matchTemplate = matchTemplate.replace(/%RATIO%/g, match.r);
                matchTemplate = matchTemplate.replace(/%LENGTH%/g, match.l);
                matchTemplate = matchTemplate.replace(/%INDEXA%/g, match.indexA);
                matchTemplate = matchTemplate.replace(/%INDEXB%/g, match.indexB);
                matchTemplate = matchTemplate.replace(/%TEXTB%/g, match.textB);
                matchTemplate = matchTemplate.replace(/%URNA%/g, match.urnA);
                matchTemplate = matchTemplate.replace(/%URNB%/g, match.urnB);
                matchTemplate = matchTemplate.replace(/%IDA%/g, match.idA);
                matchTemplate = matchTemplate.replace(/%IDB%/g, match.idB);

                //Add this div to the row   
                html += matchTemplate;
            });
            
            //Now finally update the DOM
            $('#selectionOverview').html(html);
            $('#showSelectionSummaryButton .badge').html(selectedMatches.length);
        },

        /**
         * Shows the match the provided button belongs to in the visualisation
         */
        showInVis: function(button){
            var textID = $(button).parent().attr('text-id');
            var matchURN = $(button).parent().attr('match-urn');
            comparativus.ui.showInPage(textID, matchURN, "VIS");
        },

        /**
         * Shows the match the provided button belongs to in the text
         */
        showInText: function(button){
            var textID = $(button).parent().attr('text-id');
            var matchURN = $(button).parent().attr('match-urn');
            comparativus.ui.showInPage(textID, matchURN, "TEXT");
        },

        /**
         * Shows the match the provided button belongs to in the table
         */
        showInTable: function(button){
            var textID = $(button).parent().attr('text-id');
            var matchURN = $(button).parent().attr('match-urn');
            comparativus.ui.showInPage(textID, matchURN, "TABLE");
        },

        /**
         * Shows the match described by the provided URN on the provided 
         * page (VIS|TEXT|TABLE)
         */
        showInPage(textid, urn, page){
            //Switch to the right name
            comparativus.ui.switchPageByName(page);
            //If we are in the text page, switch to the right tab
            if(page.toLowerCase() == 'text'){
                $('#textPage a[href="#text' + textid + 'Holder"').click();
            }

            //Once we're on the right page, scroll to the ones we're looking for
            //and highlight them
            setTimeout(function(){
                $('[comparativusurn="' + textid  + urn + '"').addClass('active').get(0).scrollIntoView();
                window.scrollBy(0, -50);
            }, 500);
        },

        /**
         * Loads a new file into a newly created tab of the textContent div.
         */
        addFileTab: function(id, name, content){
            //Add the tab
            $.get('./parts/filetab.html', function(data){
                //Activate the template
                data = data.replace(/%ID%/g, id);
                data = data.replace(/%NAME%/g, name);
                $('#navTabs').append(data);
                //If this is the first one, make it active
                if($('#navTabs li').length == 1){
                    $('#navTabs li').addClass('active');
                }
            });
            //Add the div that holds the pre that holds the text
            $.get('./parts/textholder.html', function(data){
                //First activate the template by replacing KEYwords
                data = data.replace(/%ID%/g, id);
                data = data.replace(/%CONTENT%/g, content);
                $('#textContent').append(data);
                //If this is the first one, make it active
                if($('#textContent div').length == 1){
                    $('#textContent div').addClass('in active');
                }
            });
        },

        /**
         * Returns the minimum match size. This is the value
         * of the minimum match size input element on the GUI.
         */
        getMinMatchSize: function(){
            return Math.round(Number($('#minimumMatchSize').val()));
        },

        /**
        Checks the minimumMatchSize value. This should be a valid integer.
        **/
        checkMinMatchSize: function(el){
            el.value = Math.round(Number(el.value));
            if(el.value == 0) el.value = 10;
        },

        /**
         * Loads the provided array of matches into 
         * the result table
         */
        showResultTable: function(matches){            
            //Stringbuilder that will hold the HTML for the data table
            var parts = [];

            //Add the table header
            var tableHeader = "<thead><tr>"
                         + "<th>TextA</th>"
                         + "<th>TextB</th>"
                         + "<th>Length</th>"
                         + "<th>Ratio</th>"
                         + "</tr></thead>"
                         + "<tbody>";
            parts.push(tableHeader);
            
            //Stringbuilder for the parts of a TSV file
            var tsvParts = [];
            
            //Set the amt of results in the table
            $('#matchesAmt').html(matches.length);
            
            //Loop through every match
            matches.forEach(function(cMatch){
                //Get the link id
                var linkID = 'A' + cMatch.indexA + 'B' + cMatch.indexB;
                var compURNA = cMatch.idA + cMatch.urnA;
                var compURNB = cMatch.idB + cMatch.urnB;
                //Add a new line for that match, by replacing the variables in the template
                var mRow = comparativus.ui.matchrow.replace(/%LENGTH%/g, cMatch.l);
                mRow = mRow.replace(/%TEXTA%/g, cMatch.textA);
                mRow = mRow.replace(/%TEXTB%/g, cMatch.textB);
                mRow = mRow.replace(/%TEXTIDA%/g, cMatch.idA);
                mRow = mRow.replace(/%TEXTIDB%/g, cMatch.idB);
                mRow = mRow.replace(/%URNA%/g, comparativus.text.getByID(cMatch.idA).name + " | " + cMatch.urnA);
                mRow = mRow.replace(/%URNB%/g, comparativus.text.getByID(cMatch.idB).name + " | " + cMatch.urnB);
                mRow = mRow.replace(/%COMPURNA%/g, compURNA);
                mRow = mRow.replace(/%COMPURNB%/g, compURNB);
                mRow = mRow.replace(/%RATIO%/g, cMatch.r.toPrecision(4));
                
                //Now add the template row to the table
                parts.push(mRow);
            });

            //Add the result to the page
            $("#resultTable").html($('#resultTable').html() + parts.join() + "</tbody>");

            //create the downloadButtons
            $('#downloadTSVButton').unbind('click').click(function(){
                var selMatches = comparativus.text.getSelectedMatches();
                if(selMatches.length == 0) selMatches = matches;
                comparativus.file.createTSV(selMatches);
            });
            $('#downloadJSONButton').unbind('click').click(function(){
                var selMatches = comparativus.text.getSelectedMatches();
                if(selMatches.length == 0) selMatches = matches;
                comparativus.file.createJSON(selMatches);
            });
        },

        /**
         * Hides the file selection menu
         */
        hideFileSelection: function(){
            $('#fileSelectionMenu').fadeOut().parent().fadeOut(400, function(){$(this).offset({top:0, left: 0}).hide();});
        },

        /**
         * Shows the uploadMenu
         */
        showUploadMenu: function(){
            //Start fading in the menu
            $('#uploadMenu').fadeIn().parent().fadeIn().offset({top: 0, left: 0});
            //And place it in the middle of the screen
            var leftOffset = ($('body').outerWidth() - $('#uploadMenu').outerWidth()) / 2;
            $('#uploadMenu').offset({left: leftOffset, top: 100});

            //Object of files
            const files = [];
            $('#fileUploadInput').unbind('change').change(function(evt){
                const f = evt.target.files[0];
                //If we have a file, load it
                if(f){
                    const reader = new FileReader();
                    //Load handler
                    reader.onload = function(e){
                        var obj = {
                            data: e.target.result,
                            name: f.name
                        }
                        files.push(obj);
                        $('#uploadedFiles').html('');
                        let listF = "";
                        for(let i = 0; i < files.length; i++){
                            listF += files[i].name + "<br>";
                        }
                        $('#uploadedFiles').html(listF);
                    }
                    //Start reading the file
                    reader.readAsText(f);
                }
            });

            /**
             * Once we're ready to continue, do so
             */
            $('#uploadReady').unbind('click').click(function(){
                //If we chose to upload, use that
                if(files.length > 1){
                    for(let i = 0; i < files.length; i++){
                        comparativus.file.addUploadFile(files[i].data, files[i].name);
                    }
                    comparativus.ui.hideUploadMenu();
                }else{
                    let textA = $('#fileUploadAreaA').val().trim();
                    let textB = $('#fileUploadAreaB').val().trim();
                    if(textA.length < 3 || textB.length < 3){
                        if(textA.length < 3) comparativus.util.jello("#fileUploadAreaA");
                        if(textB.length < 3) comparativus.util.jello("#fileUploadAreaB");
                    }else{
                        comparativus.file.addUploadFile(textA, "textA");
                        comparativus.file.addUploadFile(textB, "textB");
                        comparativus.ui.hideUploadMenu();
                    }
                }
            });
        },

        /**
         * Hides the upload menu
         */
        hideUploadMenu: function(){
            $('#uploadMenu').fadeOut().parent().fadeOut(400, function(){$(this).offset({top:0, left: 0}).hide();});
        },

        /**
         * Shows the file selection menu
         */
        showFileSelection: function(){
            //check if the template is loaded, otherwise set a sign so this function can be called back
            if(comparativus.ui.filerow.length == 0){
                comparativus.ui.filerow = "NEEDED";
                return;
            }
            //If its already loaded, continue
            
            //Start fading in the menu
            $('#fileSelectionMenu').fadeIn().parent().fadeIn().offset({top: 0, left: 0});
            //And place it in the middle of the screen
            var leftOffset = ($('body').outerWidth() - $('#fileSelectionMenu').outerWidth()) / 2;
            $('#fileSelectionMenu').offset({left: leftOffset, top: 100});

            //Search handler
            $('#fileSearch').keyup(function(){
                var query = $('#fileSearch').val();
                //Hide table rows that do not match, show those that do
                $('#fileSelectionBody tr').each(function(){
                    if($(this).text().toLowerCase().indexOf(query) == -1){
                        $(this).fadeOut(200);
                    }else{
                        $(this).fadeIn(200);
                    }
                });
            });
            //Empty filter on click
            $('#fileSearch').click(function(){
                $(this).val('');
            });

            //Add upload or paste functionality
            $('#uploadButton').unbind('click').click(function(){
                //When we upload a file, fade out the menu
                comparativus.ui.hideFileSelection();
                comparativus.ui.showUploadMenu();
            });


            //Set the contents of the fileSelectionBody
            var files = comparativus.file.list.files;
            var fileRows = [];
            var fRow = "";
            files.forEach(function(file){
                //Try to find a match in the metadata
                var metadata = file.metadata;
                var dynasty;
                var genre;
                var title = file.fileName;
                metadata.forEach(function(datum){
                    if(datum.key == "title") title = datum.value;
                    else if(datum.key == "genre") genre = datum.value;
                    else if(datum.key == "dynasty") dynasty = datum.value;
                });
                fRow = comparativus.ui.filerow.replace(/%NAME%/g, title);
                fRow = fRow.replace(/%DYNASTY%/g, file.meta);
                fRow = fRow.replace(/%GENRE%/g, );
                fRow = fRow.replace(/%ID%/g, file._id);
                //Add it to all the rows
                fileRows.push(fRow);
            });
            //Now add all the rows to the table body
            $('#fileSelectionBody').html(fileRows.join(''));

            //Now add the event listeners
            $('#fileSelectionBody input[type="checkbox"]').unbind('click').click(function(){
                //Add the selected class and get its id value
                var id = $(this).toggleClass('selected').val();
                //Count how many are selected, if enough allow loading of files
                if($('#fileSelectionBody input.selected').length > 1){
                    //If there are enough files, allow loading them
                    $('#loadSelectedButton').removeClass('disabled').unbind('click').click(function(){
                        //In case of debug, ignore the scenario
                        if(comparativus.util.isDebug()){
                            comparativus.file.loadDebug();
                        }else{
                        //Get all the ids we have to load
                            $('#fileSelectionBody input.selected').each(function(index, input){
                                var id = $(input).val();
                                comparativus.file.loadFromID(id, function(data, plain){
                                    comparativus.text.add(id, comparativus.file.getTitleFromID(id), data, plain);
                                });
                            });
                        }
                        //When the file are starting to load ,fade out the menu
                        comparativus.ui.hideFileSelection();
                    });
                }else{
                    //If we have less than the minimum required files selected (>2<)
                    $('#loadSelectedButton').removeClass('disabled').addClass('disabled').unbind('click');
                }
            });
        }
    }
})(comparativus);;/**
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
})(comparativus);;(function(_c){
        //Define 2PI
        var tau = Math.PI * 2;

        //Pad angle is the space between texts in the arc
        var padAngle = 0.05;
        
        //Define the area of the rect
        var w = 1280;
        var h = 720;
        var w2 = w / 2;
        var h2 = h / 2;
        
        //Defines the circle
        var arc = d3.arc()
            .innerRadius(h2 - 50)
            .outerRadius(h2);

        //Defines the curve used for the lines between nodes
        var curve = d3.line().curve(d3.curveBasis);

        /**
         * Checks if the provided mouse coordinates fall within the radius
         * and position of the provided node. Returns true / false
         * @param {Node} node 
         * @param {Number} mouseX 
         * @param {Number} mouseY 
         * @returns {Boolean}
         */
        var clickedNode = function(node, mouseX, mouseY){
            var dx = mouseX - parseFloat(node.attr('cx'));
            var dy = mouseY - parseFloat(node.attr('cy'));
            var r = parseFloat(node.attr('r'));
            //Square radius, prevents expensive SQRT calculations
            return (r * r > dx * dx + dy * dy);
        }

    
        /**
         * Holds the public methods for the visualization
         */
        _c.vis = {
            /**
             * Defined width and height for future use
             */
            width: w,
            height: h,

            /**
             * Color scheme
             */
            color: d3.scaleOrdinal(d3.schemeCategory10),

            /**
             * Reference to the SVg we will draw on
             */
            svg: undefined,

            /**
             * Initializes the visualization. Called on document read
             */
            init: function(){
                //hide the svg and clear it to be sure
                $('.svg-canvas').hide().html('');
                //save a reference to the svg
                comparativus.vis.svg = d3.select('.svg-canvas');
            },

            /**
             * Returns the angle (Radial) of where the node should be
             * placed on the text with the provided id.
             * @param {Object} node the node object to place
             * @param {String} id the id of the text we're placing it on
             */
            getNodeAngle: function(node, id){
                //Extract the necessary data. Index ratio is [0-1] for place in text
                var indexRatio = node.index / comparativus.text.getByID(id).clean.length;
                //Angles are the starting angle and angle of the arc of the text
                var angles = $('[text-id="' + id + '"]').attr('angle').split("+");
                //return the result
                return (parseFloat(angles[1]) * indexRatio) + parseFloat(angles[0]);
            },

            /**
             * Draws the visualisation
             */
            draw: function(){
                //Get all text ids
                var textIDS = comparativus.text.getAllIDs();

                //Fade in the svg div but clear it first
                $('.svg-canvas').html('').fadeIn(1000);
                
                //First draw the text circle parts
                comparativus.vis.drawTexts(textIDS);
                
                //Then draw the nodes on each text
                comparativus.vis.drawNodes(textIDS);
                
                //Now draw lines between them
                comparativus.vis.drawLines();

                //Add click handler on the canvas itself
                /*
                $('.svg-canvas').unbind('click').click(function(e){
                    var offset = $(this).offset();
                    //Relative to element ,and tranlsated to have 0,0 in the middle
                    var relX = e.pageX - offset.left - w2;
                    var relY = e.pageY - offset.top - h2;
                    $('.node').each(function(node){
                        console.log(clickedNode($(node), relX, relY));
                    });
                });*/
            },
            
            /**
             * Draws the lines between the nodes
             */
            drawLines: function(){
                //Create a holder for the lines
                var lineHolder = comparativus.vis.svg.append("g")
                    .attr("transform", "translate(" + comparativus.vis.width / 2 + "," + comparativus.vis.height / 2 + ")");
                
                //Now go through all match objects
                comparativus.matches.forEach(function(match){
                    //Create empty array of points;
                    var points = [];

                    //Grab beginngin and end point
                    var startNode = $('circle[comparativusURN="' + match.idA + match.urnA + '"]');
                    var endNode = $('circle[comparativusURN="' + match.idB + match.urnB + '"]');
                    
                    //Push beginning point to pathData
                    points.push([startNode.attr('cx'), startNode.attr('cy')]);
                    //Push middle point to pathData
                    points.push([0, 0]);

                    //Push end point to pathData
                    points.push([endNode.attr('cx'), endNode.attr('cy')]);

                    //Then draw a ling with the generated pathData
                    lineHolder.append("path")
                            .attr('d', curve(points))
                            .attr('comparativusURN', match.idA + match.urnA + "=" + match.idB + match.urnB)
                            .attr('class', 'matchLine');

                });
            },

            /**
             * Draws the nodes for each of the provided texts
             */
            drawNodes: function(textIDS){
                //Create a holder for the nodes
                var nodeHolder = comparativus.vis.svg.append("g")
                    .attr("transform", "translate(" + comparativus.vis.width / 2  + "," + comparativus.vis.height / 2 + ")");
                
                //For each text add all the nodes
                textIDS.forEach(function(id, index){
                    //All nodes for this text
                    var nodes = comparativus.nodes[id];
                    //Node color
                    var nColor = comparativus.vis.color(index);
                    
                    //Now draw each node onto the circle
                    nodes.forEach(function(node){
                        var angle = comparativus.vis.getNodeAngle(node, id);
                        nodeHolder.append("circle")
                            .style("stroke", "black")
                            .style("fill", nColor)
                            .attr("stroke-width", 1)
                            .attr("fill-opacity", 1)
                            .attr("class", "node")
                            .attr("cx", (Math.sin(angle) * (h2 - 50)))
                            .attr("cy", - (Math.cos(angle) * (h2 - 50)))
                            .attr("r", 6)
                            .attr("comparativusURN", id + node.urn);
                        
                    });
                });            
            },

            /**
             * Draws the texts and their info onto the screen
             */
            drawTexts: function(textIDS){
                //Create a holder for the texts
                var textHolder = comparativus.vis.svg.append("g")
                    .attr("transform", "translate(" + comparativus.vis.width / 2  + "," + comparativus.vis.height / 2 + ")");
            
                //Get all text objects
                var text, sAngle = 0, tAngle, legendY = 0;
                textIDS.forEach(function(id, index){
                    text = comparativus.text.getByID(id);
                    //Get the angle for this text in the circle
                    tAngle = (tau - (padAngle * comparativus.text.amt())) * comparativus.text.getPercentLength(id);
                    //Now add an arc to the text holder
                    var tColor = comparativus.text.getVisColor(id);
                    textHolder.append("path")
                        .datum({startAngle: sAngle, endAngle: sAngle + tAngle})
                        .style("fill", tColor)
                        .style("stroke", d3.rgb(tColor).darker())
                        .attr("d", arc)
                        .attr('text-id', id)
                        .attr('angle', sAngle + "+" + tAngle)
                        .attr("class", "textArc");
                    sAngle += tAngle + padAngle;

                    //Also draw a rect in the legend
                    textHolder.append("rect")
                        .style("fill", tColor)
                        .style("stroke", d3.rgb(tColor).darker())
                        .attr("x", -w2 + 10)
                        .attr("y", -h2 + legendY + 20)
                        .attr("width", 20)
                        .attr("height", 20)
                        .attr('text-id', id)
                        .attr("class", "textLegend");

                    //Add the highlight action when they're hover over legend or arc
                    $('.textLegend, .textArc').mouseenter(function(){
                        $('[text-id="' + $(this).attr('text-id') + '"]').addClass('active');
                    }).mouseleave(function(){
                        $('[text-id="' + $(this).attr('text-id') + '"]').removeClass('active');
                    });
                    
                    //Now draw the name with the legend rect
                    textHolder.append("text")
                        .attr("x", -w2 + 40)
                        .attr("y", -h2 + legendY + 36)
                        .text(text.name);

                    //Now draw the character length with the name
                    textHolder.append("text")
                        .attr("x", -w2 + 40)
                        .attr("y", -h2 + legendY + 48)
                        .attr("class", "small")
                        .text(text.clean.length + " characters");

                    legendY += 50;
                });
            }
    
        
        };
    })(comparativus);;/**
 * Anonymous function for this file
 */
(function (_c){
    /**
     * The popover object that will hold all the methods
     */
    _c.popover = {
        /**
         * Holds a JQ ref to the element of the popover in the DOM
         */
        pop: {},
        /**
         * Initializes the popover module
         */
        init: function(){
            comparativus.popover.pop = $('#popover');
        },

        /**
         * Shows the content that is supplied as a parameter as the
         * content of the popover div. The content should be HTML string
         * @param content {String}  HTML content as string
         * @param top   {Number}    the top coordinate (y coordinate)
         * @param left  {Number}    the left coordinate (x coordinate)
         */
        show: function(content, top, left){
            var coords = {'top': top, 'left': left};
            comparativus.popover.pop.offset(coords);
            comparativus.popover.pop.html(content);
            comparativus.popover.pop.fadeIn();
            $(document).click(function(){
                comparativus.popover.pop.hide();
                //$(document).unbind('click');
            });
            
        },

        /**
         * Hides the popover. Does NOT empty it. 
         */
        hide: function(){
            comparativus.popover.pop.fadeOut();
        },

        /**
         * Shows the JSON data that is attached to the provided element.
         * @param element {HTMLElement} the element that has a 'data' attribute that contains JSON
         */
        showData: function(element){
            var node = JSON.parse($(element).attr('data'));
            var match = node.match;
            var html = "<h4>Match Data</h4>\n" +
            "<b>Match A: </b>" + match.textA + "<br>" +
            "<b>Match B: </b>" + match.textB + "<br>" + 
            "<b>Ratio: </b> " + match.r + "<br>" +
            "<b>Length: </b>" + match.l;
            var offset = $(element).offset();
            comparativus.popover.show(html, offset.top + $(element).height(), offset.left);
        }
    };
})(comparativus);;/**
 * Anonymous namespace of this file to prevent polluting of the global namespace
 */
(function(_c){
    /**
     * The URN object holds the necessary methods for converting index to 
     * urn's and back again.
     */
    _c.urn = {
        /**
         * Returns a urn object that signifies what character
         * this index was at. I.e. a[5] is the sixth 'a'.
         * 
         * @param {String} text The text in which the index is
         * @param {Integer} index   The index in the aforementioned text.
         */
        fromIndex: function(text, index){
            //What character are we trying to find
            var c = text.charAt(index);

            //What is the first occurence
            var cIndex = text.indexOf(c);
            var found = 0;

            //Keep looking for matching character untill we arrive at the specified index
            while(cIndex != index){
                found ++;
                cIndex = text.indexOf(c, cIndex + 1);
            }

            //When it exits the loop, we have found a result, return it
            return c + '[' + found + ']';
        },

        /**
         * Tries to find the index of the character signified by the 
         * provided urn paramter in the provided text. This ignores
         * any characters between `<` and `>` brackets as they are part
         * of the HTML layout.
         * 
         * @param {String} text the text the urn is reffering to
         * @param {String} urn  the referrence to a character
         */
        toIndex: function(text, urn){
            //First decode the character and number of the urn
            var c = urn.substring(0, 1);
            var n = parseInt(urn.substr(2, urn.length - 3));

            //Then try to find that occurence
            var cIndex = -1, found = -1, ltIndex, gtIndex;
            do{
                //First find an occurence
                cIndex = text.indexOf(c, cIndex + 1);
                //Break out of the loop if you can't find it
                if(cIndex == -1) {
                    console.error("Can't find character '" + c + "' in text for urn: " + urn);
                    console.log(text);
                    break;
                }
                //Then check preceding '<' and '>'
                ltIndex = text.lastIndexOf('<', cIndex);
                gtIndex = text.lastIndexOf('>', cIndex);
                //Only count this instance if it was not within brackets
                if(ltIndex <= gtIndex) found++;
            }while(found != n);

            //Now that we have found it, return the index
            return cIndex;
        },

        /**
         * Converts a passed range of indeces in a provided text to 
         * a URN string that can be converted back.
         * 
         * @param {String} text The text the indeces refer to
         * @param {Integer} sIndex the start of the passage we are indexing
         * @param {Integer} eIndex the end of the passage we are indexing (exclusive)
         */
        fromIndeces: function(text, sIndex, eIndex){
            return comparativus.urn.fromIndex(text, sIndex) + "-" + comparativus.urn.fromIndex(text, eIndex);
        },

        /**
         * Tries to parse a URN as a range for the provided text. Returns
         * the range as an array of two index numbers. index[0] is the first
         * index number (integer), index[1] is the second index number.
         * 
         * @param {String} text The text the urn refers to
         * @param {String} urn the urn that we're converting
         */
        toIndeces: function(text, urn){
            return [
                comparativus.urn.toIndex(text, urn.substring(0, urn.indexOf('-', 2))), //Do this substring thing instead of split because of hyphen as a URN character
                comparativus.urn.toIndex(text, urn.substring(urn.indexOf('-', 2) + 1)) //This allows us to also refer to a hyphen as a URN not just a range character
            ];
        },

        /**
         * Converts a passed match to a URN string that can whitstand the 
         * altering of the text structure in HTML.
         * 
         * @param {String} text The text the match refers to
         * @param {Integer} index the start index of this match
         * @param {Integer} length the length of this match
         */
        fromMatch: function(text, index, length){
            return comparativus.urn.fromIndeces(text, index, index + length);
        },

        /**
         * Converts a URN text range to a match object that has a
         * length and index property. Use result.length and result.index
         * to read these. Also contains a text property (result.text)
         * that contains the referenced substring match.
         * 
         * @param {String} text the text the URN refers to
         * @param {String} urn  the URN we're trying to decode
         */
        toMatch: function(text, urn){
            var indeces = comparativus.urn.toIndeces(text, urn);
            //Then construct a match object from it.
            return {
                index: indeces[0],
                length: indeces[1] - indeces[0],
                text: text.substring(indeces[0], indeces[1])
            };
        }
    };
})(comparativus);;/**
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
})(comparativus);;/**
Starts after document load.
**/
$(document).ready(function (){
    //Start loading all modules
    initModules();

    //Based on the debug variable, decide where we load the list of files from
    var listFilesURL = "https://dh.chinese-empires.eu/auth/list_files/";
    if(comparativus.util.isDebug()) listFilesURL = "./data/list_files.json";
    
    //Then load the list files from the right location
    $.get(listFilesURL, function(data){  
        //Assign the file list
        comparativus.file.list = data;
        //Only start initializing after we've received the file list from the server.
        initFiles();
    });
        
});

/**
 * Calls initializing functions for the modules that require them. This happens before
 * the loading of any AJAX calls and therefore should not require the presence of 
 * files likes 'list_files' in comparativus.file.list
 */
function initModules(){
    //Call the init function for modules that need it
    comparativus.worker.init();   
    comparativus.ui.init();
    comparativus.vis.init();
    comparativus.popover.init();
}

/**
 * Calls the necessary functions to, depending on environment (production / dev), 
 * load either some dev data files or to actually parse the user input in the GET
 * variables. Called after ajax calls like list_files have succeeded. 
 * 
 * If no get variables was set, presents the user with a list files selection menu
 */
function initFiles(){
    //Try to get the url GET var. This is undefined if it is not set
    var filesVar = comparativus.util.getURLVar('files');
    if(filesVar == undefined){
        //
        //This is done when we haven't defined vars in the GET variable
        //
        comparativus.ui.showFileSelection();

    }else{
        //
        //This is done in case we have defined files already in the GET VAR
        //
        if(!comparativus.util.isDebug()){
            //Load the files from the GET URL variables
            filesVar.split(',').forEach(function(id){
                comparativus.file.loadFromID(id, function(data, plain){
                    comparativus.text.add(id, comparativus.file.getTitleFromID(id), data, plain);
                });
            });
        }else{
            //Load the data files from disc
            comparativus.file.loadDebug();
        }
    }
}