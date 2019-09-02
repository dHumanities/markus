/**BLAST seed size*/
var K = 4;

/**
Called when messaged by the main thread
**/
self.onmessage = function(event){
  //it is assumed that any communication from a worker assigns these values
  var action = event.data.action;
  var params = event.data.params;

  //Switch based on the action
  switch(action){
    case 'buildDictionary':
        buildDictionary(params.id, params.text);
        break;
    case 'prepareText':
        prepareText(params.id, params.text, params.config);
        break;
  }
}

/**
This function strips whitespace and/or punctuation or other special
characters to prepare the text for comparison according to the 
configuration the user wanted.
**/
function prepareText(id, text, config){
  //first try to strip all whitespace
  if(config.stripWhiteSpace){
      text = text.replace(/\s/g, '');
  }
  //then try to strip all punctuation
  if(config.stripPunctuation){
    text = text.replace(/[。』」，《》：『？「；,!?]/g, '');
  }
  //now send the result back to the main thread
  message('PrepareDone', {'id':id, 'text':text});
}

/**
Starts to build the dictionary for the provided text
**/
function buildDictionary(id, text){
  var i = 0;
  var dict = {};
  var max = text.length - K;
  var part = '';
  for(i = 0; i < max; i++){
    part = text.substr(i, K);
    if(part in dict){
      dict[part].push(i);
    }else{
      dict[part] = [i];
    }
  }
  message('DictDone', {'id':id, 'dictionary': dict});
}

/**
Makes sure the messages are always nicely formatted according to my expectations
meaning: always define an action and params.
**/
function message(action, parameters){
  postMessage({'action' : action, 'params' : parameters});
}

/**
 * Determines a very useful String.insertAt function. This is a prototype overwrite,
 * but that should be okay in this case. 
 * 
 * @param {Integer} index this is the position you want to inser at
 * @param {String} string the string you want to insert into the string
 */
String.prototype.insertAt = function(index, string){
  //First check if we're inserting at the beginning or the end, this prevents unnecessary function calls
  if(index <= 0){
      return string + this;
  }else if(index => this.length){
      return this + string;
  }else{
      //According to https://gist.github.com/najlepsiwebdesigner/4966627 this is a neccesary fix
      if(string.charCodeAt(0) == 13){
          string = "\n";
      }
          
      //Return the compiled string
      return this.substring(0, index) + string + this.substring(index, this.length);
  }
}