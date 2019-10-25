
import React from 'react';
import './TopNav.css';

import { Browsers } from 'lang-js-utils';
import { NavLink } from 'react-router-dom';

import MobileMenu from '../../sections/MobileMenu';
import PageNavLink from '../../iterables/PageNavLink';
import navLinks from '../../../assets/json/nav-links';
import { Pages } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


function TopNav(props) {
// 	const { darkTheme } = props;

	return (<div className="top-nav">
		<div className="top-nav-branding-wrapper">
			<NavLink to={Pages.HOME} className="page-nav-link" onClick={(event)=> trackEvent('logo', 'home')}><div>
				<Logo />
				<div className="top-nav-title">Pair</div>
			</div></NavLink>
		</div>
		<div className="top-nav-theme-toggle-wrapper">
			{/*<input type="checkbox" checked={darkTheme} value={darkTheme} onChange={props.onToggleTheme} />*/}
		</div>
		{(Browsers.isMobile.ANY())
			? (<div className="top-nav-mobile-menu-wrapper"><MobileMenu /></div>)
			: (<div className="top-nav-link-wrapper">{(navLinks.top.map((navLink, i)=> (<PageNavLink key={i} navLink={navLink} onClick={(event)=> null} />)))}</div>)
		}
	</div>);
}

const Logo = ()=> {
	return (<div className="top-nav-logo">
		<svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1">
			<g id="WEBSITE" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
				<g id="MOBILE-HOME" transform="translate(-20.000000, -44.000000)" fillRule="nonzero">
					<g id="obit-logo" transform="translate(20.000000, 44.000000)">
						<rect id="logo-bg" fill="#232323" x="0" y="0" width="18" height="18" />
						<rect id="logo-fg" fill="#F4F4F4" x="1.21621622" y="1.21621622" width="15.5675676" height="15.5675676" rx="7.78378378" />
					</g>
				</g>
			</g>
		</svg>
	</div>);
};


export default (TopNav);
