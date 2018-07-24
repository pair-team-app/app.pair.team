
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

	handleClick() {
		let isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.handleClick(isSelected);
	}

	render() {
		let btnClass = (this.state.isSelected) ? 'action-button small-button selected-button' : 'action-button small-button';
		return (
			<div className="template-item">
				<Row>
					<Column flexGrow={1} horizontal="center" className="template-item-container">
						<Row><img className="template-item-image" src={this.props.image} alt={this.props.title} /></Row>
						<Row><span className="template-item-price"><CurrencyFormat value={this.props.price} displayType={'text'} thousandSeparator={true} prefix={'$'} /></span></Row>
						<Row><span className="template-item-title">{this.props.title}</span></Row>
					</Column>
				</Row>
				<Row horizontal="center" className="template-item-button">
					<button className={btnClass} onClick={()=> this.handleClick()}>{(this.state.isSelected) ? 'Selected' : 'Select'}</button>
				</Row>
			</div>
		);
	}
}

export default TemplateItem;
