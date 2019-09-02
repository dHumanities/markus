/**
 * Anonymous function for this file
 */
(function (_c){
    /**
     * The popover object that will hold all the methods
     */
    _c.popover = {
        /**
         * Holds a JQ ref to the element of the popover in the DOM
         */
        pop: {},
        /**
         * Initializes the popover module
         */
        init: function(){
            comparativus.popover.pop = $('#popover');
        },

        /**
         * Shows the content that is supplied as a parameter as the
         * content of the popover div. The content should be HTML string
         * @param content {String}  HTML content as string
         * @param top   {Number}    the top coordinate (y coordinate)
         * @param left  {Number}    the left coordinate (x coordinate)
         */
        show: function(content, top, left){
            var coords = {'top': top, 'left': left};
            comparativus.popover.pop.offset(coords);
            comparativus.popover.pop.html(content);
            comparativus.popover.pop.fadeIn();
            $(document).click(function(){
                comparativus.popover.pop.hide();
                //$(document).unbind('click');
            });
            
        },

        /**
         * Hides the popover. Does NOT empty it. 
         */
        hide: function(){
            comparativus.popover.pop.fadeOut();
        },

        /**
         * Shows the JSON data that is attached to the provided element.
         * @param element {HTMLElement} the element that has a 'data' attribute that contains JSON
         */
        showData: function(element){
            var node = JSON.parse($(element).attr('data'));
            var match = node.match;
            var html = "<h4>Match Data</h4>\n" +
            "<b>Match A: </b>" + match.textA + "<br>" +
            "<b>Match B: </b>" + match.textB + "<br>" + 
            "<b>Ratio: </b> " + match.r + "<br>" +
            "<b>Length: </b>" + match.l;
            var offset = $(element).offset();
            comparativus.popover.show(html, offset.top + $(element).height(), offset.left);
        }
    };
})(comparativus);