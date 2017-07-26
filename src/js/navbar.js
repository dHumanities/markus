( function(_m) {

_m.navbar = {};
var loadNavBar = function() {
    var lang = $.cookie('lang') || "";
    $.cookie('lang', lang, {
        path: '/'
    });

    $("#navbar").load("navbar" + lang + ".html", {}, function() {
        $("#exportNav").show();

        $.getJSON("/auth/profile_info", function(result) {
            if (result["name"]) {
                $.get("userSection" + lang + ".html", function(data) {
                    $("#userSection").html(data);
                    $("#userName").text(result["name"]);
                });
            }


        }).fail(function() {
            $("#userSection a").on("click", function(event) {
                var lang = $.cookie('lang') || "";
                var decision = false;
                if (lang == "_zhtw") {
                    decision = confirm("登入後將會失去現在(Guest)的工作進度，你要先暫停登入以進行輸出'MARKUS存檔'嗎 ?");
                } else {
                    decision = confirm("You will lose all current data upon login. Do you want to stay on this page and export your current file first? You can proceed to login upon exporting your file.");
                }

                if (decision == true) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {

                }
            });
        });

        $('#save').on("click", function() {
            var fileName = $('.doc').attr('filename');
            $('#save .glyphicon-floppy-disk').removeClass("glyphicon-floppy-disk").addClass("glyphicon-floppy-save");
            $('#save .glyphicon-floppy-saved').removeClass("glyphicon-floppy-saved").addClass("glyphicon-floppy-save");

            markus.io.save(fileName, function(fileEntry) {
                $('#save .glyphicon-floppy-save').removeClass("glyphicon-floppy-save").addClass("glyphicon-floppy-saved");


                $.getJSON("/auth/profile_info", function(result) {
                    if (result["name"]) {
                        var data = new FormData();


                        fileEntry.file(function(_file) {
                            data.append("upload", _file);
                            console.log(_file);

                            if (_file.size > 4194304) {
                                var lang = $.cookie('lang') || "";
                                var decision = false;
                                if (lang == "_zhtw") {
                                    decision = confirm("MARKUS 暫不接受儲存大於 4 M 的檔案到伺服器, 要以 '輸出 MARKUS File' 保存於本機嗎 ?");
                                } else {
                                    decision = confirm("MARKUS cannot store files larger than 4MB. Do you want to export your current file to the MARKUS format? You can then still open it in MARKUS from your desktop.");
                                }


                                if (decision == true) {
                                    markus.io.exportSave($('.doc').attr('filename'));
                                }

                            } else {
                                $.ajax({
                                    url: '/auth/upload',
                                    type: 'POST',
                                    data: data,
                                    cache: false,
                                    dataType: 'json',
                                    processData: false, // Don't process the files
                                    contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                                    success: function(data, textStatus, jqXHR) {
                                        $("#save").attr("fileId", data);
                                        $("#save").trigger("fileIdupdated");
                                        console.log(data);
                                    },
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
                    markus.io.exportSave($('.doc').attr('filename'));
                });
            });



        // markus.io.exportSave($('.doc').attr('filename'));
        // createMarkupJobList();
        });

        $('#rollBack').on("click", function() {
            location.reload(); // createMarkupJobList();
        });

        $('#saveHTML').on("click", function() {
            markus.io.exportHTML($('.doc').attr('filename'));
        });

        $('#saveTEI').on("click", function() {
            markus.io.exportTEI($('.doc').attr('filename'));
        });

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

        $(".langLink").on("click", function(event) {

            event.preventDefault();
            var lang = $(this).attr("lang");
            $.cookie('lang', lang, {
                path: '/'
            });
            $("#helpModal").load("help" + lang + ".html", {}, function() {
                registHelp();
            });
            location.reload();
        });


    });
};
_m.navbar.register = function(_fn) {
    loadNavBar();
};



} )(markus);