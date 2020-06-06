
import React from 'react';
import { GITHUB_FIGMA_PLUGIN, GITHUB_XD_PLUGIN, NPM_DE_PLAYGROUND } from '../../../consts/uris';
import { trackEvent, trackOutbound } from '../../../utils/tracking';
import './BottomNav.css';



function BottomNav(props) {
	const handleClick = (event, url)=> {
		event.preventDefault();

		trackEvent('button', event.target.name);
		trackOutbound(url);
	};

	return (
		<div className="bottom-nav">
			<div className="button-wrapper-col button-wrapper">
				<button className="quiet-button" onClick={(event)=> handleClick(event, NPM_DE_PLAYGROUND)}>NPM Module</button>
				<button className="quiet-button" onClick={(event)=> handleClick(event, GITHUB_FIGMA_PLUGIN)}>Figma Plugin</button>
				<button className="quiet-button" onClick={(event)=> handleClick(event, GITHUB_XD_PLUGIN)}>Adobe XD Plugin</button>
			</div>
		</div>
	);
}


export default (BottomNav);
