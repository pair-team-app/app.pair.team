
import React, { Component } from 'react';
import './HomePage.css';

import { Column } from 'simple-flexbox';

import BaseDesktopPage from '../BaseDesktopPage';
import PageHeader from '../../sections/PageHeader';
import { trackEvent } from '../../../utils/tracking';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';


const HomePageHeader = (props)=> {
	console.log('HomePage.HomePageHeader()', props);

	const { title } = props;

	return (<div className="home-page-header"><Column horizontal="center">
		<img className="home-page-header-logo" src={deLogo} alt="Logo" />
		<h1 className="page-header-title home-page-header-title">{title}</h1>
		<div className="home-page-header-button-wrapper">
			<button className="adjacent-button" onClick={props.onGetStartedClick}>Get Started</button>
			<button onClick={props.onVideoClick}>Video</button>
		</div>
	</Column></div>);
};


const HomePageContent = (props)=> {
	console.log('HomePage.HomePageContent()', props);

	return (<div className="home-page-content">
		HOME PAGE CONTENT
	</div>);
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			fileDialog : false
		};
	}


	handleGetStarted = ()=> {
// 		console.log('HomePage.handleGetStarted()');

		trackEvent('button', 'get-started');
	};

	handleVideo = ()=> {
// 		console.log('HomePage.handleVideo()');

		trackEvent('button', 'video');
	};

	render() {
// 		console.log('HomePage.render()', this.props, this.state);

		return (
			<BaseDesktopPage className="home-page-wrapper">
				<PageHeader title="Move screen design forward with Design Engine" />
				<HomePageContent />
			</BaseDesktopPage>
		);
	}
}


export default HomePage;
