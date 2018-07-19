
import React, { Component } from 'react';
import './TemplateButton.css';

import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';


class TemplateButton extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		let faStyle = {
			color: '#0000ff',
			fontSize: '14px'
		};

		return (
			<div onClick={()=> this.props.onClick()} className="template-button">
				<Column flexGrow={1} horizontal="center">
					<Row><img className="template-button-image" src={this.props.image} alt={this.props.title} /></Row>
					<Row style={{width:'100%'}}>
						<Column flexGrow={1} horizontal="start"><span className="template-button-text">{this.props.title}</span></Column>
						<Column flexGrow={1} horizontal="end"><span className="template-button-text"><FontAwesome name="plus-circle" style={faStyle} /></span></Column>
					</Row>
				</Column>
			</div>
		);
	}
}

export default TemplateButton;
