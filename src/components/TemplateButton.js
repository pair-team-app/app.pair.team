
import React, { Component } from 'react';
import './TemplateButton.css';

import { Column, Row } from 'simple-flexbox';


class TemplateButton extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div onClick={()=> this.props.onClick()} className="template-button">
				<Column flexGrow={1} horizontal="center">
					<Row><img className="template-button-image" src={this.props.image} /></Row>
					<Row><div className="template-button-text">{this.props.title}</div></Row>
				</Column>
			</div>
		);
	}
}

export default TemplateButton;
