
import React, { Component } from 'react';
import './TopNav.css';

import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import TopNavMenu from './TopNavMenu/TopNavMenu';
import TopNavProfile from './TopNavProfile/TopNavProfile';
import TopNavRate from './TopNavRate/TopNavRate';

import { updateDeeplink } from '../../../redux/actions';
import { isUserLoggedIn } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';
import sections from '../../../assets/json/nav-sections';


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		updateDeeplink  : (navIDs)=> dispatch(updateDeeplink(navIDs))
	});
};


const TopNavDesktop = (props)=> {
// 	console.log('TopNav.TopNavDesktop()', props);

	const { pathname, sections } = props;
	return (<div className="top-nav-wrapper">
		<div className="top-nav-column top-nav-column-left"><Row vertical="center">
			{(sections.map((section, i)=> (
				<div key={i} className={`top-nav-link${(pathname.includes(section.url)) ? ' top-nav-link-selected' : ''}`} onClick={()=> props.onLink(section.url)}>{section.title}</div>
			)))}
			<TopNavRate selected={(pathname.includes('/rate-this'))} onLink={props.onLink} onScore={props.onScore} />
		</Row></div>

		<div className="top-nav-column top-nav-column-right">
			{(!isUserLoggedIn())
				? (<>
					<button className="aux-button adjacent-button" onClick={()=> props.onGitHub()}>GitHub</button>
					<button className="adjacent-button" onClick={()=> props.onLink('register')}>Sign Up</button>
					<button onClick={()=> props.onLink('login')}>Login</button>
				</>)
				: (<Row vertical="center" horizontal="end">
					<TopNavProfile
						onLink={props.onLink}
						onLogout={props.onLogout}
					/>
				</Row>)}
		</div>
	</div>);
};

const TopNavMobile = (props)=> {
// 	console.log('TopNav.TopNavMobile()', props);

	const { pathname, sections } = props;
	return (<div className="top-nav-wrapper">
		<div className="top-nav-column top-nav-column-left top-nav-column-left-mobile"><Row vertical="center" style={{ height : '100%' }}>
			<TopNavMenu
				pathname={pathname}
				sections={sections}
				onClick={props.onMenuClick} />
		</Row></div>

		<div className="top-nav-column top-nav-column-right top-nav-column-right-mobile">
			{(!isUserLoggedIn())
				? (<>
					<button className="adjacent-button adjacent-button-mobile" onClick={()=> props.onPage('register')}>Sign Up</button>
					<button onClick={()=> props.onPage('login')}>Login</button>
				</>)
				: (<Row vertical="center" horizontal="end">
					<TopNavProfile
						onLink={props.onLink}
						onLogout={props.onLogout}
					/>
				</Row>)}
		</div>
	</div>);
};


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	handleGitHubClick = ()=> {
// 		console.log('TopNav.handleGitHubClick()');

		trackEvent('button', 'github');

		this.props.updateDeeplink(null);
		this.props.onGitHub();
	};

	handleLink = (url)=> {
// 		console.log('TopNav.handleLink()', url);
		this.onNavigate(url);
	};

	handleMenuClick = (url)=> {
// 		console.log('TopNav.handleMenuClick()', url);
		this.onNavigate(url, 'menu');
	};

	handleScore = (score)=> {
// 		console.log('TopNav.handleScore()', score);
		trackEvent('rate', 'score');

		this.props.updateDeeplink(null);
		this.props.onScore(score);
	};

	onNavigate = (url, trackCat='link', onProp=this.props.onPage)=> {
		console.log('TopNav.onNavigate()', url, onProp, trackCat);

		trackEvent(trackCat, url);
		this.props.updateDeeplink(null);

		if (url && url.startsWith('/')) {
			this.props.onPage(url);

		} else {
			onProp();
		}
	};

	render() {
// 		console.log('TopNav.render()', this.props, this.state);

		const { pathname } = window.location;
		const { mobileLayout } = this.props;

		return ((!mobileLayout)
			? (<TopNavDesktop
					pathname={pathname}
					sections={sections.top.desktop}
					onGitHub={this.handleGitHubClick}
					onLink={this.handleLink}
					onLogout={this.props.onLogout}
					onScore={this.handleScore}
				/>)

			: (<TopNavMobile
					pathname={pathname}
					sections={sections.top.mobile}
					onLink={this.handleLink}
					onLogout={this.props.onLogout}
					onMenuClick={this.handleMenuClick}
				/>)
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TopNav);
