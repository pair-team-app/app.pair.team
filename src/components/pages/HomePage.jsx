
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { connect } from 'react-redux';

import ArtboardGrid from '../elements/ArtboardGrid';
import UploadHeader from '../elements/UploadHeader';
import { addFileUpload, appendHomeArtboards, updateNavigation } from '../../redux/actions';
import { isUserLoggedIn } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';


const mapStateToProps = (state, ownProps)=> {
	return ({
		artboards  : state.homeArtboards,
		navigation : state.navigation,
		profile    : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		addFileUpload       : (file)=> dispatch(addFileUpload(file)),
		appendHomeArtboards : (artboards)=> dispatch(appendHomeArtboards(artboards)),
		updateNavigation    : (navIDs)=> dispatch(updateNavigation(navIDs))
	});
};


const LoggedInSectionHeader = (props)=> {
// 	console.log('HomePage.LoggedInSectionHeader()', props);

	const { title, content } = props;
	return (<div className="home-page-section-header-wrapper">
		<h3>{title}</h3>
		<h4>{content}</h4>
		<div>
			{/*<button onClick={()=> {trackEvent('button', 'upload'); props.onPage(`new${window.location.pathname}`)}}>Upload</button>*/}
			<button onClick={()=> {trackEvent('button', 'upload'); props.onUpload()}}>Upload</button>
		</div>
	</div>);
};

const LoggedOutSectionHeader = (props)=> {
// 	console.log('HomePage.LoggedOutSectionHeader()', props);

	const { title, content } = props;
	return (<div className="home-page-section-header-wrapper">
		<h3>{title}</h3>
		<h4>{content}</h4>
		<div>
			<button className="adjacent-button" onClick={()=> {trackEvent('button', 'register'); props.onPage('register')}}>Sign Up</button>
			<button onClick={()=> {trackEvent('button', 'login'); props.onPage('login')}}>Login</button>
		</div>
	</div>);
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			firstFetch  : false,
			fetching    : false,
			loadOffset  : 0,
			loadAmt     : -1,
			dialog      : false
		};
	}

	componentDidMount() {
// 		console.log('HomePage.componentDidMount()', this.props);

		if (this.props.profile && this.props.artboards.length === 0) {
			this.handleLoadNextUploads();
		}
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
// 		console.log('HomePage.shouldComponentUpdate()', this.props, nextProps);
		return (true);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('HomePage.componentDidUpdate()', prevProps, this.props);

		const { artboards } = this.props;
		if (!this.state.firstFetch && this.props.profile && artboards.length === 0) {
			this.setState({ firstFetch : true });
			this.handleLoadNextUploads();
		}
	}

	handleFile = (file)=> {
// 		console.log('HomePage.handleFile()', file);
		this.props.addFileUpload(file);
		this.props.onPage(`new${window.location.pathname}`);
	};

	handleLoadNextUploads = ()=> {
// 		console.log('HomePage.handleLoadNextUploads()', this.props.artboards);

		const { profile } = this.props;
		const { loadOffset, loadAmt } = this.state;
		this.setState({ fetching : true });

		let formData = new FormData();
		formData.append('action', 'USER_UPLOADS');
		formData.append('user_id', profile.id);
		formData.append('offset', loadOffset);
		formData.append('length', loadAmt);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('USER_UPLOADS', response.data);

				const uploads = response.data.uploads.map((upload)=> ({
					id           : upload.id,
					title        : upload.title,
					description  : upload.description,
					totals       : upload.totals,
					added        : upload.added,
					selected     : false,
					fonts        : upload.fonts.map((font)=> ({
						id     : font.id,
						family : font.family,
						style  : font.style,
						added  : font.added
					})),
					colors       : upload.colors.map((color)=> ({
						id    : color.id,
						hex   : color.hex_val,
						added : color.added
					})),
					symbols      : upload.fonts.map((symbol)=> ({
						id    : symbol.id,
						uuid  : symbol.uuid,
						title : symbol.title,
						added : symbol.added
					})),
					contributors : upload.contributors.map((contributor)=> ({
						id     : contributor.id,
						title  : contributor.username,
						avatar : contributor.avatar
					})),
					pages        : upload.pages.map((page) => ({
						id          : page.id,
						uploadID    : page.upload_id,
						title       : page.title,
						description : page.description,
						added       : page.added,
						selected    : false,
						artboards   : page.artboards.map((artboard) => ({
							id        : artboard.id,
							pageID    : artboard.page_id,
							uploadID  : artboard.upload_id,
							title     : upload.title,
							pageTitle : artboard.page_title,
							filename  : artboard.filename,
							creator   : artboard.creator,
							meta      : JSON.parse(artboard.meta),
							added     : artboard.added,
							selected  : false
						}))
					}))
				}));

				const artboards = uploads.filter((upload)=> (upload.pages.length > 0)).map((upload)=> {
					return (upload.pages.shift().artboards.shift());
				});

				this.setState({
					fetching   : false,
					loadOffset : artboards.length
				});

				if (artboards.length > 0) {
					this.props.appendHomeArtboards(artboards);
				}
			}).catch((error) => {
		});
	};

	handleUploadClick = ()=> {
// 		console.log('HomePage.handleUploadClick()');

		setTimeout(()=> {
			this.setState({ dialog : false });
		}, 3333);

		this.setState({ dialog : true });
	};


	render() {
		console.log('HomePage.render()', this.props, this.state);

		const { profile, artboards } = this.props;
		const { fetching, dialog } = this.state;

		const { pathname } = window.location;
		const uploadTitle = (pathname === '/' || pathname === '/inspect') ? 'Drag & Drop any Sketch file here to inspect design specs & code.' : (pathname === '/parts') ? 'Drag & Drop any Sketch file here to download design parts & source.' : 'Turn any Sketch file into an organized System of Fonts, Colors, Symbols, Views &amp; more. (Drag & Drop)';
		const sectionTitle = (pathname === '/' || pathname === '/inspect') ? (isUserLoggedIn()) ? 'Do you need specs & code from a design file?' : 'Sign Up for Design Engine' : (pathname === '/parts') ? (isUserLoggedIn()) ? 'Do you need parts & source from a design file?' : 'Sign Up for Design Engine' : 'Start a new Design Project';
		const sectionContent = (pathname === '/' || pathname === '/inspect') ? (isUserLoggedIn()) ? 'Upload any Sketch file to Design Engine to inspect specifications & code.' : 'Design Engine is a design platform built for engineers inspired by the way you work.' : (pathname === '/parts') ? (isUserLoggedIn()) ? 'Upload any Sketch file to Design Engine to export design parts & source.' : 'Design Engine is a design platform built for engineers inspired by the way you work.' : 'Turn any Design File into an organized System of Fonts, Colors, Symbols, Views & More.';
		const gridTitle = (profile) ? (fetching) ? 'Loading…' : (artboards.length > 0) ? `Showing ${artboards.length} project${((artboards.length === 1) ? '' : 's')}.` : null : null;

		return (
			<div className="page-wrapper home-page-wrapper">
				<UploadHeader title={uploadTitle} dialog={dialog} onFile={this.handleFile} onPopup={this.props.onPopup} />

				{(isUserLoggedIn())
					? (<LoggedInSectionHeader title={sectionTitle} content={sectionContent} onUpload={()=> this.handleUploadClick()} />)
					: (<LoggedOutSectionHeader title={sectionTitle} content={sectionContent} onPage={this.props.onPage} />)
				}

				<ArtboardGrid
					title={gridTitle}
					artboards={artboards}
					onClick={(artboard)=> {trackEvent('artboard', 'click'); this.props.onArtboardClicked(artboard)}}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
