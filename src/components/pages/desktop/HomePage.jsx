
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { connect } from 'react-redux';

import BaseDesktopPage from './BaseDesktopPage';
import ArtboardGrid from '../../elements/ArtboardGrid';
import UploadHeader from '../../elements/UploadHeader';

import homeContent from '../../../assets/json/home-content';
import { addFileUpload, appendHomeArtboards } from '../../../redux/actions';
import { isUserLoggedIn } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';


const mapStateToProps = (state, ownProps)=> {
	return ({
		artboards : state.homeArtboards,
		deeplink  : state.deeplink,
		profile   : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		addFileUpload       : (file)=> dispatch(addFileUpload(file)),
		appendHomeArtboards : (artboards)=> dispatch(appendHomeArtboards(artboards))
	});
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			section     : null,
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
			this.onLoadNextUploads();
		}
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
// 		console.log('HomePage.shouldComponentUpdate()', this.props, nextProps);
		return (true);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('HomePage.componentDidUpdate()', prevProps, this.props);

		const { artboards } = this.props;
		const { section } = this.state;

		if (!this.state.firstFetch && this.props.profile && artboards.length === 0) {
			this.setState({ firstFetch : true });
			this.onLoadNextUploads();
		}

		if (window.location.pathname.substr(1).split('/').shift() !== section) {
			this.setState({ section : window.location.pathname.substr(1).split('/').shift() });
		}
	}

	handleArtboardClicked = (artboard)=> {
		console.log('HomePage.handleArtboardClicked()', artboard);

		trackEvent('artboard', 'click');
		this.props.onArtboardClicked(artboard)
	};

	handleFile = (file)=> {
// 		console.log('HomePage.handleFile()', file);

		this.props.addFileUpload(file);
		this.props.onPage(`new${window.location.pathname}`);
	};

	handleLogin = ()=> {
// 		console.log('HomePage.handleLogin()');

		trackEvent('button', 'login');
		this.props.onPage('login');
	};

	handleRegister = ()=> {
// 		console.log('HomePage.handleRegister()');

		trackEvent('button', 'register');
		this.props.onPage('register');
	};

	handleUploadClick = ()=> {
// 		console.log('HomePage.handleUploadClick()');

		trackEvent('button', 'upload');
		setTimeout(()=> {
			this.setState({ dialog : false });
		}, 3333);

		this.setState({ dialog : true });
	};

	onLoadNextUploads = ()=> {
// 		console.log('HomePage.onLoadNextUploads()', this.props.artboards);

		const { profile } = this.props;
		const { loadOffset, loadAmt } = this.state;
		this.setState({ fetching : true });

		let formData = new FormData();
		formData.append('action', 'HOME_ARTBOARDS');
		formData.append('user_id', profile.id);
		formData.append('offset', loadOffset);
		formData.append('length', loadAmt);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('HOME_ARTBOARDS', response.data);

				const artboards = response.data.artboards.filter((artboard)=> (artboard)).map((artboard)=> ({
					id        : artboard.id << 0,
					pageID    : artboard.page_id << 0,
					uploadID  : artboard.upload_id << 0,
					title     : artboard.page_title,
					pageTitle : artboard.title,
					filename  : artboard.filename,
					creator   : artboard.creator,
					meta      : JSON.parse(artboard.meta),
					added     : artboard.added,
					selected  : false
				}));

				this.setState({
					fetching   : false,
					loadOffset : artboards.length
				});

				if (artboards.length > 0) {
					this.props.appendHomeArtboards(artboards);
				}
			}).catch((error)=> {
		});
	};


	render() {

// 		const ellipsis = Array((DateTimes.epoch(() % 4) + 1).join('.');
// 		console.log('HomePage.render()', this.props, this.state);

		const { profile, artboards } = this.props;
		const { section, fetching, dialog } = this.state;

		const gridTitle = (profile) ? (fetching) ? `Loading${'…'}` : (artboards.length > 0) ? 'Previous' : 'N/A' : 'N/A';

		return (
			<BaseDesktopPage className="home-page-wrapper">
				<UploadHeader
					title={(section) ? homeContent[section].header.title : 'Upload a design file'}
					subtitle={(section) ? homeContent[section].header.subtitle : 'Drag, drop, or click to upload.'}
					uploading={false}
					dialog={dialog}
					onFile={this.handleFile}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />

				<div className="home-page-section-header-wrapper">
					<h1>{(section) ? homeContent[section].body.title : 'Free code, specs, & parts to implement pixel-perfect design.'}</h1>
					{(isUserLoggedIn())
						? (<>
							<button className="long-button" onClick={()=> this.handleUploadClick()}>Upload</button>
						</>)
						: (<>
							<button className="long-button stack-button" onClick={()=> this.handleRegister()}>Sign Up</button>
							<button className="long-button" onClick={()=> this.handleLogin()}>Login</button>
						</>)
					}
				</div>

				{(isUserLoggedIn()) && (<ArtboardGrid
					title={gridTitle}
					artboards={artboards}
					onClick={this.handleArtboardClicked}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />)}
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
