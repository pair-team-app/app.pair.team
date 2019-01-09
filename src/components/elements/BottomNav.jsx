
import React, { Component } from 'react';
import './BottomNav.css';

import { isExplorePage, isProjectPage, isInspectorPage, isUploadPage, isUserLoggedIn } from '../../utils/funcs';


class BottomNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const pathname = window.location.pathname;
		const year = new Date().getFullYear();

		const style = (isInspectorPage()) ? {
			display  : 'none'
		} : (!isProjectPage() && !isExplorePage() && !pathname.includes('invite') && !isUploadPage() && !pathname.includes('terms') && !pathname.includes('privacy')) ? {
			position : 'fixed',
			left     : '320px',
			bottom   : '10px'
		} : null;

		return (
			<div className="bottom-nav-wrapper" style={style}>
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
