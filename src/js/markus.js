var markus = {
    version: "0.3.4.1",
    build: "201602005"
};

( function($) {
$.fn.goto = function() {
    $('html, body').animate({
        scrollTop: $(this).offset().top + 'px'
    }, 'fast');
    return this; // for chaining...
}
} )(window.jQuery);

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