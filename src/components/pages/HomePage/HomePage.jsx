
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import qs from 'qs';

import BasePage from '../BasePage';
import BaseSection from '../../sections/BaseSection';
import PageHeader from '../../sections/PageHeader';
import { Modals, API_ENDPT_URL } from '../../../consts/uris';
import { Bits, Strings } from '../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';
import homePage from '../../../assets/images/elements/element-home.png';


const HomePageContent = (props)=> {
	console.log('HomePage.HomePageContent()', props);

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
	console.log('HomePage.HomePageRegister()', props);

	const { email, emailValid } = props;
	return (<div className="home-page-register">
		<BaseSection>
			<h1 className="section-title">Share screen design docs with ease for devs & stakeholders</h1>
			<form onSubmit={props.onSubmit}>
				<div className={`input-wrapper${(!emailValid) ? ' input-wrapper-error' : ''}`}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={props.onFocus} onChange={props.onChange} /></div>
				<button disabled={(email.length === 0 || !emailValid)} type="submit" className="long-button" onClick={(event)=> props.onSubmit(event)}>Start Free Trial</button>
			</form>
		</BaseSection>
	</div>);
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email      : '',
			emailValid : true
		};
	}


	handleFreeTrial = ()=> {
// 		console.log('HomePage.handleFreeTrial()');

		trackEvent('button', 'free-trial');
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

				<HomePageRegister
					email={email}
					emailValid={emailValid}
					onFocus={this.handleSignupFocus}
					onChange={this.handleSignupChange}
					onSubmit={this.handleSignupSubmit}
				/>

				<HomePageContent
					onFreeTrial={this.handleFreeTrial}
				/>
			</BasePage>
		);
	}
}


export default HomePage;
