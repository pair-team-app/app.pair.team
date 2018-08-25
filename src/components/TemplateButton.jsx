
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
			<Column onClick={()=> this.props.onClick()} className="template-button">
				<Row flexGrow={1} horizontal="center">
					<Row><img className="template-button-image" src={this.props.image} alt={this.props.title} onMouseOver={e=> (e.currentTarget.src = this.props.gif)} onMouseOut={e=> (e.currentTarget.src = this.props.image)} /></Row>
				</Row>
			  <div>
					<div className="template-button-title">{this.props.title}</div>
					<div className="template-button-text">{this.props.info}</div>
				  <div style={{textAlign:'left'}}><button className="action-button template-button-button" onClick={()=> this.props.onClick()}>Select</button></div>
				</div>
			</Column>
		);
	}
}

export default TemplateButton;
