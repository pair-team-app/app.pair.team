
import React, { Component } from 'react';
import './HomePage.css';

import { connect } from 'react-redux';

import BaseDesktopPage from '../BaseDesktopPage';
import ArtboardGrid from './ArtboardGrid';
import UploadHeader from '../../../navs/UploadHeader';

import { Modals } from '../../../../consts/uris';
import { addFileUpload } from '../../../../redux/actions';
import { Strings, URIs } from '../../../../utils/lang';
import { trackEvent } from '../../../../utils/tracking';


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
		if (section !== URIs.lastComponent()) {
			this.setState({ section : URIs.lastComponent() });
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
		this.props.onPage(`new/${URIs.lastComponent()}`);
	};

	handleGitHub = ()=> {
//		console.log('HomePage.handleGitHub()');

		trackEvent('button', 'github');
		this.props.onModal(Modals.GITHUB_CONNECT);
	};

	handleLogin = ()=> {
// 		console.log('HomePage.handleLogin()');

		trackEvent('button', 'login');
		this.props.onModal(Modals.LOGIN);
	};

	handleRegister = ()=> {
// 		console.log('HomePage.handleRegister()');

		trackEvent('button', 'register');
		this.props.onModal(Modals.REGISTER);
	};

	handleUploadClick = ()=> {
// 		console.log('HomePage.handleUploadClick()');

		trackEvent('button', 'upload');
		this.props.onPage('/new');

// 		setTimeout(()=> {
// 			this.setState({ fileDialog : false });
// 		}, 3333);
//
// 		this.setState({ fileDialog : true });
	};


	render() {
// 		console.log('HomePage.render()', this.props, this.state);

		const { profile, artboards } = this.props;
		const { fileDialog } = this.state;
		const gridTitle = (profile) ? `${(URIs.subdomain()) ? `Team ${Strings.capitalize(URIs.subdomain())}` : `History`} (${artboards.length})` : 'N/A';

		return (
			<BaseDesktopPage className="home-page-wrapper">
				<UploadHeader
					section={URIs.lastComponent()}
					title={`${(URIs.lastComponent().includes('edit')) ? 'Upload a design file to Edit' : `Upload any design for Free ${Strings.capitalize(window.location.pathname.split('/').slice(-1).pop())}`}`}
					subtitle="Drag & drop any design file here"
					uploading={false}
					fileDialog={fileDialog}
					onFile={this.handleFile}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />

				<ArtboardGrid
					title={gridTitle}
					artboards={artboards}
					onClick={this.handleArtboardClicked}
					onUpload={this.handleUploadClick}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup}
				/>
			</BaseDesktopPage>
		);
	}
}


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


export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
