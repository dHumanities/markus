/**
 * Web dictionary module handles the interaction between tab, input, spinner and iframe interactions.
 * It does basic iframe URL construction from input value
 *
 * @param {Markus}  _m a reference to markus is passed
 **/

(function(_m) {

    /**
     * Function called before search.
     * @param  {Object} dictionary The dictionary Object
     */
    var _jobBeforeSearch = function(dictionary) {
        $(dictionary.iframe).hide();
        $(dictionary.spinHolder).show();
    };

    /**
     * TODO: what does this function do?
     * Searches the dictionary object for itself
     * @param  {Object} dictionary the passed dictionary parameter
     */
    var searchDictionary = function(dictionary) {
        dictionary.search(dictionary);
    };

    /**
     * All dictionaries as one object
     * @type {Object}
     */
    var dictionaries = {};

    //Both local and markus referenced dictionary are set to new Object
    var webDict = _m.webDict = {};

    /**
     * Define a search function. Uses the webDict object to open the URL
     * specified in the dictionary object.
     * @param  {Object} dictionary the dictionary object
     */
    var _search = function(dictionary) {
        webDict.openURL(dictionary, dictionary.src.replace(dictionary.param, encodeURI($(dictionary.input).val())));
    };

    /**
     * Resizes the passed object to match the window height.
     * @param  {Object} obj HTML object to match the window height
     */
    webDict.resize = function(obj) {
        $(obj).height($(window).height());
    };

    /**
     * Sets all the parameters in a dictionary object to open the URL
     * @param  {Object} dictionary the passed dictionary object
     * @param  {String} url        the URL string
     */
    webDict.openURL = function(dictionary, url) {
        //first call the preparation function before search
        _jobBeforeSearch(dictionary);

        //set the src attribute of the iframe to the provided URL
        $(dictionary.iframe).attr('src', url);

        //If the exportURL exists and is not a zero-length string, set the
        //href attribute of the exportLink to the exportURL.
        //Otherwise, set the href attribute of the exportLink to the passed URL
        if (dictionary.exportURL && dictionary.exportURL.length > 0) {
            $(dictionary.exportLink).attr('href', dictionary.exportURL.replace(dictionary.param, encodeURI($(dictionary.input).val())));
        } else {
            $(dictionary.exportLink).attr('href', url);
        }
    };

    /**
     * Searches through all dictionaries by looping through the object that
     * holds all defined dictionaries by key.
     */
    webDict.searchAllDictionary = function() {
        for (var key in dictionaries) {
            console.log(dictionaries[key]);
            searchDictionary(dictionaries[key]);
        }
    };

    /**
     * Returns the specified webDictionary referenced by its name
     * @param  {String} web_dictionary_name the name of the webDic you want to get
     * @return {Object} the referenced webDictionary object
     */
    webDict.getDictionary = function(web_dictionary_name) {
        return dictionaries[web_dictionary_name];
    };

    /**
     * Registers a new Web Dictionary
     */
    webDict.registWebDictionary = function() {
        //Setting position for the web dictionary container
        $('.web-dictionary-container').affix({
            offset: {
                top: 0,
                bottom: function() {
                    return (this.bottom = $('.footer').outerHeight(true));
                }
            }
        });

        //For each of the web dictionaries convert it into a dictionary object
        $(".web-dictionary[web-dictionary-name]").each(function() {
            var obj = $(this),
                dictionary_name = $(this).attr("web-dictionary-name"), dictionary, web_dictionary_input, web_dictionary_button, web_dictionary_iframe, web_dictionary_spinHolder, web_dictionary_exportURL;

            //initializing the Dictionary object
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

            //Use eval to set the web_dictionary_search, this should be a function
            var web_dictionary_search = eval($(this).attr("web-dictionary-search"));
            console.log(web_dictionary_search);

            //Check if we got the right type of data. If not, try to find the function
            //by name. If that fails, assign the search function to the one
            //defined above. (_search)
            if (typeof (web_dictionary_search) == "function") {
                dictionary.search = web_dictionary_search;
            } else if (web_dictionary_search != null && web_dictionary_search.length > 0) {
                dictionary.search = _m.util.searchFunctionByName(web_dictionary_search, window);
            } else {
                dictionary.search = _search;
            }

            //Assigns the Web Dictionary input and gives it an event handler
            //that searches the dictionary on change
            web_dictionary_input = obj.find(".web-dictionary-input");
            if (web_dictionary_input.length > 0) {
                dictionary.input = web_dictionary_input[0];
                $(dictionary.input).on('change', function() {
                    searchDictionary(dictionary);
                    // dictionary.openURL();
                });
            }

            //Set the iframe variable
            web_dictionary_iframe = obj.find(".web-dictionary-iframe");
            //Set the exportURL variable
            web_dictionary_exportURL = obj.find(".web-dictionary-exportURL");

            //If there is actually a non zero-length exportURL. Assign the
            //it to dictionary.exportLink.
            if (web_dictionary_exportURL.length > 0) {
                dictionary.exportLink = web_dictionary_exportURL[0];
            }

            //If there is actually a non zero-length iframe. Assign the
            //it to dictionary.iframe.
            if (web_dictionary_iframe.length > 0) {
                dictionary.iframe = web_dictionary_iframe[0];
            }

            //Assigns the spinHolder
            web_dictionary_spinHolder = obj.find(".web-dictionary-spinHolder");

            //If there are multiple, assign the first one
            if (web_dictionary_spinHolder.length > 0) {
                dictionary.spinHolder = web_dictionary_spinHolder[0];
            }

        });

        /**
         * Debonces the specified function call
         * @param  {Function} func    the function you called and want to be debounced
         * @param  {int} timeout the timeout of the debounce
         */
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

        /**
         * Defines what happens when you click on a tab. It shows the specified
         * tab, hides all webDicts, shows the correct one and triggers the
         * resetSize event.
         * @return {[type]} [description]
         */
        $(".web-dictionary-tab").on("click", function() {
            //show the current tab and get the dictionary name from the tab
            $(this).tab("show");
            var web_dictionary_name = $(this).attr("web-dictionary-name");
            // var index = $(".reference").find("a").index(this);

            //hide all web dictionaries and show only the correct one. trigger
            //a resetsize event
            $(".web-dictionary").hide();
            $(".web-dictionary[web-dictionary-name='" + web_dictionary_name + "']").show(function() {
                $(this).find(".web-dictionary-iframe").trigger("resetSize");
            });

        });


        /**
         * ResetSize handler for the iframe of the Web Dictionary
         */
        $('.web-dictionary-iframe').on('resetSize', function() {
            webDict.resize($(this));
            // $(this).height($(window).height() -$("#content").offset().top - $("#buttonsRow").outerHeight()-100);
        });

        /**
         * ResetSize handler for the container of the Web Dictionary
         */
        $('.web-dictionary-container').on('resetSize', function() {
            $(this).width($(this).parent().width());
        });

        /**
         * Affix handler for the container of the Web Dictionary
         */
        $('.web-dictionary-container').on('affixed.bs.affix', function() {
            $(this).trigger("resetSize");
        });

        /**
         * Load handler for the iframe of the Web Dictionary. Handles initializing
         */
        $('.web-dictionary-iframe').on('load', function() {
            var index = $(".web-dictionary").find("iframe").index(this);
            $(".web-dictionary").find(".web-dictionary-spinHolder").eq(index).hide();
            $(this).show();
            $(this).trigger('resetSize');
        });

        //Trigger resetSize
        $('.web-dictionary-iframe').trigger('resetSize');

        //When the window resizes, send a resize event to the Web Dictionary iframe
        //and container too. But debounce the events to prevent too many events
        //reaching the element.
        $(window).on("resize", debouncer(function() {
            $('.web-dictionary-iframe').trigger("resetSize");
            $('.web-dictionary-container').trigger("resetSize");
        }));

    };


})(markus);
