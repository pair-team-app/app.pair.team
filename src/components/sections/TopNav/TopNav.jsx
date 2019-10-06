
import React from 'react';
import './TopNav.css';

import { NavLink } from 'react-router-dom';
import { Row } from 'simple-flexbox';

import PageNavLink from '../PageNavLink';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';
import deLogoBG from '../../../assets/images/logos/logo-designengine-bg.svg';
import deLogoFG from '../../../assets/images/logos/logo-designengine-fg.svg';
import navLinks from '../../../assets/json/nav-links';
import { Pages } from '../../../consts/uris';


const Logo = ()=> {
	return (<svg
		width="20px"
		height="20px"
		viewBox="0 0 20 20"
		version="1.1">
		<g id="WEBSITE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
			<g id="PRICING" transform="translate(-19.000000, -19.000000)">
				<g id="Group-7" transform="translate(20.000000, 19.000000)">
					<g id="Group-4">
						<g id="Logo" transform="translate(0.000000, 1.000000)">
							<rect id="Rectangle" stroke="#CECECE" fill="#F7F7F7" stroke-linecap="round" stroke-linejoin="round" x="-0.5" y="-0.5" width="19" height="19" rx="2"></rect>
							<circle id="Oval" fill="#232323" cx="9" cy="9" r="8"></circle>
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>);
};

const LogoBG = ()=> {
	return (<svg
		width="20px"
		height="20px"
		viewBox="0 0 20 20"
		className="top-nav-logo-bg"
		version="1.1">
		<g id="WEBSITE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
			<g id="PRICING-EXPANDED" transform="translate(-19.000000, -19.000000)" fill="#F7F7F7" stroke="#CECECE">
				<g id="Group-7" transform="translate(20.000000, 19.000000)">
					<g id="Group-4">
						<g id="Logo" transform="translate(0.000000, 1.000000)">
							<rect id="Rectangle" x="-0.5" y="-0.5" width="19" height="19" rx="2"></rect>
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>);
};

const LogoFG = ()=> {
	return (<svg
		width="16px"
		height="16px"
		viewBox="0 0 16 16"
		className="top-nav-logo-fg"
		version="1.1">
		<g id="WEBSITE" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
			<g id="PRICING-EXPANDED" transform="translate(-21.000000, -21.000000)" fill="#232323">
				<g id="Group-7" transform="translate(20.000000, 19.000000)">
					<g id="Group-4">
						<g id="Logo" transform="translate(0.000000, 1.000000)">
							<circle id="Oval" cx="9" cy="9" r="8"></circle>
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>);
};


function TopNav(props) {
	return (<div className="top-nav">
		<NavLink to={Pages.HOME} className="top-nav-branding-wrapper"><Row vertical="center">
			<div className="top-nav-logo-wrapper">
				<LogoBG /><LogoFG />
			</div>
			<div className="top-nav-title">Obit</div>
		</Row></NavLink>
		<div className="top-nav-link-wrapper">
			{(navLinks.top.map((navLink, i)=> (<PageNavLink key={i} navLink={navLink} />)))}
		</div>
	</div>);
}

export default (TopNav);
