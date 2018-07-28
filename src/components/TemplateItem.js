
import React, { Component } from 'react';
import './TemplateItem.css';

import CurrencyFormat from 'react-currency-format';
import { Column, Row } from 'simple-flexbox';


class TemplateItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSelected : this.props.selected
		};
	}

	handleSelectClick() {
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onSelectClick(isSelected);
	}

	render() {
		const imageClass = (this.state.isSelected) ? 'template-item-image template-item-image-selected' : 'template-item-image';
		const btnClass = (this.state.isSelected) ? 'action-button small-button selected-button' : 'action-button small-button';

		return (
			<div className="template-item">
				<Row>
					<Column flexGrow={1} horizontal="center" className="template-item-container">
						<Row><img className={imageClass} src={this.props.image} alt={this.props.title} onClick={()=> this.props.onImageClick()} /></Row>
						<Row><span className="template-item-price"><CurrencyFormat value={this.props.price} displayType={'text'} thousandSeparator={true} prefix={'$'} /></span></Row>
					</Column>
				</Row>
				<Row horizontal="center" className="template-item-button">
					<button className={btnClass} onClick={()=> this.handleSelectClick()}>{(this.state.isSelected) ? 'Selected' : 'Select'}</button>
				</Row>
			</div>
		);
	}
}

export default TemplateItem;
