
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { Bits, Browsers, Strings } from 'lang-js-utils';
import { NavLink } from 'react-router-dom';

import BasePage from '../BasePage';
import DummyForm from '../../forms/DummyForm';
import { API_ENDPT_URL, CDN_HOSTNAME, Modals } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';

import pageContent from '../../../assets/json/content-home-page';



class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			title      : (Browsers.isMobile.ANY()) ? pageContent.mobile.title: pageContent.desktop.title,
			video      : ((Browsers.isMobile.ANY()) ? pageContent.mobile.assets.videos[0].url: pageContent.desktop.assets.videos[0].url).replace('_{CDN_HOSTNAME}_', CDN_HOSTNAME),
			email      : '',
			emailValid : false,
			emailReset : false,
			submitted  : false
		};
	}

	handleGitHub = ()=> {
// 		console.log('%s.handleGitHub()', this.constructor.name);
		trackEvent('button', 'github');

		this.props.onModal(Modals.GITHUB);
	};

	handleTextfieldChange = (event)=> {
// 		console.log('%s.handleTextfieldChange()', this.constructor.name, event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);
		const email = event.target.value;
		const emailValid = Strings.isEmail(email);

		this.setState({ email,
// 			emailValid : emailValid || email.length === 0
			emailValid : emailValid || !email.includes('!') || email.length === 0
		});
	};

	handleTextfieldFocus = (event)=> {
// 		console.log('%s.handleTextfieldFocus()', this.constructor.name, event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);

		const email = event.target.value;
		this.setState({
			email      : (Strings.isEmail(email)) ? email : '',
			emailValid : true,
			emailReset : false
		});
	};

	handleMouseLeave = (event)=> {
// 		console.log('%s.handleMouseLeave()', this.constructor.name, event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);

		const emailValid = Strings.isEmail(event.target.value);
		this.setState({ emailValid })
	};

	handleTextfieldBlur = (event)=> {
// 		console.log('%s.handleTextfieldBlur()', this.constructor.name, event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);

		const emailValid = Strings.isEmail(event.target.value);
		this.setState({ emailValid })
	};

	handleSubmit = (event)=> {
// 		console.log('%s.handleSubmit()', this.constructor.name);
		event.preventDefault();

		trackEvent('button', 'join-wait-list');

		const { email } = this.state;
		if (Strings.isEmail(email)) {
			axios.post(API_ENDPT_URL, {
				action  : 'REGISTER',
				payload : { email,
					username : email,
					type     : 'wait_list'
				}
			}).then((response)=> {
// 				console.log('REGISTER', response.data);
				const status = parseInt(response.data.status, 16);
// 					console.log('status', status, Bits.contains(status, 0x01), Bits.contains(status, 0x10));

				if (status === 0x11) {
					trackEvent('signup', 'success', email);
					this.props.onSignup(response.data.user);

					this.setState({
						email      : 'Thank you for signing up!',
						emailValid : true,
						emailReset : false,
						submitted  : true
					});

				} else {
					this.setState({
						email      : Bits.contains(status, 0x10) ? email : 'Email Address Already in Use',
						emailValid : Bits.contains(status, 0x10),
						emailReset : true
					});
				}
			}).catch((error)=> {
			});

		} else {
			this.setState({
// 				email      : '',
				emailValid : false,
				emailReset : true
			});
		}
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { title, video, email, emailReset, submitted } = this.state;
		return (
			<BasePage { ...this.props } className="home-page">
				<div className="home-page-form-wrapper">
					<h1 dangerouslySetInnerHTML={{ __html : title }} />
					<form onSubmit={this.handleSubmit}>
						<DummyForm />

						{(emailReset)
							? (<input disabled={submitted} type="email" placeholder="Enter Email Address" value={email} onFocus={this.handleTextfieldFocus} onChange={this.handleTextfieldChange} onMouseLeave={this.handleMouseLeave} onBlur={this.handleTextfieldBlur} required autoComplete="new-password" />)
							: (<input disabled={submitted} type="text" placeholder="Enter Email Address" value={email} onFocus={this.handleTextfieldFocus} onChange={this.handleTextfieldChange} onMouseLeave={this.handleMouseLeave} onBlur={this.handleTextfieldBlur} autoComplete="new-password" />)
						}
						<button disabled={submitted} type="submit" onClick={(event)=> this.handleSubmit(event)}>Join Wait List</button>
					</form>
					<div className="form-disclaimer">By tapping “Join Wait List” you accept our<br /><NavLink to="/terms">Terms of Service.</NavLink></div>
				</div>

				<div className="base-page-content-wrapper home-page-content-wrapper">
					<div className="home-page-element-wrapper">
						<video className={`home-page-element ${(Browsers.isMobile.ANY()) ? 'home-page-element-portrait' : 'home-page-element-landscape'}`} onLoad={()=> trackEvent('video', 'load')} onPause={()=> trackEvent('video', 'pause')} onPlay={()=> trackEvent('video', 'play')} autoPlay={true} controls muted loop>
							<source src={video} type="video/mp4" />
						</video>
					</div>
				</div>
			</BasePage>
		);
	}
}


export default (HomePage);
