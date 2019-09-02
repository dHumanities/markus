/**
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
})(comparativus);