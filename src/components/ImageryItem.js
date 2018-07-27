
import React, { Component } from 'react';
import './ImageryItem.css';


class ImageryItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSelected : false
		};
	}

	handleClick() {
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onClick(isSelected);
	}

	render() {
		const className = (this.state.isSelected) ? 'imagery-item-image imagery-item-image-selected' : 'imagery-item-image';

		return (
			<div onClick={()=> this.handleClick()} className="imagery-item">
				<img src={this.props.url} className={className} alt={this.props.title} />
			</div>
		);
	}
}

export default ImageryItem;
