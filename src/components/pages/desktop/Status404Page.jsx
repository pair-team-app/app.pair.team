
import React, { Component } from 'react';
import './Status404Page.css';

import { Column } from 'simple-flexbox';

import BaseDesktopPage from './BaseDesktopPage';


class Status404Page extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<BaseDesktopPage className="status-404-page-wrapper">
				<Column className="page-header" horizontal="center" vertical="center">
					<h1 className="page-header-title">Nothing Here, 404</h1>
					<div className="page-header-subtitle">Free code, specs, & parts to implement pixel-perfect design.</div>
				</Column>
			</BaseDesktopPage>
		);
	}
}

export default Status404Page;
