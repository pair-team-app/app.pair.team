
import React from 'react';
import './CommentsPanelItem.css';

import PlaygroundBaseComment from '../../PlaygroundBaseComment';


function CommentsPanelItem(props) {
// 	console.log('CommentsPanelItem()', props);

	const { ind, comment, selected } = props;
	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment);
	};

	return (<div className="comments-panel-item" data-id={comment.id} data-selected={selected}>
		<PlaygroundBaseComment ind={ind} comment={comment} onDelete={handleDelete} />
 	</div>);
}


export default (CommentsPanelItem);
