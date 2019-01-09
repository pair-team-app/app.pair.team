
import React, { Component } from 'react';
import './TopNav.css';

import { Row } from 'simple-flexbox';

import TopNavProfile from './TopNavProfile';
import { isExplorePage, isHomePage, isProjectPage, isUploadPage, isUserLoggedIn } from '../../utils/funcs';
import logo from '../../images/logo-designengine.svg';

class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row horizontal="start" vertical="center">
					<img onClick={()=> this.props.onHome()} src={logo} className="top-nav-logo" alt="Design Engine" />
					<div className={(isHomePage() || isProjectPage() || isUploadPage()) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onHome()}>Projects</div>
					{/*<div className={(window.location.pathname.includes('/add-ons')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('add-ons')}>Add Ons</div>*/}
					<div className={(isExplorePage()) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('explore')}>Explore</div>
					<div className="top-nav-link" onClick={()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLSdYZI6uIqF9D5zW5LmZQqCem6zrXh7THmVVBoOkeAQWm9o6lg/viewform?usp=sf_link')}>Survey</div>
				</Row></div>

				<div className="top-nav-column top-nav-column-right">
					<Row horizontal="end" vertical="center">
						{(!isUserLoggedIn())
							? (<button className="top-nav-upload-button" onClick={()=> this.props.onPage('register')}>Sign Up with Email</button>)
							: (<Row vertical="center">
									<TopNavProfile
										onPage={this.props.onPage}
										onLogout={this.props.onLogout}
									/>
							</Row>)}
					</Row>
				</div>
			</div>
		);
	}
}

export default TopNav;
