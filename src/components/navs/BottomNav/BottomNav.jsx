
import React from 'react';
import './BottomNav.css';

import { trackEvent } from './../../../utils/tracking';
import { URIs } from './../../../utils/lang';
import deLogo from './../../../assets/images/logos/logo-designengine.svg';
import sections from './../../../assets/json/nav-sections';


function BottomNav(props) {
// 	console.log('BottomNav()', props);

	const handleLink = (url)=> {
// 		console.log('BottomNav.handleLink()', url);

		if (URIs.firstComponent(url) === 'modal') {
			trackEvent('link', URIs.lastComponent(url));
			props.onModal(`/${URIs.lastComponent(url)}`);

		} else {
			trackEvent('link', url);
			props.onPage(url);
		}
	};

	return (
		<div className="bottom-nav-wrapper">
			<div className="bottom-nav-link-wrapper">
				{(sections.bottom.map((section, i)=> (
					<div key={i} className="bottom-nav-link" onClick={()=> this.handleLink(section.url.substr(1))}>{section.title}</div>
				)))}
			</div>
			<img className="bottom-nav-logo" src={deLogo} onClick={()=> this.handleLink('')} alt="Design Engine" />
		</div>
	);
}

export default BottomNav;
