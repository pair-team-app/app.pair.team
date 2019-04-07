
import React from 'react';
import './IntegrationGridItem.css';

import FontAwesome from 'react-fontawesome';

import { Strings } from '../../../utils/lang';


function IntegrationGridItem(props) {
// 	console.log('IntegrationGridItem()', props);

	const { title, image, enabled, selected, inheritedClass, onClick } = props;
	return (<fieldset disabled={(!enabled)}><div className={`integration-grid-item${(selected) ? ' integration-grid-item-selected' : ''}${(inheritedClass) ? Strings.lPad(inheritedClass, ' ', -1) : ''}`} onClick={()=> (onClick) ? props.onClick() : null}>
		<img className="integration-grid-item-image" src={image} alt={title} />
		<div className="integration-grid-item-overlay" />
		<div className="integration-grid-item-title-wrapper">
			<div className="integration-grid-item-title">{title}</div>
		</div>
		<div className={`integration-grid-item-selected-icon${(selected) ? ' integration-grid-item-selected-icon-visible' : ''}`}><FontAwesome name="check-circle" size="2x" /></div>
	</div></fieldset>);
}

export default IntegrationGridItem;
