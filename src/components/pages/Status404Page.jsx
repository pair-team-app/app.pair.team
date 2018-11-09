

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
							<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
						</div>
					</Column>
				</Row>
			</div>
		);
	}
}

export default DevelopersPage;
