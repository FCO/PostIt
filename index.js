"use strict";

class PostIt {
	constructor(id, data, x, y, ang) {
		this.dom		= document.importNode(PostIt.template(), true);
		this.divStyle		= this.dom.querySelector("div.postit").style;
		this.editStyle		= this.dom.querySelector("div.editableContent").style;
		this.fixStyle		= this.dom.querySelector("pre.content").style;

		//this.shadow		= PostIt.shadowDOM();
		this.preroot		= PostIt.domBase || document.body.querySelector("div");
		this.root		= document.createElement("DIV");
		this.shadow		= this.root.createShadowRoot();
		this.appendToDom();

		this.editData		= this.dom.querySelector("textarea#editable_content");
		this.fixData		= this.dom.querySelector("pre#fixed_content");

		this.id			= PostIt.lastId(id);
		this.data		= data;
		this.x			= x || 0;
		this.y			= y || 0;
		this.ang		= ang || Math.random() * 60 - 30;
		this.divStyle.opacity	= 0;
		this.divStyle.transition= "1s ease-in-out";

		this.addListeners();

		this.dom = this.shadow.appendChild(this.dom);
		this.save();
		this.BUILT	= new Promise(acc => setTimeout(acc, 100))
			.then(() => {
				this.divStyle.opacity = 1;
				this.rotate(this.ang);
				return this;
			})
		;
	}

	appendToDom() {
		this.preroot.appendChild(this.root);
	}

	static get db() {
		return PostIt._db;
	}

	static set db(db) {
		PostIt._db = db;
	}

	static lastId(id) {
		if(!PostIt._lastId)		PostIt._lastId = 0;
		if(id && id > PostIt._lastId)	PostIt._lastId = id;
		if(!id)				id = ++PostIt._lastId;
		return id;
	}

	static shadowDOM() {
		if(!PostIt._shadowDOM)
			//PostIt._shadowDOM = document.body.createShadowRoot();
			PostIt._shadowDOM = document.body.querySelector("div").createShadowRoot();
		return PostIt._shadowDOM;
	}

	static template() {
		if(!PostIt._template)
			PostIt._template = document.querySelector('template#postit').content;
		return PostIt._template;
	}

	get data() {return this._data}
	set data(data) {
		this._data = data;
		this.fixData.innerText = this._data;
		this.editData.value = this._data;
		;
	}

	get x() {return this._x}
	set x(x) {
		this._x			= x;
		this.divStyle.left	= this.x + "px";
	}

	get y() {return this._y}
	set y(y) {
		this._y			= y;
		this.divStyle.top	= this.y + "px";
	}

	get width()	{return 150}
	get height()	{return 150}

	get center() {
		return {
			x: this.x + this.width	/ 2,
			y: this.y + this.height	/ 2
		}
	}

	get json() {
		return {
			id	: this.id,
			data	: this.data,
			x	: this.x,
			y	: this.y,
			ang	: this.ang,
		}
	}

	save() {
		return new Promise((acc, rej) => {
			var db = PostIt.db;
			var trans = db.transaction('postit', 'readwrite');
			var store = trans.objectStore('postit');

			var request		= store.put(this.json);
			request.onsuccess	= () => acc(this);
			request.onerror		= rej;
		})
	}

	delete() {
		return new Promise((acc, rej) => {
			var db = PostIt.db;
			var trans = db.transaction('postit', 'readwrite');
			var store = trans.objectStore('postit');

			var request		= store.delete(this.id);
			request.onsuccess	= () => acc(this);
			request.onerror		= rej;
		})
	}

	destroy() {
		this.delete()
			.then(() => {
				this.divStyle.opacity = 0;
				setTimeout(() => this.preroot.removeChild(this.root), 1500);
			})
			.catch(err => {
				console.error(err);
				Promise.reject(err);
			})
	}

	rotate(ang){
		this.divStyle.webkitTransform	= `rotate(${ang}deg)`;
		this.divStyle.mozTransform	= `rotate(${ang}deg)`;
		this.divStyle.msTransform	= `rotate(${ang}deg)`;
		this.divStyle.oTransform	= `rotate(${ang}deg)`;
		this.divStyle.transform		= `rotate(${ang}deg)`;
	}

	addListeners() {
		var postit = this.dom.querySelector("div.postit");
		postit
			.addEventListener("mousedown", ev => {
				//ev.preventDefault();
				this.startDragging(ev.offsetX, ev.offsetY);
			})
		;
		postit
			.addEventListener("mousemove", ev => {
				ev.preventDefault();
				if(this.touching) {
					this.x = ev.clientX - this.touching.x;
					this.y = ev.clientY - this.touching.y;
				}
			})
		;
		postit
			.addEventListener("mouseup", ev => {
				ev.preventDefault();
				if(this.touching)
					this.stopDragging();
			})
		;
		postit
			.addEventListener("mouseout", ev => {
				ev.preventDefault();
				if(this.touching)
					this.stopDragging();
			})
		;
		postit
			.addEventListener("dblclick", ev => {
				ev.preventDefault();
				this.edit();
			})
		;
		this.dom
			.querySelector("button.update")
			.addEventListener("click", ev => this.finishEdit())
		;
		this.dom
			.querySelector("div.postit")
			.addEventListener("mouseover", ev => this.rotate(0))
		;
		this.dom
			.querySelector("div.postit")
			.addEventListener("mouseout", ev => this.rotate(this.ang))
		;

	}

	edit() {
		this.editStyle.display = "block";
		this.fixStyle.display = "none";
		this.editData.focus();
	}

	finishEdit() {
		this.data = this.editData.value;
		this.editStyle.display = "none";
		this.fixStyle.display = "block";
		this.save();
	}

	startDragging(x, y) {
		this.appendToDom();
		this.touching = {x, y};
		this.divStyle.transition = undefined;
	}

	stopDragging(x, y) {
		delete(this.touching);
		this.save();
		this.divStyle.transition = "1s ease-in-out";
		if(this.board) this.board.dropPostIt(this);
	}

	move(x, y) {
		var orig			= this.divStyle.transition;
		this.divStyle.transition	= "5s ease-in-out";
		this.x = x;
		this.y = y;
		this.divStyle.transition 	= orig;
		this.save();
	}
}

