
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import qs from 'qs';

import BasePage from '../BasePage';
import { API_ENDPT_URL, Modals, Pages } from '../../../consts/uris';
import { Bits, Strings } from '../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';

import homePageElement from '../../../assets/images/elements/element-home-page.png';


const HomePageHeaderForm = (props)=> {
	const { email } = props;
	const emailValid = Strings.isEmail(email) || email.includes('!');

	return (<div className="home-page-header-form">
		<h1>A new tool for product teams to<br />organize design</h1>
		<form onSubmit={props.onSubmit}>
			<div className={`input-wrapper${(!emailValid && email.length > 0) ? ' input-wrapper-error' : ''}`}>
				<input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={props.onFocus} onChange={props.onChange} />
			</div>
			<button disabled={!emailValid || email.includes('!')} type="submit" onClick={(event)=> props.onSubmit(event)}>Join Wait List</button>
		</form>
		<h5>By tapping “Join Wait List” you accept our<br />Terms of Service.</h5>
	</div>);
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email : ''
		};
	}

	componentDidMount() {
// 		console.log('HomePage.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('HomePage.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}


	handleGitHub = ()=> {
		console.log('HomePage.handleGitHub()');
		trackEvent('button', 'github');

		this.props.onModal(Modals.GITHUB_CONNECT);
	};

	handleTextfieldChange = (event)=> {
// 		console.log('HomePage.handleTextfieldChange()', event);
		this.setState({
			[event.target.name] : event.target.value,
		});
	};

	handleTextfieldFocus = (event)=> {
// 		console.log('HomePage.handleTextfieldFocus()', event);

		this.setState({
			[event.target.name]           : '',
			[`${event.target.name}Valid`] : true
		});
	};

	handleSubmit = (event)=> {
		console.log('HomePage.handleSubmit()');
		event.preventDefault();

		trackEvent('button', 'register');

		const { email } = this.state;
		if (Strings.isEmail(email)) {
			axios.post(API_ENDPT_URL, qs.stringify({ email,
				action    : 'REGISTER',
				username  : email,
				password  : '',
				type      : 'early_access'
			})).then((response) => {
				console.log('REGISTER', response.data);
				const status = parseInt(response.data.status, 16);
// 					console.log('status', status, Bits.contains(status, 0x01), Bits.contains(status, 0x10));

				if (status === 0x11) {
					this.props.onRegistered(response.data.user);
					this.props.onPage(Pages.THANK_YOU);

					this.setState({
						email    : '',
						password : '',
						passMsg  : ''
					});

				} else {
					this.setState({
						email         : Bits.contains(status, 0x10) ? email : 'Email Address Already in Use',
						password      : '',
						emailValid    : Bits.contains(status, 0x10)
					});
				}
			}).catch((error)=> {
			});

		} else {
			this.setState({ email : 'Invalid Email Address' });
		}
	};

	render() {
// 		console.log('HomePage.render()', this.props, this.state);

		const { email } = this.state;

		return (
			<BasePage className="home-page-wrapper">

					<HomePageHeaderForm
						email={email}
						onChange={this.handleTextfieldChange}
						onFocus={this.handleTextfieldFocus}
						onSubmit={this.handleSubmit}
					/>

					<div className="home-page-content">
						<img src={homePageElement} className="home-page-element" alt="Screen shot" />
					</div>




					{/*<PageHeader title="Design Engine turns code components into design components.">*/}
						{/*{(URIs.firstComponent() === '' || URIs.firstComponent() === 'register') && (<HomePageHeaderForm*/}
							{/*email={email}*/}
							{/*emailValid={emailValid}*/}
							{/*onChange={this.handleTextfieldChange}*/}
							{/*onFocus={this.handleTextfieldFocus}*/}
							{/*onSubmit={this.handleSubmit}*/}
						{/*/>)}*/}

						{/*{(URIs.firstComponent() === 'thank-you') && (<HomePageHeaderForm*/}
							{/*email="Thank you for signing up!"*/}
							{/*emailValid={true}*/}
							{/*onChange={(e)=> null}*/}
							{/*onFocus={(e)=> null}*/}
							{/*onSubmit={(e)=> null}*/}
						{/*/>)}*/}

						{/*<BottomNav*/}
							{/*mobileLayout={false}*/}
							{/*onModal={this.handleGitHub}*/}
							{/*onPage={this.props.onPage}*/}
						{/*/>*/}
					{/*</PageHeader>*/}


				{/*<div className="home-page-content">*/}
					{/*<BaseSection>*/}
						{/*<h1 className="section-title section-title-red" style={headerStyle}>What is Design Engine?</h1>*/}
						{/*<h2 className="section-text" style={contentStyle}>Design Engine allows for product teams to capture, distribute, and collaborate on Design Systems.</h2>*/}
						{/*<BottomNav*/}
							{/*mobileLayout={false}*/}
							{/*onModal={this.handleGitHub}*/}
							{/*onPage={this.props.onPage}*/}
						{/*/>*/}
					{/*</BaseSection>*/}
				{/*</div>*/}

				{/*<div className="home-page-content">*/}
					{/*<BaseSection>*/}
						{/*<h1 className="section-title section-title-blue" style={headerStyle}>How does it work?</h1>*/}
						{/*<h2 className="section-text" style={contentStyle}>Design Engine works by using a virtual browser (chromium) to crawl and deliver interface design assets directly to your design team.</h2>*/}
						{/*<BottomNav*/}
							{/*mobileLayout={false}*/}
							{/*onModal={this.handleGitHub}*/}
							{/*onPage={this.props.onPage}*/}
						{/*/>*/}
					{/*</BaseSection>*/}
				{/*</div>*/}

				{/*<div className="home-page-content">*/}
					{/*<BaseSection>*/}
						{/*<h1 className="section-title section-title-fit section-title-red" style={headerStyle}>Who built Design Engine?</h1>*/}
						{/*<div className="home-page-creator-wrapper">*/}
							{/*<div className="home-page-creator-logo-wrapper">*/}
								{/*<img className="home-page-creator-logo" src={deLogoLeft} alt="Logo" />*/}
								{/*<img className="home-page-creator-logo home-page-creator-logo-adjacent" src={deLogoRight} alt="Logo" />*/}
							{/*</div>*/}
							{/*<h2 className="home-page-creator" style={contentStyle}>Design Engine was built by <a href="https://www.linkedin.com/in/jasonfesta/" target="_blank" rel="noopener noreferrer">Jason Festa</a> & <a href="https://www.linkedin.com/in/gullinbursti/" target="_blank" rel="noopener noreferrer">Matt Holcombe</a> during their time at <a href="https://medium.com/adobetech/the-xd-plugin-accelerator-meet-the-teams-f9a07a866ae0" target="_blank" rel="noopener noreferrer">Adobe's Plugin Accelerator</a>.</h2>*/}
						{/*</div>*/}
						{/*<BottomNav*/}
							{/*mobileLayout={false}*/}
							{/*onModal={this.handleGitHub}*/}
							{/*onPage={this.props.onPage}*/}
						{/*/>*/}
					{/*</BaseSection>*/}
				{/*</div>*/}
			</BasePage>
		);
	}
}


export default HomePage;
