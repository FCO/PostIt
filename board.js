"use strict";

class Board {

	constructor(dom) {
		/*
		window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
		if(!(IDBTransaction in window))
			window.IDBTransaction = window.webkitIDBTransaction;
		if(!(IDBKeyRange in window))
			window.IDBKeyRange = window.webkitIDBKeyRange;

		if (!window.indexedDB) {
			    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
		}
		*/

		this.dom = dom;
		PostIt.domBase = dom;
		
		//<img id="garbage" src="img/garbage_empty.png">
		this.garbage	= document.createElement("IMG");
		this.garbage.setAttribute("src", "img/garbage_empty.png");
		this.garbage.setAttribute("id", "garbage");
		dom.appendChild(this.garbage);
		/*
		this.garbage.center = {
			x: parseInt(window.getComputedStyle(this.garbage).right)	+ this.garbage.width / 2,
			y: parseInt(window.getComputedStyle(this.garbage).top)		+ this.garbage.height / 2
		};
		*/

		this.BUILT = new Promise((acc, rej) => {
			var version	= 2;
			var dbName	= "db";
			var req = window.indexedDB.open(dbName, version);

			req.onupgradeneeded = ev => {
				console.log(ev);
				var db = ev.target.result;
				db.onerror = console.error;
				if(ev.oldVersion == 0)
					db.createObjectStore("postit", {keyPath: "id"});  
			};

			req.onsuccess = ev => {
				var db = ev.target.result;
				acc(db);
			};

			req.onerror = err => {
				console.error(err);
				rej(err);
			}
		})
			.then(db => {
				this.db = PostIt.db = db;
				return this;
			})
		;
	}

	loadPostIts() {
		var trans = this.db.transaction('postit', 'readwrite');
		var store = trans.objectStore('postit');

		store.openCursor().onsuccess = event => {
			var cursor = event.target.result;
			if (cursor) {
				var postit = new PostIt(cursor.key, cursor.value.data, cursor.value.x, cursor.value.y, cursor.value.ang);
				postit.board = this;
				cursor.continue();
			}
		};
	}

	createPostit() {
		var postit = new PostIt(undefined, "bla", 50, 50);
		postit.board = this;
		setTimeout(() => postit.move(300, 300), 100);
	}

	distanceFromGarbage(postit) {
		var cpostit = postit.center;
		var garbage = {x: screen.width, y: screen.height};

		return Math.sqrt(Math.pow(Math.abs(cpostit.x - garbage.x), 2) + Math.pow(Math.abs(cpostit.y - garbage.y), 2))
	}

	dropPostIt(postit) {
		var max_distance = (screen.width + screen.height / 2) / 8;
		console.log(this.distanceFromGarbage(postit) + " < " + max_distance);
		if(this.distanceFromGarbage(postit) < max_distance) {
			console.log(postit);
			postit.destroy();
		}
	}
}
