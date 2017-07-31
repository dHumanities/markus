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

    _m.helpInfo = {};
    var loadHelpInfo = function() {
        var lang = $.cookie('lang') || "";
        if ($("#helpModal").length > 0) {
            $("#helpModal").load("help" + lang + ".html", {}, function() {
                registHelp();
            });
        }
    }



    var registHelp = function() {
        // alert("regist Help");
        markus.ui.colorSwitcher.regist("#helpModal button.switcher", "#helpModal");
        $('#showHelpModalBtn').on("click", function() {

            $('#helpModal').modal('show');
        });
        $('#helpModal .modal-body').scroll(function() {
            $('#helpModal').find(".popover").hide();
            $('.selected').removeClass("selected");
        });
        $('#helpModal').on("click", function() {
            $('#helpModal').find(".popover").hide();
            $('.selected').removeClass("selected");
        });

        $('#helpModal').on('shown.bs.modal', function() {
            $('[data-spy="scroll"]').each(function() {
                $(this).scrollspy('refresh')
            });
        });
        $(document).on("click", ".markupSample", sampleMarkupClicked);
    };

    var sampleMarkupClicked = function(event) {

        console.log("sampleName");
        console.log($(this).html());
        if ($(this).find(".markupSample").length > 0) {
            return;
        }

        event.stopPropagation();
        $("#sampleCbdbIdPopover").hide();
        $("#sample1Popover").hide();
        var offset = $(this).offset();
        var _parent = $(this).parent();


        var obj = this;

        // remove previous selected tag
        $(".selected").removeClass("selected");


        // update as selected tag
        $(this).addClass("selected");

        var popover = $("#sample1Popover");
        popover.find(".tagText").hide();
        var tagText = $(obj).text();

        // console.log("sample1Popover");
        /*
          start
          Nested multi tags detect and show popup
        */

        var typePopoverContent = popover.find(".typePopoverContent");
        typePopoverContent.hide();
        typePopoverContent.find("button").removeClass("noColor").hide();

        var sameTag = false;

        while (_parent.is(".markup") && _parent.text() == tagText) {
            sameTag = true;
            typePopoverContent.find("." + $(_parent).attr("type")).show();
            _parent = _parent.parent();
        }
        console.log("sameTag = " + sameTag);
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

        $("#sample1Popover").show().offset({
            top: offset.top + $(this).height() / 2 - $("#sample1Popover").outerHeight() / 2,
            left: offset.left + $(this).outerWidth() + 11
        });

        if ($(this).hasClass("fullName") || $(this).hasClass("partialName")) {
            var colorClass = "";
            var cbdbIdPopover = $("#sampleCbdbIdPopover");
            var cbdbIdPopoverContent = cbdbIdPopover.find("#sampleCbdbIdPopoverContent");
            if ($(this).hasClass("fullName")) {
                colorClass = "btn-danger" ;
                cbdbIdPopoverContent.addClass("has-error").removeClass("has-warning");
            } else {
                colorClass = "btn-warning";
                cbdbIdPopoverContent.addClass("has-warning").removeClass("has-error");
            }

            cbdbIdPopoverContent.find("button").remove();

            if (!$(this).attr("cbdbid")) {
                $(this).attr("cbdbid", "");
            }
            var cbdbids = $(this).attr("cbdbid").split("|");
            var cbdbIdsHTML = "";

            for (var i = 0; i < cbdbids.length; i++) {
                if (cbdbids[i].length > 0) {
                    cbdbIdsHTML += "<button class='btn " + colorClass + " btn-xs' style='margin-bottom: 1px;'>" + cbdbids[i] + "</button> ";
                }
            }
            $("#sampleCbdbIdPopover").addClass("top").removeClass("bottom").show().offset({
                top: offset.top - $("#sampleCbdbIdPopover").outerHeight() - 11,
                left: offset.left + $(this).outerWidth() / 2 - $("#sampleCbdbIdPopover").outerWidth() / 2
            });
            $(cbdbIdPopoverContent).prepend(cbdbIdsHTML);

        }

        console.log("after");

    }



    _m.helpInfo.register = function() {
        loadHelpInfo();
    }
} )(markus);
