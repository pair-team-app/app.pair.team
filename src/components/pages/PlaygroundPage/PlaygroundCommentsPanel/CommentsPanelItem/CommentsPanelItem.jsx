
import React from 'react';
import './CommentsPanelItem.css';

import ComponentComment from '../../ComponentComment';


function CommentsPanelItem(props) {
// 	console.log('CommentsPanelItem()', props);

	const { ind, comment } = props;
	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment.id);
	};

	return (<div className="comments-panel-item" data-id={comment.id}>
		<ComponentComment ind={ind} comment={comment} onDelete={handleDelete} />
 	</div>);
}


export default (CommentsPanelItem);
