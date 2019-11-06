
import React, { Component } from 'react';
import './PlaygroundCommentsPanel.css';

import CommentsPanelItem from './CommentsPanelItem';

class PlaygroundCommentsPanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { comments } = this.props;
		return (<div className={`playground-comments-panel${(comments.length === 0) ? ' playground-comments-panel-collapsed' :''}`}>
			{(comments.map((comment, i)=> {
				return (<CommentsPanelItem key={i} comment={comment} onDelete={this.props.onDelete} />);
			}))}
		</div>);
	}
}


export default (PlaygroundCommentsPanel);
