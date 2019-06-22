
import React, { Component } from 'react';
import './Status404Page.css';

import { Column } from 'simple-flexbox';

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
				<Column className="page-header" horizontal="center" vertical="center">
					<h1 className="page-header-title">Nothing Here, 404</h1>
					<div className="page-header-subtitle">Free code, specs, & parts to implement pixel-perfect design.</div>
				</Column>
			</BasePage>
		);
	}
}

export default Status404Page;
