
import React, { Component } from 'react';
import './SideNav.css'

import axios from 'axios';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import SideNavItem from './SideNavItem';

class SideNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pages : []
		};
	}

	handleNavItem = (ind) => {
		let pages = [...this.state.pages];
		pages.forEach(page => page.selected = false);
		pages[ind].selected = true;

		this.setState({ pages : pages });
		this.props.onNavItem(pages[ind]);
	};

	componentDidMount() {
		if ((this.props.url === '/' || this.props.url.includes('/render/')) && typeof cookie.load('user_id') !== 'undefined') {
			let formData = new FormData();
			formData.append('action', 'PAGES');
			formData.append('user_id', cookie.load('user_id'));
			formData.append('upload_id', cookie.load('upload_id'));
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('PAGES', JSON.stringify(response.data));
					let pages = [];
					response.data.pages.forEach(page => {
						pages.push({
							id          : page.id,
							title       : page.title,
							description : page.description,
							added       : page.added,
							selected    : false
						});
					});

					this.setState({ pages : pages });

				}).catch((error) => {
			});
		}
	}

	render() {
		const items = ((this.props.url === '/' || this.props.url.includes('/render/')) && typeof cookie.load('user_id') !== 'undefined') ? this.state.pages.map((item, i, arr) => {
			return (
					<SideNavItem
						key={i}
						title={item.title}
						description={item.description}
						selected={item.selected}
						onClick={()=> this.handleNavItem(i)} />
			);
		}) : [];

		return (
			<div className="side-nav-wrapper">
				<div className="side-nav-link-wrapper">
					<div className="side-nav-top-wrapper">
						{(typeof cookie.load('user_id') !== 'undefined') && (
							<button className="side-nav-invite-button" onClick={()=> this.props.onInvite()}><Row>
								<Column flexGrow={1} horizontal="start" vertical="center">Invite Team</Column>
								<Column flexGrow={1} horizontal="end" vertical="center"><img className="side-nav-invite-image" src="https://via.placeholder.com/18x20" alt="Invite Team" /></Column>
							</Row></button>
						)}
						{items}
					</div>
					<div className="side-nav-bottom-wrapper">
						{(typeof cookie.load('user_id') !== 'undefined')
							? <div className="nav-link" onClick={() => this.props.onLogout()}>Logout</div>
							: <div className="nav-link" onClick={() => this.props.onRegister()}>Sign Up / Sign In</div>
						}
						<div className="nav-link"><a href="https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA" target="_blank" rel="noopener noreferrer">Slack</a></div>
						<div className="nav-link"><a href="https://spectrum.chat/designengine" target="_blank" rel="noopener noreferrer">Spectrum</a></div>
						<div className="nav-link"><a href={'/manifesto'}>Manifesto</a></div>
						<div className="nav-link"><a href={'/terms'}>Terms of Service</a></div>
						<div className="nav-link"><a href={'/privacy'}>Privacy Policy</a></div>
						<div className="copyright">&copy; {new Date().getFullYear()} Design Engine AI</div>
					</div>
				</div>
			</div>
		);
	}
}

export default SideNav;
