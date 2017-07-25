/**
 * Configuration object. Holds the version and build number
 * @type {Object}
 */
var markus = {
    version: "0.3.4.1",
    build: "201602005"
};

/**
 * New JQuery function definition. Scrolls to the element that is passed
 * as a parameter: e.g:
 * $('#div_element2').goTo();
 *
 * Source: https://stackoverflow.com/questions/4801655/how-to-go-to-a-specific-element-on-page
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
 * New JQuery function definition. Replaces all elements passed to this functions
 * with the specified element name. For example, to replace all divs with spans:
 * $('div').replaceTagName('span');
 *
 * Source: https://stackoverflow.com/questions/2815683/jquery-javascript-replace-tag-type
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
