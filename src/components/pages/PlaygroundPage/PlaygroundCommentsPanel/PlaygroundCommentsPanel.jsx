
import React from 'react';
import './PlaygroundCommentsPanel.css';

import CommentsPanelItem from './CommentsPanelItem';


function PlaygroundCommentsPanel(props) {
// 	console.log('PlaygroundCommentsPanel()', props);

	const { comments } = props;
	return (<div className={`playground-comments-panel${(!window.location.href.includes('/comments')) ? ' playground-comments-panel-collapsed' :''}`}>
		{(comments.map((comment, i)=> {
			return (<CommentsPanelItem key={i} ind={(comments.length - 1) - i} comment={comment} onDelete={props.onDelete} />);
		}))}
	</div>);
}


export default (PlaygroundCommentsPanel);
