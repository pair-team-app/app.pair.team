
import React, { Component } from 'react';
import './SideNav.css'

import axios from 'axios';
import cookie from 'react-cookies';

import UploadTreeItem from '../iterables/UploadTreeItem';

const wrapper = React.createRef();

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
		this.refreshData();
	}

	componentDidUpdate(prevProps) {
		console.log('SideNav.componentDidUpdate()', prevProps, this.props);
		if (window.location.pathname.includes('/artboard/')) {
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

	handleUploadClick = (upload)=> {
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

		this.setState({
			uploads : uploads,
			pages   : upload.pages
		});

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

		this.setState({
			pageID    : page.id,
			pages     : pages,
			artboards : page.artboards
		});
		this.props.onPageItem(page);
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

	handleTop = () => {
		let pages = [...this.state.pages];
		pages.forEach((page)=> {
			page.selected = false;
		});
		this.setState({ pageID : -1 });
		this.props.onTop();
	};

	refreshData = ()=> {
		let formData = new FormData();
		formData.append('action', 'UPLOADS');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOADS', response.data);

				const uploads =response.data.uploads.map((upload)=> ({
					id       : upload.id,
					title    : upload.title,
					author   : upload.author,
					pages    : upload.pages.map((page) => ({
						id          : page.id,
						title       : page.title,
						description : page.description,
						artboards   : page.artboards.map((artboard)=> ({
							id        : artboard.id,
							pageID    : artboard.page_id,
							title     : artboard.title,
							filename  : artboard.filename,
							meta      : JSON.parse(artboard.meta),
							added     : artboard.added,
							slices    : artboard.slices.map((slice)=> ({
								id       : slice.id,
								title    : slice.title,
								type     : slice.type,
								filename : slice.filename + '@1x.png',
								meta     : JSON.parse(slice.meta),
								added    : slice.added,
								selected : false
							})),
							selected  : (this.props.artboardID === artboard.id)
						})),
						added       : page.added,
						selected    : (this.props.pageID === page.id)
					})),
					added    : upload.added,
					selected : (this.props.uploadID === upload.id)
				}));

				this.setState({ uploads : uploads });
			}).catch((error) => {
		});
	};

	render() {
		console.log('SideNav.render()', this.state);
		return (
			<div className="side-nav-wrapper" ref={wrapper}>
				<div className="side-nav-link-wrapper">
					<div className="side-nav-top-wrapper">
						<button className="side-nav-invite-button" onClick={()=> this.props.onInvite()}>Invite Team Members</button>
						{(window.location.pathname === '/' && this.state.pageID === -1) && (<div className="nav-link page-tree-item-text-selected" onClick={()=> this.handleTop()}><img className="artboard-tree-item-arrow" src="/images/chevron-right.svg" alt="chevron" />Top Views</div>)}
						{this.state.uploads.map((upload, i, arr) => {
							return (
								<UploadTreeItem
									key={i}
									title={(upload.title.length > 45) ? (upload.title.substring(0, 44) + '…') : upload.title}
									author={upload.author}
									pages={upload.pages}
									selected={upload.selected}
									onClick={()=> this.handleUploadClick(upload)}
									onPageClick={(page)=> this.handlePageClick(page)}
									onArtboardClick={(artboard)=> this.handleArtboardClick(artboard)} />
							);
						})}
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
