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
      App.postItList.pushObject(
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
  }
});

App.Model = Ember.Object.extend({
   content: "bla...",
   id:      0,
   angle:   0,
   x:       100,
   y:       200,
   init:    function() {
      this.set("angle", Math.floor(Math.random() * 60) - 30);
      App.Model.id++;
   },
});

App.PostItList = Ember.ArrayController.extend({
   content: [],
});

App.PostIt = Ember.View.extend({
   templateName:      'teste',
   id:                0,
   classNames:        "postit",
   tagName:           "div",
   angle:             null,
   x:                 0,
   y:                 0,
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











var html5rocks = {};
html5rocks.webdb = {};
html5rocks.webdb.db = null;

html5rocks.webdb.open = function() {
  var dbSize = 5 * 1024 * 1024; // 5MB
  html5rocks.webdb.db = openDatabase("PostIts", "1.0", "Lembretes", dbSize);
}

html5rocks.webdb.createTable = function() {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS postit(ID INTEGER PRIMARY KEY ASC, content TEXT, x NUMBER, y NUMBER, angle NUMBER)", []);
  });
}

html5rocks.webdb.addPostIt = function(content, x, y, angle) {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx){
    tx.executeSql(
        "INSERT INTO postit(content, x, y, angle) VALUES (?, ?, ?, ?)",
        [content, x, y, angle],
        html5rocks.webdb.onSuccess,
        html5rocks.webdb.onError
    );
   });
}

html5rocks.webdb.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
}

html5rocks.webdb.onSuccess = function(tx, r) {
  // re-render the data.
  //html5rocks.webdb.getAllTodoItems(loadTodoItems);
}


html5rocks.webdb.getAllPostIts = function(renderFunc) {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM postit", [], renderFunc,
        html5rocks.webdb.onError);
  });
}

html5rocks.webdb.deletePostIt = function(id) {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx){
    tx.executeSql("DELETE FROM todo WHERE ID=?", [id],
        html5rocks.webdb.onSuccess,
        html5rocks.webdb.onError);
    });
}

function init() {
  html5rocks.webdb.open();
  html5rocks.webdb.createTable();
  html5rocks.webdb.getAllTodoItems(loadTodoItems);
}
