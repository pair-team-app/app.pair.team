
import React, { Component } from 'react';
import './TemplateItem.css';

// import CurrencyFormat from 'react-currency-format';
import FontAwesome from 'react-fontawesome';
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
		const faClass = (this.state.isSelected) ? 'template-item-check' : 'template-item-check is-hidden';
		const btnClass = (this.state.isSelected) ? 'action-button template-item-button template-item-button-selected' : 'action-button template-item-button';

		return (
			<div className="template-item">
				<Row>
					<Column flexGrow={1} horizontal="center" className="template-item-container">
						<Row><img className={imageClass} src={this.props.image} alt={this.props.title} onClick={()=> this.props.onImageClick()} /></Row>
						<Row><FontAwesome name="check-circle" className={faClass} /></Row>
					</Column>
				</Row>
				<Row>
					<Column flexGrow={1} horizontal="start">
						<Row className="template-item-title">{this.props.title}</Row>
						<Row className="template-item-text">{this.props.description}</Row>
						<Row><button className={btnClass} onClick={()=> this.handleSelectClick()}>
							{this.state.isSelected && ('Selected')}
							{!this.state.isSelected && ('$' + this.props.price + ' Buy')}
						</button></Row>
					</Column>
				</Row>
			</div>
		);
	}
}

export default TemplateItem;
