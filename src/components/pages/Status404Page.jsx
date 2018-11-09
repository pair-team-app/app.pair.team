

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
			<div className="status-404-page-wrapper">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="page-header">
							<Row horizontal="center"><div className="page-header-text">404 Not Found!</div></Row>
							<div className="page-subheader-text">The document at {window.location.pathname} was not found here.</div>
						</div>
					</Column>
				</Row>
			</div>
		);
	}
}

export default DevelopersPage;
