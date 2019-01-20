
import React, { Component } from 'react';
import './BottomNav.css';

import { GITHUB_ROADMAP } from '../../consts/uris';
import { isUserLoggedIn } from '../../utils/funcs';


class BottomNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		console.log('BottomNav.render()', this.props, this.state);

		return (
			<div className="bottom-nav-wrapper">
				<div className="bottom-nav-link-wrapper">
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('inspect')}>Free Inspect</div>
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('parts')}>Free Parts</div>
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('terms')}>Terms</div>
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('privacy')}>Privacy</div>
					<div className="bottom-nav-link" onClick={()=> window.open(GITHUB_ROADMAP)}>Roadmap</div>

					{(isUserLoggedIn())
						? (<div className="bottom-nav-link" onClick={() => this.props.onLogout()}>Sign Out</div>)
						: (<span style={{ display : 'inline' }}>
								<div className="bottom-nav-link" onClick={()=> this.props.onPage('register')}>Sign Up</div>
								<div className="bottom-nav-link" onClick={()=> this.props.onPage('login')}>Login</div>
						</span>)
					}
				</div>

				<div className="copyright">&copy; {new Date().getFullYear()} Design Engine AI, Inc</div>
			</div>
		);
	}
}

export default BottomNav;
