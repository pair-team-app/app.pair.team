
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
		const className = (this.props.title !== '') ? 'artboard-item' : 'artboard-item artboard-item-loading';
		const imageClass = (this.props.size === 'landscape') ? 'artboard-item-image artboard-item-image-landscape' : 'artboard-item-image artboard-item-image-portrait';

		return (
			<div className={className} onClick={()=> (this.props.title !== '') ? this.props.onClick() : null}>
				{(this.props.title !== '') && (<div>
					<img className={imageClass} src={this.props.image} alt={this.props.title} />
					<div className="artboard-item-overlay" />
					<img className="artboard-item-icon" src="/images/icon-sketch.png" />
					<div className="artboard-item-details-wrapper">
						<img className="artboard-item-avatar" src="/images/default-avatar.png" />
						<div className="artboard-item-title">{this.state.title}</div>
					</div>
				</div>)}
			</div>
		);
	}
}

export default ArtboardItem;
