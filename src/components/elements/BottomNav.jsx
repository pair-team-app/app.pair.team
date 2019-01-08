
import React, { Component } from 'react';
import './BottomNav.css';

import { isExplorePage, isProjectPage, isInspectorPage, isUploadPage, isUserLoggedIn } from '../../utils/funcs';


const LoggedIn = (props)=> {
	return (<div>
		<div className="bottom-nav-link" onClick={() => props.onLogout()}>Sign Out</div>
	</div>);
};

const LoggedOut = (props)=> {
	return (<div>
		<div className="bottom-nav-link" onClick={() => props.onPage('register')}>Sign Up</div>
		<div className="bottom-nav-link" onClick={() => props.onPage('login')}>Login</div>
	</div>);
};


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

		const pathname = window.location.pathname;
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
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('')}>Projects</div>
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('explore')}>Explore</div>
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('terms')}>Terms</div>
					<div className="bottom-nav-link" onClick={()=> this.props.onPage('privacy')}>Privacy</div>
					<div className="bottom-nav-link" onClick={()=> window.open('https://github.com/de-ai/designengine.ai/projects/1')}>Roadmap</div>
					{(isUserLoggedIn())
						? (<LoggedIn onLogout={this.props.onLogout}/>)
						: (<LoggedOut onPage={this.props.onPage} />)}
				</div>

				<div className="copyright">&copy; {year} Design Engine AI, Inc</div>
			</div>
		);
	}
}

export default BottomNav;
