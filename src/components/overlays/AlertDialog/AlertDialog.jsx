
import React from 'react';
import './AlertDialog.css'

import BaseOverlay from '../BaseOverlay';


function AlertDialog(props) {
	console.log('AlertDialog()', props);
	const { tracking, title, children } = props;
	let outro = false;

	const handleClose = (event)=> {
		console.log('AlertDialog.handleClose()', props);
		event.preventDefault();
		outro = true;
	};

	return (<BaseOverlay
		tracking={tracking}
		outro={outro}
		closeable={true}
		defaultButton="OK"
		title={title}
		onComplete={props.onComplete}>
		<div className="alert-dialog">
			<div className="alert-dialog-content">{children}</div>
			<div className="alert-dialog-button-wrapper">
				<button onClick={handleClose}>OK</button>
			</div>
		</div>
	</BaseOverlay>);
}


export default (AlertDialog);
