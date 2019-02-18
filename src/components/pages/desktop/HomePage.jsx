
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { connect } from 'react-redux';

import BaseDesktopPage from './BaseDesktopPage';
import ArtboardGrid from '../../elements/ArtboardGrid';
import UploadHeader from '../../elements/UploadHeader';
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
		if (!this.state.firstFetch && this.props.profile && artboards.length === 0) {
			this.setState({ firstFetch : true });
			this.onLoadNextUploads();
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
		formData.append('action', 'USER_UPLOADS');
		formData.append('user_id', profile.id);
		formData.append('offset', loadOffset);
		formData.append('length', loadAmt);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
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
					pages        : upload.pages.map((page)=> ({
						id          : page.id,
						uploadID    : page.upload_id,
						title       : page.title,
						description : page.description,
						added       : page.added,
						selected    : false,
						artboards   : page.artboards.map((artboard)=> ({
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
					return (upload.pages.pop().artboards.pop());
				});

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
// 		console.log('HomePage.render()', this.props, this.state);

		const { profile, artboards } = this.props;
		const { fetching, dialog } = this.state;

		const gridTitle = (profile) ? (fetching) ? 'Loading…' : (artboards.length > 0) ? 'Previous' : null : null;

		return (
			<BaseDesktopPage className="home-page-wrapper">
				<UploadHeader
					title="Upload any design file for interface specs"
					subtitle="Drag, drop, or click to upload."
					uploading={false}
					dialog={dialog}
					onFile={this.handleFile}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />

				<div className="home-page-section-header-wrapper">
					<h1>Free specs, parts, & code to engineer pixel-perfect  interfaces.</h1>
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
