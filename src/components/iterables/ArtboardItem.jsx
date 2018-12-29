
import React, { Component } from 'react';
import './ArtboardItem.css'

class ArtboardItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	static getDerivedStateFromProps(nextProps) {
		return ({ title : (nextProps.title) ? (nextProps.title.length > 27) ? (nextProps.title.substring(0, 26) + '…') : nextProps.title : null });
	}

	render() {
		const { title, image } = this.props;
		const className = (image) ? 'artboard-item' : 'artboard-item artboard-item-loading';

		return (
			<div className={className} onClick={()=> (title !== '') ? this.props.onClick() : null}>
				{(this.props.title !== '') && (<div>
					{(image) && (<img className="artboard-item-image" src={image.replace('@3x', '@0.25x')} alt={title} />)}
					<div className="artboard-item-overlay" />
					{(image) && (<img className="artboard-item-icon" src="/images/icon-sketch.png" alt="Icon" />)}
					{(image) && (<div className="artboard-item-details-wrapper">
						<img className="artboard-item-avatar" src="/images/default-avatar.png" alt="Avatar" />
						<div className="artboard-item-title">{title}</div>
					</div>)}
				</div>)}
			</div>
		);
	}
}

export default ArtboardItem;
