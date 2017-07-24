/**
 * Web dictionary module handles the interaction between tab, input, spinner and iframe interactions.
 * It does basic iframe URL construction from input value
 *
 **/

(function(_m) {

    var _jobBeforeSearch = function(dictionary) {
        $(dictionary.iframe).hide();
        $(dictionary.spinHolder).show();
        // $(dictionary.spinHolder).show();
        // dictionary.spinner.spin(dictionary.spinHolder);
    };

    var searchDictionary = function(dictionary) {
        dictionary.search(dictionary);
    };

    var dictionaries = {};


    var webDict = _m.webDict = {};
    var _search = function(dictionary) {
        webDict.openURL(dictionary, dictionary.src.replace(dictionary.param, encodeURI($(dictionary.input).val())));
    };

    webDict.resize = function(obj) {
        $(obj).height($(window).height());
    };

    webDict.openURL = function(dictionary, url) {
        _jobBeforeSearch(dictionary);
        $(dictionary.iframe).attr('src', url);

        if (dictionary.exportURL && dictionary.exportURL.length > 0) {
            $(dictionary.exportLink).attr('href', dictionary.exportURL.replace(dictionary.param, encodeURI($(dictionary.input).val())));
        } else {
            $(dictionary.exportLink).attr('href', url);
        }


    };

    webDict.searchAllDictionary = function() {
        for (var key in dictionaries) {
            console.log(dictionaries[key]);
            searchDictionary(dictionaries[key]);
        }
    };

    webDict.getDictionary = function(web_dictionary_name) {
        return dictionaries[web_dictionary_name];
    };

    webDict.registWebDictionary = function() {
        $('.web-dictionary-container').affix({
            offset: {
                top: 0,
                bottom: function() {
                    return (this.bottom = $('.footer').outerHeight(true));
                }
            }
        });
        $(".web-dictionary[web-dictionary-name]").each(function() {
            var obj = $(this),
                dictionary_name = $(this).attr("web-dictionary-name"), dictionary, web_dictionary_input, web_dictionary_button, web_dictionary_iframe, web_dictionary_spinHolder, web_dictionary_exportURL;

            dictionaries[dictionary_name] = dictionary = {
                dictionary_name: dictionary_name,
                holder: obj,
                iframe: null,
                spinHolder: null,
                exportLink: null,
                idRegex: $(this).attr("web-dictionary-id-regex"),
                idSrc: $(this).attr("web-dictionary-id-src"),
                input: null,
                src: $(this).attr("web-dictionary-src"),
                exportURL: $(this).attr("web-dictionary-exportURL"),
                search: null,
                param: $(this).attr("web-dictionary-param")
            };

            var web_dictionary_search = eval($(this).attr("web-dictionary-search"));
            console.log(web_dictionary_search);
            if (typeof (web_dictionary_search) == "function") {
                dictionary.search = web_dictionary_search;
            } else if (web_dictionary_search != null && web_dictionary_search.length > 0) {
                dictionary.search = _m.util.searchFunctionByName(web_dictionary_search, window);
            } else {
                dictionary.search = _search;
            }

            web_dictionary_input = obj.find(".web-dictionary-input");
            if (web_dictionary_input.length > 0) {
                dictionary.input = web_dictionary_input[0];
                $(dictionary.input).on('change', function() {
                    searchDictionary(dictionary);
                    // dictionary.openURL();
                });
            }

            web_dictionary_iframe = obj.find(".web-dictionary-iframe");
            web_dictionary_exportURL = obj.find(".web-dictionary-exportURL");

            if (web_dictionary_exportURL.length > 0) {
                dictionary.exportLink = web_dictionary_exportURL[0];
            }

            if (web_dictionary_iframe.length > 0) {
                dictionary.iframe = web_dictionary_iframe[0];
            }

            web_dictionary_spinHolder = obj.find(".web-dictionary-spinHolder");

            if (web_dictionary_spinHolder.length > 0) {
                dictionary.spinHolder = web_dictionary_spinHolder[0];
            }

        });
        var debouncer = function(func, timeout) {
            var timeoutID;
            timeout = timeout || 200;
            return function() {
                var scope = this ,
                    args = arguments;
                clearTimeout(timeoutID);
                timeoutID = setTimeout(function() {
                    func.apply(scope, Array.prototype.slice.call(args));
                }, timeout);
            };
        };


        $(".web-dictionary-tab").on("click", function() {
            $(this).tab("show");
            var web_dictionary_name = $(this).attr("web-dictionary-name");
            // var index = $(".reference").find("a").index(this);


            $(".web-dictionary").hide();
            $(".web-dictionary[web-dictionary-name='" + web_dictionary_name + "']").show(function() {
                $(this).find(".web-dictionary-iframe").trigger("resetSize");
            });

        });



        $('.web-dictionary-iframe').on('resetSize', function() {
            webDict.resize($(this));
            // $(this).height($(window).height() -$("#content").offset().top - $("#buttonsRow").outerHeight()-100);
        });

        $('.web-dictionary-container').on('resetSize', function() {
            $(this).width($(this).parent().width());
        });

        $('.web-dictionary-container').on('affixed.bs.affix', function() {
            $(this).trigger("resetSize");
        });

        $('.web-dictionary-iframe').on('load', function() {
            var index = $(".web-dictionary").find("iframe").index(this);
            $(".web-dictionary").find(".web-dictionary-spinHolder").eq(index).hide();
            $(this).show();
            $(this).trigger('resetSize');
        });

        $('.web-dictionary-iframe').trigger('resetSize');


        $(window).on("resize", debouncer(function() {
            $('.web-dictionary-iframe').trigger("resetSize");
            $('.web-dictionary-container').trigger("resetSize");
        }));

    };


})(markus);