
import React, { Component } from 'react';
import './Status404Page.css';

import BasePage from '../BasePage';


class Status404Page extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<BasePage className="status-404-page-wrapper">
				<h1>Nothing Here, 404</h1>
			</BasePage>
		);
	}
}

export default (Status404Page);
