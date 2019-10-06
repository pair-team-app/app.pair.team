
import React from 'react';
import './PageNavLink.css';

import { NavLink } from 'react-router-dom';
import { URIs } from '../../../utils/lang';


function PageNavLink(props) {
	const { title, url } = props.navLink;

	return (<NavLink
		to={`/${URIs.lastComponent(url)}`}
		className="page-nav-link"
		activeClassName="page-nav-link page-nav-link-selected">{title}
	</NavLink>);
}


export default (PageNavLink);
