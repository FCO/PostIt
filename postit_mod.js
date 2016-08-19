

var PostIt = React.createClass({
	render: function() {
		return <div class="postit" style="left: {this.props.x}px; top: {this.props.y}px;">
			<div class="container">
				<pre id="fixed_content" class="content">{this.props.data}</pre>
				<div class="editableContent" align="center" style="display: none">
					<textarea id="editable_content" style="border: 0px; width: 145px; height: 145px">{this.props.data}</textarea>
					<br />
					<button class="update">OK</button>
				</div>
			</div>
		</div>
	}
});


ReactDOM.render(<PostIt x=30 y=30 data"bla">)
