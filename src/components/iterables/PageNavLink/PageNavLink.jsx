
import React from 'react';
import './PageNavLink.css';

import { NavLink } from 'react-router-dom';
import { trackEvent, trackOutbound } from '../../../utils/tracking';


function PageNavLink(props) {
  console.log('PageNavLink()', { props });

	const { children, to } = props;
	const extURL = (/^http?s:\/\//i.test(to));

	const handleExternalURL = (event)=> {
    console.log('PageNavLink().handleExternalURL', { event, this : { ...this } });

		event.preventDefault();

		trackEvent('link', to);
		trackOutbound(to, ()=> {
			window.open(to);

			if (props.onClick) {
				props.onClick(event);
			}
		});
	};

	return (<NavLink
		to={to}
		target={(extURL) ? '_blank' : '_self'}
		className="page-nav-link"
		activeClassName="page-nav-link-selected"
		onClick={(event)=> (extURL) ? handleExternalURL(event, to) : (props.onClick) ? props.onClick(event, to) : null }
		tabIndex="0"
    data-selected={false}>
		{children}
	</NavLink>);
}


export default (PageNavLink);
