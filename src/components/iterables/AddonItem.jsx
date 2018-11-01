
import React, { Component } from 'react';
import './AddonItem.css';

import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';

class AddonItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}g

	render() {
		return (
			<div className="addon-item">
				<img className="addon-item-image" src={this.props.image} alt={this.props.title} />
				<div className="addon-item-title-wrapper">
					<Row>
						<Column flexGrow={1} horizontal="start" vertical="center"><div className="addon-item-title">{this.props.title}</div></Column>
						<Column flexGrow={1} horizontal="end" vertical="center"><button className="addon-item-button"><FontAwesome name="plus" className="addon-item-plus" /></button></Column>
					</Row>
				</div>
			</div>
		);
	}
}

export default AddonItem;
