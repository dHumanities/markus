define({ "api": [
  {
    "type": "head",
    "url": "markus.js",
    "title": "markus",
    "name": "ConfigurationMarkus",
    "group": "Markus",
    "description": "<p>This is the global object that holds the version and build info</p>",
    "success": {
      "examples": [
        {
          "title": "Usage:",
          "content": "markus.version; //Contains the version number as a String\nmarkus.build;   //Contains the build number as a String",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/js/markus.js",
    "groupTitle": "Markus"
  },
  {
    "type": "head",
    "url": "markus.js",
    "title": "$.goto()",
    "name": "GotoMarkus",
    "group": "Markus",
    "description": "<p>New JQuery function definition. Scrolls to the element that is passed as a parameter.</p>",
    "success": {
      "examples": [
        {
          "title": "Usage:",
          "content": "$('#div_element2').goTo();",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Source:",
          "content": "https://stackoverflow.com/questions/4801655/how-to-go-to-a-specific-element-on-page",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/js/markus.js",
    "groupTitle": "Markus"
  },
  {
    "type": "head",
    "url": "markus.js",
    "title": "$.replaceTagName()",
    "name": "ReplaceTagNameMarkus",
    "group": "Markus",
    "description": "<p>New JQuery function definition. Replaces all elements passed to this functions with the specified element name.</p>",
    "success": {
      "examples": [
        {
          "title": "Usage:",
          "content": "$('div').replaceTagName('span');",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Source:",
          "content": "https://stackoverflow.com/questions/2815683/jquery-javascript-replace-tag-type",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/js/markus.js",
    "groupTitle": "Markus"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "dictionaries",
    "name": "DictsWebDictionary",
    "group": "WebDictionary",
    "description": "<p>All dictionaries are held in one object</p>",
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "Init Function",
    "name": "InitWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Web dictionary module handles the interaction between tab, input, spinner and iframe interactions. It does basic iframe URL construction from input value.</p> <p>This method is called upon loading of the file.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "_m",
            "description": "<p>a reference to the Markus Configuration Object is passed</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "_jobBeforeSearch()",
    "name": "JBSWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Function called before search. It hides the iframe of the dictionary and shows the spinHolder.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "dictionary",
            "description": "<p>The dictionary Object</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "searchDictionary()",
    "name": "SDWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Seaches the dictionary for itself.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "dictionary",
            "description": "<p>the passed dictionary parameter</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "getDictionary()",
    "name": "getDictWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Returns the specified webDictionary referenced by its name</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "web_dictionary_name",
            "description": "<p>the name of the webDictionary you want to get</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "RETURNS",
            "description": "<p>the referenced webDictionary object</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "openURL()",
    "name": "openURLWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Sets all the parameters in a dictionary object to open the passed URL</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "dictionary",
            "description": "<p>the passed dictionary object</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>the URL string</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "registWebDictionary()",
    "name": "registWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Registers a new Web Dictionary</p>",
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "resize()",
    "name": "resizeWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Resizes the passed object to match the window height.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "obj",
            "description": "<p>HTML object that has to match the window height</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "search()",
    "name": "searchWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Define a search function. Uses the webDict object to open the URL specified in the dictionary object.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "dictionary",
            "description": "<p>the dictionary object</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  },
  {
    "type": "head",
    "url": "webDictionary.js",
    "title": "searchAllDictionary()",
    "name": "serachAllWebDictionary",
    "group": "WebDictionary",
    "description": "<p>Searches through all dictionaries by looping through the object that holds all defined dictionaries by key.</p>",
    "version": "0.0.0",
    "filename": "src/js/webDictionary.js",
    "groupTitle": "WebDictionary"
  }
] });
