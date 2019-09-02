/**
Starts after document load.
**/
$(document).ready(function (){
    //Start loading all modules
    initModules();

    //Based on the debug variable, decide where we load the list of files from
    var listFilesURL = "https://dh.chinese-empires.eu/auth/list_files/";
    if(comparativus.util.isDebug()) listFilesURL = "./data/list_files.json";
    
    //Then load the list files from the right location
    $.get(listFilesURL, function(data){  
        //Assign the file list
        comparativus.file.list = data;
        //Only start initializing after we've received the file list from the server.
        initFiles();
    });
        
});

/**
 * Calls initializing functions for the modules that require them. This happens before
 * the loading of any AJAX calls and therefore should not require the presence of 
 * files likes 'list_files' in comparativus.file.list
 */
function initModules(){
    //Call the init function for modules that need it
    comparativus.worker.init();   
    comparativus.ui.init();
    comparativus.vis.init();
    comparativus.popover.init();
}

/**
 * Calls the necessary functions to, depending on environment (production / dev), 
 * load either some dev data files or to actually parse the user input in the GET
 * variables. Called after ajax calls like list_files have succeeded. 
 * 
 * If no get variables was set, presents the user with a list files selection menu
 */
function initFiles(){
    //Try to get the url GET var. This is undefined if it is not set
    var filesVar = comparativus.util.getURLVar('files');
    if(filesVar == undefined){
        //
        //This is done when we haven't defined vars in the GET variable
        //
        comparativus.ui.showFileSelection();

    }else{
        //
        //This is done in case we have defined files already in the GET VAR
        //
        if(!comparativus.util.isDebug()){
            //Load the files from the GET URL variables
            filesVar.split(',').forEach(function(id){
                comparativus.file.loadFromID(id, function(data, plain){
                    comparativus.text.add(id, comparativus.file.getTitleFromID(id), data, plain);
                });
            });
        }else{
            //Load the data files from disc
            comparativus.file.loadDebug();
        }
    }
}