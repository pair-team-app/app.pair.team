
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

	handleLink = (url)=> {
// 		console.log('TopNav.handleLink()', url);

		trackEvent('link', url);
		this.props.updateDeeplink(null);
		this.props.onPage(url);
	};

	handleMenuClick = (url)=> {
// 		console.log('TopNav.handleMenuClick()', url);

		trackEvent('menu', url);
		this.props.updateDeeplink(null);
		this.props.onPage(url);
	};

	handleScore = (score)=> {
// 		console.log('TopNav.handleScore()', score);
		trackEvent('rate', 'score');
		this.props.onScore(score);
	};

	render() {
// 		console.log('TopNav.render()', this.props, this.state);

		const { pathname } = window.location;
		const { mobileLayout } = this.props;

		return ((!mobileLayout)
			? (<TopNavDesktop
					pathname={pathname}
					sections={sections.top.desktop}
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
