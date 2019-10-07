
import React from 'react';
import './PageNavLink.css';

import { URIs } from 'lang-js-utils';
import { NavLink } from 'react-router-dom';


function PageNavLink(props) {
	const { title, url } = props.navLink;
	const extURL = (/^\/url/i.test(url));

	const handleOpenURL = (event, url)=> {
		event.preventDefault();
		window.open(url.split('/').slice(2).join('/'));
		props.onClick(event);
	};

	return (<NavLink
		to={(extURL) ? url : `/${URIs.lastComponent(url)}`}
		target={(extURL) ? '_blank' : '_self'}
		className="page-nav-link"
		activeClassName="page-nav-link-selected"
		onClick={(event)=> (extURL) ? handleOpenURL(event, url) : props.onClick(event) }>
		{title}
	</NavLink>);
}


export default (PageNavLink);
