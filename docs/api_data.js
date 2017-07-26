define({ "api": [
  {
    "type": "head",
    "url": "/markus.js",
    "title": "Configuration object.",
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
    "url": "/markus.js",
    "title": "Define JQuery Goto",
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
    "url": "/markus.js",
    "title": "Define JQuery ReplaceTagName",
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
  }
] });
