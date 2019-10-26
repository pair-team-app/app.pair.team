
import React from 'react';
import './CommentsPanelItem.css';

import { MOMENT_TIMESTAMP } from '../../../../../consts/formats';
import { DEFAULT_AVATAR } from '../../../../../consts/uris';


function CommentsPanelItem(props) {
// 	console.log('CommentsPanelItem()', props);

	const { comment } = props;
	const { ind, author, content, timestamp } = comment;

	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment);
	};

	return (<div className="comments-panel-item">
		<div className="comments-panel-item-header-wrapper">
			<div className="comments-panel-item-header-icon-wrapper">
				<div className="comments-panel-item-header-icon">{ind + 1}</div>
				<div className="comments-panel-item-header-icon"><img src={(!author.avatar) ? DEFAULT_AVATAR : author.avatar} alt={author.username} /></div>
			</div>
			<div className="comments-panel-item-header-spacer" />
			<div className="comments-panel-item-header-link-wrapper">
				<div className="comments-panel-item-header-link" onClick={handleDelete}>Delete</div>
			</div>
		</div>

		<div className="comments-panel-item-timestamp" dangerouslySetInnerHTML={{ __html : timestamp.format(MOMENT_TIMESTAMP).replace(/(\d{1,2})(\w{2}) @/, (match, p1, p2)=> (`${p1}<sup>${p2}</sup> @`)) }} />
		<div className="comments-panel-item-content">{content}</div>
	</div>);
}


export default (CommentsPanelItem);
