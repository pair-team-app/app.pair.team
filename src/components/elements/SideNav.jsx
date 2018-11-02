
import React, { Component } from 'react';
import './SideNav.css'

import axios from 'axios';
import cookie from 'react-cookies';

import ArtboardTreeItem from '../iterables/ArtboardTreeItem';
import PageTreeItem from '../iterables/PageTreeItem';
import SideNavBack from './SideNavBack';

class SideNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageID     : this.props.pageID,
			artboardID : this.props.artboardID,
			sliceID    : this.props.sliceID,
			pages      : [],
			artboards  : [],
			treeMenu   : [],
			collapsedBookkeeping: []
		};
	}

	componentDidMount() {
		console.log('SideNav.componentDidMount()', this.state);
		this.refreshData();
	}

	componentDidUpdate(prevProps) {
		console.log("SideNav.componentDidUpdate()", this.props, prevProps);
		if (window.location.pathname.includes('/render/')) {
			if (this.props.pageID !== prevProps.pageID && this.props.artboardID !== prevProps.artboardID) {
				const { pageID, artboardID, sliceID } = this.props;

				this.setState({
					pageID     : pageID,
					artboardID : artboardID,
					sliceID    : sliceID
				});

				this.refreshData();
				return (null);
			}
		}
	}

	handleNavItem = (type, id) => {
		console.log('handleNavItem()', type, id);

		if (type === 'top') {
			let pages = [...this.state.pages];
			pages.forEach((page)=> {
				page.selected = false;
			});
			this.setState({ pageID : -1 });
			this.props.onTop();

		} else if (type === 'page') {
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

			this.setState({
				pageID : id,
				pages : pages
			});
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

			this.setState({
				pageID     : artboard.pageID,
				artboardID : id,
				artboards  : artboards
			});

			this.props.onArtboardItem(artboard);

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

	refreshData = ()=> {
		if (typeof cookie.load('user_id') !== 'undefined') {
			if (window.location.pathname.includes('/render/')) {
				const { pageID, artboardID } = this.props;

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
									type     : item.type,
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
								comments  : artboard.comments,
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
										type     : item.type,
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
									selected  : false
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
		console.log('SideNav.render()', this.state);

		return (
			<div className="side-nav-wrapper">
				<div className="side-nav-link-wrapper">
					<div className="side-nav-top-wrapper">
						<button className="side-nav-invite-button" onClick={()=> this.props.onInvite()}>Invite Team Members</button>
						{(typeof cookie.load('user_id') !== 'undefined') && (<div>
							{(window.location.pathname === '/' && this.state.pageID !== -1) && (<div className="nav-link" onClick={()=> this.handleNavItem('top', 0)}>Top Views</div>)}
							{(window.location.pathname === '/' && this.state.pageID === -1) && (<div className="nav-link page-tree-item-text-selected" onClick={()=> this.handleNavItem('top', 0)}><img className="artboard-tree-item-arrow" src="/images/chevron-right.svg" alt="chevron" />Top Views</div>)}
						</div>)}
						{(window.location.pathname !== '/') && (<SideNavBack onClick={()=> this.props.onBack()} />)}
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
							: (window.location.pathname === '/') && (this.state.pages.map((item, i, arr) => {
								return (
									<PageTreeItem
										key={i}
										title={item.title}
										description={item.description}
										selected={item.selected}
										onClick={()=> this.handleNavItem('page', item.id)} />
								);
							}))
						}
					</div>
					<div className="side-nav-bottom-wrapper">
						{(cookie.load('user_id') !== '0')
							? <div className="nav-link" onClick={() => this.props.onLogout()}>Logout</div>
							: <div className="nav-link" onClick={() => this.props.onRegister()}>Sign Up / Sign In</div>
						}
						<div className="nav-link"><a href="https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA" target="_blank" rel="noopener noreferrer">Slack</a></div>
						<div className="nav-link"><a href="https://spectrum.chat/designengine" target="_blank" rel="noopener noreferrer">Spectrum</a></div>
						<div className="nav-link"><a href={'/mission'}>Mission</a></div>
						<div className="nav-link"><a href={'/terms'}>Terms of Service</a></div>
						<div className="nav-link"><a href={'/privacy'}>Privacy Policy</a></div>
						<div className="copyright">&copy; {(new Date().getFullYear() + 1)} Design Engine AI, Inc.</div>
					</div>
				</div>
			</div>
		);
	}
}

export default SideNav;
