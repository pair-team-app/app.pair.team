
import React from 'react';
import './BasePage.css';


function BasePage(props) {
	console.log('BasePage()', props);

	const { pageClass, children } = props;
	return (
		<div className={`base-page-wrapper ${pageClass}`}>
			{(children)}
		</div>
	);
}


export default (BasePage);
