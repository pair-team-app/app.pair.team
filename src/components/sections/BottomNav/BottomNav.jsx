
import React from 'react';
import './BottomNav.css';

import PageNavLink from '../../iterables/PageNavLink';
import navLinks from '../../../assets/json/nav-links';

import { GITHUB_XD_PLUGIN, NPM_DE_PLAYGROUND } from '../../../consts/uris';


function BottomNav(props) {
	const handleClick = (event, url)=> {
		event.preventDefault();
		window.open(url);
	};

	return (
		<div className="bottom-nav">
			<div className="bottom-nav-spacer" />
			<div className="bottom-nav-button-wrapper">
				<button className="quiet-button adjacent-button" onClick={(event)=> handleClick(event, NPM_DE_PLAYGROUND)}>Download NPM</button>
				<button className="quiet-button" onClick={(event)=> handleClick(event, GITHUB_XD_PLUGIN)}>Open in Adobe XD</button>
			</div>
			<div className="bottom-nav-link-wrapper">
				{(navLinks.bottom.map((navLink, i)=> (
					<PageNavLink key={i} navLink={navLink} onClick={(event)=> null} />
				)))}
			</div>
		</div>
	);
}


export default (BottomNav);
