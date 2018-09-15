
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
		const className = (this.state.isSelected) ? 'template-item template-item-selected' : 'template-item';
		const faClass = (this.state.isSelected) ? 'template-item-check' : 'template-item-check is-hidden';
		const btnClass = (this.state.isSelected) ? 'action-button template-item-button template-item-button-selected' : 'action-button template-item-button';

		return (
			<div className={className} onClick={()=> this.handleSelectClick()}>
				<Row>
					<Column flexGrow={1} horizontal="center" className="template-item-container">
						{/*<Row><img className="template-item-image" src={this.props.image} alt={this.props.title} onClick={()=> this.props.onImageClick()} /></Row>*/}
						<Row><img className="template-item-image" src={this.props.image} alt={this.props.title} /></Row>
						<Row><FontAwesome name="check-circle" className={faClass} /></Row>
					</Column>
				</Row>
				<Row>
					<Column flexGrow={1} horizontal="start">
						<Row className="template-item-title">{this.props.title}</Row>
						<Row className="template-item-text">{this.props.description}</Row>
						<Row><button className={btnClass}>
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
