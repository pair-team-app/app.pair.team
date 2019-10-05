
import React from 'react';
import './TopNav.css';

import { Row } from 'simple-flexbox';

import deLogo from '../../../assets/images/logos/logo-designengine.svg';
import navLinks from '../../../assets/json/nav-links';
import { URIs } from '../../../utils/lang';
import { trackEvent } from './../../../utils/tracking';


const TopNavLink = (props)=> {
	const { title, url, selected } = props;
	return (<div className={`top-nav-link${(selected) ? 'top-nav-link-selected' : ''}`} onClick={()=> props.onClick(url)}>
		{title}
	</div>);
};


function TopNav(props) {
	const handleLink = (url)=> {
		console.log(this.constructor.name, '.handleLink()', url);

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

	return (<div className="top-nav">
		<div className="top-nav-logo-wrapper"><Row vertical="center">
			<img className="top-nav-logo" src={deLogo} onClick={()=> window.location = '/'} alt="Logo" />
			<div className="top-nav-title">Design Engine</div>
		</Row></div>
		<div className="top-nav-link-wrapper">
			{(navLinks.top.map((navLink)=> (<TopNavLink title={navLink.title} onClick={handleLink} />)))}
		</div>
	</div>);
}

export default (TopNav);
