/**
 * navbar.js base file.
 * @module navbar.js
 */


  /**
  The class that holds the variables and functions created in the namespace of this file.
  The constrcutor of this object is only called once, because it is an anonymous function.

  @class helpInfo.js_anonymous
  @constructor
  @param {Object}  _m a reference to the Markus Configuration Object is passed
  **/
( function(_m) {

    //Define the new HelpInfo object
    _m.helpInfo = {};

    /**
     * In this method we load the specific help template according to the language
     * cookie.
     *
     * @method loadHelpInfo
     */
    var loadHelpInfo = function() {
        var lang = $.cookie('lang') || "";
        if ($("#helpModal").length > 0) {
            $("#helpModal").load("help" + lang + ".html", {}, function() {
                registHelp();
            });
        }
    }


    /**
     * Registers the eventHandlers for the help menu.
     *
     * @method registHelp
     */
    var registHelp = function() {
        // alert("regist Help");
        markus.ui.colorSwitcher.regist("#helpModal button.switcher", "#helpModal");

        //Shows the modal help button on click
        $('#showHelpModalBtn').on("click", function() {

            $('#helpModal').modal('show');
        });

        //Hides the modal popover on scroll
        $('#helpModal .modal-body').scroll(function() {
            $('#helpModal').find(".popover").hide();
            $('.selected').removeClass("selected");
        });

        //Hides the modal popover on click
        $('#helpModal').on("click", function() {
            $('#helpModal').find(".popover").hide();
            $('.selected').removeClass("selected");
        });

        //Refresh the modal on scroll
        $('#helpModal').on('shown.bs.modal', function() {
            $('[data-spy="scroll"]').each(function() {
                $(this).scrollspy('refresh')
            });
        });

        //When you click on the markupSample button the function below triggers.
        $(document).on("click", ".markupSample", sampleMarkupClicked);
    };

    /**
     * Defines what happens when you click the sampleMarkup. Basically, creates contents
     * and shows/hides things depending on what you clicked.
     *
     * @method sampleMarkupClicked
     * @param  {Event} event the event that is passed from the DOM (i.e. the mouse click)
     */
    var sampleMarkupClicked = function(event) {
        //Logging for debug purposes
        console.log("sampleName");
        console.log($(this).html());

        //If the markupSample already exists, just return.
        if ($(this).find(".markupSample").length > 0) {
            return;
        }

        //prevent the event from bubbling through the event chain
        event.stopPropagation();

        //Hide the cbdbIdPopover and sample1Popover
        $("#sampleCbdbIdPopover").hide();
        $("#sample1Popover").hide();

        //calculate the offset and find the parent of this element.
        var offset = $(this).offset();
        var _parent = $(this).parent();

        //Get a reference to self.
        var obj = this;

        // remove previous selected tag and set the current as selected
        $(".selected").removeClass("selected");
        $(this).addClass("selected");

        //Find the samplePopover, hide its tagText, and get the tagtext from the current markupSample
        var popover = $("#sample1Popover");
        popover.find(".tagText").hide();
        var tagText = $(obj).text();

        // console.log("sample1Popover");
        /*
          start
          Nested multi tags detect and show popup
        */

        //Hide the typePopoverContent, remove the noColor class and hide it.
        var typePopoverContent = popover.find(".typePopoverContent");
        typePopoverContent.hide();
        typePopoverContent.find("button").removeClass("noColor").hide();

        //A flag that holds if this tag is the same as its parent
        var sameTag = false;

        //If you are identical to your parent
        while (_parent.is(".markup") && _parent.text() == tagText) {
            sameTag = true;
            //Keep showing markups that are contained in the parent
            typePopoverContent.find("." + $(_parent).attr("type")).show();
            _parent = _parent.parent();
        }
        //Logging of the sameTag status
        console.log("sameTag = " + sameTag);

        //If there was an identical tag, show that popOver
        if (sameTag) {
            typePopoverContent.find("." + $(this).attr("type")).show();
            typePopoverContent.show();
        }
        /*
          end nested multi tags
        */
        // clickedMarkup = $(this);
        // if (otherTags.length > 0){
        $("#sample1Popover").find(".search").show();
        // $("#sample1Popover").find(".trash").hide();
        // }else {
        $("#sample1Popover").find(".trash").show();
        // $("#sample1Popover").find(".search").hide();
        // }
        // console.log($(this).attr("cbdbid"));

        //Set the offset of the sample1Popover
        $("#sample1Popover").show().offset({
            top: offset.top + $(this).height() / 2 - $("#sample1Popover").outerHeight() / 2,
            left: offset.left + $(this).outerWidth() + 11
        });

        //If this has a class of fullName or partialName
        if ($(this).hasClass("fullName") || $(this).hasClass("partialName")) {
            var colorClass = "";
            var cbdbIdPopover = $("#sampleCbdbIdPopover");
            var cbdbIdPopoverContent = cbdbIdPopover.find("#sampleCbdbIdPopoverContent");

            //Set the color based on what name it is
            if ($(this).hasClass("fullName")) {
                colorClass = "btn-danger" ;
                cbdbIdPopoverContent.addClass("has-error").removeClass("has-warning");
            } else {
                colorClass = "btn-warning";
                cbdbIdPopoverContent.addClass("has-warning").removeClass("has-error");
            }

            //Remove the popoOvercontent button
            cbdbIdPopoverContent.find("button").remove();

            //If the cbdbid attribute does not yet exist, we create it.
            if (!$(this).attr("cbdbid")) {
                $(this).attr("cbdbid", "");
            }
            //Split multiple associated ids
            var cbdbids = $(this).attr("cbdbid").split("|");
            var cbdbIdsHTML = "";

            //For each of the split associated cbdbIDs
            for (var i = 0; i < cbdbids.length; i++) {
                //As long as it is an actual cbdbid (length > 0)
                if (cbdbids[i].length > 0) {
                    //Create a button with inline styling.
                    cbdbIdsHTML += "<button class='btn " + colorClass + " btn-xs' style='margin-bottom: 1px;'>" + cbdbids[i] + "</button> ";
                }
            }

            //Set the offset of the sampleCbdbIdPopover.
            $("#sampleCbdbIdPopover").addClass("top").removeClass("bottom").show().offset({
                top: offset.top - $("#sampleCbdbIdPopover").outerHeight() - 11,
                left: offset.left + $(this).outerWidth() / 2 - $("#sampleCbdbIdPopover").outerWidth() / 2
            });

            //Prepend the cbdbIdsHTML tot the content
            $(cbdbIdPopoverContent).prepend(cbdbIdsHTML);
        }
        console.log("after");
    }

    //Register the helpInfo.register function to the loadHelpInfo defined above
    _m.helpInfo.register = function() {
        loadHelpInfo();
    }
} )(markus);
