( function(_m) {

    var tagToggle = null;
    var registMakupAction = function() {
        var _class = $(this).attr("class");
        $(this).attr("class", _class.trim());

    }


    var newtypeSave = function() {
        var clickedMarkup = _m.popup.clickedMarkup;
        $(".justAdd").removeClass("justAdd");
        if ($("#manualPopover").find(".switch:not(.noColor)").length > 0) {
            $(clickedMarkup).removeClass("justSelected").addClass("justAdd").addClass("markup").addClass("manual").addClass("unsolved");
            var type = $("#manualPopover").find(".switch:not(.noColor)").attr("_type");
            switch (type) {
                case "fullName":
                case "partialName":
                    $(clickedMarkup).addClass(type).addClass("noCBDBID").attr("type", type).attr("cbdbid", "");
                    break;
                default:
                    $(clickedMarkup).addClass(type).attr("type", type);
            }
        }
        $("#manualPopover").find(".singleTagContent").fadeOut();
        $(".doc").find("span.justAdd").each(registMakupAction);
        $("#manualPopover").find(".search").show();
        // $("#manualPopover").find(".glyphicon-search").click();

    }


    var initialRemoveModal = function() {
        $("#applyAllBtn").removeClass("fired");
        $("#removeAllBtn").removeClass("fired");
    }



    var updateRemoveModal = function() {

        // console.log($("#removeModal").find(".well").length);
        switch ($("#removeModal").find(".well").length) {
            case 0:
                $("#removeModal").modal("hide");
                break;
            case 1:
                $("#removeAllBtn").hide();
                $("#applyAllBtn").hide();
                break;
            default:
                $("#removeModal").find(".sameTags .well:first").css({
                    "border-width": "2px",
                    "border-color": "#8D8C8C",
                    "background-color": "#D8D5D5"
                });
                if (!$("#removeAllBtn").hasClass("fired")) {
                    $("#removeAllBtn").show();
                } else {
                    $("#removeAllBtn").fadeOut();
                }
                if (!$("#applyAllBtn").hasClass("fired")) {
                    $("#applyAllBtn").show();
                } else {
                    $("#applyAllBtn").fadeOut();
                }

        }

    }


    var showManualMarkup = function() {
        var clickedMarkup = _m.popup.clickedMarkup;
        $(".popover").hide();
        var text = $(clickedMarkup).text();

        if (text.trim().length == 0) {
            return;
        }

        var html = $(".doc").html();
        $(".doc").html(html);


        // var items = 
        $(".doc").find("*").contents().filter(function() {
            return this.nodeType === 3 && this.nodeValue.indexOf(text) > -1;
        }).wrap("<wrap>");
        // console.log(items);


        // console.log($("wrap"));

        $("wrap").replaceWith(function() {
            return $("<wrap>" + $(this).text().replace(new RegExp(text, 'g'), "<span class='justExtended unsolved markup'>" + text + "</span>") + "</wrap>");
        });
        $("wrap").contents().unwrap();

        if ($(".doc").find(".justAdd").length > 0) {
            $(".doc").find(".justAdd .justExtended").contents().unwrap();
            clickedMarkup = $(".doc").find(".justAdd");
        } else if ($(".doc").find(".justSelected .justExtended").length > 0) {

            clickedMarkup = $(".doc").find(".justSelected .justExtended");
            $(".doc").find(".justSelected").contents().unwrap();
        }
        var extended = $("span.justExtended").filter(function() {
            var parent = $(this).parent();
            if (parent.hasClass("markup")) {
                return $(parent).text() == $(this).text();
            }
            return false;

        });
        extended.contents().unwrap();

        _m.popup.showSameMarkup();
    }





    _m.manualMarkup = {
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

            $(document).on("click", ".doc", function() {
                var sel = rangy.getSelection();
                // var selContainerNode = null;
                if (sel.rangeCount > 0) {
                    // console.log(sel);
                    tagToggle.applyToSelection();
                    // console.log($(".justSelected"));
                    var popover = $("#manualPopover");
                    popover.find(".tagText").hide();
                    popover.find(".typePopoverContent").hide();
                    popover.find(".singleTagContent").show();

                    popover.find(".glyphicon-collapse-down").show();
                    popover.find(".expand").show();
                    popover.find(".typePopoverContent .btn.switch").addClass("noColor");
                    popover.find(".typePopoverContent .glyphicon-floppy-disk").addClass("disabled");

                    if (editable) {
                        popover.find(".typePopoverContent").show();
                    }
                    var term = $(".justSelected");
                    if (term.length > 0) {
                        term = $(".justSelected")[0];
                        var offset = $(term).offset();
                        _m.popup.clickedMarkup = $(term);


                        $(popover).show().offset({
                            top: $(term).offset().top + $(term).height() / 2 - $(popover).outerHeight() / 2,
                            left: $(term).offset().left + $(term).outerWidth() + 11
                        });
                    }

                }
            });

            $("#manualPopover .glyphicon-book").on("click", _m.popup.searchMarkup);
            $("#manualPopover .glyphicon-floppy-disk").on("click", newtypeSave);
            $("#manualPopover .glyphicon-search").on("click", showManualMarkup);
            // $("#manualPopover .glyphicon-trash").on("click", function() {
            //     alert("trash");

            // });

            $("#manualPopover .typePopoverContent").on("click", "button.switch", function() {
                // if($(this).attr("markupType")){
                $("#manualPopover .glyphicon-floppy-disk").removeClass("disabled");
                $("#manualPopover .typePopoverContent button.switch").addClass("noColor");
                $(this).removeClass("noColor");
                // $(".doc").find("."+$(this).attr("markupType")).toggleClass("noColor");
                // }
            });

            $("#manualPopover").find(".glyphicon-collapse-down").on("click", function() {
                var expand = $(this).parent();
                expand.hide();
                $(expand).parent().find(".search").hide();
                $(expand).parent().find(".typePopoverContent").fadeIn();
            });

            $("#removeModal").on("update", updateRemoveModal);
            $("#removeModal").on("initial", initialRemoveModal);

            $("#removeModal").on("hide.bs.modal", function() {
                // var parent = $(".justSelected,.justExtended").parent();
                $(".justSelected,.justExtended").contents().unwrap();

            });



        }

    };


} )(markus);
