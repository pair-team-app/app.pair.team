
import React, { Component } from 'react';
import './ArtboardItem.css'

class ArtboardItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	static getDerivedStateFromProps(nextProps) {
		return ({ title : (nextProps.title.length > 32) ? (nextProps.title.substring(0, 31) + '…') : nextProps.title });
	}

	render() {
		const imageClass = (this.props.size === 'landscape') ? 'artboard-item-image artboard-item-image-landscape' : 'artboard-item-image artboard-item-image-portrait';

		return (
			<div className="artboard-item" onClick={()=> this.props.onClick()}>
				<img className={imageClass} src={this.props.image} alt={this.props.title} />
				<div className="artboard-item-details-wrapper">
					<div className="artboard-item-title">{this.state.title}</div>
				</div>
			</div>
		);
	}
}

export default ArtboardItem;
