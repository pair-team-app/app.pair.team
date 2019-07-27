
import React from 'react';
import './BaseSection.css';

import { Column } from 'simple-flexbox';


function BaseSection(props) {
// 	console.log('BaseSection()', props);

	const { className, children, style } = props;
	return (
		<div
			className={`base-section ${className}`}
			style={(style) ? style : null}>
			<Column horizontal="center"><div className="base-section-content-wrapper">
				{children}
			</div></Column>
		</div>
	);
}


export default (BaseSection);
