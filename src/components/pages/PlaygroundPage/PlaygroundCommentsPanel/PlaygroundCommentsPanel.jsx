
import React from 'react';
import './PlaygroundCommentsPanel.css';

import CommentsPanelItem from './CommentsPanelItem';


function PlaygroundCommentsPanel(props) {
// 	console.log('PlaygroundCommentsPanel()', props);

	const { comments, commentID } = props;
	return (<div className="playground-comments-panel" data-collapsed={!window.location.href.includes('/comments')}>
		<div className="comments-panel-item-wrapper">
			{(comments.map((comment, i)=> {
				return (<CommentsPanelItem key={i} ind={(comments.length - 1) - i} comment={comment} selected={comment.id === commentID} onDelete={props.onDelete} />);
			}))}
		</div>
	</div>);
}


export default (PlaygroundCommentsPanel);
