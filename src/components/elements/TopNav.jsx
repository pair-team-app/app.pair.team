
import React, { Component } from 'react';
import './TopNav.css';

import axios from "axios/index";
import cookie from 'react-cookies';
import { Row } from 'simple-flexbox';

import TopNavProfile from './TopNavProfile';


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loadProfile : props.loadProfile,
			avatar      : 'http://cdn.designengine.ai/profiles/default-avatar.png'
		};
	}

	componentDidMount() {
		this.refreshData();
	}

	componentDidUpdate(prevProps) {
		if (this.props.loadProfile !== prevProps.loadProfile && this.props.loadProfile) {
			this.refreshData();
		}
	}

	refreshData = ()=> {
		let formData = new FormData();
		formData.append('action', 'PROFILE');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('PROFILE', response.data);

				this.setState({
					loadProfile : false,
					avatar      : response.data.avatar
				});
			}).catch((error) => {
		});
	};


	handleUplaod = ()=> {
		cookie.save('msg', 'use this feature.', { path : '/' });
		this.props.onPage((cookie.load('user_id') === '0') ? 'login' : 'new')
	};

	render() {
		const { avatar } = this.state;

		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row horizontal="start" vertical="center">
					<img onClick={()=> this.props.onHome()} src="/images/logo.svg" className="top-nav-logo" alt="Design Engine" />
					<div className={(window.location.pathname === '/' || window.location.pathname.includes('proj') || window.location.pathname.includes('new')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onHome()}>Projects</div>
					{/*<div className={(window.location.pathname.includes('/add-ons')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('add-ons')}>Add Ons</div>*/}
					<div className={(window.location.pathname.includes('/explore')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('explore')}>Explore</div>
					<div className="top-nav-link" onClick={()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLSdYZI6uIqF9D5zW5LmZQqCem6zrXh7THmVVBoOkeAQWm9o6lg/viewform?usp=sf_link')}>Survey</div>
				</Row></div>

				<div className="top-nav-column top-nav-column-right">
					<Row horizontal="end" vertical="center">
						{(cookie.load('user_id') === '0')
							? (<button className="top-nav-upload-button" onClick={()=> this.props.onPage('register')}>Sign Up with Email</button>)
							: (<Row vertical="center">
									<TopNavProfile
										avatar={avatar}
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
