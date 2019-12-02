
import React from 'react';
import './RadioButton.css';

import radButtonSelected from '../../../assets/images/buttons/btn-radio-button_selected.png'


function RadioButton(props) {
	const { enabled, selected, title, subtext } = props;

	const titleClass = (enabled) ? 'radio-button-title' : 'radio-button-title radio-button-title-disabled';
	const subtextClass = (enabled) ? 'radio-button-subtext' : 'radio-button-subtext radio-button-subtext-disabled';

	return (
		<div className="radio-button">
			<button disabled={(!enabled)} className="radio-button-button" onClick={()=> props.onClick()}>
				{(selected) && (<img className="radio-button-image" src={radButtonSelected} alt={title} />)}
			</button>
			<div className={titleClass}>{title}</div>
			<div className={subtextClass}>{subtext}</div>
		</div>
	);
}

export default RadioButton;
