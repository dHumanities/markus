( function(_m) {

var saveComment = function() {
    var comments = [];
    $("#commentHolder .comment").each(function() {
        comments.push($(this).find("pre").text());
    });
    var newComment = $.trim($("#comment .commentTextArea").val());
    if (newComment.length > 0) {
        comments.push(newComment);
    }
    console.log(JSON.stringify(comments));
    $("#comment .commentTextArea").val("");

    var obj = $("span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] .commentContainer");
    obj.attr("value", JSON.stringify(comments));
    obj.attr("value", markus.util.convertToEscapeUnicode(obj.attr("value")));
    obj.attr("data-markus-noOfComment", (comments.length == 0) ? "" : comments.length);
    // obj.text(convertToEscapeUnicode(JSON.stringify(comments)));
    $("span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] span[type='commentIcon']").trigger("click");
};

var removeAnySync = function(event) {
    event.stopPropagation();
    var removeCommentId = $(this).attr("data-markus-commentId");
    var comments = [];
    $("#commentHolder .comment[data-markus-commentId='" + removeCommentId + "']").remove();

    $("#commentHolder .comment").each(function() {
        comments.push($(this).find("pre").text());
    });
    var obj = $("span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] .commentContainer");
    obj.attr("value", JSON.stringify(comments));
    obj.attr("value", markus.util.convertToEscapeUnicode(obj.attr("value")));
    obj.attr("data-markus-noOfComment", (comments.length == 0) ? "" : comments.length);
    // obj.text(convertToEscapeUnicode(obj.attr("value")));
    // $("span[id='" + $("#commentHolder .panel-group").attr("data-markus-passageId") + "'] .commentContainer").attr("value", convertToEscapeUnicode(JSON.stringify(comments)));
    $(".doc span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] span[type='commentIcon']").trigger("click");
};

var edit = function(event) {
    event.stopPropagation();
    var commentId = $(this).attr("data-markus-commentId");
    var comments = [];
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .panel-body").prop("contenteditable", "true");
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .collapse").collapse('show');
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] span[type='comment-edit']").attr("type", "comment-save").removeClass("glyphicon-edit").addClass("glyphicon-floppy-disk");
};

var save = function(event) {
    event.stopPropagation();
    var commentId = $(this).attr("data-markus-commentId");
    var comments = [];
    var content = $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .panel-body").html();
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .panel-body").html(content.replace(/<\/pre><pre>/gm, "\n"));
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .panel-body").prop("contenteditable", "false");
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] span[type='comment-save']").attr("type", "comment-edit").addClass("glyphicon-edit").removeClass("glyphicon-floppy-disk");
    $("#commentHolder .comment").each(function() {
        comments.push($(this).find("pre").text());
    });
    var obj = $("span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] .commentContainer");
    obj.attr("value", JSON.stringify(comments));
    obj.attr("value", markus.util.convertToEscapeUnicode(obj.attr("value")));
    obj.attr("data-markus-noOfComment", (comments.length == 0) ? "" : comments.length);


};

var startAddingCommentHolder = function() {
    $(".doc .passage").each(function() {
        if ($(this).find(".commentContainer").length == 0) {
            $(this).prepend("<span class='commentContainer' value='[]'><span class='glyphicon glyphicon-comment' type='commentIcon' style='display:none' aria-hidden='true' data-markus-passageId='" + $(this).attr('id') + "'></span></span>");
        } else {
            var commentIcons = $(this).find("[type='commentIcon']");
            for (var i = 1; i < commentIcons.length; i++) {
                commentIcons[i].remove();
            }
            var commentContainer = $(this).find(".commentContainer");
            var comments = $.parseJSON(markus.util.converBackToUnicode($(commentContainer[0]).attr("value")));


            for (var i = 1; i < commentContainer.length; i++) {


                comments = comments.concat($.parseJSON(markus.util.converBackToUnicode($(commentContainer[i]).attr("value"))));
                $(commentContainer[i]).remove();
            }
            $(commentContainer[0]).attr("value", JSON.stringify(comments));
            $(commentContainer[0]).attr("value", markus.util.convertToEscapeUnicode($(commentContainer[0]).attr("value")));
        }
    });
    $.getJSON("/auth/profile_info", function(result) {
        if (result["name"]) {
            $(".doc span[type='commentIcon']").show();
        } else {
            $(".doc span[type='commentIcon']").hide();

        }


    }).fail(function() {
        $(".doc span[type='commentIcon']").hide();
    });

};
_m.comment = {
    saveComment: saveComment,
    removeAnySync: removeAnySync,
    startAddingCommentHolder: startAddingCommentHolder,
    edit: edit,
    save: save

};

} )(markus);

var registerCommentUI = function() {
    $("#comment").hide();
    $("#comment .addCommentBtn").on("click", markus.comment.saveComment);
    $("#comment .closeComment").on("click", function() {
        $("#comment").hide();
        $("#assist").show();
    });
    $("#commentHolder").on("click", "span[type='comment-trash']", markus.comment.removeAnySync);
    $("#commentHolder").on("click", "span[type='comment-edit']", markus.comment.edit);
    $("#commentHolder").on("click", "span[type='comment-save']", markus.comment.save);
};

var registerCommentIcon = function() {
    $(".doc").on("click", "span[type='commentIcon']", function() {
        if ( ($("#comment").css('display') == 'none') ) {
            // console.log('hit');
            $("#assist").hide();

            $("#comment").show();
        }
        $("#comment .comment").remove();
        $("#commentHolder").attr("data-markus-passageId", $(this).attr("data-markus-passageId"));
        var comments = $(this).parent().attr("value") || "[]";
        comments = $.parseJSON(markus.util.converBackToUnicode(comments));
        for (var i = comments.length - 1; i >= 0; i--) {
            var comment = comments[i];
            // $("#commentHolder .panel-group").attr("data-markus-passageId", $(this).parent().attr("id"));
            $("#commentHolder .panel-group").prepend('<div class="panel panel-default comment" data-markus-commentId="' + i + '"> \
            <div class="panel-heading" role="tab" id="heading' + i + '" aria-expanded="false"> \
              <h4 class="panel-title"> \
                <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '" aria-expanded="true" aria-controls="collapse' + i + '">'
                + comment.substring(0, 10) + "..." +
                '</a> <span class="pull-right glyphicon glyphicon-trash" type="comment-trash" data-markus-commentId="' + i + '"></span> <span class="pull-right glyphicon glyphicon-edit" type="comment-edit" data-markus-commentId="' + i + '"></span>\
              </h4> \
            </div> \
            <div id="collapse' + i + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + i + '"> \
              <div class="panel-body"><pre>'
                + comment +
                '</pre></div> \
            </div> \
          </div>');
        }

        $("#commentHolder").css("top", $(this).position().top).show();
    });
};