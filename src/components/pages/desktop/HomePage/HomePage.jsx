
import React, { Component } from 'react';
import './HomePage.css';

import { connect } from 'react-redux';

import BaseDesktopPage from '../BaseDesktopPage';
import ArtboardGrid from './ArtboardGrid';
import UploadHeader from '../../../navs/UploadHeader';

import { Modals, INSPECT } from '../../../../consts/uris';
import { addFileUpload } from '../../../../redux/actions';
import {  URIs } from '../../../../utils/lang';
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
		if (section !== URIs.firstComponent()) {
			this.setState({ section : URIs.firstComponent() });
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
		setTimeout(()=> {
			this.setState({ fileDialog : false });
		}, 3333);

		this.setState({ fileDialog : true });
	};


	render() {
// 		console.log('HomePage.render()', this.props, this.state);

		const { fileDialog } = this.state;
		return (
			<BaseDesktopPage className="home-page-wrapper">
				<UploadHeader
					title="Upload any design for Free Specs"
					subtitle="Drag & drop any design file here"
					uploading={false}
					fileDialog={fileDialog}
					onFile={this.handleFile}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
