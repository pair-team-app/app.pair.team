
import React, { Component } from 'react';
import './Status404Page.css';

import { Row } from 'simple-flexbox';

import BaseDesktopPage from './BaseDesktopPage';


class DevelopersPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<BaseDesktopPage className="status-404-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>Nothing Here, 404</h1></Row>
					<div className="page-header-text">Design Engine is a design platform built for engineers. From open source projects to enterprise apps, you can inspect designs, download parts, copy code, and build interfaces faster.</div>
				</div>
			</BaseDesktopPage>
		);
	}
}

export default DevelopersPage;
