
import React from 'react';
import './TopNav.css';

import { NavLink } from 'react-router-dom';
import { Row } from 'simple-flexbox';

import PageNavLink from '../PageNavLink';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';
import navLinks from '../../../assets/json/nav-links';
import { Pages } from '../../../consts/uris';


function TopNav(props) {
	return (<div className="top-nav">
		<NavLink to={Pages.HOME} className="top-nav-logo-wrapper"><Row vertical="center">
			<img className="top-nav-logo" src={deLogo} alt="Logo" />
			<div className="top-nav-title">Design Engine</div>
		</Row></NavLink>
		<div className="top-nav-link-wrapper">
			{(navLinks.top.map((navLink, i)=> (<PageNavLink key={i} navLink={navLink} />)))}
		</div>
	</div>);
}

export default (TopNav);
