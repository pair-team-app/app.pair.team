
import React, { Component } from 'react';
import './ProjectItem.css';

import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';


class ProjectItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const faStyle = {
			color: '#999999',
			fontSize: '12px'
		};

		return (
			<div className="project-item">
				<Column flexGrow={1} horizontal="center">
					<Row><img className="project-item-image" src={this.props.image} alt={this.props.title} /></Row>
					<Row style={{width:'100%'}}>
						<Column flexGrow={1} horizontal="start"><span className="project-item-text">{this.props.title}</span></Column>
						<Column flexGrow={1} horizontal="end"><span className="project-item-text"><FontAwesome name="chevron-right" style={faStyle} /></span></Column>
					</Row>
				</Column>
			</div>
		);
	}
}

export default ProjectItem;
