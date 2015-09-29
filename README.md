# Commentiquette
### A Google Doc like commenting widget

To use:

Have an empty HTML entry point that Jquery can select on
```
<div id="my-target"></div>
```
Then after sourcing the commentiquette css and js files, init widget by:
```
$('#my-target').Commentiquette({
    indexID: '',
    userName: '',
    allCommentsPath: '',
    newCommentSeriesPath: '',
    replyCommentPath: '',
    deleteCommentPath: '',
    notifyPath: ''
});
```
where indexID is some sort of unique index you are commenting. Could be the ID of a file or video.
The property userName is the user name of the commenter. The remaining properties are paths to your
backend that will perform asynchronous task.

Then to delete widget:
```
$('#my-target').Commentiquette.removeAll();
```