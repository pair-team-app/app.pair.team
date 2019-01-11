
import React, { Component } from 'react';
import './BottomNav.css';

import { NavLink } from 'react-router-dom';

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
					<NavLink to="/inspect" className="bottom-nav-link">Free Inspect</NavLink>
					<NavLink to="/parts" className="bottom-nav-link">Parts</NavLink>
					<NavLink to="/colors" className="bottom-nav-link">Colors</NavLink>
					<NavLink to="/typography" className="bottom-nav-link">Typography</NavLink>
					<NavLink to="/terms" className="bottom-nav-link">Terms of Service</NavLink>
					<NavLink to="/privacy" className="bottom-nav-link">Privacy</NavLink>
					<div className="bottom-nav-link" onClick={()=> window.open('https://github.com/de-ai/designengine.ai/projects/1')}>Roadmap</div>

					{(isUserLoggedIn())
						? (<div className="bottom-nav-link" onClick={() => this.props.onLogout()}>Sign Out</div>)
						: (<div style={{ display : 'inline' }}>
								<NavLink to="/register" className="bottom-nav-link">Sign Up</NavLink>
								<NavLink to="/login" className="bottom-nav-link">Login</NavLink>
						</div>)
					}
				</div>

				<div className="copyright">&copy; {year} Design Engine AI, Inc</div>
			</div>
		);
	}
}

export default BottomNav;
