
import React, { Component } from 'react';
import './TopNav.css';

import { Column, Row } from 'simple-flexbox';


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className="top-nav-wrapper">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="start" vertical="center" style={{height:'40px'}}>
						<a href="/"><img src="/images/logo.svg" className="nav-logo" alt="Design Engine" /></a>
					</Column>

					<Column flexGrow={5} horizontal="start" vertical="center" style={{height:'40px'}}>
						<button>UPLOAD</button>
					</Column>


					<Column flexGrow={1} horizontal="end" vertical="center" style={{height:'40px'}}>
						<div className="nav-link"><a href={'/manifesto'}>Manifesto</a></div>
					</Column>
				</Row>
			</div>
		);
	}
}

export default TopNav;
