
import React, { Component } from 'react';
import './TopNav.css';

import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import TopNavMenu from './TopNavMenu';
import TopNavProfile from './TopNavProfile';
import TopNavRate from './TopNavRate';

import { isUserLoggedIn } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';
import { updateDeeplink } from '../../redux/actions';
import sections from '../../assets/json/nav-sections';


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateDeeplink  : (navIDs)=> dispatch(updateDeeplink(navIDs))
	});
};


const TopNavDesktop = (props)=> {
// 	console.log('TopNav.TopNavDesktop()', props);

	const { pathname, sections } = props;
	return (<div className="top-nav-wrapper">
		<div className="top-nav-column top-nav-column-left"><Row vertical="center" style={{ height : '100%' }}>
			{(sections.map((section, i)=> (
				<div key={i} className={`top-nav-link${(pathname.includes(section.url)) ? ' top-nav-link-selected' : ''}`} onClick={()=> props.onPage(section.url)}>{section.title}</div>
			)))}
			<TopNavRate selected={(pathname.includes('/rate-this'))} onPage={props.onPage} onScore={props.onScore} />
		</Row></div>

		<div className="top-nav-column top-nav-column-right">
			{(!isUserLoggedIn())
				? (<>
					<button className="adjacent-button" onClick={()=> props.onPage('register')}>Sign Up</button>
					<button onClick={()=> props.onPage('login')}>Login</button>
				</>)
				: (<Row vertical="center" horizontal="end">
					<TopNavProfile
						onPage={props.onPage}
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
				onPage={props.onPage} />
		</Row></div>

		<div className="top-nav-column top-nav-column-right top-nav-column-right-mobile">
			{(!isUserLoggedIn())
				? (<>
					<button className="adjacent-button adjacent-button-mobile" onClick={()=> props.onPage('register')}>Sign Up</button>
					<button onClick={()=> props.onPage('login')}>Login</button>
				</>)
				: (<Row vertical="center" horizontal="end">
					<TopNavProfile
						onPage={props.onPage}
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

		this.props.updateDeeplink(null);
		this.props.onPage(url);
	};

	handleScore = (score)=> {
// 		console.log('TopNav.handleScore()', score);
		trackEvent('rate', 'score', null, score);
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
					onPage={this.handleLink}
					onScore={this.handleScore}
					onLogout={this.props.onLogout}
				/>)

			: (<TopNavMobile
					pathname={pathname}
					sections={sections.top.mobile}
					onPage={this.handleLink}
					onLogout={this.props.onLogout}
				/>)
		);
	}
}

export default connect(null, mapDispatchToProps)(TopNav);
