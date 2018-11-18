
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

	handleUplaod = ()=> {
		cookie.save('msg', 'start a new project.', { path : '/' });
		this.props.onPage((cookie.load('user_id') === '0') ? 'login' : 'upload')
	};

	render() {
		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row horizontal="start" vertical="center">
					<img onClick={()=> this.props.onHome()} src="/images/logo.svg" className="top-nav-logo" alt="Design Engine" />
					<div className={(window.location.pathname === '/') ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onHome()}>Projects</div>
					<Row>
						<Column><div className={(window.location.pathname.includes('/add-ons')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('add-ons')}>Add Ons</div></Column>
						<Column><sup>new</sup></Column>
					</Row>
					<div className="top-nav-link" onClick={()=> window.open('https://github.com/de-ai/designengine.ai/projects/1')}>Roadmap</div>
				</Row></div>

				<div className="top-nav-column top-nav-column-right">
					<Column flexGrow={1} horizontal="end" vertical="center">
						<button className="top-nav-upload-button" onClick={()=> this.handleUplaod()}>New Project</button>
					</Column>
				</div>
			</div>
		);
	}
}

export default TopNav;
