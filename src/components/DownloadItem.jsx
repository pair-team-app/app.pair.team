
import React, { Component } from 'react';
import './DownloadItem.css';

import { Column, Row } from 'simple-flexbox';


class DownloadItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	handleSelectClick() {
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onSelectClick(isSelected);
	}

	render() {
		return (
			<div className="download-item">
				<Row>
					<Column flexGrow={1} horizontal="center" vertical="center" className="download-item-container">
						<Row><img className="download-item-image" src={this.props.image} alt={this.props.title} /></Row>
					</Column>
				</Row>
				<Row>
					<Column flexGrow={1} horizontal="start">
						<Row className="download-item-title">{this.props.title}</Row>
						<Row className="download-item-text">{this.props.description}</Row>
						<Row><button className="action-button download-item-button" onClick={()=> this.props.onClick()}>{this.props.button}</button></Row>
					</Column>
				</Row>
			</div>
		);
	}
}

export default DownloadItem;
