
import React from 'react';
import './BlockingDialog.css';

import BaseOverlay from '../BaseOverlay';


function BlockingDialog(props) {
// console.log('AlertDialog()', { props });
	const { filled, title, tracking, children } = props;

	return (<BaseOverlay
		tracking={tracking}
		filled={filled}
		closeable={false}
		title={title}
		onComplete={()=> null}>
		<div className="blocking-dialog">
			{children}
		</div>
	</BaseOverlay>);
}


export default (BlockingDialog);
