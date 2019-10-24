
import React, { Component } from 'react';
import './PlaygroundPageHeader.css';

import HeaderProfile from './HeaderProfile';


class PlaygroundPageHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	render() {
		console.log(this.constructor.name, '.render()', this.props, this.state);

		return (<div className="playground-page-header">
			<div className="playground-page-header-col">Product - Component</div>
			<div className="playground-page-header-col playground-page-header-col-right">
				Share
				<HeaderProfile />
			</div>
		</div>);
	}
}


export default (PlaygroundPageHeader);
