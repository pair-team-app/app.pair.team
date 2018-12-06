
import React, { Component } from 'react';
import './BottomNav.css';

import cookie from 'react-cookies';

class BottomNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		const year = new Date().getFullYear();

		return (
			<div className="bottom-nav-wrapper">
				<div className="bottom-nav-link-wrapper">
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('terms')}>Terms</div>
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('privacy')}>Privacy</div>
					<div className="bottom-nav-link" onClick={()=> window.open('https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA')}>Slack</div>
					<div className="bottom-nav-link" onClick={()=> window.open('https://spectrum.chat/designengine')}>Spectrum</div>
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('api')}>API</div>
					<div className="bottom-nav-link" onClick={()=> window.open('https://github.com/de-ai/designengine.ai/projects/1')}>Roadmap</div>
					{(cookie.load('user_id') === '0') && (<div className="bottom-nav-link" onClick={() => this.props.onPage('register')}>Sign Up</div>)}
					{(cookie.load('user_id') === '0') && (<div className="bottom-nav-link" onClick={() => this.props.onPage('login')}>Login</div>)}
					{(cookie.load('user_id') !== '0') && (<div className="bottom-nav-link" onClick={() => this.props.onLogout()}>Sign Out</div>)}
				</div>

				<div className="copyright">&copy; {year} Design Engine AI, Inc</div>
			</div>
		);
	}
}

export default BottomNav;
