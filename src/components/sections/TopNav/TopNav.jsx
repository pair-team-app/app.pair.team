
import React from 'react';
import './TopNav.css';

import { NavLink } from 'react-router-dom';

import PageNavLink from '../../iterables/PageNavLink';
import navLinks from '../../../assets/json/nav-links';
import { Pages } from '../../../consts/uris';


const Logo = ()=> {
	return (<svg
		version="1.1"
		width="20px"
		height="20px"
		viewBox="0 0 20 20"
		className="top-nav-logo">
		<g id="WEBSITE" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
			<g id="PRICING" transform="translate(-19.000000, -19.000000)">
				<g id="Group-7" transform="translate(20.000000, 19.000000)">
					<g id="Group-4">
						<g id="logo" transform="translate(0.000000, 1.000000)">
							<rect id="logo-bg" stroke="#CECECE" fill="#F7F7F7" strokeLinecap="round" strokeLinejoin="round" x="-0.5" y="-0.5" width="19" height="19" rx="2" />
							<circle id="logo-fg" fill="#232323" cx="9" cy="9" r="8" />
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>);
};

function TopNav(props) {
	return (<div className="top-nav">
		<NavLink to={Pages.HOME} className="top-nav-branding-wrapper" activeClassName=""><div>
			<Logo />
			<div className="top-nav-title">Obit</div>
		</div></NavLink>
		<div className="top-nav-link-wrapper">
			{(navLinks.top.map((navLink, i)=> (<PageNavLink key={i} navLink={navLink} />)))}
		</div>
	</div>);
}

export default (TopNav);
