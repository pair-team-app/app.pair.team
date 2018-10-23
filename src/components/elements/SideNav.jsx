
import React, { Component } from 'react';
import './SideNav.css'

import axios from 'axios';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import ArtboardTreeItem from './ArtboardTreeItem';
import PageTreeItem from './PageTreeItem';

class SideNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageID     : 0,
			artboardID : 0,
			sliceID    : 0,
			pages      : [],
			artboards  : [],
			treeMenu   : [],
			collapsedBookkeeping: []
		};
	}

	handleNavItem = (type, id) => {
		console.log('handleNavItem()', type, id);

		if (type === 'page') {
			let page = null;
			let pages = [...this.state.pages];
			pages.forEach(function(item, i) {
				if (item.id === id) {
					item.selected = !item.selected;
					page = item;

				} else {
					item.selected = false;
				}
			});

			this.setState({ pages : pages });
			this.props.onPageItem(page);

		} else if (type === 'artboard') {
			let artboard = null;
			let artboards = [...this.state.artboards];
			artboards.forEach(function(item, i) {
				item.slices.forEach((slice)=> {
					slice.selected = false;
				});

				if (item.id === id) {
					item.selected = !item.selected;
					artboard = item;

				} else {
					item.selected = false;
				}
			});

// 			if (artboard.selected) {
				this.setState({
					pageID     : artboard.pageID,
					artboardID : id,
					artboards  : artboards
				});

				this.props.onArtboardItem(artboard);
// 			}

		} else if (type === 'slice') {
			let slice = null;
			let artboards = [...this.state.artboards];
			artboards.forEach(function(artboard, i) {
				artboard.slices.forEach(function(item, j) {
					if (item.id === id) {
						item.selected = true;
						slice = item;
					}
				});
			});

			this.props.onSliceItem(slice);
		}
	};

	componentDidMount() {
		this.refreshData();
	}

	refreshData = ()=> {
		if (typeof cookie.load('user_id') !== 'undefined') {
			if (window.location.pathname.includes('/render/')) {
				const { pageID, artboardID, sliceID } = this.props;
				this.setState({
					pageID     : pageID,
					artboardID : artboardID,
					sliceID    : sliceID
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

						this.setState({
							artboards : artboards,
							collapsedBookkeeping :artboards.map(() => false)
						});

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
		console.log('SideNav.render()', this.state.pages);

		if (window.location.pathname.includes('/render/')) {
			const artboardID = this.props.artboardID;
			if (this.state.artboardID !== artboardID) {
				this.refreshData();
				return (null);
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
						{(window.location.pathname.includes('/render/'))
							? this.state.artboards.map((artboard, i)=> {
								return (
									<ArtboardTreeItem
										key={artboard.id}
										title={artboard.title}
										description=""
										slices={artboard.slices}
										selected={artboard.selected}
										onClick={()=> this.handleNavItem('artboard', artboard.id)}
										onSliceClick={(id)=> this.handleNavItem('slice', id)} />
								);
							})
							: this.state.pages.map((item, i, arr) => {
								return (
									<PageTreeItem
										key={i}
										title={item.title}
										description={item.description}
										selected={item.selected}
										onClick={()=> this.handleNavItem('page', item.id)} />
								);
							})
						}
					</div>
					<div className="side-nav-bottom-wrapper">
						{(typeof cookie.load('user_id') !== 'undefined')
							? <div className="nav-link" onClick={() => this.props.onLogout()}>Logout</div>
							: <div className="nav-link" onClick={() => this.props.onRegister()}>Sign Up / Sign In</div>
						}
						<div className="nav-link"><a href="https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA" target="_blank" rel="noopener noreferrer">Slack</a></div>
						<div className="nav-link"><a href="https://spectrum.chat/designengine" target="_blank" rel="noopener noreferrer">Spectrum</a></div>
						<div className="nav-link"><a href={'/mission'}>Mission</a></div>
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
