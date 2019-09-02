/**
 * Anonymous namespace of this file to prevent polluting of the global namespace
 */
(function(_c){
    /**
     * The URN object holds the necessary methods for converting index to 
     * urn's and back again.
     */
    _c.urn = {
        /**
         * Returns a urn object that signifies what character
         * this index was at. I.e. a[5] is the sixth 'a'.
         * 
         * @param {String} text The text in which the index is
         * @param {Integer} index   The index in the aforementioned text.
         */
        fromIndex: function(text, index){
            //What character are we trying to find
            var c = text.charAt(index);

            //What is the first occurence
            var cIndex = text.indexOf(c);
            var found = 0;

            //Keep looking for matching character untill we arrive at the specified index
            while(cIndex != index){
                found ++;
                cIndex = text.indexOf(c, cIndex + 1);
            }

            //When it exits the loop, we have found a result, return it
            return c + '[' + found + ']';
        },

        /**
         * Tries to find the index of the character signified by the 
         * provided urn paramter in the provided text. This ignores
         * any characters between `<` and `>` brackets as they are part
         * of the HTML layout.
         * 
         * @param {String} text the text the urn is reffering to
         * @param {String} urn  the referrence to a character
         */
        toIndex: function(text, urn){
            //First decode the character and number of the urn
            var c = urn.substring(0, 1);
            var n = parseInt(urn.substr(2, urn.length - 3));

            //Then try to find that occurence
            var cIndex = -1, found = -1, ltIndex, gtIndex;
            do{
                //First find an occurence
                cIndex = text.indexOf(c, cIndex + 1);
                //Break out of the loop if you can't find it
                if(cIndex == -1) {
                    console.error("Can't find character '" + c + "' in text for urn: " + urn);
                    console.log(text);
                    break;
                }
                //Then check preceding '<' and '>'
                ltIndex = text.lastIndexOf('<', cIndex);
                gtIndex = text.lastIndexOf('>', cIndex);
                //Only count this instance if it was not within brackets
                if(ltIndex <= gtIndex) found++;
            }while(found != n);

            //Now that we have found it, return the index
            return cIndex;
        },

        /**
         * Converts a passed range of indeces in a provided text to 
         * a URN string that can be converted back.
         * 
         * @param {String} text The text the indeces refer to
         * @param {Integer} sIndex the start of the passage we are indexing
         * @param {Integer} eIndex the end of the passage we are indexing (exclusive)
         */
        fromIndeces: function(text, sIndex, eIndex){
            return comparativus.urn.fromIndex(text, sIndex) + "-" + comparativus.urn.fromIndex(text, eIndex);
        },

        /**
         * Tries to parse a URN as a range for the provided text. Returns
         * the range as an array of two index numbers. index[0] is the first
         * index number (integer), index[1] is the second index number.
         * 
         * @param {String} text The text the urn refers to
         * @param {String} urn the urn that we're converting
         */
        toIndeces: function(text, urn){
            return [
                comparativus.urn.toIndex(text, urn.substring(0, urn.indexOf('-', 2))), //Do this substring thing instead of split because of hyphen as a URN character
                comparativus.urn.toIndex(text, urn.substring(urn.indexOf('-', 2) + 1)) //This allows us to also refer to a hyphen as a URN not just a range character
            ];
        },

        /**
         * Converts a passed match to a URN string that can whitstand the 
         * altering of the text structure in HTML.
         * 
         * @param {String} text The text the match refers to
         * @param {Integer} index the start index of this match
         * @param {Integer} length the length of this match
         */
        fromMatch: function(text, index, length){
            return comparativus.urn.fromIndeces(text, index, index + length);
        },

        /**
         * Converts a URN text range to a match object that has a
         * length and index property. Use result.length and result.index
         * to read these. Also contains a text property (result.text)
         * that contains the referenced substring match.
         * 
         * @param {String} text the text the URN refers to
         * @param {String} urn  the URN we're trying to decode
         */
        toMatch: function(text, urn){
            var indeces = comparativus.urn.toIndeces(text, urn);
            //Then construct a match object from it.
            return {
                index: indeces[0],
                length: indeces[1] - indeces[0],
                text: text.substring(indeces[0], indeces[1])
            };
        }
    };
})(comparativus);