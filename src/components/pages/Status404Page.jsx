

import React, { Component } from 'react';
import './Status404Page.css';

import { Row } from 'simple-flexbox';

class DevelopersPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className="page-wrapper status-404-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>Nothing is here :(</h1></Row>
					<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along.</div>
					<Row horizontal="center"><button onClick={()=> this.props.onPage('')}>Go Home</button></Row>
				</div>
			</div>
		);
	}
}

export default DevelopersPage;
