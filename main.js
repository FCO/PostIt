var Board = require("./index.js");

window.addEventListener("load", e => {
	new Board(document.body).BUILT
		.then(board => {
			board.loadPostIts();
			document.querySelector("button#new")
				.addEventListener("click", () => board.createPostit())
			;
		})
	;
});
