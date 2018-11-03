
import React, { Component } from 'react';
import './ArtboardItem.css'

import FontAwesome from 'react-fontawesome';

class ArtboardItem extends Component {
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
		const imageClass = (this.props.size === 'landscape') ? 'artboard-item-image artboard-item-image-landscape' : 'artboard-item-image artboard-item-image-portrait';
		const titleClass = (this.state.isSelected) ? 'artboard-item-title is-hidden' : 'artboard-item-title';
		const btnClass = (this.state.isSelected) ? 'artboard-item-button artboard-item-button-selected' : 'artboard-item-button';

		return (
			<div className="artboard-item" onClick={()=> this.props.onClick()}>
				<img className={imageClass} src={this.props.image} alt={this.props.title} />
				<div className="artboard-item-details-wrapper">
					<div className={titleClass}>{this.props.title}</div>
					<button className={btnClass} onClick={()=> this.handleSelect()}>
						{(this.state.isSelected)
							? <FontAwesome name="check" className="artboard-item-check" />
							: 'Select'
						}
					</button>
				</div>
			</div>
		);
	}
}

export default ArtboardItem;
