
import React from 'react';
import './AlertDialog.css'

import { URIs } from 'lang-js-utils';
import BaseOverlay from '../BaseOverlay';


function AlertDialog(props) {
	console.log('AlertDialog()', props);
	const { tracking, title, children } = props;

	return (<BaseOverlay
		tracking={`${tracking}/${URIs.firstComponent()}`}
		outro={false}
		closeable={true}
		defaultButton="OK"
		title={title}
		onComplete={props.onComplete}>
		<div className="alert-dialog-content">{children}</div>
	</BaseOverlay>);
}


export default (AlertDialog);
