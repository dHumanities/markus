(function(_c){
    /**
     * Defines the utility object with some useful
     * functionality
     */
    _c.util = {
        /**
         * Returns the levenSthein ratio [0-1] similarity between
         * the two provided string. 1 means they're identical. 0
         * means they are completely different.
         * 
         * This is basically the normalized levensthein distance.
         */
        levDistRatio : function(sA, sB){
            //instantiate vars and cache length
            var aMax = sA.length;
            var bMax = sB.length;
            var matrix = [];

            //increment the first cell of each row and each column
            for(var i = 0; i <= bMax; i++){matrix[i] = [i];}
            for(var j = 0; j <= aMax; j++){matrix[0][j] = j;}

            //calculate the rest of the matrix
            for(i = 1; i <= bMax; i++){
                for(j = 1; j <= aMax; j++){
                if(sA.charAt(i-1) == sB.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                            Math.min(matrix[i][j-1] + 1, // insertion
                                                    matrix[i-1][j] + 1)); // deletion
                }
                }
            }

            //0 for no likeness. 1 for complete likeness
            return 1 - (matrix[bMax][aMax] / aMax);
        },

        /**
         * Returns the value of the GET variable with the provided name.
         * If no variable was set, undefined is returned. If it is set,
         * its string is URI decoded and returned.
         */
        getURLVar: function(name){
            //for the parts of a GET assignement
            var parts;
            //Loop through each of GET key-value pairs
            var pairs = window.location.search.substring(1).split('&');
            for(var i = 0; i < pairs.length; i++){
                parts = pairs[i].split('=');
                //If this is the key-value pair we want
                if(parts[0] == name){
                    //return the value or true if this only was a key
                    return ((parts[1] === undefined) ? true : decodeURI(parts[1]));
                }
            };
        },

        /**
         * This function will give the jello animation to the provided element and remove it again
         */
        jello: function(elementID){
            $(elementID).addClass('animated jello');
            setTimeout(function(){
                $(elementID).removeClass('animated jello');
            }, 400);
        },

        /**
         * Checks if we're running under a localhost environment
         * @returns {boolean}
         */
        isDebug: function(){
            return (window.location.href.indexOf('localhost') != -1);
        },

        /**
         * Sets the scracthpad div to the provided content string. This is useful for JQuery manipulation
         * @param {String} text the html content to set this div to
         */
        setScratch: function(text){
            $('#scratchpad').html(text);
        },

        /**
         * Returns a JQ ref to the scratchpad div
         */
        getScratch: function(){
            return $('#scratchpad');
        }
    };
})(comparativus);
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