
import React from 'react';
import './PlaygroundFooter.css';

import FontAwesome from 'react-fontawesome';

import { GITHUB_XD_PLUGIN, NPM_DE_PLAYGROUND } from '../../../../consts/uris';
import { trackEvent, trackOutbound } from '../../../../utils/tracking';


function PlaygroundFooter(props) {
// 	console.log('PlaygroundFooter()', props);

	const handleClick = (event, url)=> {
		event.preventDefault();

		trackEvent('button', event.target.name);
		trackOutbound(url, ()=> {
			window.open(url);
		});
	};

	const { comments, desktop, mobile } = props;
	return (<div className="playground-footer">
		<div className="playground-footer-comments-wrapper">
			<button className="quiet-button glyph-button" data-selected={comments} onClick={props.onToggleComments}><FontAwesome name="comment" /></button>
		</div>
		<div className="playground-footer-button-wrapper">
			<button className="quiet-button adjacent-button" onClick={(event)=> handleClick(event, NPM_DE_PLAYGROUND)} name="download-npm">NPM Module</button>
			<button className="quiet-button" onClick={(event)=> handleClick(event, GITHUB_XD_PLUGIN)} name="adobe-xd-plugin">Adobe XD Plugin</button>
		</div>
		<div className="playground-footer-device-wrapper">
			<button className="quiet-button glyph-button adjacent-button"><FontAwesome name="mobile" /></button>
			<button className="quiet-button glyph-button"><FontAwesome name="desktop" /></button>
		</div>
	</div>);
}


export default (PlaygroundFooter);
