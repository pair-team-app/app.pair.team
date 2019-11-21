
import React from 'react';
import './BottomNav.css';

import PageNavLink from '../../iterables/PageNavLink';
import navLinks from '../../../assets/json/nav-links';

import { GITHUB_FIGMA_PLUGIN, GITHUB_XD_PLUGIN, NPM_DE_PLAYGROUND } from '../../../consts/uris';
import { trackEvent, trackOutbound } from '../../../utils/tracking';


function BottomNav(props) {
	const handleClick = (event, url)=> {
		event.preventDefault();

		trackEvent('button', event.target.name);
		trackOutbound(url, ()=> {
			window.open(url);
		});

		window.open(url);
	};

	return (
		<div className="bottom-nav">
			<div className="bottom-nav-spacer" />
			<div className="button-wrapper-col bottom-nav-button-wrapper">
				<button className="quiet-button" onClick={(event)=> handleClick(event, NPM_DE_PLAYGROUND)}>NPM Module</button>
				<button className="quiet-button" onClick={(event)=> handleClick(event, GITHUB_FIGMA_PLUGIN)}>Figma Plugin</button>
				<button className="quiet-button" onClick={(event)=> handleClick(event, GITHUB_XD_PLUGIN)}>Adobe XD Plugin</button>
			</div>
			<div className="bottom-nav-link-wrapper">
				{(navLinks.bottom.map((navLink, i)=> (
					<PageNavLink key={i} navLink={navLink} onClick={()=> null} />
				)))}
			</div>
		</div>
	);
}


export default (BottomNav);
