
import React from 'react';
import './BaseDesktopPage.css';


function BaseDesktopPage(props) {
// 	console.log('BaseDesktopPage()', props);

	const { className, children, style } = props;
	return (
		<div
			className={`base-desktop-page-wrapper ${className}`}
			style={(style) ? style : null}>
				{(children)}
		</div>
	);
}


export default (BaseDesktopPage);
