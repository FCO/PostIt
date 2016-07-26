var DB = {};

window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

DB.indexedDB = {};
DB.indexedDB.db = null;

// Handle the prefix of Chrome to IDBTransaction/IDBKeyRange.
if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.webkitIDBTransaction;
  window.IDBKeyRange = window.webkitIDBKeyRange;
}

indexedDB.db = null;
// Hook up the errors to the console so we could see it.
// In the future, we need to push these messages to the user.
indexedDB.onerror = function(e) {
  console.error(e);
};


App = Em.Application.create({

  // When everything is loaded.
  ready: function() {

    App.postItList     = App.PostItList.create();

    App.postIts = Ember.View.create({
       templateName:     'postIts',
    });
    
    App.postIts.append();

    $("img#garbage").droppable({
      drop: function(event, ui) {
        ui.draggable.get(0).distroy();
      }
    });
    $("div.editableContent button.update").live("click", function(event){
      var dad = $(this).parent("div.editableContent");
      var content = dad.parents("div.postit").find("pre.content");
      content.text(dad.find("textarea").val());
      dad.fadeOut("slow", function(){
         content.fadeIn("slow");
      });
    });
    $("div.postit pre.content").live("dblclick", function(event){
      $(this).parent().find("div.editableContent textarea").val($(this).text());
      $(this).fadeOut("slow", function(){
         var edit = $(this).parent().find("div.editableContent");
         edit.fadeIn("slow");
         edit.find(":first-child").focus();
      });
    });
    $("button#new").click(function(){
      App.postItList.pushPostit(
        App.Model.create({content: "Bla Ble Bli Blo Blu"})
      );
    });
    $(".config-icon").live("click", function(){
      var postit = $(this).parents("div.postit");
      postit.get(0).rotate(0);
      postit.get(0).flip();
    });

    $("button.config-ok").live("click", function(){
      var postit = $(this).parents("div.postit");
      postit.get(0).unflip();
      postit.get(0).rotateDefault();
    });

    // Call the superclass's `ready` method.
    this._super();

    var v = 1;
    var request = indexedDB.open("postit", v);
    
    request.onupgradeneeded = function(e) {
      var db = request.result;
      var store = db.createObjectStore("postit", {keyPath: "id"});  
    };
  
    request.onsuccess = function(e) {    
      DB.indexedDB.db = e.target.result;
      //DB.indexedDB.getAllTodoItems();
    };
  
    request.onfailure = DB.indexedDB.onerror;
  
 }

});

var postit_id = 0;

App.Model = Ember.Object.extend({
   content: "bla...",
   id:      postit_id,
   angle:   0,
   x:       100,
   y:       200,
   init:    function() {
      this.set("angle", Math.floor(Math.random() * 60) - 30);
      this.id = ++postit_id;
      //this.save();
   },
   save: function() {
     var db = DB.indexedDB.db;
     var trans = db.transaction('postit', 'readwrite');
     var store = trans.objectStore('postit');

     var request = store.put({
       content: this.content,
       id:      this.id,
       angle:   this.angle,
       x:       this.x,
       y:       this.y,
     });

     request.oncomplete = function(e) {
       //DB.indexedDB.getAllTodoItems();
     };

     request.onerror = function(e) {
       console.error("Error Adding: ", e);
     };
   }
});

App.PostItList = Ember.ArrayController.extend({
   content: [],
   pushPostit: function(postit) {
      this.pushObject(postit);
      postit.save();
   }
});

App.PostIt = Ember.View.extend({
   templateName:      'teste',
   id:                0,
   classNames:        "postit",
   tagName:           "div",
   angle:             null,
   get x()            {
	   return model.x;
   },
   set x(data)        {
	   return model.x = data;
   },
   get y()            {
	   return model.y;
   },
   set y(data)        {
	   return model.x = data;
   },
   model:             null,
   init:              function() {
      this.on("didInsertElement", function(){
         var view = this;
         var _this = this.$().get(0);
         _this.flip = function() {
           $(this).transition({rotateY: "180deg"}, 1000);
         }
         _this.unflip = function() {
           $(this).transition({rotateY: "0deg"}, 1000);
         }
         _this.rotate = function(angle) {
           $(this).transition({rotate: angle + "deg"}, 1000);
         }
         _this.rotateDefault = function() {
           $(this).transition({rotate: view.get("angle") + "deg"}, 1000);
         }
         _this.move = function(x, y, angle) {
           $(this).unbind('mouseenter');
           $(this).unbind('mouseleave');
           $(this).animate({ left: x + "px", top: y + "px", transition: "rotate: 60deg" }, {
             duration: 2000,
             step:     function(now,fx) {
               $(this).css('transform',         'rotate(' + (now * (angle / fx.end)) + 'deg)'); 
               $(this).css('-moz-transform',    'rotate(' + (now * (angle / fx.end)) + 'deg)'); 
               $(this).css('-webkit-transform', 'rotate(' + (now * (angle / fx.end)) + 'deg)'); 
             },
             specialEasing: {
               left:       'swing',
               top:        'swing',
             },
           });
         }
         _this.move(this.get("x"), this.get("y"), this.get("angle"))
         _this.distroy = function() {
            $(this).unbind('mouseenter');
            $(this).unbind('mouseleave');
            view.$().fadeOut("slow", function(){
               view.remove();
            });
         }

         this.$().mouseenter(function(){
             $(this).removeClass("ember-view");
             $(this).stop();
             $(this).get(0).rotate(0);
         });
         this.$().mouseleave(function(){
             $(this).addClass("ember-view");
             $(this).stop();
             $(this).get(0).rotateDefault();
         });

         this.$().draggable({
           stack: "div.postit",
           start:  function(){
             $(this).stop();
           },
           stop:  function(){
             view.set("x", view.$().position().left);
             view.set("y", view.$().position().top);
           },
         });
      });
   },
});
