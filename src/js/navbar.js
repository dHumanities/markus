/**
 * navbar.js base file.
 * @module navbar.js
 */

 /**
 The class that holds the variables and functions created in the namespace of this file.
 The constrcutor of this object is only called once, because it is an anonymous function.

 @class navbar.js_anonymous
 @constructor
 @param {Object}  _m a reference to the Markus Configuration Object is passed
 **/
( function(_m) {

//Creates the NavBar object
_m.navbar = {};

/**
 * Defines the loadNavBar function that will later be register to the `markus.navbar.register`
 * functions.
 *
 * This function defines all the behaviour of the navBar and the registers all the listeners to
 * the NavBar UI objects.
 *
 * Please read through the source to understand what the actual navBar buttons do.
 *
 * @method loadNavBar
 */
var loadNavBar = function() {
    //Sets a cookie for the language
    var lang = $.cookie('lang') || "";
    $.cookie('lang', lang, {
        path: '/'
    });

    //Loads the navBar.html template for the appropriate language
    $("#navbar").load("navbar" + lang + ".html", {}, function() {
        $("#exportNav").show();

        //Loads the user profile info as JSON
        $.getJSON("/auth/profile_info", function(result) {
            if (result["name"]) {
                //Loads the userSection for that lanugage and sets the info according to the userName
                $.get("userSection" + lang + ".html", function(data) {
                    $("#userSection").html(data);
                    $("#userName").text(result["name"]);
                });
            }

        //Below is what happens if you're not logged in, you will lose all current data
        }).fail(function() {
            //If you click on the userSection but are not logged in, you will get prompted
            //If you're sure of your decisions in live that lead you to this point in time.
            $("#userSection a").on("click", function(event) {
                var lang = $.cookie('lang') || "";
                var decision = false;

                //Base the prompt upon the language cookie
                if (lang == "_zhtw") {
                    decision = confirm("登入後將會失去現在(Guest)的工作進度，你要先暫停登入以進行輸出'MARKUS存檔'嗎 ?");
                } else {
                    decision = confirm("You will lose all current data upon login. Do you want to stay on this page and export your current file first? You can proceed to login upon exporting your file.");
                }

                //If we cancel the button click, stop the event from propagating
                if (decision == true) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                  //DO NOTHING
                }
            });
        });

        //Defines what happens when you click on the SaveButton
        $('#save').on("click", function() {

            //Get the fileName
            var fileName = $('.doc').attr('filename');

            //Set the saveIcon to the floppy-save icon from glyphicon
            $('#save .glyphicon-floppy-disk').removeClass("glyphicon-floppy-disk").addClass("glyphicon-floppy-save");
            $('#save .glyphicon-floppy-saved').removeClass("glyphicon-floppy-saved").addClass("glyphicon-floppy-save");

            //Call the save function with the following funciton as a second parameters
            markus.io.save(fileName, function(fileEntry) {
                //Once it has been saved, remove the save glyphicon to give feedback on the saving
                $('#save .glyphicon-floppy-save').removeClass("glyphicon-floppy-save").addClass("glyphicon-floppy-saved");

                //load the user profile info as JSON
                $.getJSON("/auth/profile_info", function(result) {
                    if (result["name"]) {
                        var data = new FormData();

                        //The upload file form
                        fileEntry.file(function(_file) {
                            data.append("upload", _file);
                            console.log(_file);

                            //If the file size is >4Mb you cannot store it, you get a request if you want to export the save.
                            if (_file.size > 4194304) {
                                var lang = $.cookie('lang') || "";
                                var decision = false;
                                if (lang == "_zhtw") {
                                    decision = confirm("MARKUS 暫不接受儲存大於 4 M 的檔案到伺服器, 要以 '輸出 MARKUS File' 保存於本機嗎 ?");
                                } else {
                                    decision = confirm("MARKUS cannot store files larger than 4MB. Do you want to export your current file to the MARKUS format? You can then still open it in MARKUS from your desktop.");
                                }

                                //If they want to export the save, the save is exported.
                                if (decision == true) {
                                    markus.io.exportSave($('.doc').attr('filename'));
                                }
                            //If the file is a decent size (<4Mb)
                            } else {
                                //Save the DATA using a AJAX POST request
                                $.ajax({
                                    url: '/auth/upload',
                                    type: 'POST',
                                    data: data,
                                    cache: false,
                                    dataType: 'json',
                                    processData: false, // Don't process the files
                                    contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                                    success: function(data, textStatus, jqXHR) {
                                        //When succesful, update the UI to reflect this
                                        $("#save").attr("fileId", data);
                                        $("#save").trigger("fileIdupdated");
                                        console.log(data);
                                    },
                                    //If there was an error uploading, we log it.
                                    error: function(jqXHR, textStatus, errorThrown) {
                                        // Handle errors here
                                        console.log('ERRORS: ' + textStatus);
                                    // STOP LOADING SPINNER
                                    }
                                });
                            }
                        }, function() {});
                    }
                }).fail(function() {
                    //If we get an error loading the userProfile, we just export the save
                    markus.io.exportSave($('.doc').attr('filename'));
                });
            });
        // markus.io.exportSave($('.doc').attr('filename'));
        // createMarkupJobList();
        });

        //Registers the rollBack button, when you click this you reload the page
        $('#rollBack').on("click", function() {
            location.reload(); // createMarkupJobList();
        });

        //Registers the saveHTML button and provides it with the fileName
        $('#saveHTML').on("click", function() {
            markus.io.exportHTML($('.doc').attr('filename'));
        });

        //Registers the saveTei button and provides it with the fileName
        $('#saveTEI').on("click", function() {
            markus.io.exportTEI($('.doc').attr('filename'));
        });

        //Registers the exportSave button and provides it with the fileName
        $('#exportSAVE').on("click", function() {
            markus.io.exportSave($('.doc').attr('filename'));
        });

        // $(window).bind('beforeunload', function() {
        //   var lang = $(this).attr("lang");
        //   switch (lang) {
        //     case "zhtw":
        //       return '離開系統前有需要輸出存檔嗎 ?';
        //     default:
        //       return 'Do you want to export your save before leaving ?';
        //   }
        // });

        //Defines what happens when you click on the language Link
        $(".langLink").on("click", function(event) {

            event.preventDefault();

            //Get the language button clicked and set a cookie based on the language
            var lang = $(this).attr("lang");
            $.cookie('lang', lang, {
                path: '/'
            });

            //Registers the help functions to the provided language
            $("#helpModal").load("help" + lang + ".html", {}, function() {
                registHelp();
            });

            //Reload after changing of the language
            location.reload();
        });


    });
};
//Registers the navBar.register function to call the loadNavBar function
_m.navbar.register = function(_fn) {
    loadNavBar();
};
} )(markus);
