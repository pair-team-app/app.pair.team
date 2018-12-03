
import React, { Component } from 'react';
import './SideNav.css'

import axios from 'axios';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import UploadTreeItem from '../iterables/UploadTreeItem';

const wrapper = React.createRef();
const scrollWrapper = React.createRef();

class SideNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			uploadID   : this.props.uploadID,
			pageID     : this.props.pageID,
			artboardID : this.props.artboardID,
			sliceID    : this.props.sliceID,
			uploads    : [],
			pages      : [],
			artboards  : []
		};
	}

	componentDidMount() {
		this.refreshUploads();
	}

	componentDidUpdate(prevProps) {
// 		console.log('SideNav.componentDidUpdate()', prevProps, this.props);
// 		if (this.props.uploadID === 0 && (prevProps.uploadID !== this.props.uploadID || prevProps.pageID !== this.props.pageID || prevProps.artboardID !== this.props.artboardID)) {
		if (prevProps.uploadID !== this.props.uploadID || prevProps.pageID !== this.props.pageID || prevProps.artboardID !== this.props.artboardID) {
			let self = this;
			let uploads = [...this.state.uploads];
			uploads.forEach((upload)=> {
				upload.selected = (upload.id === this.props.uploadID);
				upload.pages.forEach((page)=> {
					page.selected = (page.id === self.props.pageID);
					page.artboards.forEach((artboard)=> {
						artboard.selected = (artboard.id === self.props.artboardID);
					});
				});
			});

			this.setState({ uploads : uploads });
		}

		if (this.props.userID !== prevProps.userID) {
			this.refreshUploads();
		}


		if ((window.location.pathname.includes('/artboard/') || window.location.pathname.includes('/proj/')) && this.state.pages.length === 0) {
			let self = this;
			let uploads = [...this.state.uploads];
			uploads.forEach(function(upload, i) {
				if (upload.id === self.props.uploadID) {
					upload.selected = true;

					let formData = new FormData();
					formData.append('action', 'PAGE_NAMES');
					formData.append('upload_id', upload.id);
					axios.post('https://api.designengine.ai/system.php', formData)
						.then((response) => {
							console.log('PAGE_NAMES', response.data);

							const pages = response.data.pages.map((page) => ({
								id          : page.id,
								title       : page.title,
								description : page.description,
								total       : page.total,
								added       : page.added,
								selected    : (self.props.pageID === page.id),
								artboards   : page.artboards.map((artboard)=> ({
									id       : artboard.id,
									pageID   : artboard.page_id,
									title    : artboard.title,
									filename : artboard.filename,
									total    : artboard.total,
									meta     : JSON.parse(artboard.meta),
									added    : artboard.added,
									selected : (self.props.artboardID === artboard.id)
								}))
							}));

							upload.pages = pages;
							self.setState( { pages : pages });

							pages.forEach(function(page, i) {
								if (page.id === self.props.pageID) {
									let formData = new FormData();
									formData.append('action', 'ARTBOARD_NAMES');
									formData.append('page_id', self.props.pageID);
									axios.post('https://api.designengine.ai/system.php', formData)
										.then((response) => {
											//console.log('ARTBOARD_NAMES', response.data);

											const artboards = response.data.artboards.map((artboard) => ({
												id       : artboard.id,
												pageID   : artboard.page_id,
												title    : artboard.title,
												filename : artboard.filename,
												total    : artboard.total,
												meta     : JSON.parse(artboard.meta),
												added    : artboard.added,
												selected : (self.props.artboardID === artboard.id)
											}));

											page.artboards = artboards;

											self.setState({
												uploads   : uploads,
												pages     : pages,
												artboards : artboards
											});
										}).catch((error) => {
									});
								}
							});

						}).catch((error) => {
					});
				}
			});
		}
	}

	refreshUploads = ()=> {
		let formData = new FormData();
		formData.append('action', 'UPLOAD_NAMES');
		formData.append('user_id', (typeof cookie.load('user_id') !== 'undefined') ? cookie.load('user_id') : '0');
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_NAMES', response.data);

				const uploads = response.data.uploads.map((upload)=> ({
					id       : upload.id,
					title    : upload.title,
					author   : upload.author,
					total    : upload.total,
					added    : upload.added,
					selected : (this.props.uploadID === upload.id),
					pages    : upload.pages.map((page) => ({
						id          : page.id,
						title       : page.title,
						description : page.description,
						total       : page.total,
						added       : page.added,
						selected    : (this.props.pageID === page.id),
						artboards   : page.artboards.map((artboard)=> ({
							id       : artboard.id,
							pageID   : artboard.page_id,
							title    : artboard.title,
							filename : artboard.filename,
							total    : artboard.total,
							meta     : JSON.parse(artboard.meta),
							added    : artboard.added,
							selected : (this.props.artboardID === artboard.id)
						}))
					}))
				}));

				this.setState({ uploads : uploads });
			}).catch((error) => {
		});
	};

	handleUploadClick = (upload)=> {
		cookie.save('upload_id', upload.id, { path : '/' });

		let uploads = [...this.state.uploads];
		uploads.forEach(function(item, i) {
			if (item.id === upload.id) {
				item.selected = !item.selected;

			} else {
				item.selected = false;
				item.pages.forEach((page)=> {
					page.selected = false;
					page.artboards.forEach((artboard)=> {
						artboard.selected = false;
					});
				});
			}
		});

		if (upload.selected) {
			let formData = new FormData();
			formData.append('action', 'PAGE_NAMES');
			formData.append('upload_id', upload.id);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('PAGE_NAMES', response.data);

					const pages = response.data.pages.map((page) => ({
						id          : page.id,
						title       : page.title,
						description : page.description,
						total       : page.total,
						added       : page.added,
						selected    : (this.props.pageID === page.id),
						artboards   : page.artboards.map((artboard) => ({
							id       : artboard.id,
							pageID   : artboard.page_id,
							title    : artboard.title,
							filename : artboard.filename,
							total    : artboard.total,
							meta     : JSON.parse(artboard.meta),
							added    : artboard.added,
							selected : (this.props.artboardID === artboard.id)
						}))
					}));

					upload.pages = pages;

					this.setState({
						uploadID : upload.id,
						uploads  : uploads,
						pages    : pages
					});
				}).catch((error) => {
			});

		} else {
			this.setState({
				pages     : [],
				artboards : []
			});
		}

		wrapper.current.scrollTo(0, 0);
		this.props.onUploadItem(upload);
	};

	handlePageClick = (page)=> {
		let pages = [...this.state.pages];
		pages.forEach(function(item, i) {
			if (item.id === page.id) {
				item.selected = !item.selected;

			} else {
				item.selected = false;
			}
		});

		if (page.selected) {
			let formData = new FormData();
			formData.append('action', 'ARTBOARD_NAMES');
			formData.append('page_id', page.id);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					//console.log('ARTBOARD_NAMES', response.data);

					const artboards = response.data.artboards.map((artboard) => ({
						id       : artboard.id,
						pageID   : artboard.page_id,
						title    : artboard.title,
						filename : artboard.filename,
						total    : artboard.total,
						meta     : JSON.parse(artboard.meta),
						added    : artboard.added,
						selected : (this.props.artboardID === artboard.id)
					}));

					page.artboards = artboards;

					this.setState({
						pageID    : page.id,
						pages     : pages,
						artboards : artboards
					});
				}).catch((error) => {
			});

			this.props.onPageItem(page);

		} else {
			this.setState({ artboards : [] });
		}
	};

	handleArtboardClick = (artboard)=> {
		let artboards = [...this.state.artboards];
		artboards.forEach(function(item, i) {
			if (item.id === artboard.id) {
				item.selected = !item.selected;

			} else {
				item.selected = false;
			}
		});

		this.setState({
			artboardID : artboard.id,
			artboards  : artboards
		});

		this.props.onArtboardItem(artboard)
	};

	handleInvite = ()=> {
		cookie.save('msg', 'invite team members.', { path : '/' });
		this.props.onPage((cookie.load('user_id') !== '0') ? 'invite-team' : 'login');
	};

	handleUplaod = ()=> {
		cookie.save('msg', 'start a new project.', { path : '/' });
		this.props.onPage((cookie.load('user_id') === '0') ? 'login' : 'new');
	};

	render() {
		const { uploads } = this.state;
		//console.log('SideNav.render()', scrollHeight, (wrapper.current) ? wrapper.current.clientHeight : '');

		return (
			<div className="side-nav-wrapper" ref={wrapper}>
				<div className="side-nav-top-wrapper">
					{/*<button className="side-nav-invite-button" onClick={()=> this.handleInvite()}>Invite Team Members</button>*/}
					<h3 className="side-nav-header"><Row vertical="center" style={{width:'100%'}}>
						<Column flexGrow={1} horizontal="start">Projects</Column>
						<Column flexGrow={1} horizontal="end"><button className="side-nav-upload-button" onClick={()=> this.handleUplaod()}>New</button></Column>
					</Row></h3>
					<div className="side-nav-tree-wrapper" ref={scrollWrapper}>
						{uploads.map((upload, i) => {
							return (
								<UploadTreeItem
									key={i}
									title={upload.title}
									author={upload.author}
									pages={upload.pages}
									selected={upload.selected}
									onClick={()=> this.handleUploadClick(upload)}
									onPageClick={(page)=> this.handlePageClick(page)}
									onArtboardClick={(artboard)=> this.handleArtboardClick(artboard)} />
							);
						})}
					</div>
					<div className="side-nav-link" onClick={()=> this.props.onPage('explore')}>Explore More</div>
				</div>
				<div className="side-nav-team-wrapper">
					<h6>Your teams</h6>
					Team support coming soon. <span className="page-link" onClick={()=> window.open('https://github.com/de-ai/designengine.ai/projects/1')}>Roadmap</span>
				</div>
				<div className="side-nav-account-wrapper">
					<h6>Account</h6>
					{(cookie.load('user_id') !== '0') && (<div className="nav-link" onClick={() => this.props.onPage('profile')}>Profile</div>)}
					{(cookie.load('user_id') === '0') && (<div>
						<div className="nav-link" onClick={() => this.props.onPage('register')}>Sign Up</div>
						<div className="nav-link" onClick={() => this.props.onPage('login')}>Login</div>
					</div>)}

					{(cookie.load('user_id') !== '0') && (<div className="nav-link" onClick={() => this.props.onLogout()}>Sign Out</div>)}
				</div>
			</div>
		);
	}
}

export default SideNav;
