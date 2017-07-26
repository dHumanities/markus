/**
 * @api {head} markus.js markus
 * @apiName ConfigurationMarkus
 * @apiGroup Markus
 *
 * @apiDescription This is the global object that holds the version and build
 * info
 * @apiSuccessExample Usage:
 *  markus.version; //Contains the version number as a String
 *  markus.build;   //Contains the build number as a String
*/
var markus = {
    version: "0.3.4.1",
    build: "201602005"
};

/**
* @api {head} markus.js $.goto()
 * @apiName GotoMarkus
 * @apiGroup Markus
 *
 * @apiDescription New JQuery function definition. Scrolls to the element that is passed
 * as a parameter.
 *
 * @apiSuccessExample Usage:
 *   $('#div_element2').goTo();
 * @apiErrorExample Source:
 * https://stackoverflow.com/questions/4801655/how-to-go-to-a-specific-element-on-page
 */
( function($) {
$.fn.goto = function() {
    $('html, body').animate({
        scrollTop: $(this).offset().top + 'px'
    }, 'fast');
    return this; // for chaining...
}
} )(window.jQuery);

/**
* @api {head} markus.js $.replaceTagName()
 * @apiName ReplaceTagNameMarkus
 * @apiGroup Markus
 *
 * @apiDescription New JQuery function definition. Replaces all elements passed to this functions
 * with the specified element name.
 *
 * @apiSuccessExample Usage:
 *   $('div').replaceTagName('span');
 *
 * @apiErrorExample Source:
 * https://stackoverflow.com/questions/2815683/jquery-javascript-replace-tag-type
 */
( function($) {
$.fn.replaceTagName = function(replaceWith) {
    var tags = [],
        i = this.length;
    while (i--) {
        var newElement = document.createElement(replaceWith),
            thisi = this[i],
            thisia = thisi.attributes;
        for (var a = thisia.length - 1; a >= 0; a--) {
            var attrib = thisia[a];
            newElement.setAttribute(attrib.name, attrib.value);
        }
        ;
        newElement.innerHTML = thisi.innerHTML;
        $(thisi).after(newElement).remove();
        tags[i] = newElement;
    }
    return $(tags);
};
} )(window.jQuery);
