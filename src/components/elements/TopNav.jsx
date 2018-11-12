
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
				<div className="top-nav-column top-nav-column-left"><Row horizontal="start" vertical="center">
					<img onClick={()=> this.props.onHome()} src="/images/logo.svg" className="top-nav-logo" alt="Design Engine" />
					<div className={(window.location.pathname === '/') ? 'top-nav-link top-nav-link-selcted' : 'top-nav-link'} onClick={()=> this.props.onHome()}>Projects</div>
					<div className={(window.location.pathname.includes('/add-ons')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('add-ons')}>Add Ons</div>
				</Row></div>

				<div className="top-nav-column top-nav-column-middle">
				</div>

				<div className="top-nav-column top-nav-column-right">
					{(cookie.load('user_id') !== '0') && (
						<Column flexGrow={1} horizontal="end" vertical="center">
							<button className="top-nav-upload-button" onClick={()=> this.props.onPage('upload')}>New Project</button>
						</Column>
					)}
				</div>
			</div>
		);
	}
}

export default TopNav;
