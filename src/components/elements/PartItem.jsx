
import React, { Component } from 'react';
import './PartItem.css'

class PartItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return (
			<div className="part-item">
				<img className="part-item-image" src={this.props.image} alt={this.props.title} />
				<div className="part-item-title">{this.props.title}</div>
			</div>
		);
	}
}

export default PartItem;
