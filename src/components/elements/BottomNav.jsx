
import React from 'react';
import './BottomNav.css';

import { isUserLoggedIn } from '../../utils/funcs';
import deLogo from '../../assets/images/logos/logo-designengine.svg';


function BottomNav(props) {
	console.log('BottomNav()', props);

	return (
		<div className="bottom-nav-wrapper">
			<img onClick={()=> props.onPage('')} src={deLogo} className="bottom-nav-logo" alt="Design Engine" />
			<div className="bottom-nav-link-wrapper">
				<div className="bottom-nav-link" onClick={()=> props.onPage('inspect')}>Free Inspect</div>
				<div className="bottom-nav-link" onClick={()=> props.onPage('parts')}>Free Parts</div>
				<div className="bottom-nav-link" onClick={()=> props.onPage('terms')}>Terms</div>
				<div className="bottom-nav-link" onClick={()=> props.onPage('privacy')}>Privacy</div>

				{(isUserLoggedIn())
					? (<div className="bottom-nav-link" onClick={() => props.onLogout()}>Sign Out</div>)
					: (<span style={{ display : 'inline' }}>
							<div className="bottom-nav-link" onClick={()=> props.onPage('register')}>Sign Up</div>
							<div className="bottom-nav-link" onClick={()=> props.onPage('login')}>Login</div>
					</span>)
				}
			</div>
		</div>
	);
}

export default BottomNav;
