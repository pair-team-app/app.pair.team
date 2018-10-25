
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
		const options = {
			year   : 'numeric',
			month  : 'numeric',
			day    : 'numeric',
			hour   : 'numeric',
			minute : 'numeric'
		};

		return (
			<div className="comment-item">
				<img className="comment-item-avatar" src="/images/default-avatar.png" alt={this.props.author} />
				<div className="comment-item-content-wrapper">
					<div className="comment-item-date">{(new Intl.DateTimeFormat('en-US', options).format(Date.parse(this.props.added))).replace(',', '').toLowerCase().replace(/\ (.{2})$/g, '$1')}</div>
					<div className="comment-item-text">{this.props.content}</div>
				</div>
			</div>
		);
	}
}

export default CommentItem;
