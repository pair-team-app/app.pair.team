
import React, { Component } from 'react';
import './PlaygroundPageContent.css';


class PlaygroundPageContent extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	render() {
		console.log(this.constructor.name, '.render()', this.props, this.state);

		return (<div className="playground-page-content">
		</div>);
	}
}

export default (PlaygroundPageContent);
