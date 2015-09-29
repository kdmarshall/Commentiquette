# Commentiquette
## A Google Doc like commenting widget

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

Then to delete widget:
```
$('#my-target').Commentiquette.removeAll();
```