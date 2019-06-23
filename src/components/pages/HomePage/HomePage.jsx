
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import qs from 'qs';
import { Element, scroller } from 'react-scroll';

import BasePage from '../BasePage';
import BaseSection from '../../sections/BaseSection';
import PageHeader from '../../sections/PageHeader';
import { API_ENDPT_URL } from '../../../consts/uris';
import { Bits, Strings, URIs } from '../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';
import homePage from '../../../assets/images/elements/element-home.png';


const HomePageContent = (props)=> {
// 	console.log('HomePage.HomePageContent()', props);

	return (<div className="home-page-content">
		<div className="home-page-content-animation-wrapper">
			<img src={homePage} className="home-page-content-animation" alt="Animation" />
		</div>
		<h1 className="section-title">Share screen design anywhere</h1>
		<h5>Executive, stakeholder, & product owners design team access.</h5>
		<button className="long-button" onClick={props.onFreeTrial}>Start Free Trial</button>
	</div>);
};


const HomePageRegister = (props)=> {
// 	console.log('HomePage.HomePageRegister()', props);

	const { email, emailValid } = props;
	return (<div className="home-page-register">
		<BaseSection>
			<h1 className="section-title">Share screen design docs with ease for devs & stakeholders</h1>
			<form onSubmit={props.onSubmit}>
				<div className={`input-wrapper${(!emailValid) ? ' input-wrapper-error' : ''}`}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={props.onFocus} onChange={props.onChange} /></div>
				<button disabled={(email.length === 0 || !emailValid)} type="submit" className="long-button" onClick={(event)=> props.onSubmit(event)}>Start Free Trial</button>
			</form>
			<div className="page-link" onClick={()=> props.onPage('/login')}>Login</div>
			<h5>By tapping “Sign Up” or “Login” you accept our Terms of Service.</h5>
		</BaseSection>
	</div>);
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email      : '',
			emailValid : true,
			scrolled   : false
		};
	}

	componentDidMount() {
// 		console.log('HomePage.componentDidMount()', this.props, this.state);

		if (URIs.firstComponent() === 'free-trial') {
			scroller.scrollTo('register', {
				duration : 666,
				delay    : 125,
				smooth   : 'easeInOutQuart'
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('HomePage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

// 		if (URIs.firstComponent() === 'free-trial' && prevProps.scrolling && !this.props.scrolling && this.state.scrolled && !prevState.scrolled) {
// 			this.setState({ scrolled : false });
// 		}

		if (URIs.firstComponent() === 'free-trial' && !this.state.scrolled) {
			this.setState({ scrolled : true }, ()=> {
				scroller.scrollTo('register', {
					duration : 666,
					delay    : 0,
					smooth   : 'easeInOutQuart'
				});
			});
		}
	}


	handleFreeTrial = ()=> {
// 		console.log('HomePage.handleFreeTrial()');

		trackEvent('button', 'free-trial');
		this.props.onPage('/free-trial');
	};

	handleSignupChange = (event)=> {
		console.log('HomePage.handleSignupChange()', event);
		this.setState({
			email      : event.target.value,
// 			emailValid : Strings.isEmail(event.target.value)
		});
	};

	handleSignupFocus = (event)=> {
		console.log('HomePage.handleSignupFocus()', event);
		this.setState({
			email      : '',
			emailValid : true
		});
	};

	handleSignupSubmit = (event)=> {
// 		console.log('HomePage.handleVideo()', event);
		event.preventDefault();

		trackEvent('button', 'signup');

		const { email } = this.state;
		const emailValid = Strings.isEmail(email);

		this.setState({ emailValid }, ()=> {
			if (emailValid) {
				axios.post(API_ENDPT_URL, qs.stringify({ email,
					action    : 'REGISTER',
					username  : '',
					password  : '',
					invite_id : '0'
				})).then((response) => {
					console.log('REGISTER', response.data);
					const status = parseInt(response.data.status, 16);
// 					console.log('status', status, Bits.contains(status, 0x01), Bits.contains(status, 0x10));

					if (status === 0x11) {
						this.props.onRegistered(response.data.user);

					} else {
						this.setState({
							email      : Bits.contains(status, 0x10) ? email : 'Email Address Already in Use',
							emailValid : Bits.contains(status, 0x10)
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

		const { email, emailValid } = this.state;

		return (
			<BasePage className="home-page-wrapper">
				<PageHeader title="Move screen design forward with Design Engine">
					<button className="long-button" onClick={this.handleFreeTrial}>Start Free Trial</button>
				</PageHeader>

				<Element name="register"><HomePageRegister
					email={email}
					emailValid={emailValid}
					onFocus={this.handleSignupFocus}
					onChange={this.handleSignupChange}
					onSubmit={this.handleSignupSubmit}
					onPage={(url)=> this.props.onPage(url)}
				/></Element>

				<HomePageContent
					onFreeTrial={this.handleFreeTrial}
				/>
			</BasePage>
		);
	}
}


export default HomePage;
