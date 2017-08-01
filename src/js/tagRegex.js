(function(_m) {
    var tagRegexReplace = function(a, b) {
        return "<[^>]{0,}" + b + "[^>]{0,}>[^<]{0,}<[^>]{0,}span>";
    };
    var tagRegexPat = /<([^>]{1,})>/g;
    _m.regex = {

        translate: function(tagRegex) {
            var regex = tagRegex.replace(tagRegexPat, tagRegexReplace);
            return regex;
        }
    };

})(markus);