
import React, { Component } from 'react';
import './CornerType.css';


class CornerType extends Component {
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
		const className = (this.state.isSelected) ? 'corner-type corner-type-selected' : 'corner-type';

		return (
			<div onClick={()=> this.handleClick()} className={className}>
				<img src={this.props.url} className="corner-type-image" alt={this.props.title} />
			</div>
		);
	}
}

export default CornerType;
