
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
		const className = (this.props.title === 'Placeholder') ? 'template-item template-item-placeholder' : 'template-item';
		const imgClass = (this.props.title.includes('-portrait') || this.props.description.includes('-portrait')) ? 'template-item-image template-item-image-portrait' : 'template-item-image';
		const checkClass = (this.state.isSelected) ? 'template-item-check-wrapper template-item-check-wrapper-selected' : 'template-item-check-wrapper';
		const faClass = (this.state.isSelected) ? 'template-item-check' : 'template-item-check is-hidden';

		return (
			<div className={className}>
				<Row>
					<Column flexGrow={1} horizontal="center" className="template-item-container">
						{(this.props.title === 'Placeholder')
							? <Row><img className={imgClass} src={this.props.image} alt={this.props.title} /></Row>
							: <Row><img className={imgClass} src={this.props.image} alt={this.props.title} onClick={()=> this.props.onImageClick()} /></Row>
						}
						<div className={checkClass} onClick={()=> this.handleSelectClick()}><FontAwesome name="check" className={faClass} /></div>
					</Column>
				</Row>
			</div>
		);
	}
}

export default TemplateItem;
