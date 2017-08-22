/**
 * manualMarkup.js base file.
 * @module io.js
 */

 /**
 The class that holds the variables and functions created in the namespace of this file.
 The constrcutor of this object is only called once, because it is an anonymous function.

 @class manualMarkup.js_anonymous
 @constructor
 @param {Object}  _m a reference to the Markus Configuration Object is passed
 **/
( function(_m) {

    /**Holds the tag toggle*/
    var tagToggle = null;

    /**
     * This function cleans the class attribute of the element this is called on.
     *
     * @method registMakupAction
     * @param {Span} justAdd  one of the spans that still has the justAdd class
     */
    var registMakupAction = function() {
        var _class = $(this).attr("class");
        $(this).attr("class", _class.trim());
    }

    /**
     * Called when we have a new type of markup to save. We set the classes on
     * the corresponding element, and fadeout the `singleTagContent` css class
     * elements. Also shows the `.search` element at the end of the function.
     *
     * @method newtypeSave
     */
    var newtypeSave = function() {
        //get a reference to the just clicked markup instance
        var clickedMarkup = _m.popup.clickedMarkup;
        //remove the ``.justAdd` class if it already was added. From all the elements
        //that have it right now, including just clicked markup
        $(".justAdd").removeClass("justAdd");

        //If there is an element within #manualPopover that has the switch element
        //with a defined color
        if ($("#manualPopover").find(".switch:not(.noColor)").length > 0) {
            //remove class: `justselected`,
            //add class: `justAdd`, `markup`, `manual`, `unsolved`
            //From the clicked markup we get in the beginning of the function
            $(clickedMarkup).removeClass("justSelected").addClass("justAdd").addClass("markup").addClass("manual").addClass("unsolved");

            //Get the type of the manualPopover switch.
            var type = $("#manualPopover").find(".switch:not(.noColor)").attr("_type");

            //Do based on type
            switch (type) {
                case "fullName":
                case "partialName":
                    //In case it's a name, we add that is has no CBDBID.
                    $(clickedMarkup).addClass(type).addClass("noCBDBID").attr("type", type).attr("cbdbid", "");
                    break;
                default:
                    //Else we just add the type attribute as the type.
                    $(clickedMarkup).addClass(type).attr("type", type);
            }
        }

        //We fadeout the singleTagContent element
        $("#manualPopover").find(".singleTagContent").fadeOut();
        //For each of the just added elements we call the `registMakupAction`,
        //This function just cleans the class assignement.
        $(".doc").find("span.justAdd").each(registMakupAction);
        //We find the search element and show it
        $("#manualPopover").find(".search").show();

        // $("#manualPopover").find(".glyphicon-search").click();
    }

    /**
     * Function called when either `applyAllBtn` or `removeAllBtn` has fired
     * and event and we want to process it. This just removes the `fired` class
     * from both of those buttons if present.
     *
     * @method initialRemoveModal
     */
    var initialRemoveModal = function() {
        $("#applyAllBtn").removeClass("fired");
        $("#removeAllBtn").removeClass("fired");
    }

    /**
     * Shows and or hides the `#removeModal` and the `#removeAll` and `#applyAll` buttons
     *
     * @method updateRemoveModal
     */
    var updateRemoveModal = function() {
        // console.log($("#removeModal").find(".well").length);

        //Swtich based on the amount of wells found within the #removeModal element
        switch ($("#removeModal").find(".well").length) {
            case 0:
                //If none were found, hide the modal
                $("#removeModal").modal("hide");
                break;
            case 1:
                //If there was one, hide both the removeAll and applyAll button.
                $("#removeAllBtn").hide();
                $("#applyAllBtn").hide();
                break;
            default:
                //If there are a different amount of wells

                //Set the styling of the first well with the sameTags class
                $("#removeModal").find(".sameTags .well:first").css({
                    "border-width": "2px",
                    "border-color": "#8D8C8C",
                    "background-color": "#D8D5D5"
                });

                //If the removeAllBtn has the fired class, show it, else fadeOut
                if (!$("#removeAllBtn").hasClass("fired")) {
                    $("#removeAllBtn").show();
                } else {
                    $("#removeAllBtn").fadeOut();
                }


                //If the applyAllBtn has the fired class, show it, else fadeOut
                if (!$("#applyAllBtn").hasClass("fired")) {
                    $("#applyAllBtn").show();
                } else {
                    $("#applyAllBtn").fadeOut();
                }

        }

    }

    /**
     * Shows the just created markup instance. Sets the classes of the markup element.
     *
     * @method showManualMarkup
     */
    var showManualMarkup = function() {
        //Get a reference to the clicked Markup
        var clickedMarkup = _m.popup.clickedMarkup;

        //Hide the popOver class objects
        $(".popover").hide();

        //Get the text of the clickedMarkup.
        var text = $(clickedMarkup).text();

        //If there is no text in the clickedMarkup this is not a valid state,
        //return without doing anything.
        if (text.trim().length == 0) {
            return;
        }

        //get the html from the document and then set it back to the html
        //that we jus retrieved. Unsure what this does.
        var html = $(".doc").html();
        $(".doc").html(html);


        //Wrap all of the elements in the document that have a nodeType of 3
        //and a nodevalue that matches the clickedMarkups textValue in a
        //`<wrap>` element.
        $(".doc").find("*").contents().filter(function() {
            return this.nodeType === 3 && this.nodeValue.indexOf(text) > -1;
        }).wrap("<wrap>");
        // console.log(items);

        //Replace all wrap elements in this function
        $("wrap").replaceWith(function() {
            //Replaces all instances with an `span` element with the `justExtended`, `unsolved` and `markup` classes.
            return $("<wrap>" + $(this).text().replace(new RegExp(text, 'g'), "<span class='justExtended unsolved markup'>" + text + "</span>") + "</wrap>");
        });
        //Unwraps the contents, removes the wrapping elements now that the changes have been made.
        $("wrap").contents().unwrap();

        //If there are elements with the `justAdd` class
        if ($(".doc").find(".justAdd").length > 0) {
            $(".doc").find(".justAdd .justExtended").contents().unwrap();
            clickedMarkup = $(".doc").find(".justAdd");
        } else if ($(".doc").find(".justSelected .justExtended").length > 0) {
            //Else we unwrap the `.justSelected` contents
            clickedMarkup = $(".doc").find(".justSelected .justExtended");
            $(".doc").find(".justSelected").contents().unwrap();
        }

        //Get the extended spans with parents that have the same text as the child element
        var extended = $("span.justExtended").filter(function() {
            var parent = $(this).parent();
            if (parent.hasClass("markup")) {
                return $(parent).text() == $(this).text();
            }
            return false;

        });

        //Unwrap all those identical elements
        extended.contents().unwrap();

        //Then we show all the same markups
        _m.popup.showSameMarkup();
    }


    /**
     * Defines the `markus.manualMarkup` object that can be accessed globally. Uses some functions that have
     * been defined in the manualMarkup.js anonymous namespace, but also defines some functions in the object
     * creation itself.
     *
     * @class ManualMarkup
     * @constructor
     */
    _m.manualMarkup = {
        /**
         * Handles the registering of manual markup. Handles the necessary registering
         * of event handlers and takes care of the selection from the document.
         *
         * @method registManualMarkup
         * @param  {Object} editable An editable object
         */
        registManualMarkup: function(editable) {
            var editable = editable || false;
            rangy.init();


            if (rangy.supported && rangy.modules.CssClassApplier && rangy.modules.CssClassApplier.supported) {
                tagToggle = rangy.createCssClassApplier("justSelected", {
                    tagNames: ["markup"]
                });
            } else {
                alert("error");
            }

            //Click handler for the document
            $(document).on("click", ".doc", function() {
                //We get a selection from the rangy plugin
                var sel = rangy.getSelection();

                // var selContainerNode = null;
                // If there is even a selection
                if (sel.rangeCount > 0) {
                    // console.log(sel);
                    tagToggle.applyToSelection();
                    // console.log($(".justSelected"));
                    // We set all the initial stats of the `#manualPopover` element
                    var popover = $("#manualPopover");
                    popover.find(".tagText").hide();
                    popover.find(".typePopoverContent").hide();
                    popover.find(".singleTagContent").show();

                    popover.find(".glyphicon-collapse-down").show();
                    popover.find(".expand").show();
                    popover.find(".typePopoverContent .btn.switch").addClass("noColor");
                    popover.find(".typePopoverContent .glyphicon-floppy-disk").addClass("disabled");

                    //If a valid editable was passed we show the `typePopoverContent`
                    if (editable) {
                        popover.find(".typePopoverContent").show();
                    }

                    //If there are `.justSelected` spans
                    var term = $(".justSelected");
                    if (term.length > 0) {
                        term = $(".justSelected")[0];
                        var offset = $(term).offset();
                        //we set a ref to the just clicked term
                        _m.popup.clickedMarkup = $(term);

                        //We show the popover next to the just clicked term
                        $(popover).show().offset({
                            top: $(term).offset().top + $(term).height() / 2 - $(popover).outerHeight() / 2,
                            left: $(term).offset().left + $(term).outerWidth() + 11
                        });
                    }

                }
            });

            //Registers some clickhandlers, some of which call back to the anonymous namespace used above
            $("#manualPopover .glyphicon-book").on("click", _m.popup.searchMarkup);
            $("#manualPopover .glyphicon-floppy-disk").on("click", newtypeSave);
            $("#manualPopover .glyphicon-search").on("click", showManualMarkup);
            // $("#manualPopover .glyphicon-trash").on("click", function() {
            //     alert("trash");

            // });

            //When we cloick on the `.typePopoverContent`
            $("#manualPopover .typePopoverContent").on("click", "button.switch", function() {
                // if($(this).attr("markupType")){
                $("#manualPopover .glyphicon-floppy-disk").removeClass("disabled");
                $("#manualPopover .typePopoverContent button.switch").addClass("noColor");
                $(this).removeClass("noColor");
                // $(".doc").find("."+$(this).attr("markupType")).toggleClass("noColor");
                // }
            });

            //If we click on the `glyphicon-collapse-down`
            $("#manualPopover").find(".glyphicon-collapse-down").on("click", function() {
                var expand = $(this).parent();
                expand.hide();
                $(expand).parent().find(".search").hide();
                $(expand).parent().find(".typePopoverContent").fadeIn();
            });

            //When the `initial` or `update` event are passed
            $("#removeModal").on("update", updateRemoveModal);
            $("#removeModal").on("initial", initialRemoveModal);

            //When the removeModal hides
            $("#removeModal").on("hide.bs.modal", function() {
                // var parent = $(".justSelected,.justExtended").parent();
                $(".justSelected,.justExtended").contents().unwrap();

            });
        }

    };


} )(markus);
