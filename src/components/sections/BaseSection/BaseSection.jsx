
import React from 'react';
import './BaseSection.css';

import { Column } from 'simple-flexbox';


function BaseSection(props) {
// 	console.log('BaseSection()', props);

	const { children, style } = props;
	return (
		<div
			className="base-section"
			style={(style || null)}>
			<Column horizontal="center" style={{ height : '100%' }}><div className="base-section-content-wrapper">
				{children}
			</div></Column>
		</div>
	);
}


export default (BaseSection);
