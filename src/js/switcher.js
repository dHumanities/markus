( function(_m) {

if (_m.ui == null) {
    _m.ui = {};
}
_m.ui.colorSwitcher = {
    regist: function(target, buttonSelector, doc) {
        console.log($(target));
        $(target).on("click", buttonSelector, function() {
            var colorSwitchedClass = $(this).attr("color-switcher-class");

            if (colorSwitchedClass) {

                // noColor -> bordered -> no CSS Class -> no Color. ...


                if ($(this).hasClass("noColor")) {
                    $(this).removeClass("noColor").removeClass("tagReset");
                    $(this).addClass("bordered");
                    $(doc).find("." + colorSwitchedClass).removeClass("noColor").removeClass("tagReset");
                    // $(doc).find("." + colorSwitchedClass).removeClass("tagReset");
                    $(doc).find("." + colorSwitchedClass).addClass("bordered");
                    markus.tag[colorSwitchedClass]["status"] = "bordered";

                } else if ($(this).hasClass("bordered")) {
                    $(this).removeClass("noColor");
                    $(this).removeClass("bordered");
                    $(this).addClass("tagReset");
                    $(doc).find("." + colorSwitchedClass).removeClass("noColor").removeClass("bordered");
                    $(doc).find("." + colorSwitchedClass).addClass("tagReset");
                    markus.tag[colorSwitchedClass]["status"] = "tagReset";
                } else if ($(this).hasClass("tagReset")) {
                    // $(this).addClass("noColor");
                    $(this).removeClass("bordered").removeClass("tagReset").removeClass("noColor");
                    $(doc).find("." + colorSwitchedClass).removeClass("bordered").removeClass("tagReset").removeClass("noColor");
                    markus.tag[colorSwitchedClass]["status"] = "";

                } else {
                    $(this).addClass("noColor");
                    $(this).removeClass("bordered").removeClass("tagReset");
                    $(doc).find("." + colorSwitchedClass).removeClass("bordered").removeClass("tagReset");
                    $(doc).find("." + colorSwitchedClass).addClass("noColor");
                    markus.tag[colorSwitchedClass]["status"] = "noColor";
                }
            }
        });
    }
};



} )(markus);



var registColorSwitcher = function() {
    markus.ui.colorSwitcher.regist("#buttonsRow", "button.switcher", ".doc");
}








