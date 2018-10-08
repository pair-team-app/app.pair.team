
import React, { Component } from 'react';
import './PartItem.css'

import FontAwesome from 'react-fontawesome';

class PartItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isSelected : false
		};
	}

	handleSelect = ()=> {
		let isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onSelect(isSelected);
	};

	render() {
		const titleClass = (this.state.isSelected) ? 'part-item-title is-hidden' : 'part-item-title';
		const btnClass = (this.state.isSelected) ? 'part-item-button part-item-button-selected' : 'part-item-button';

		return (
			<div className="part-item">
				<img className="part-item-image" src={this.props.image} alt={this.props.title} onClick={()=> this.props.onClick()} />
				<div className="part-item-details-wrapper">
					<div className={titleClass}>{this.props.title}</div>
					<button className={btnClass} onClick={()=> this.handleSelect()}>
						{(this.state.isSelected)
							? <FontAwesome name="check" className="part-item-check" />
							: 'Select'
						}
					</button>
				</div>
			</div>
		);
	}
}

export default PartItem;
