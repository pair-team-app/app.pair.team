
import React from 'react';
import './BottomNav.css';

import { isUserLoggedIn } from '../../utils/funcs';
import deLogo from '../../assets/images/logos/logo-designengine.svg';
import sections from '../../assets/json/sections-bottom_nav';


const BottomNavDesktop = (props)=> {
// 	console.log('BottomNav().BottomNavDesktop()', props);

	return (<div className="bottom-nav-desktop-wrapper">
		<img className="bottom-nav-desktop-logo" src={deLogo} onClick={()=> props.onPage('')} alt="Design Engine" />
		<div className="bottom-nav-link-wrapper">
			{(sections.desktop.map((section, i)=> (
				<div key={i} className="bottom-nav-link" onClick={()=> props.onPage(section.url.substr(1))}>{section.title}</div>
			)))}

			{(isUserLoggedIn())
				? (<div className="bottom-nav-link" onClick={() => props.onLogout()}>Sign Out</div>)
				: (<span style={{ display : 'inline' }}>
							<div className="bottom-nav-link" onClick={()=> props.onPage('register')}>Sign Up</div>
							<div className="bottom-nav-link" onClick={()=> props.onPage('login')}>Login</div>
					</span>)
			}
		</div>
	</div>);
};

const BottomNavMobile = (props)=> {
// 	console.log('BottomNav().BottomNavMobile()', props);

	return (<div className="bottom-nav-mobile-wrapper">
		<img className="bottom-nav-mobile-logo" src={deLogo} onClick={()=> props.onPage('')} alt="Design Engine" />
	</div>);
};


function BottomNav(props) {
// 	console.log('BottomNav()', props);

	const { mobileLayout } = props;
	return (
		<div className="bottom-nav-wrapper">
			{(!mobileLayout)
				? (<BottomNavDesktop onPage={props.onPage} />)
				: (<BottomNavMobile onPage={props.onPage} />)
			}
		</div>
	);
}

export default BottomNav;
