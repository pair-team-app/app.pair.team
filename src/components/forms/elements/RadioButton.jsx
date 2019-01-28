
import React from 'react';
import './RadioButton.css';

import { Column, Row } from 'simple-flexbox';

import radButtonSelected from '../../../assets/images/buttons/btn-radio-button_selected.png'


function RadioButton(props) {
	const { enabled, selected, title, subtext } = props;

	const titleClass = (enabled) ? 'radio-button-title' : 'radio-button-title radio-button-title-disabled';
	const subtextClass = (enabled) ? 'radio-button-subtext' : 'radio-button-subtext radio-button-subtext-disabled';

	return (
		<div className="radio-button"><Row vertical="center">
			<Column vertical="center"><button disabled={(!enabled)} className="radio-button-button" onClick={()=> props.onClick()}>
				{(selected) && (<img className="radio-button-image" src={radButtonSelected} alt={title} />)}
			</button></Column>
			<Column vertical="center"><div className={titleClass}>{title}</div></Column></Row>
			<div className={subtextClass}>{subtext}</div>
		</div>
	);
}

export default RadioButton;
