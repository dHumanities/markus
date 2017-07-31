/**
 * Comment.js base file.
 * @module comment.js
 */

 /**
 The class that holds the variables and functions created in the namespace of this file.
 The constrcutor of this object is only called once, because it is an anonymous function.

 The functions defined in this class are later added to the MARKUS global object and can
 from that point on be called as `markus.comments.FUNCTION_NAME`

 @class comment.js_anonymous
 @constructor
 @param {Object}  _m a reference to the Markus Configuration Object is passed
 **/
( function(_m) {

/**
 * Finds all comments for this element, stores their text contents into an array,
 * and sets this array as value atribute (after Unicode Escaping) for the `span`
 * comment Container. Finally it triggers a click event on the commentIcon span
 *
 * @for Comment
 * @method saveComment
 */
var saveComment = function() {
    //hold all the pre element textcontent in an array
    var comments = [];
    $("#commentHolder .comment").each(function() {
        comments.push($(this).find("pre").text());
    });

    //check if there is a newComment, if there is, also add it
    var newComment = $.trim($("#comment .commentTextArea").val());
    if (newComment.length > 0) {
        comments.push(newComment);
    }

    //Log the comments to be saved and reset the newComment field
    console.log(JSON.stringify(comments));
    $("#comment .commentTextArea").val("");

    //Find the span with the ID of the markus passageID and class of commentContainer
    var obj = $("span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] .commentContainer");

    //set the value attribute to the array of comments, and unicodeEscape it
    obj.attr("value", JSON.stringify(comments));
    obj.attr("value", markus.util.convertToEscapeUnicode(obj.attr("value")));

    //Set the attribute that contains the number of comments that are stored on this object
    obj.attr("data-markus-noOfComment", (comments.length == 0) ? "" : comments.length);

    //Finally trigger a click event on the commentIcon to save the data
    $("span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] span[type='commentIcon']").trigger("click");
};


/**
 * Handles the removing of a comment. It first removes the comment, and then
 * resaves all the ones that are still left.
 *
 * @for Comment
 * @method removeAnySync
 * @param  {Event} event The event Object that is passed
 */
var removeAnySync = function(event) {
    event.stopPropagation();

    //Get the ID of the comment we want to remove and remove that one
    var removeCommentId = $(this).attr("data-markus-commentId");
    $("#commentHolder .comment[data-markus-commentId='" + removeCommentId + "']").remove();

    //push all the leftover comments into an array
    var comments = [];
    $("#commentHolder .comment").each(function() {
        comments.push($(this).find("pre").text());
    });


    //Find the span with the ID of the markus passageID and class of commentContainer
    var obj = $("span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] .commentContainer");

    //set the value attribute to the array of comments, and unicodeEscape it
    obj.attr("value", JSON.stringify(comments));
    obj.attr("value", markus.util.convertToEscapeUnicode(obj.attr("value")));
    //set the data-markus-noOfComment value to the amount of comments
    obj.attr("data-markus-noOfComment", (comments.length == 0) ? "" : comments.length);
    // obj.text(convertToEscapeUnicode(obj.attr("value")));
    // $("span[id='" + $("#commentHolder .panel-group").attr("data-markus-passageId") + "'] .commentContainer").attr("value", convertToEscapeUnicode(JSON.stringify(comments)));

    //click the span within the .doc class with the right passageID
    $(".doc span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] span[type='commentIcon']").trigger("click");
};

/**
 * Enables the editing of the provided comment. It starts the editing of it
 * by setting the panel-body to contenteditable and chaning the edit to a save
 * button.
 *
 * @for Comment
 * @method edit
 * @param  {Event} event the propagated event from the DOM
 */
var edit = function(event) {
    event.stopPropagation();

    //find the id of the comment we're working on
    var commentId = $(this).attr("data-markus-commentId");

    //finds the commentHolder and sets a few settings to allow it to be edited.
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .panel-body").prop("contenteditable", "true");
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .collapse").collapse('show');
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] span[type='comment-edit']").attr("type", "comment-save").removeClass("glyphicon-edit").addClass("glyphicon-floppy-disk");
};

/**
 * Saves the current commentField. It escape Unicode Characters
 *
 * @for Comment
 * @method save
 * @param  {Event} event The event that is passed from the DOM
 */
var save = function(event) {
    event.stopPropagation();

    //Finds the comment we inted to save
    var commentId = $(this).attr("data-markus-commentId");

    //Saves the content from the commentHolder, and formats it, and stops the editing process
    var content = $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .panel-body").html();
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .panel-body").html(content.replace(/<\/pre><pre>/gm, "\n"));
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] .panel-body").prop("contenteditable", "false");
    $("#commentHolder .comment[data-markus-commentId='" + commentId + "'] span[type='comment-save']").attr("type", "comment-edit").addClass("glyphicon-edit").removeClass("glyphicon-floppy-disk");

    //Gets all the comments and pushes them in an array to be saved
    var comments = [];
    $("#commentHolder .comment").each(function() {
        comments.push($(this).find("pre").text());
    });

    //Setting the value of the commentHolder to the comments array and
    //Escaping Unicode Characters.
    var obj = $("span[id='" + $("#commentHolder").attr("data-markus-passageId") + "'] .commentContainer");
    obj.attr("value", JSON.stringify(comments));
    obj.attr("value", markus.util.convertToEscapeUnicode(obj.attr("value")));
    obj.attr("data-markus-noOfComment", (comments.length == 0) ? "" : comments.length);
};

