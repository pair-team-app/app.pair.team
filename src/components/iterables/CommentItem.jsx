
import React, { Component } from 'react';
import './CommentItem.css'

class CommentItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<div className="comment-item">
				<img className="comment-item-avatar" src="/images/default-avatar.png" alt={this.props.author} />
				<div className="comment-item-text">{this.props.content}</div>
			</div>
		);
	}
}

export default CommentItem;
