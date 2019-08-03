
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import qs from 'qs';
import { Element, Events, scroller, scrollSpy } from 'react-scroll';

import BasePage from '../BasePage';
import BaseSection from '../../sections/BaseSection';
import PageHeader from '../../sections/PageHeader';
import BottomNav from '../../sections/BottomNav';

import {
	API_ENDPT_URL,
	TWITTER_SOCIAL,
	INSTAGRAM_SOCIAL,
	SLACK_INVITE,
	Modals,
	Pages
} from '../../../consts/uris';
import { Bits, Strings, URIs } from '../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';

import deLogoLeft from '../../../assets/images/logos/logo-designengine_left.svg';
import deLogoRight from '../../../assets/images/logos/logo-designengine_right.svg';

const HomePageButtonSection = (props)=> {
	console.log('HomePage.HomePageButtonSection()', props);

	return (<div className="home-page-button-section">
		<button className="aux-button long-button stack-button" onClick={props.onGitHub}>Sign Up for Early Access with Github</button><br />
		<button className="long-button stack-button" onClick={props.onSignup}>Sign Up for Early Access with Email</button><br />
		<button className="long-button" onClick={props.onLogin}>Login</button>
	</div>);
};

const HomePageFormSection = (props)=> {
// 	console.log('HomePage.HomePageFormSection()', props);

	const { section, email, emailValid, password, passwordValid, passMsg } = props;
	return (<div className="home-page-form-section">
		<form onSubmit={props.onSubmit}>
			<div className={`input-wrapper${(!emailValid) ? ' input-wrapper-error' : ''}`}><input type="text" name="email" placeholder="Enter Work Email Address" value={email} onFocus={props.onFocus} onChange={props.onChange} /></div>

			<div className={`input-wrapper${(!passwordValid) ? ' input-wrapper-error' : ''}`} onClick={props.onPassword}>
				<input type="password" name="password" placeholder="Enter Password" value={password} style={{ display : (passwordValid) ? 'block' : 'none' }} onChange={props.onChange} />
				<div className="field-error" style={{ display : (!passwordValid) ? 'block' : 'none' }}>{passMsg}</div>
			</div>

			<button disabled={(email.length === 0 || !emailValid || password.length === 0 || !passwordValid)} type="submit" className="long-button" onClick={(event)=> props.onSubmit(event)}>{(section === 'register') ? 'Sign Up' : 'Login'}</button>
		</form>
	</div>);
};

