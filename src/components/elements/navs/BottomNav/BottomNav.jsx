
import React from 'react';
import './BottomNav.css';

import { trackEvent } from '../../../../utils/tracking';
import { isUserLoggedIn } from '../../../../utils/funcs';
import deLogo from '../../../../assets/images/logos/logo-designengine.svg';
import sections from '../../../../assets/json/nav-sections';


const BottomNavDesktop = (props)=> {
// 	console.log('BottomNav().BottomNavDesktop()', props);

	return (<div className="bottom-nav-desktop-wrapper">
		<img className="bottom-nav-desktop-logo" src={deLogo} onClick={()=> props.onLink('')} alt="Design Engine" />
		<div className="bottom-nav-link-wrapper">
			{(sections.bottom.desktop.map((section, i)=> (
				<div key={i} className="bottom-nav-link" onClick={()=> props.onLink(section.url.substr(1))}>{section.title}</div>
			)))}

			{(isUserLoggedIn())
				? (<div className="bottom-nav-link" onClick={() => props.onLogout()}>Logout</div>)
				: (<span style={{ display : 'inline' }}>
						<div className="bottom-nav-link" onClick={()=> props.onLink('register')}>Sign Up</div>
						<div className="bottom-nav-link" onClick={()=> props.onLink('login')}>Login</div>
					</span>)
			}
		</div>
	</div>);
};

const BottomNavMobile = (props)=> {
// 	console.log('BottomNav().BottomNavMobile()', props);

	return (<div className="bottom-nav-mobile-wrapper">
		<img className="bottom-nav-mobile-logo" src={deLogo} onClick={()=> props.onLink('')} alt="Design Engine" />
		<div className="bottom-nav-link-wrapper">
			{(sections.bottom.mobile.map((section, i)=> (
				<div key={i} className="bottom-nav-link" onClick={()=> props.onLink(section.url.substr(1))}>{section.title}</div>
			)))}
		</div>
	</div>);
};


function BottomNav(props) {
// 	console.log('BottomNav()', props);

	const handleLink = (url)=> {
// 		console.log('BottomNav.handleLink()', url);

		trackEvent('link', url);
		props.onPage(url);
	};

	const { mobileLayout } = props;
	return (
		<div className="bottom-nav-wrapper">
			{(!mobileLayout)
				? (<BottomNavDesktop onLink={handleLink} onLogout={props.onLogout} />)
				: (<BottomNavMobile onLink={handleLink} onLogout={props.onLogout} />)
			}
		</div>
	);
}

export default BottomNav;
