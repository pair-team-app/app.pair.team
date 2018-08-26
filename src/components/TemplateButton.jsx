
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
		const isPending = (parseInt(this.props.pending) === 1);
		const className = (isPending) ? 'template-button template-button-pending' : 'template-button';

		return (
			<div>
				{!isPending && (
					<Column onClick={()=> this.props.onClick()} className={className}>
						<Row flexGrow={1} horizontal="center">
							<Row><img className="template-button-image" src={this.props.image} alt={this.props.title} onMouseOver={e=> (e.currentTarget.src = this.props.gif)} onMouseOut={e=> (e.currentTarget.src = this.props.image)} /></Row>
						</Row>
						<div>
							<div className="template-button-title">{this.props.title}</div>
							<div className="template-button-text">{this.props.info}</div>
							<div style={{textAlign:'left'}}><button className="action-button template-button-button" onClick={()=> this.props.onClick()}>Select</button></div>
						</div>
					</Column>
				)}

				{isPending && (
					<Column onClick={()=> this.props.onClick()} className={className}>
						<Row flexGrow={1} horizontal="center">
							<Row><div className="template-button-image-pending"></div></Row>
						</Row>
						<div>
							<div className="template-button-title" style={{width:'40%', height:'16px', backgroundColor:'#f3f3f3'}}></div>
							<div className="template-button-title" style={{width:'60%', height:'16px', backgroundColor:'#f3f3f3'}}></div>
							<div className="template-button-title" style={{width:'20%', height:'16px', backgroundColor:'#f3f3f3'}}></div>
						</div>
					</Column>
				)}
			</div>
		);
	}
}

export default TemplateButton;
