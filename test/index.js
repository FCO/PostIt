require("should");

require('jsdom-global')();
window.indexedDB = require('fake-indexeddb');
window.IDBTransaction = require("fake-indexeddb/lib/FDBTransaction");

beforeEach(function() {
	document.body.innerHTML = '<template id="postit"> <style> @import "postit.css"; </style> <div class="postit"> <div class="container"> <pre id="fixed_content" class="content">Data...</pre> <div class="editableContent" align="center" style="display: none"> <textarea id="editable_content" style="border: 0px; width: 145px; height: 145px">Data...</textarea> <br> <button class="update">OK</button> </div> </div> </div> </template> <div width="100%" height="100%" class=cortica></div> <button id=new>Create PostIt</button>';
});

Node.prototype.createShadowRoot = function() {
	var root = document.createElement("DIV");

	this.appendChild(root);
	return root;
}

var PostIt = require("../postit.js");
var Board = require("../index.js");

describe('high level:', function() {
	describe('Board', function() {
		it('should not have PostIts on it', function() {
			(document.body.querySelector("div.postit") == null).should.be.true;
			document.body.querySelectorAll("div.postit").length.should.be.equal(0);
		});
		it('Outside board should be the same as the inside one', function(done) {
			var outsideBoard = new Board(document.body);
			outsideBoard.BUILT
				.then(insideBoard => {
					insideBoard.should.be.a.Object;
					insideBoard.should.be.equal(outsideBoard);
					done();
				})
				.catch(done)
			;
		});
		it('should create a new PostIt', function(done) {
			var board = new Board(document.body);
			board.BUILT
				.then(board => {
					board.createPostit();
					(document.body.querySelector("div.postit") != null).should.be.true;
					document.body.querySelectorAll("div.postit").length.should.be.equal(1);
					done();
				})
				.catch(done)
			;
		});
	});
});
