
import React, { Component } from 'react';
import './TopNav.css';

import { Row } from 'simple-flexbox';

import TopNavProfile from './TopNavProfile';
import { isUserLoggedIn } from '../../utils/funcs';


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const pathname = window.location.pathname;

		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row horizontal="start" vertical="center">
					<img onClick={()=> this.props.onHome()} src="/images/logo.svg" className="top-nav-logo" alt="Design Engine" />
					<div className={(pathname === '/' || pathname.includes('proj') || pathname.includes('new')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onHome()}>Projects</div>
					{/*<div className={(window.location.pathname.includes('/add-ons')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('add-ons')}>Add Ons</div>*/}
					<div className={(pathname.includes('/explore')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('explore')}>Explore</div>
					<div className="top-nav-link" onClick={()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLSdYZI6uIqF9D5zW5LmZQqCem6zrXh7THmVVBoOkeAQWm9o6lg/viewform?usp=sf_link')}>Survey</div>
				</Row></div>

				<div className="top-nav-column top-nav-column-right">
					<Row horizontal="end" vertical="center">
						{(!isUserLoggedIn())
							? (<button className="top-nav-upload-button" onClick={()=> this.props.onPage('register')}>Sign Up with Email</button>)
							: (<Row vertical="center">
									<TopNavProfile
										onPage={(url)=> this.props.onPage(url)}
										onLogout={()=> this.props.onLogout()}
									/>
							</Row>)}
					</Row>
				</div>
			</div>
		);
	}
}

export default TopNav;
