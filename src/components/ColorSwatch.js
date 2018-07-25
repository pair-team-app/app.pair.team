
import React, { Component } from 'react';
import './ColorSwatch.css';

// import ReactTooltip from 'react-tooltip'

class ColorSwatch extends Component {
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
		const swatchStyle = {
			backgroundColor: '#' + this.props.swatch,
			border: (this.state.isSelected) ? '2px solid #333333' : '2px solid #' + this.props.swatch
		};

		return (
			<div onClick={()=> this.handleClick()} className="color-swatch" style={swatchStyle} data-tip={'#' + this.props.swatch.toUpperCase()} data-type="dark">
				<span className="color-swatch-hex">{'#' + this.props.swatch}</span>
				{/*<ReactTooltip />*/}
			</div>
		);
	}
}

export default ColorSwatch;
