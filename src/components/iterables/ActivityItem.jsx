
import React, { Component } from 'react';
import './ActivityItem.css';

import { Column, Row } from 'simple-flexbox';

class ActivityItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<div className="activity-item"><Row vertical="center">
				<Column flexGrow={1} horizontal="start"><span dangerouslySetInnerHTML={{ __html : this.props.content }} /></Column>
				<Column flexGrow={1} horizontal="end"><img className="activity-item-avatar" src={this.props.avatar} alt={this.props.title} /></Column>
			</Row></div>
		);
	}
}

export default ActivityItem;
