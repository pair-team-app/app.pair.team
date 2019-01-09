
import React, { Component } from 'react';
import './BottomNav.css';

import { isUserLoggedIn } from '../../utils/funcs';


class BottomNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const year = new Date().getFullYear();

		return (
			<div className="bottom-nav-wrapper">
				<div className="bottom-nav-link-wrapper">
					{(isUserLoggedIn())
						? (<div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('')}>Projects</div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('explore')}>Explore</div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('profile')}>Profile</div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('terms')}>Terms</div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('privacy')}>Privacy</div>
							<div className="bottom-nav-link" onClick={() => this.props.onLogout()}>Sign Out</div>
						</div>) : (<div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('')}>Projects</div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('explore')}>Explore</div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('terms')}>Terms</div>
							<div className="bottom-nav-link" onClick={()=> this.props.onPage('privacy')}>Privacy</div>
							<div className="bottom-nav-link" onClick={() => this.props.onPage('register')}>Sign Up</div>
							<div className="bottom-nav-link" onClick={() => this.props.onPage('login')}>Login</div>
						</div>)}
				</div>

				<div className="copyright">&copy; {year} Design Engine AI, Inc</div>
			</div>
		);
	}
}

export default BottomNav;
