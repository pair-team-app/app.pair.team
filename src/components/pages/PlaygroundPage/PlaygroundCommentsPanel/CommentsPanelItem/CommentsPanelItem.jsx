
import React from 'react';
import './CommentsPanelItem.css';

import 'emoji-mart/css/emoji-mart.css'
// import { Picker } from 'emoji-mart'

import PlaygroundBaseComment from '../../PlaygroundBaseComment';


function CommentsPanelItem(props) {
// 	console.log('CommentsPanelItem()', props);

	const { ind, comment, selected } = props;
	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment);
	};

	const handleEmoji = (emoji, event=null)=> {
		console.log('PlaygroundBaseComment.handleEmoji()', { emoji, event });
	};

	return (<div className="comments-panel-item" data-id={comment.id} data-selected={selected}>
		<PlaygroundBaseComment ind={ind} comment={comment} onDelete={handleDelete} />
		{/* {(ind > 0) && (<Picker set="apple" onSelect={handleEmoji} onClick={handleEmoji} perline={3} emojiSize="12" native={true} sheetSize={16} showPreview={false} showSkinTones={false} title="Pick your emoji…" emoji="point_up" style={{ position : 'relative', bottom : '20px', right : '20px' }} />)} */}
 	</div>);
}


export default (CommentsPanelItem);
