
import React, { Component } from 'react';
import './CornerType.css';


class CornerType extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSelected : this.props.isSelected
		};
	}

	handleClick() {
		this.props.onClick();
	}

	render() {
		const className = (this.props.isSelected) ? 'corner-type corner-type-selected' : 'corner-type';

		return (
			<div onClick={()=> this.handleClick()} className={className}>
				<img src={this.props.url} className="corner-type-image" alt={this.props.title} />
			</div>
		);
	}
}

export default CornerType;
