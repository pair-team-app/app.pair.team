
import React, { Component } from 'react';
import './TopNav.css';

import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			uploads  : [],
			devices  : [],
			colors   : []
		};
	}

	componentDidMount() {
	}


	render() {
		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row>
					<Column flexGrow={1} horizontal="start" vertical="center">
						<img onClick={()=> this.props.onHome()} src="/images/logo.svg" className="nav-logo" alt="Design Engine" />
					</Column>
				</Row></div>

				<div className="top-nav-column top-nav-column-middle">
				</div>

				<div className="top-nav-column top-nav-column-right">
					{(cookie.load('user_id') !== '0') && (
						<Column flexGrow={1} horizontal="end" vertical="center">
							<button className="top-nav-upload-button" onClick={()=> this.props.onUpload()}>New Project</button>
						</Column>
					)}
				</div>
			</div>
		);
	}
}

export default TopNav;
