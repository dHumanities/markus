/** 
 * Global object to access comparativus functions 
*/
var comparativus = {
    author: "Mees Gelein",
    version: "0.01"
}
/**
 * Used anonymous function to prevent pollution of the global namespace 
 */
(function (_c) {
    /**
     * Adds the listeners for the match selection and highlight events to 
     * all the elements across the page
     */
    _c.addMatchListeners = function () {
        $('[comparativusURN]').mouseenter(function (e) {
            //Then set the active class
            comparativus.setActive($(this).attr('comparativusURN'), true);
        }).mouseleave(function (e) {
            comparativus.setActive($(this).attr('comparativusURN'), false);
        });
    },

    /**
     * Adds/removes the active class based on the provided comparativusURN attribute
     */
    _c.setActive = function(urn, enabled) {
        if (enabled) $('[comparativusURN*="' + urn + '"]').addClass('active');
        else $('[comparativusURN*="' + urn + '"]').removeClass('active');
    }

})(comparativus);