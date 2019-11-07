
import React from 'react';
import './CommentsPanelItem.css';

import { MOMENT_TIMESTAMP } from '../../../../../consts/formats';
import { DEFAULT_AVATAR } from '../../../../../consts/uris';


function CommentsPanelItem(props) {
// 	console.log('CommentsPanelItem()', props);

	const { ind, comment } = props;
	const { id, type, author, content, timestamp } = comment;

	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment.id);
	};

	return (<div className="comments-panel-item" data-id={id}>
		<div className="comments-panel-item-header-wrapper">
			<div className="comments-panel-item-header-icon-wrapper">
				{(type !== 'init') && (<div className="comments-panel-item-header-icon">{ind}</div>)}
				<div className="comments-panel-item-header-icon"><img src={(!author.avatar) ? DEFAULT_AVATAR : author.avatar} alt={author.username} /></div>
			</div>
			<div className="comments-panel-item-header-spacer" />
			<div className="comments-panel-item-header-link-wrapper">
				{(type !== 'init') && (<div className="comments-panel-item-header-link" onClick={handleDelete}>Delete</div>)}
			</div>
		</div>

		<div className="comments-panel-item-timestamp" dangerouslySetInnerHTML={{ __html : timestamp.format(MOMENT_TIMESTAMP).replace(/(\d{1,2})(\w{2}) @/, (match, p1, p2)=> (`${p1}<sup>${p2}</sup> @`)) }} />
		<div className="comments-panel-item-content" dangerouslySetInnerHTML={{ __html : content.replace(author.username, `<strong>@${author.username}</strong>`) }} />
	</div>);
}


export default (CommentsPanelItem);
