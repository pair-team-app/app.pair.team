
import React, { Component } from 'react';
import './CornerType.css';

import AIStatus from './elements/AIStatus';


class CornerType extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSelected : false,
			status : {
				isVisible : false,
				content   : '',
				isLoading : false
			}
		};

		this.divWrapper = null;
	}

	showStatus(isLoading, content) {
		let self = this;
		let status = {
			isVisible : true,
			content   : content,
			isLoading : isLoading
		};
		this.setState({ status : status });

		setTimeout(function() {
			let status = {
				isVisible : false,
				content   : '',
				isLoading : false
			};
			self.setState({ status : status });
		}, 3125);
	}

	handleClick() {
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onClick(isSelected);

		if (isSelected) {
			this.showStatus(true, 'Loading…');
			let self = this;

			setTimeout(function() {
				self.showStatus(false, (self.props.amount < 4) ? 'Sentiment: Negative' : (self.props.amount < 20) ? 'Sentiment: Neutral' : 'Sentiment: Positive');
			}, 250);
		}
	}

	render() {
// 		const style = { borderRadius : this.props.amount + 'px' };
		const className = (this.state.isSelected) ? 'corner-type corner-type-selected' : 'corner-type';
		const marginOffset = (this.divWrapper) ? (this.divWrapper.clientWidth < 200) ? (this.divWrapper.clientWidth * -0.5) + ((200 - this.divWrapper.clientWidth) * -0.5) : (this.divWrapper.clientWidth * -0.5) + ((this.divWrapper.clientWidth - 200) * 0.5) : 0;
		if (this.divWrapper && this.state.isSelected) console.log(this.divWrapper.clientWidth, marginOffset);

		return (
			<div onClick={()=> this.handleClick()} className={className} ref={(element)=> { this.divWrapper = element; }}>
				{this.state.status.isVisible && (
					<div className="ai-status-wrapper" style={{marginLeft:marginOffset + 'px'}}>
						<AIStatus content={this.state.status.content} loading={this.state.status.isLoading} />
					</div>
				)}
				<span className="corner-type-text">{this.props.title}px</span>
			</div>
		);
	}
}

export default CornerType;
