
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
		let isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onClick(isSelected);
	}

	render() {
		let className = (this.state.isSelected) ? 'imagery-item imagery-item-selected' : 'imagery-item';
		return (
			<div onClick={()=> this.handleClick()} className={className}>
				<img src={this.props.url} className="imagery-item-image" alt={this.props.title} />
			</div>
		);
	}
}

export default ImageryItem;
