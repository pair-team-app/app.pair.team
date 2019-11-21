
import React from 'react';
import './PlaygroundFooter.css';

import FontAwesome from 'react-fontawesome';

import { GITHUB_FIGMA_PLUGIN, GITHUB_XD_PLUGIN, NPM_DE_PLAYGROUND } from '../../../../consts/uris';
import { trackEvent, trackOutbound } from '../../../../utils/tracking';


function PlaygroundFooter(props) {
// 	console.log('PlaygroundFooter()', props);

	const handleClick = (event, url)=> {
		event.preventDefault();
		event.stopPropagation();

		trackEvent('button', event.target.name);
		trackOutbound(url, ()=> {
			window.open(url);
		});
		window.open(url);
	};

	const { accessibility, cursor, playground, builds } = props;
	return (<div className="playground-footer">
		<div className="playground-footer-comments-wrapper">
			<button className="quiet-button glyph-button" onClick={props.onToggleCursor} data-selected={cursor}><FontAwesome name="comment" /></button>
		</div>
		<div className="button-wrapper-col playground-footer-button-wrapper">
			<button className="quiet-button" onClick={(event)=> handleClick(event, NPM_DE_PLAYGROUND)}>NPM Module</button>
			<button className="quiet-button" onClick={(event)=> handleClick(event, GITHUB_FIGMA_PLUGIN)}>Figma Plugin</button>
			<button className="quiet-button" onClick={(event)=> handleClick(event, GITHUB_XD_PLUGIN)}>Adobe XD Plugin</button>
		</div>
		<div className="button-wrapper-col playground-footer-content-toggle-wrapper">
			<button className="quiet-button glyph-button" onClick={props.onToggleAccessibility} data-selected={(accessibility)}><FontAwesome name="universal-access" /></button>
			<button className="quiet-button glyph-button" onClick={props.onToggleMobile} data-selected={(playground.deviceID === 2)} data-hidden={(builds === 1)}><FontAwesome name="mobile" /></button>
			<button className="quiet-button glyph-button" onClick={props.onToggleDesktop} data-selected={(playground.deviceID === 1)} data-hidden={(builds === 1)}><FontAwesome name="desktop" /></button>
		</div>
	</div>);
}


export default (PlaygroundFooter);
