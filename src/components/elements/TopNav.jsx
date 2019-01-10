
import React, { Component } from 'react';
import './TopNav.css';

import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import TopNavProfile from './TopNavProfile';
// import { isExplorePage, isHomePage, isProjectPage, isUploadPage, isUserLoggedIn } from '../../utils/funcs';
import { isInspectorPage, isUserLoggedIn } from '../../utils/funcs';
import logo from '../../images/logo-designengine.svg';
import { updateNavigation } from "../../redux/actions";


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateNavigation  : (navIDs)=> dispatch(updateNavigation(navIDs))
	});
};


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	handleLink = (url)=> {
		this.props.updateNavigation({
			uploadID   : 0,
			pageID     : 0,
			artboardID : 0
		});
		this.props.onPage(url);

// 		} else if (type === 'parts') {
// 			this.props.updateNavigation({
// 				uploadID   : 1,
// 				pageID     : 2,
// 				artboardID : 4
// 			});
//
// 			this.props.onPage('page/1/2/4/account');
	};

	render() {
		const { pathname } = window.location;

		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row horizontal="start" vertical="center">
					<img onClick={()=> this.props.onHome()} src={logo} className="top-nav-logo" alt="Design Engine" />
					<div className={(pathname.includes('/page')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.handleLink('page')}>Free Inspect</div>
					<div className={(pathname.includes('/free-parts')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.handleLink('free-parts')}>Free Parts</div>
					<div className={(pathname.includes('/free-colors')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.handleLink('free-colors')}>Free Colors</div>
					<div className={(pathname.includes('/free-fonts')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.handleLink('free-fonts')}>Free Fonts</div>
					{/*<div className={(isHomePage() || isProjectPage() || isUploadPage()) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onHome()}>Projects</div>*/}
					{/*<div className={(window.location.pathname.includes('/add-ons')) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('add-ons')}>Add Ons</div>*/}
					{/*<div className={(isExplorePage()) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage('explore')}>Explore</div>*/}
					{/*<div className="top-nav-link" onClick={()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLSdYZI6uIqF9D5zW5LmZQqCem6zrXh7THmVVBoOkeAQWm9o6lg/viewform?usp=sf_link')}>Survey</div>*/}
				</Row></div>

				<div className="top-nav-column top-nav-column-right">
					<Row horizontal="end" vertical="center">
						{(!isUserLoggedIn())
							? (<button className="top-nav-upload-button" onClick={()=> this.props.onPage('register')}>Sign Up with Email</button>)
							: (<Row vertical="center">
									<TopNavProfile
										onPage={this.props.onPage}
										onLogout={this.props.onLogout}
									/>
							</Row>)}
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(TopNav);
