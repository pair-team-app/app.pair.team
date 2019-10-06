
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import qs from 'qs';
import { NavLink } from 'react-router-dom';

import BasePage from '../BasePage';
import { API_ENDPT_URL, Modals, Pages } from '../../../consts/uris';
import { Bits, Strings } from '../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';

import homePageElement from '../../../assets/images/elements/element-home-page.png';


const HomePageHeaderForm = (props)=> {
	const { email, emailValid, emailReset } = props;
// 	const { email } = props;
// 	const emailValid = Strings.isEmail(email) || (email.length > 0 || email.includes('!'));

	return (<div className="home-page-header-form">
		{/*<h1>A new tool for product teams to<br />organize design</h1>*/}
		<h1>A safe space for product teams to<br />create the best & most accessible design</h1>
		<form onSubmit={props.onSubmit}>
			{/*<div className={`input-wrapper${(!emailValid && email.length > 0) ? ' input-wrapper-error' : (emailValid && email.length > 0) ? ' input-wrapper-pass' : ''}`}>*/}
			{/*<div className={`input-wrapper${(emailReset) ? ((emailValid) ? ' input-wrapper-pass' : ' input-wrapper-error') : ''}`}>*/}
			<div className={`input-wrapper${(emailValid || email.length === 0) ? '' : ' input-wrapper-error'}`}>
				<input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={props.onFocus} onChange={props.onChange} onMouseLeave={props.onMouseLeave} onBlur={props.onBlur} />
			</div>
			<button disabled={!emailValid || email.length === 0} type="submit" onClick={(event)=> props.onSubmit(event)}>Join Wait List</button>
		</form>
		<div className="form-disclaimer">By tapping “Join Wait List” you accept our<br /><NavLink to="/terms">Terms of Service.</NavLink></div>
	</div>);
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email      : '',
			emailValid : false,
			emailReset : false
		};
	}

	handleGitHub = ()=> {
		console.log('HomePage.handleGitHub()');
		trackEvent('button', 'github');

		this.props.onModal(Modals.GITHUB_CONNECT);
	};

	handleTextfieldChange = (event)=> {
// 		console.log(this.constructor.name, '.handleTextfieldChange()', event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);
		const email = event.target.value;
		const emailValid = Strings.isEmail(email);

		this.setState({ email,
			emailValid : emailValid || !email.includes('!') || email.length === 0
		});
	};

	handleTextfieldFocus = (event)=> {
// 		console.log(this.constructor.name, '.handleTextfieldFocus()', event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);

		const email = event.target.value;
		this.setState({
			email      : (Strings.isEmail(email)) ? email : '',
			emailValid : true
		});
	};

	handleMouseLeave = (event)=> {
// 		console.log(this.constructor.name, '.handleMouseLeave()', event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);

		const emailValid = Strings.isEmail(event.target.value);
		this.setState({ emailValid })
	};

	handleTextfieldBlur = (event)=> {
// 		console.log(this.constructor.name, '.handleTextfieldBlur()', event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);

		const emailValid = Strings.isEmail(event.target.value);
		this.setState({ emailValid })
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
				type      : 'wait_list'
			})).then((response) => {
				console.log('REGISTER', response.data);
				const status = parseInt(response.data.status, 16);
// 					console.log('status', status, Bits.contains(status, 0x01), Bits.contains(status, 0x10));

				if (status === 0x11) {
					this.props.onRegistered(response.data.user);
					this.props.onPage(Pages.THANK_YOU);

					this.setState({
						email      : 'Thank you for signing up!',
						emailValid : true
					});

				} else {
					this.setState({
						email      : Bits.contains(status, 0x10) ? email : 'Email Address Already in Use',
						emailValid : Bits.contains(status, 0x10)
					});
				}
			}).catch((error)=> {
			});

		} else {
			this.setState({ emailValid : false });
		}
	};

	render() {
// 		console.log('HomePage.render()', this.props, this.state);

		const { email, emailValid, emailReset } = this.state;
		return (
			<BasePage className="home-page-wrapper">
				<HomePageHeaderForm
					email={email}
					emailValid={emailValid}
					emailReset={emailReset}
					onChange={this.handleTextfieldChange}
					onFocus={this.handleTextfieldFocus}
					onMouseLeave={this.handleMouseLeave}
					onBlur={this.handleTextfieldBlur}
					onSubmit={this.handleSubmit}
				/>

				<div className="home-page-content">
					<img src={homePageElement} className="home-page-element" alt="Screen shot" />
				</div>
			</BasePage>
		);
	}
}


export default (HomePage);
