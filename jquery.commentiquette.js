/*
* Commentiquette JQuery Plugin
* Author: Kyle Marshall
* Email: kyle.marshall@schrodinger.com
* Version: 1.0
* Used jquery-1.11.0.min.js for development
*/

(function ($) {
  /**
   * Initial default options.
   */
  var options = {
      indexID: '',
      userName: '',
      allCommentsPath: '',
      newCommentSeriesPath: '',
      replyCommentPath: '',
      deleteCommentPath: '',
      notifyPath: ''
    };

  /**
   * Acts as a data store for the plugin.
   * 
   * JSON comments structure should be in the form of:
        id: '',
        parentId: '',
        commentBlockId: '',
        commenterName: '',
        timeStamp: '',
        commentBody: ''
   * with these JSON object comments grouped into an array
   * by common commentBlockId's and then those arrays 
   * added into a parent array in ascending order. The
   * data structure will be a 2D array of JSON object comments.
   */
  var model = {
      comments: null
  };

  var controller = {
     /**
     * Initiates the injection of the plugin into
     * the DOM and renders initial comments.
     *
     * @param {string} text selector for plugin entrypoint
     * @return {None}
     */
    init: function(selector){
      //append commentiquette container
      var $container = $(selector);
      if ($container.find('commentiquette-container').length === 0) $container.append("<div class='commentiquette-container'></div>");
      controller.requestAllComments();
    },
    /**
     * Retrieves all comments from the current
     * model data store state.
     *
     * @param {None}
     * @return {Array} array of comment objects.
     */
    getComments: function(){
      return model.comments;
    },
    /**
     * Sets the comments passed to the function
     * to the model comment data store
     *
     * @param {Array} array of comment objects
     * @return {None}
     */
    setComments: function(comments){
      if ($.isArray(comments)) {
        model.comments = comments;
      } else{
        console.error("Could not set comments. Argument is not an Array.");
      }
    },
    /**
     * Deletes all comments from
     * model data store.
     *
     * @param {None}
     * @return {None}
     */
    clearComments: function(){
      model.comments = null;
    },
    /**
     * Sends a GET request to obtain
     * all of the comments. Expects
     * the comments to be in the 
     * correct order and format.
     *
     * @param {None}
     * @return {None}
     */
    requestAllComments: function(){
      // If your server-side code requires
      // payload to be in JSON format,
      // use commented code below
      var payload = {'fileID': options.indexID};
      $.ajax({
        type: "GET",
        url: options.allCommentsPath,
        // data: JSON.stringify(payload),
        data: payload,
        dataType : 'json',
        // contentType : 'application/json; charset=utf-8',
        success: function(data){
              //console.log(JSON.stringify(data));
              controller.clearComments();
              controller.clear();
              controller.setComments(data);
              view.init();
            },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
            controller.clear();
          }
      });
    },
    /**
     * Sends a POST request to start a 
     * new comment series.
     *
     * @param {None}
     * @return {None}
     */
    requestNewCommentSeries: function(body){
      // If your server-side code requires
      // payload to be in JSON format,
      // use commented code below
      var payload = {'body': body, 'name': options.userName, 'fileID': options.indexID};
      $.ajax({
        type: "POST",
        url: options.newCommentSeriesPath,
        // data: JSON.stringify(payload),
        data: payload,
        dataType : 'json',
        // contentType : 'application/json; charset=utf-8',
        success: function(data){
              console.log(data);
              controller.requestAllComments();
            },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
          }
      });
    },
    /**
     * Sends a POST request to reply to
     * a comment.
     *
     * @param {None}
     * @return {None}
     */
    reply: function(parentID,text){
      // If your server-side code requires
      // payload to be in JSON format,
      // use commented code below
      var payload = {'parent': parentID, 'body': text, 'name': options.userName};
      console.log(payload);
      $.ajax({
        type: "POST",
        url: options.replyCommentPath,
        // data: JSON.stringify(payload),
        data: payload,
        dataType : 'json',
        // contentType : 'application/json; charset=utf-8',
        success: function(data){
              console.log(data);
              controller.requestAllComments();
            },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
          }
      });
      
    },
    /**
     * Sends a POST request to delete or
     * set a comment to obsolete.
     *
     * @param {None}
     * @return {None}
     */
    delete: function(parent){
      // If your server-side code requires
      // payload to be in JSON format,
      // use commented code below
      var $nodeList = parent.parentsUntil('.commentiquette-container','.commentiquette-comment');
      if ($nodeList.length >= 1){
        var $node = $nodeList[0];
        var commentID = $node.attributes['data-comment-id'].nodeValue;
        var payload = {'id': commentID};
        var $commentNode = $('.commentiquette-comment[data-comment-id="'+commentID+'"]');
        $commentNode.addClass('commentiquette-blackout');
        $commentNode.prepend('<div class="commentiquette-delete-popup">Delete this comment?<div class="commentiquette-new-buttons"><button id="commentiquette-delete-button-success"><b>Delete</b></button><button id="commentiquette-delete-button-cancel"><b>Cancel</b></button></div></div>');
        //onclick delete comment
        $('#commentiquette-delete-button-success').click(function(event){
          event.preventDefault();
          $.ajax({
            type: "POST",
            url: options.deleteCommentPath,
            // data: JSON.stringify(payload),
            data: payload,
            dataType : 'json',
            // contentType : 'application/json; charset=utf-8',
            success: function(data){
                  console.log(data);
                  controller.requestAllComments();
                },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
              }
          });
        });
        //onclick cancel delete comment
        $('#commentiquette-delete-button-cancel').click(function(event){
            event.preventDefault();
            $('.commentiquette-delete-popup').remove();
            $commentNode.removeClass('commentiquette-blackout');
        });

      }else {
        console.err("NOT ABLE TO ACCESS THE COMMENT-ID ATTRIBUTE");
      }
    },
    /**
     * Sends a POST request that
     * includes the comment date,
     * comment body, and user.
     *
     * @param {None}
     * @return {None}
     */
    notify: function(parent){
      // If your server-side code requires
      // payload to be in JSON format,
      // use commented code below
      var $nodeList = parent.parentsUntil('.commentiquette-container','.commentiquette-comment');
      if ($nodeList.length >= 1){
        var $node = $nodeList[0];
        var commentID = $node.attributes['data-comment-id'].nodeValue;
        var $commentNode = $('.commentiquette-comment[data-comment-id="'+commentID+'"]');
        $commentNode.addClass('commentiquette-blackout');
        $commentNode.prepend('<div class="commentiquette-notify-popup"><label>Enter Email:</label><input id="commentiquette-notify-input" type="text" placeholder="example@example.com"><div class="commentiquette-new-buttons"><button id="commentiquette-notify-button-success"><b>Notify</b></button><button id="commentiquette-notify-button-cancel"><b>Cancel</b></button></div></div>');
        
        //onclick notify success
        $('#commentiquette-notify-button-success').click(function(event){
            event.preventDefault();
            var inputEmail = $('#commentiquette-notify-input').val();
            var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
            if (filter.test(inputEmail)) {
              var payload = {'id': commentID, 'to_email': inputEmail};
              $.ajax({
                type: "POST",
                url: options.notifyPath,
                //data: JSON.stringify(payload),
                data: payload,
                dataType : 'json',
                //contentType : 'application/json; charset=utf-8',
                success: function(data){
                      console.log(data);
                      $('.commentiquette-notify-popup').remove();
                      $commentNode.removeClass('commentiquette-blackout');
                    },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                  }
              });
            } else {
              alert("Not valid email");
            }
        });
        //onclick notify cancel
        $('#commentiquette-notify-button-cancel').click(function(event){
            event.preventDefault();
            $('.commentiquette-notify-popup').remove();
            $commentNode.removeClass('commentiquette-blackout');
        });
      }else {
        console.error("NOT ABLE TO ACCESS THE COMMENT-ID ATTRIBUTE");
      }
    },
    /**
     * Empties the div comment container.
     *
     * @param {None}
     * @return {None}
     */
    clear: function(){
      $('.commentiquette-container').empty();
    },
    /**
     * Checks to make sure all options
     * have been passed to the constructor.
     *
     * @param {None}
     * @return {None}
     */
    checkOptions: function(){
      for (var key in options){
        if (options.hasOwnProperty(key)){
          if (options[key] === ''){
            return false;
          }
        }
      }
      return true;
    }
  };

  var view = {
    init: function(){
      view.render();
      view.initNewCommentSeries();
      view.setReplyEventListeners();

      //Setup the auto-expanding input textarea
      $('.commentiquette-comment textarea').keyup(function(e) {
      //Will help the text expand vertically as typing takes place
        while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
            $(this).height($(this).height()+1);
          }
      });

      //Icon popup - keeps comments that are not last child from having the delete option
      $('.commentiquette-comment-block .commentiquette-comment:not(:last-child) .commentiquette-menu-icon').click(function(e){
        e.preventDefault();
        //remove content menu
        if ($('.commentiquette-content-menu').length){
          $('.commentiquette-content-menu').remove();
          return;
        }
        $(this).append("<ul class='commentiquette-content-menu'><li data-action='notify'>Notify</li></ul>");
        $('.commentiquette-content-menu li').click(function(e){
          switch($(this).attr('data-action')){
            case 'notify': controller.notify($(this)); break;
          }
        $('.commentiquette-content-menu').hide(100);
        });
      });

      //Icon popup - creates a popup with notify and delete features for last child comments
      $('.commentiquette-comment-block .commentiquette-comment:last-child .commentiquette-menu-icon').click(function(e){
        e.preventDefault();
        //remove content menu
        if ($('.commentiquette-content-menu').length){
          $('.commentiquette-content-menu').remove();
          return;
        }
        $(this).append("<ul class='commentiquette-content-menu'><li data-action='notify'>Notify</li><li data-action='delete'>Delete</li></ul>");
        $('.commentiquette-content-menu li').click(function(e){
          switch($(this).attr('data-action')){
            case 'notify': controller.notify($(this)); break;
            case 'delete': controller.delete($(this)); break;
          }
        $('.commentiquette-content-menu').hide(100);
        });
      });

    },
     /**
     * Renders comment objects to parent node.
     * Either pass in data and parent or
     * uses container as parent and renders comments
     * that are in current model state.
     *
     * @param1 {Array/Object} Either single comment object or array of them
     * @param2 {String} Parent selector string e.g. '.commentiquette-container'
     * @return {void}
     */
    render: function(data, parent){
      function formatDomString(comment){
        return '<div class="commentiquette-comment flat" data-comment-id="'+comment.id+'">'+
                  '<header>'+
                    '<h4 class="commentiquette-user">'+comment.commenterName+'<span class="commentiquette-menu-icon"><i class="fa fa-ellipsis-v"></i></span></h4>'+
                    '<p class="commentiquette-timeline">'+comment.timeStamp+'</p>'+
                  '</header>'+
                  '<section class="commentiquette-comment-body">'+comment.commentBody+'</section>'+
                '</div>';
        }

      //if no arguments passed
      if (arguments.length == 0){
        var data = controller.getComments();
        for(var i in data){
          $('.commentiquette-container').append('<div class="commentiquette-comment-block" data-comment-block-id="'+data[i][0].commentBlockId+'"></div>');
          var $commentBlock = $('.commentiquette-comment-block[data-comment-block-id="'+data[i][0].commentBlockId+'"');
          for (var j in data[i]){
            $commentBlock.append(formatDomString(data[i][j]));
          }
        }
        return;
      }
      //if arguments passed
      var $parent = $(parent);
      if ($.isArray(data)){ //TODO possibly change this so it can handle 2d array of comment objects
        for(var i in data){
          $parent.append(formatDomString(data[i]));
        }
      } else if (typeof data === 'object' && data != null){
        $parent.append(formatDomString(data));
      } else{
        console.err("Data passed to view.render function is not in a usable type.");
      }
    },
    initNewCommentSeries: function(){
      //append new comment block div
      //add empty comment body w/buttons
      var template = '<div class="commentiquette-comment-block">'+
                        '<div class="commentiquette-comment edit">'+
                          '<header>'+
                            '<h4 class="commentiquette-user">'+options.userName+'</h4>'+
                          '</header>'+
                          '<textarea id="commentiquette-new-textarea-reply" name="Comment-Textarea"></textarea>'+
                          "<div class='commentiquette-new-buttons commentiquette-button-reply-series'><button id='commentiquette-button-new-series-reply'><b>Reply</b></button></div>"                      
                        '</div>'+
                     '</div>';          
      $('.commentiquette-container').append(template);
      $('#commentiquette-button-new-series-reply').click(function(event){
          event.preventDefault();
          var body = $('#commentiquette-new-textarea-reply').val();
          if (body !== ''){
            controller.requestNewCommentSeries(body);
          }
      });
    },
    setReplyEventListeners: function(){
      var commentBlocks = document.querySelectorAll('.commentiquette-comment-block');
      for (var i in commentBlocks){
        try {
          var lastComment = commentBlocks[i].lastChild;
          if (typeof lastComment != 'undefined' && lastComment.hasAttribute('data-comment-id')){
              var commentID = lastComment.getAttribute('data-comment-id');
              var $lastComment = $('.commentiquette-comment[data-comment-id="'+commentID+'"]');
              var $commentBody = $lastComment.find(".commentiquette-comment-body");
              
              $commentBody.click(function(e){
                e.stopPropagation();
                if ($('#commentiquette-textarea-reply').length){
                  $('#commentiquette-textarea-reply').remove();
                  $(this).removeClass('commentiquette-reply');
                  return;
                }
                $(this).after('<textarea id="commentiquette-textarea-reply" name="Comment-Textarea"></textarea>');
                $(this).addClass('commentiquette-reply');
                $(this).siblings('#commentiquette-textarea-reply').keyup(function(e) {
                //  the following will help the text expand as typing takes place
                  while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
                      $(this).height($(this).height()+1);
                    }
                });
                $('#commentiquette-textarea-reply').focus(function(){
                  if ($('.commentiquette-buttons').length){
                    return;
                    }
                  $(this).after("<div class='commentiquette-buttons'><button id='commentiquette-button-reply'><b>Reply</b></button><button id='commentiquette-button-cancel'><b>Cancel</b></button></div>");
                  //Remove textarea and buttons when 'Cancel' button is clicked
                  $('#commentiquette-button-cancel').click(function(e){
                    $('.commentiquette-buttons').remove();
                    $('#commentiquette-textarea-reply').remove();
                    $('.commentiquette-comment-body').removeClass('commentiquette-reply');
                  });
                  //Create new comment upon button 'Reply' click
                  $('#commentiquette-button-reply').click(function(e){
                    var $parentComment = $(this).parents('.commentiquette-comment');
                    var textarea = $(this).parent().prev();
                    if (textarea.val() !== ''){
                      controller.reply($parentComment.data('comment-id'),textarea.val());
                    }
                  });
                });
              });
          }
        } catch(err){
          console.error(err);
        }
      }
    }
  };

  /**
   * Initiate the plugin
  **/
  $.fn.Commentiquette = function(params){
    $.extend(options, params);
    if (controller.checkOptions() === false){
      console.error("ERROR: Please pass all arguemnts to constructor");
      return;
    }
    var self = this.selector;
    controller.init(self);
  };

  /**
   * Removes all widget DOM elements
  **/
  $.fn.Commentiquette.removeAll = function(){
    var $parent = $('.commentiquette-container').parent();
    $parent.empty();
  };

})(jQuery);