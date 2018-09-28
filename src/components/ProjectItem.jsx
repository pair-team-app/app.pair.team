
import React, { Component } from 'react';
import './ProjectItem.css';

import { Column, Row } from 'simple-flexbox';


class ProjectItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const imgClass = (this.props.title.includes('-portrait') || this.props.description.includes('-portrait')) ? 'project-item-image project-item-image-portrait' : 'project-item-image';

		return (
			<div className="project-item" onClick={()=> this.props.onClick()}>
				<Column flexGrow={1} horizontal="center">
					<Row><img className={imgClass} src={this.props.image} alt={this.props.title} /></Row>
				</Column>
			</div>
		);
	}
}

export default ProjectItem;
