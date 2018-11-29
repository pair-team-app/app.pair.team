
import React, { Component } from 'react';
import './CommentItem.css'

import cookie from 'react-cookies';
import FontAwesome from 'react-fontawesome';

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

		const userID = cookie.load('user_id');
		let isUpVoted = false;
		let isDnVoted = false;
		let score = 1;
		this.props.votes.forEach(function(item, i) {
			if (item.user_id === userID) {
				isUpVoted = (parseInt(item.value, 10) === 1);
				isDnVoted = (parseInt(item.value, 10) === -1);
			}

			score += parseInt(item.value, 10);
		});

		const arrowUpClass = (isUpVoted) ? 'comment-item-arrow comment-item-arrow-voted' : 'comment-item-arrow';
		const arrowDnClass = (isDnVoted) ? 'comment-item-arrow comment-item-arrow-voted' : 'comment-item-arrow';

		return (
			<div className="comment-item">
				<img className="comment-item-avatar" src="/images/default-avatar.png" alt={this.props.author} />
				<div className="comment-item-vote-wrapper">
					<FontAwesome name="arrow-up" className={arrowUpClass} onClick={()=> this.props.onVote(1)} /><br />
					<div className="comment-item-score">{score}</div>
					<FontAwesome name="arrow-down" className={arrowDnClass} onClick={()=> this.props.onVote(-1)} /><br />
				</div>
				<div className="comment-item-content-wrapper">
					<div className="comment-item-date">{(new Intl.DateTimeFormat('en-US', options).format(Date.parse(this.props.added))).replace(',', '').replace(/ (.{2})$/g, '$1').toLowerCase()}</div>
					<div className="comment-item-text">{this.props.content}</div>
				</div>
			</div>
		);
	}
}

export default CommentItem;
