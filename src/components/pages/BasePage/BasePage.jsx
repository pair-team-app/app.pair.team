
import React from 'react';
import './BasePage.css';


function BasePage(props) {
// 	console.log('BasePage()', props);

	const { className, children, style } = props;
	return (
		<div
			className={`base-page ${className}`}
			style={(style) ? style : null}>
				{(children)}
		</div>
	);
}


export default (BasePage);
