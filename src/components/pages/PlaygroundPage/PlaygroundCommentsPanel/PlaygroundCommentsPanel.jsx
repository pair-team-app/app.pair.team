
import React, { Component } from 'react';
import './PlaygroundCommentsPanel.css';


class PlaygroundCommentsPanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

		const { collapsed } = this.props;
		return (<div className={`playground-comments-panel${(collapsed) ? ' playground-comments-panel-collapsed' :''}`}>
		</div>);
	}
}


export default (PlaygroundCommentsPanel);
