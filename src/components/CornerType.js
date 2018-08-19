
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
		const style = { borderRadius : this.props.amount + 'px' };
		const className = (this.state.isSelected) ? 'corner-type corner-type-selected' : 'corner-type';

		return (
			<div onClick={()=> this.handleClick()} className={className} style={style}>
				<span className="corner-type-text">{this.props.title}px</span>
			</div>
		);
	}
}

export default CornerType;
