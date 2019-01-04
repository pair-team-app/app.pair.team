
import React, { Component } from 'react';
import './ArtboardItem.css'

import { limitString } from '../../utils/funcs';
import defaultAvatar from '../../images/default-avatar.png';
import sketchIcon from '../../images/icon-sketch.png';

const TITLE_CHAR_LIMIT = 27;


class ArtboardItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	static getDerivedStateFromProps(nextProps) {
		return ({
			title : (nextProps.title) ? limitString(nextProps.title, TITLE_CHAR_LIMIT) : null,
			image : (nextProps.image) ? (!nextProps.image.includes('@')) ? nextProps.image + '@0.25x.png' : nextProps.image : null
		});
	}

	render() {
		const { title, image } = this.state;
		const className = (image) ? 'artboard-item' : 'artboard-item artboard-item-loading';

		return (
			<div className={className} onClick={()=> (title !== '') ? this.props.onClick() : null}>
				{(title !== '') && (<div>
					{(image) && (<img className="artboard-item-image" src={image} alt={title} />)}
					<div className="artboard-item-overlay" />
					{(image) && (<img className="artboard-item-icon" src={sketchIcon} alt="Icon" />)}
					{(image) && (<div className="artboard-item-details-wrapper">
						<img className="artboard-item-avatar" src={defaultAvatar} alt="Avatar" />
						<div className="artboard-item-title">{title}</div>
					</div>)}
				</div>)}
			</div>
		);
	}
}

export default ArtboardItem;
