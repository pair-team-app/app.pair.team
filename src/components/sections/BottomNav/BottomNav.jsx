
import React from 'react';
import './BottomNav.css';

import { trackEvent } from './../../../utils/tracking';
import { URIs } from './../../../utils/lang';
import sections from './../../../assets/json/nav-sections';


function BottomNav(props) {
// 	console.log('BottomNav()', props);

	const handleLink = (url)=> {
// 		console.log('BottomNav.handleLink()', url);

		if (URIs.firstComponent(url) === 'modal') {
			trackEvent('link', URIs.lastComponent(url));
			props.onModal(`/${URIs.lastComponent(url)}`);

		} else if (URIs.firstComponent(url) === 'page') {
			trackEvent('link', url);
			props.onPage(`/${URIs.lastComponent(url)}`);

		} else {
			window.open(url);
		}
	};

	return (
		<div className="bottom-nav">
			<div className="bottom-nav-link-wrapper">
				{(sections.bottom.map((section, i)=> (
					<div key={i} className="bottom-nav-link" onClick={()=> handleLink(section.url)}>{section.title}</div>
				)))}
			</div>
			<div className="bottom-nav-disclaimer">
				By tapping “Sign in with Github” or “Sign Up”<br />you accept our <span className="bottom-nav-link" onClick={()=> handleLink('/page/terms')}>Terms of Service.</span>
			</div>
		</div>
	);
}

export default BottomNav;