const HomePageThankYouSection = (props)=> {
	console.log('HomePage.HomePageThankYouSection()', props);

	return (<div className="home-page-thak-you-section">
		<button className="long-button stack-button" onClick={()=> props.onSocial(TWITTER_SOCIAL)}>Twitter</button><br />
		<button className="long-button" onClick={()=> props.onSocial(INSTAGRAM_SOCIAL)}>Instagram</button><br />
		{/*<button className="long-button" onClick={()=> props.onSocial(SLACK_INVITE)}>Slack</button>*/}
	</div>);
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email         : '',
			emailValid    : true,
			password      : '',
			passwordValid : true,
			passMsg       : '',
			scrolled      : false,
			scrollY       : -1
		};
	}

	componentDidMount() {
// 		console.log('HomePage.componentDidMount()', this.props, this.state);

		let self = this;
		Events.scrollEvent.register('end', function(to, element) {
			self.setState({
				scrolled  : false,
				scrollY   : window.scrollY
			});
		});

		scrollSpy.update();

		if (URIs.firstComponent() === 'register' || URIs.firstComponent() === 'login') {
			this.setState({ scrolled : true }, ()=> {
				scroller.scrollTo('top', {
					duration : 666,
					delay    : 125,
					smooth   : 'easeInOutQuart'
				});
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('HomePage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if ((URIs.firstComponent() === 'register' || URIs.firstComponent() === 'login') && !this.state.scrolled && this.state.scrollY !== window.scrollY) {
			this.setState({ scrolled : true }, ()=> {
				scroller.scrollTo('top', {
					duration : 666,
					delay    : 0,
					smooth   : 'easeInOutQuart'
				});
			});
		}
	}


	handleGitHub = ()=> {
		console.log('HomePage.handleGitHub()');
		trackEvent('button', 'github');

		this.props.onModal(Modals.GITHUB_CONNECT);
	};

	handleLogin = ()=> {
// 		console.log('HomePage.handleLogin()');
		trackEvent('button', 'login');

		this.props.onPage(Pages.LOGIN);
	};

	handleSignup = ()=> {
// 		console.log('HomePage.handleSignup()');

		trackEvent('button', 'sign-up');
		this.props.onPage(Pages.REGISTER);
	};

	handleSocial = (url)=> {
		console.log('HomePage.handleSocial()');

		trackEvent('social', url);
		window.open(url);
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

	handlePassword = ()=> {
// 		console.log('HomePage.handlePassword()');

		this.setState({
			password      : '',
			passwordValid : true,
			passMsg       : ''
		});
	};

	handleSubmit = (event)=> {
		console.log('HomePage.handleSubmit()');

		if (URIs.firstComponent() === 'register') {
			this.handleRegisterSubmit(event);

		} else if (URIs.firstComponent() === 'login') {
			this.handleLoginSubmit(event);
		}
	};

	handleLoginSubmit = (event)=> {
// 		console.log('LoginForm.handleLoginSubmit()', event.target, this.state);
		event.preventDefault();

		trackEvent('button', 'login');

		const { email, password } = this.state;
		const emailValid = (email.includes('@')) ? Strings.isEmail(email) : (email.length > 0);
		const passwordValid = (password.length > 0);

		this.setState({
			email         : (emailValid) ? email : 'Email Address or Username Invalid',
			passMsg       : (passwordValid) ? '' : 'Password Invalid',
			emailValid    : emailValid,
			passwordValid : passwordValid
		});

		if (emailValid && passwordValid) {
			let formData = new FormData();
			formData.append('action', 'LOGIN');
			formData.append('email', email);
			formData.append('password', password);
			axios.post(API_ENDPT_URL, formData)
				.then((response)=> {
					console.log('LOGIN', response.data);
					const status = parseInt(response.data.status, 16);

					if (Bits.contains(status, 0x11)) {
						const { user } = response.data;
						this.props.onLoggedIn(user);
						this.props.onPage(Pages.THANK_YOU);

						this.setState({
							email    : '',
							password : '',
							passMsg  : ''
						});

					} else {
						this.setState({
							email         : Bits.contains(status, 0x01) ? email : 'Email Address or Username In Use',
							password      : '',
							emailValid    : Bits.contains(status, 0x01),
							passwordValid : Bits.contains(status, 0x10),
							passMsg       : Bits.contains(status, 0x10) ? '' : 'Password Invalid'
						});
					}
				}).catch((error)=> {
			});
		}
	};

	handleRegisterSubmit = (event)=> {
// 		console.log('HomePage.handleRegisterSubmit()', event, this.state);
		event.preventDefault();

		trackEvent('button', 'register');

		const { email, password } = this.state;
		const emailValid = Strings.isEmail(email);

		this.setState({ emailValid }, ()=> {
			if (emailValid) {
				axios.post(API_ENDPT_URL, qs.stringify({ email,
					action    : 'REGISTER',
					username  : email,
					password  : password,
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
		});
	};

	render() {
// 		console.log('HomePage.render()', this.props, this.state);

		const { email, emailValid, password, passwordValid, passMsg } = this.state;

		return (
			<BasePage className="home-page-wrapper">
				<Element name="top">
					<PageHeader title={`${(URIs.firstComponent() === 'thank-you') ? 'Thank you, you have been added to our wait list. We will be in touch shortly.' : 'Design Engine helps developers maintain their products design source'}`}>
						{(URIs.firstComponent() === '') && (<HomePageButtonSection
							onGitHub={this.handleGitHub}
							onSignup={this.handleSignup}
							onLogin={this.handleLogin}
						/>)}

						{(URIs.firstComponent() === 'register' || URIs.firstComponent() === 'login') && (<HomePageFormSection
							section={URIs.firstComponent()}
							email={email}
							emailValid={emailValid}
							password={password}
							passwordValid={passwordValid}
							passMsg={passMsg}
							onPassword={this.handlePassword}
							onChange={this.handleTextfieldChange}
							onFocus={this.handleTextfieldFocus}
							onSubmit={this.handleSubmit}
						/>)}

						{(URIs.firstComponent() === 'thank-you') && (<HomePageThankYouSection
							onSocial={this.handleSocial}
						/>)}

						<BottomNav
							mobileLayout={false}
							onModal={this.handleGitHub}
							onPage={this.props.onPage}
						/>
					</PageHeader>
				</Element>

				<div className="home-page-content">
					<BaseSection>
						<h1 className="section-title section-title-red">Why did we build this?</h1>
						<h1 className="section-list-wrapper">
							Code reusability<br />
					    Increased efficiency in Design<br />
					    Increased efficiency in Development<br />
					    UX/UI consistency<br />
					    Maintaining brand standards<br />
					    Accessibility compliance<br />
					    No more redlines<br />
						</h1>
						<BottomNav
							mobileLayout={false}
							onModal={this.handleGitHub}
							onPage={this.props.onPage}
						/>
					</BaseSection>
				</div>

				<div className="home-page-content">
					<BaseSection>
						<h1 className="section-title section-title-blue">How does it work?</h1>
						<h1 className="section-text">Developers can distribute coded components to their design team to maintain a single source of design truth</h1>
						<BottomNav
							mobileLayout={false}
							onModal={this.handleGitHub}
							onPage={this.props.onPage}
						/>
					</BaseSection>
				</div>

				<div className="home-page-content">
					<BaseSection>
						<h1 className="section-title section-title-red">Who built Design Engine?</h1>
						<div className="home-page-creator-wrapper">
							<img className="home-page-creator-logo" src={deLogoLeft} alt="Logo" />
							<img className="home-page-creator-logo home-page-creator-logo-adjacent" src={deLogoRight} alt="Logo" />
							<h1 className="home-page-creator">
								Designed & Developed by Jason Festa & Matt Holcombe
							</h1>
						</div>
						<BottomNav
							mobileLayout={false}
							onModal={this.handleGitHub}
							onPage={this.props.onPage}
						/>
					</BaseSection>
				</div>

				<div className="home-page-content">
					<BaseSection>
						<div className="section-quote-wrapper">
							<span className="section-quote">“Instead of giving developers code, why don't developers give designers their UI?”</span>
							<span className="section-quote-attrib"> - Jason Festa</span>
						</div>
						<div className="home-page-button-wrapper">
							<button className="aux-button long-button stack-button" onClick={this.handleGitHub}>Sign Up for Early Access with Github</button><br />
							<button className="long-button stack-button" onClick={this.handleSignup}>Sign Up for Early Access with Email</button><br />
							<button className="long-button" onClick={this.handleLogin}>Login</button>
						</div>
						<BottomNav
							mobileLayout={false}
							onModal={this.handleGitHub}
							onPage={this.props.onPage}
						/>
					</BaseSection>
				</div>
			</BasePage>
		);
	}
}


export default HomePage;