/**
 * Called upon parsing of the document to parse the comment UI from the data in the html
 * document. This goes through all the comments and sanitizes them.
 *
 * @for Comment
 * @method startAddingCommentHolder
 */
var startAddingCommentHolder = function() {
    //For each of the passages in the document
    $(".doc .passage").each(function() {
        //If there is no commentContainer content, make one default one
        if ($(this).find(".commentContainer").length == 0) {
            $(this).prepend("<span class='commentContainer' value='[]'><span class='glyphicon glyphicon-comment' type='commentIcon' style='display:none' aria-hidden='true' data-markus-passageId='" + $(this).attr('id') + "'></span></span>");
        } else {
            //If there is conent in the commentContainer, we look through it

            //Find all the commentIcons and remove them
            var commentIcons = $(this).find("[type='commentIcon']");
            for (var i = 1; i < commentIcons.length; i++) {
                commentIcons[i].remove();
            }

            //Find the Commentcontainer
            var commentContainer = $(this).find(".commentContainer");
            //And read back all the comments from JSOn into a JS Array (after converting it back into UNICode)
            var comments = $.parseJSON(markus.util.converBackToUnicode($(commentContainer[0]).attr("value")));

            //If there are any leftOver commentContainers, we remove them after taking their contents
            for (var i = 1; i < commentContainer.length; i++) {
                comments = comments.concat($.parseJSON(markus.util.converBackToUnicode($(commentContainer[i]).attr("value"))));
                $(commentContainer[i]).remove();
            }

            //Set the value of the commentContainer to the JSON data equivalent of the JS array
            $(commentContainer[0]).attr("value", JSON.stringify(comments));
            //convertToEscapeUnicode on the contents
            $(commentContainer[0]).attr("value", markus.util.convertToEscapeUnicode($(commentContainer[0]).attr("value")));
        }
    });

    //Try to find the user Authentication profile.
    //If it succeeds, and the user has a name, you show the comments field
    $.getJSON("/auth/profile_info", function(result) {
        if (result["name"]) {
            $(".doc span[type='commentIcon']").show();
        } else {
            $(".doc span[type='commentIcon']").hide();

        }

    //If the User Authentication request fails, hide by default
    }).fail(function() {
        $(".doc span[type='commentIcon']").hide();
    });

};
/**
 * This class' method are defined in the above anonymous class of this file and
 * are only reassigned here.
 *
 * Make all the functions that have been defined above availabe through
 * markus.comment.FUNCTION, to allow calling of them throughout the DOM
 * @class Comment
 */
_m.comment = {
    saveComment: saveComment,
    removeAnySync: removeAnySync,
    startAddingCommentHolder: startAddingCommentHolder,
    edit: edit,
    save: save

};
} )(markus);

/**
 * Adds all the UI Event handles for the Comment UI. This class links the UI to
 * the functions behind the scenes.
 *
 * @for Global
 * @method registerCommentUI
 */
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

/**
 *  Defines what happens when you click the commentIcon. It generates a new commentHolder
 *
 * @for Global
 * @method registerCommentIcon
 */
var registerCommentIcon = function() {
    $(".doc").on("click", "span[type='commentIcon']", function() {

        //If it is currently not visible, we need to show it and hide the assist
        if ( ($("#comment").css('display') == 'none') ) {
            $("#assist").hide();
            $("#comment").show();
        }

        //Remove the commentClass object from the comment and set the passageID
        $("#comment .comment").remove();
        $("#commentHolder").attr("data-markus-passageId", $(this).attr("data-markus-passageId"));

        //Get a list of comments for this passage from the passage and try to convert it back to Unicode
        var comments = $(this).parent().attr("value") || "[]";
        comments = $.parseJSON(markus.util.converBackToUnicode(comments));

        //For each of those comments
        for (var i = comments.length - 1; i >= 0; i--) {
            var comment = comments[i];
            // $("#commentHolder .panel-group").attr("data-markus-passageId", $(this).parent().attr("id"));

            //add a new panel to the commentHolder
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

        //Set the position of the commentHolder and show it on the page
        $("#commentHolder").css("top", $(this).position().top).show();
    });
};
