
import React, { Component } from 'react';
import './ColorSwatch.css';

import FontAwesome from 'react-fontawesome';

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

	adjustBrightness(col, amt) {

		let usePound = false;

		if (col[0] === '#') {
			col = col.slice(1);
			usePound = true;
		}

		let r = parseInt(col.substring(0,2),16);
		let g = parseInt(col.substring(2,4),16);
		let b = parseInt(col.substring(4,6),16);

		r += amt;
		g += amt;
		b += amt;

		if (r > 255) {
			r = 255;

		} else if (r < 0) {
			r = 0;
		}

		if (g > 255) {
			g = 255;

		} else if (g < 0) {
			g = 0;
		}

		if (b > 255) {
			b = 255;

		} else if (b < 0) {
			b = 0;
		}

		let rr = ((r.toString(16).length === 1) ? "0" + r.toString(16) : r.toString(16));
		let gg = ((g.toString(16).length === 1) ? "0" + g.toString(16) : g.toString(16));
		let bb = ((b.toString(16).length === 1) ? "0" + b.toString(16) : b.toString(16));

		return ((usePound) ? '#' : '') + rr + gg + bb;
	}


	render() {
		const swatchStyle = { backgroundImage : 'linear-gradient(to right, #' + this.props.gradient + ' , #' + this.props.swatch + ')' };
		const faClass = (this.state.isSelected) ? 'color-swatch-check' : 'color-swatch-check is-hidden';

		return (
			<div onClick={()=> this.handleClick()} className="color-swatch" style={swatchStyle}>
				<div className="color-swatch-hex">{this.props.title}</div>
				<FontAwesome name="check-circle" className={faClass} />
			</div>
		);
	}
}

export default ColorSwatch;
