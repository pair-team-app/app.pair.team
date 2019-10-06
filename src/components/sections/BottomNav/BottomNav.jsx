
import React from 'react';
import './BottomNav.css';

import PageNavLink from '../../iterables/PageNavLink';
import navLinks from '../../../assets/json/nav-links';


function BottomNav(props) {
	return (
		<div className="bottom-nav">
			<div className="bottom-nav-link-wrapper">
				{(navLinks.bottom.map((navLink, i)=> (
					<PageNavLink key={i} navLink={navLink} />
				)))}
			</div>
		</div>
	);
}

export default (BottomNav);
