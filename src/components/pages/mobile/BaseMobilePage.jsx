
import React from 'react';
import './BaseMobilePage.css';

import {Column} from "simple-flexbox";


const UnsupportedMobilePage = (props)=> {
	console.log('BaseMobilePage().UnsupportedMobilePage()', props);

	return (<div className="unsupported-mobile-page-wrapper">
		<Column horizontal="center">
			<h1>A desktop is required to View</h1>
			<h3>A desktop browser is required to view.</h3>
		</Column>
	</div>);
};


function BaseMobilePage(props) {
	console.log('BaseMobilePage()', props);

	const { className, children } = props;
	return (
		<div className={`base-mobile-page-wrapper${(className) ? ' ' + className : ''}`}>
			{(children) ? (children) : (<UnsupportedMobilePage />)}
		</div>
	);
}


export default (BaseMobilePage);
