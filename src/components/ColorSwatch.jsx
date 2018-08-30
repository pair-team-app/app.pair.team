
import React, { Component } from 'react';
import './ColorSwatch.css';

import axios from "axios/index";

import AIStatus from './elements/AIStatus';


class ColorSwatch extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSelected : false,
			status : {
				isVisible : false,
				content   : '',
				coords    : {
					x : 0,
					y : 0
				}
			}
		};

		this.divWrapper = null;
	}

	handleClick() {
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onClick(isSelected);

		let self = this;
		if (isSelected) {
			this.showStatus({x:2.125, y:0}, 'Loading…');
			axios.get('http://192.241.197.211/aws.php?action=COMPREHEND&phrase=' + this.props.title)
				.then((response)=> {
					console.log("COMPREHEND", JSON.stringify(response.data));
					self.showStatus({x:0, y:0}, 'Sentiment: ' + response.data.comprehend.sentiment.outcome);
				}).catch((error) => {
			});
		}
	}

	showStatus(coords, content) {
		let self = this;
		let status = {
			isVisible : true,
			content : content,
			coords : coords,
		};
		this.setState({ status : status });

		setTimeout(function() {
			let status = {
				isVisible : false,
				content   : '',
				coords    : {
					x : 0,
					y : 0
				},
			};
			self.setState({ status : status });
		}, 3125);
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
		const swatchClass = (this.state.isSelected) ? 'color-swatch color-swatch-selected' : 'color-swatch';
		const swatchStyle = (this.state.isSelected) ? {} : { backgroundImage : 'linear-gradient(to right, #' + this.props.gradient + ' , #' + this.props.swatch + ')' };
		//const faClass = (this.state.isSelected) ? 'color-swatch-check' : 'color-swatch-check is-hidden';

		const marginOffset = (this.divWrapper) ? (this.divWrapper.clientWidth < 200) ? (200 - this.divWrapper.clientWidth) * -0.5 : (this.divWrapper.clientWidth - 200) * 0.5 : 0;
		if (this.divWrapper && this.state.isSelected) console.log(this.divWrapper.clientWidth, marginOffset);

		return (
			<div onClick={()=> this.handleClick()} className={swatchClass} style={swatchStyle}>
				<div className="color-swatch-hex">{this.props.title}</div>
				{this.state.status.isVisible && (
					<div className="ai-status-wrapper"style={{marginLeft:marginOffset + 'px'}}>
						<AIStatus content={this.state.status.content} coords={this.state.status.coords} />
					</div>
				)}
			</div>
		);
	}
}

export default ColorSwatch;
