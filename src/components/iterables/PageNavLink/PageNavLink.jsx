
import React from 'react';
import './PageNavLink.css';

import { URIs } from 'lang-js-utils';
import { NavLink } from 'react-router-dom';

import { trackEvent } from '../../../utils/tracking';


function PageNavLink(props) {
	const { title, url } = props.navLink;
	const extURL = (/^\/url/i.test(url));

	const handleOpenURI = (event, uri)=> {
		event.preventDefault();

		const url = uri.split('/').slice(2).join('/');
		trackEvent('link', url);
		window.open(url);
		props.onClick(event);
	};

	return (<NavLink
		to={(extURL) ? url : `/${URIs.lastComponent(url)}`}
		target={(extURL) ? '_blank' : '_self'}
		className="page-nav-link"
		activeClassName="page-nav-link-selected"
		onClick={(event)=> (extURL) ? handleOpenURI(event, url) : props.onClick(event) }>
		{title}
	</NavLink>);
}


export default (PageNavLink);
