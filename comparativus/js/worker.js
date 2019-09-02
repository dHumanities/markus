/**
 * Namespacing
 */
(function(_c){

    /** 
     * Makes sure the messages are always nicely formatted according to my expectations.
     * Meaing: always define an action and params
     */
    var message = function(action, parameters){
        comparativus.worker.thread.postMessage({'action' : action, 'params' : parameters});
    };

    /**
     * Contains the messaging interface with the workers
     */
    _c.worker = {
        /**
         * Reference to the single thread we're working with
         */
        thread: undefined,

        /**
         * Does all the necessary thread initialization. Creates the new 
         * Webworker and assigns a message handler.
         */
        init: function(){
            //create a new thread (force refresh in debug)
            var workerFileURL = 'js/thread.js';
            if(comparativus.util.isDebug()) workerFileURL += "?v=" + (new Date()).getTime();
            
            //Finally create a worker from the created url
            comparativus.worker.thread = new Worker(workerFileURL);
    
            //And assign the correct handler function for workers
            comparativus.worker.thread.onmessage = comparativus.worker.onmessage;
        },

        /**
         * Messages the worker to prepare the text for usage
         * This function loads data files from disk. Just used for 
         * testing purposes. Don't clean the file again if it is already loaded
         */
        prepareText: function(id){
            var config = {
              'stripWhiteSpace': $('#stripWhiteSpace').val(),
              'stripPunctuation': $('#stripPunctuation').val()
            };
            message('prepareText', {'id': id, 'text': comparativus.text.getByID(id).plain, 'config': config});          
        },

        /**
         * Messages the worker to start building the dictionary.
         * Builds the dictionary for the text that is registered under
         * the provided name
         */
        buildDictionary: function(id){
            message('buildDictionary', {'id':id , text: comparativus.text.getByID(id).clean});
        },

        /**
         * What happens when the main thread recieves a message from the worker. This is all defined 
         * in this function
         */
        onmessage: function(event){
            //it is assumed that any communication from a worker assigns these values
            var action = event.data.action;
            var params = event.data.params;
        
            //Switch based on the action parameter
            switch(action){
                case 'DictDone':
                    comparativus.dicts.toBuild --;
                    comparativus.dicts[params.id] = params.dictionary;
                    if(comparativus.dicts.toBuild == 0){
                        comparativus.startComparison();
                    }
                    break;
                case 'PrepareDone':
                    comparativus.text.setByID(params.id, params.text);
                    $('#info' + params.id).html('Length: ' + params.text.length + ' characters');
                    comparativus.worker.buildDictionary(params.id);
                    break;
            }
        }
    };
           
})(comparativus);