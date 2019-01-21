
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
					<Row horizontal="center"><h1>Nothing Here, 404</h1></Row>
					<div className="page-header-text">Design Engine is a design platform built for engineers. From open source projects to enterprise apps, you can inspect designs, download parts, copy code, and build interfaces faster.</div>
					<Row horizontal="center"><button onClick={()=> this.props.onPage('')}>Projects</button></Row>
				</div>
			</div>
		);
	}
}

export default DevelopersPage;
