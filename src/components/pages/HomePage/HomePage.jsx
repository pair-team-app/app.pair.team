
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
		<div className="form-disclaimer">By tapping “Join Wait List” you accept our<br /><NavLink to="/terms">Terms of Service.</NavLink></div>
	</div>);
};


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email : ''
		};
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
			</BasePage>
		);
	}
}


export default (HomePage);
