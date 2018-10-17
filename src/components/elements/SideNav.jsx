
import React, { Component } from 'react';
import './SideNav.css'

import axios from 'axios';
import cookie from 'react-cookies';
import { withRouter } from 'react-router-dom'
import { Column, Row } from 'simple-flexbox';

import SideNavItem from './SideNavItem';

class SideNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageID     : 0,
			artboardID : 0,
			sliceID    : 0,
			pages      : [],
			artboards  : []
		};
	}

	handleNavItem = (ind) => {
		console.log('handleNavItem()', ind);

		if (window.location.pathname === '/') {
			let pages = [...this.state.pages];
			pages.forEach(page => page.selected = false);
			pages[ind].selected = true;

			this.setState({ pages : pages });
			this.props.onPageItem(pages[ind]);

		} else {
			let artboards = [...this.state.artboards];
			artboards.forEach(artboard => artboard.selected = false);
			artboards[ind].selected = true;

			this.setState({
				pageID      : artboards[ind].pageID,
				artboardID  : artboards[ind].id,
				artboards   : artboards
			});

			this.props.onArtboardItem(artboards[ind]);
		}
	};

	componentDidMount() {
		this.refreshData();
	}

	refreshData = ()=> {
		if (window.location.pathname.includes('/render/')) {
			const pageID = window.location.pathname.match(/\/(\d+)\//)[1];
			const artboardID = window.location.pathname.match(/\/(\d+)$/)[1];
			this.setState({
				pageID     : pageID,
				artboardID : artboardID
			});
		}

		if (typeof cookie.load('user_id') !== 'undefined') {
			if (window.location.pathname.includes('/render/')) {
				const pageID = window.location.pathname.match(/\/(\d+)\//)[1];
				const artboardID = window.location.pathname.match(/\/(\d+)$/)[1];
				this.setState({
					pageID     : pageID,
					artboardID : artboardID
				});

				let formData = new FormData();
				formData.append('action', 'ARTBOARDS');
				formData.append('upload_id', cookie.load('upload_id'));
				formData.append('page_id', '' + pageID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('ARTBOARDS', response.data);
						let artboards = [];

						response.data.artboards.forEach(artboard => {
							let slices = [];
							artboard.slices.forEach(function(item, i) {
								slices.push({
									id       : item.id,
									title    : item.title,
									filename : item.filename + '@1x.png',
									meta     : JSON.parse(item.meta),
									added    : item.added,
									selected : false
								});
							});

							artboards.push({
								id        : artboard.id,
								pageID    : artboard.page_id,
								title     : artboard.title,
								filename  : artboard.filename,
								meta      : JSON.parse(artboard.meta),
								views     : artboard.views,
								downloads : artboard.downloads,
								added     : artboard.added,
								slices    : slices,
								selected  : (artboardID === artboard.id)
							});
						});

						this.setState({ artboards : artboards });

					}).catch((error) => {
				});

			}	else {
				let formData = new FormData();
				formData.append('action', 'PAGES');
				formData.append('user_id', cookie.load('user_id'));
				formData.append('upload_id', cookie.load('upload_id'));
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('PAGES', response.data);
						let pages = [];
						response.data.pages.forEach(page => {
							let artboards = [];

							page.artboards.forEach(artboard => {
								let slices = [];
								artboard.slices.forEach(function(item, i) {
									slices.push({
										id       : item.id,
										title    : item.title,
										filename : item.filename + '@1x.png',
										meta     : JSON.parse(item.meta),
										added    : item.added,
										selected : false
									});
								});

								artboards.push({
									id        : artboard.id,
									pageID    : artboard.page_id,
									title     : artboard.title,
									filename  : artboard.filename,
									meta      : JSON.parse(artboard.meta),
									added     : artboard.added,
									slices    : slices,
									selected  : false//(artboardID === artboard.id)
								});
							});

							pages.push({
								id          : page.id,
								title       : page.title,
								description : page.description,
								artboards   : artboards,
								added       : page.added,
								selected    : false
							});
						});

						this.setState({ pages : pages });

					}).catch((error) => {
				});
			}
		}
	};

	render() {
		console.log('SideNav.render()');

		if (window.location.pathname.includes('/render/')) {
			const artboardID = window.location.pathname.match(/\/(\d+)$/)[1];
			if (this.state.artboardID !== artboardID) {
				this.refreshData();
				return (null);
			}
		}

		let items = [];
		if (typeof cookie.load('user_id') !== 'undefined') {
			if (window.location.pathname === '/') {
				items = this.state.pages.map((item, i, arr) => {
					return (
						<SideNavItem
							key={i}
							title={item.title}
							description={item.description}
							selected={item.selected}
							onClick={()=> this.handleNavItem(i)} />
					);
				});

			} else if (window.location.pathname.includes('/render/')) {
				items = this.state.artboards.map((item, i, arr) => {
					return (
						<SideNavItem
							key={i}
							title={item.title}
							description=""
							selected={item.selected}
							onClick={()=> this.handleNavItem(i)} />
					);
				});
			}
		}

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

export default withRouter(SideNav);
