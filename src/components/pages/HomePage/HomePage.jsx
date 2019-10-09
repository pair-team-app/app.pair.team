
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { Bits, Browsers, Strings } from 'lang-js-utils';
import { NavLink } from 'react-router-dom';

import BasePage from '../BasePage';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';

import homePageElementLandscape from '../../../assets/images/elements/element-home-page-landscape.png';
import homePageElementPortrait from '../../../assets/images/elements/element-home-page-portrait.png';
import pageContent from '../../../assets/json/content-home-page';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			title      : (Browsers.isMobile.ANY()) ? pageContent.mobile.title: pageContent.desktop.title,
			email      : '',
			emailValid : false,
			emailReset : false,
			submitted  : false
		};
	}

	handleGitHub = ()=> {
		console.log(this.constructor.name, '.handleGitHub()');
		trackEvent('button', 'github');

		this.props.onModal(Modals.GITHUB_CONNECT);
	};

	handleTextfieldChange = (event)=> {
// 		console.log(this.constructor.name, '.handleTextfieldChange()', event.target.value, this.state.email, this.state.emailValid, this.state.emailReset);
		const email = event.target.value;
		const emailValid = Strings.isEmail(email);

		this.setState({ email,
// 			emailValid : emailValid || email.length === 0
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
		console.log(this.constructor.name, '.handleSubmit()');
		event.preventDefault();

		trackEvent('button', 'register');

		const { email } = this.state;
		if (Strings.isEmail(email)) {
			axios.post(API_ENDPT_URL, {
				action  : 'REGISTER',
				payload : { email,
					username : email,
					type     : 'wait_list'
				}
			}).then((response) => {
				console.log('REGISTER', response.data);
				const status = parseInt(response.data.status, 16);
// 					console.log('status', status, Bits.contains(status, 0x01), Bits.contains(status, 0x10));

				if (status === 0x11) {
					this.props.onRegistered(response.data.user);

					this.setState({
						email      : 'Thank you for signing up!',
						emailValid : true,
						submitted  : true
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
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

		const { title, email, emailValid, submitted } = this.state;
		return (
			<BasePage className="home-page-wrapper">
				<div className="home-page-form">
					<h1 dangerouslySetInnerHTML={{ __html : title }} />
					<form onSubmit={this.handleSubmit}>
						<div className={`input-wrapper${(submitted) ? ' input-wrapper-submitted' : (emailValid || email.length === 0) ? '' : ' input-wrapper-error'}`}>
							<input disabled={submitted} type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={this.handleTextfieldFocus} onChange={this.handleTextfieldChange} onMouseLeave={this.handleMouseLeave} onBlur={this.handleTextfieldBlur} required />
						</div>
						<button disabled={(!emailValid && !email.length === 0) || submitted} type="submit" onClick={(event)=> this.handleSubmit(event)} style={{opacity : (submitted) ? 0.5 : 1.0}}>Join Wait List</button>
					</form>
					<div className="form-disclaimer">By tapping “Join Wait List” you accept our<br /><NavLink to="/terms">Terms of Service.</NavLink></div>
				</div>

				<div className="page-content-wrapper home-page-content-wrapper">
					<div className="home-page-element-wrapper">
						{(Browsers.isMobile.ANY())
							? (<img src={homePageElementPortrait} className="home-page-element home-page-element-portrait" alt="Screen shot" />)
							: (<img src={homePageElementLandscape} className="home-page-element home-page-element-landscape" alt="Screen shot" />)
						}
					</div>
				</div>
			</BasePage>
		);
	}
}


export default (HomePage);
