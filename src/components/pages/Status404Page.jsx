

import React, { Component } from 'react';
import './Status404Page.css';

import { Column, Row } from 'simple-flexbox';

class DevelopersPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className="page-wrapper status-404-page-wrapper">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="page-header">
							<Row horizontal="center"><h1>404 Not Found!</h1></Row>
							<div className="page-header-text">The document at {window.location.pathname} was not found here.</div>
						</div>
					</Column>
				</Row>
			</div>
		);
	}
}

export default DevelopersPage;
