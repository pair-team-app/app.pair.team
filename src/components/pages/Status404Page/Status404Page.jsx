
import React from 'react';
import './Status404Page.css';

import BasePage from '../BasePage';


function Status404Page(props) {
	console.log('Status404Page()', { props });

	return (<BasePage { ...props } className="status-404-page">
		<h1>Nothing Here, 404</h1>
	</BasePage>);
}


export default (Status404Page);
