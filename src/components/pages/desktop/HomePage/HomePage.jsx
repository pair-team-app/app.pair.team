
import React, { Component } from 'react';
import './HomePage.css';

import { connect } from 'react-redux';

import BaseDesktopPage from '../BaseDesktopPage';
import ArtboardGrid from './ArtboardGrid';
import UploadHeader from '../../../navs/UploadHeader';

import { INSPECT } from '../../../../consts/uris';
import { addFileUpload } from '../../../../redux/actions';
import {  URLs } from '../../../../utils/lang';
import { isUserLoggedIn } from '../../../../utils/funcs';
import { trackEvent } from '../../../../utils/tracking';
import homeContent from '../../../../assets/json/home-content';

const mapStateToProps = (state, ownProps)=> {
	return ({
		artboards : state.homeArtboards,
		profile   : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		addFileUpload : (file)=> dispatch(addFileUpload(file))
	});
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			section    : null,
			fetching   : false,
			fileDialog : false
		};
	}

	componentDidMount() {
// 		console.log('HomePage.componentDidMount()', this.props);
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
// 		console.log('HomePage.shouldComponentUpdate()', this.props, nextProps);
		return (true);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('HomePage.componentDidUpdate()', prevProps, this.props);

		const { section } = this.state;
		if (section !== URLs.firstComponent()) {
			this.setState({ section : URLs.firstComponent() });
		}
	}

	handleArtboardClicked = (artboard)=> {
// 		console.log('HomePage.handleArtboardClicked()', artboard);

		trackEvent('artboard', 'click');
		this.props.onArtboardClicked(artboard)
	};

	handleFile = (file)=> {
// 		console.log('HomePage.handleFile()', file);

		const { section } = this.state;

		this.props.addFileUpload(file);
		this.props.onPage(`new/${(section || INSPECT.substr(1))}`);
	};

	handleGitHub = ()=> {
		console.log('HomePage.handleGitHub()');

		trackEvent('button', 'github');
		this.props.onModal('/github-connect');
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
			this.setState({ fileDialog : false });
		}, 3333);

		this.setState({ fileDialog : true });
	};


	render() {
// 		console.log('HomePage.render()', this.props, this.state);

		const { profile, artboards } = this.props;
		const { section, fetching, fileDialog } = this.state;
		const gridTitle = (profile) ? (fetching) ? `Loading${'…'}` : (artboards.length > 0) ? (URLs.subdomain()) ? `Team ${URLs.subdomain()}` : 'Previous' : 'N/A' : 'N/A';

		return (
			<BaseDesktopPage className="home-page-wrapper">
				<UploadHeader
					title={(section) ? homeContent[section].header.title : 'Upload a design file'}
					subtitle={(section) ? homeContent[section].header.subtitle : 'Drag, drop, or click to upload.'}
					uploading={false}
					fileDialog={fileDialog}
					onFile={this.handleFile}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />

				<div className="home-page-section-header-wrapper">
					<h1>{(section) ? homeContent[section].body.title : 'Free code, specs, & parts to implement pixel-perfect design.'}</h1>
					{(isUserLoggedIn())
						? (<button className="long-button" onClick={()=> this.handleUploadClick()}>Upload</button>)
						: (<>
								<div className="home-page-button-wrapper">
									<button className="long-button adjacent-button" onClick={()=> this.handleRegister()}>Sign Up</button>
									<button className="long-button aux-button" onClick={()=> this.handleGitHub()}>Connect to GitHub</button>
								</div>
								<button className="long-button" onClick={()=> this.handleLogin()}>Login</button>
						</>)
					}
				</div>

				<ArtboardGrid
					title={gridTitle}
					artboards={artboards}
					onClick={this.handleArtboardClicked}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup}
				/>
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
