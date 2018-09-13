
import React, { Component } from 'react';
import './KeywordItem.css';

import axios from "axios/index";

import AIStatus from './elements/AIStatus';

class KeywordItem extends Component {
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
		let self = this;
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onClick(isSelected);

		if (isSelected) {
			this.showStatus(true, '…');
			axios.get('http://192.241.197.211/aws.php?action=COMPREHEND&phrase=' + this.props.title)
				.then((response)=> {
					console.log("COMPREHEND", JSON.stringify(response.data));
					const val = response.data.comprehend.sentiment.scores[response.data.comprehend.sentiment.outcome].toFixed(1);
					self.showStatus(false, response.data.comprehend.sentiment.outcome + ' (' + val + ')');
				}).catch((error) => {
			});
		}
	}

	render() {
		const className = (this.state.isSelected) ? 'keyword-item-image-wrapper keyword-item-image-wrapper-selected' : 'keyword-item-image-wrapper';
		const marginOffset = (this.divWrapper) ? (this.divWrapper.clientWidth < 200) ? (this.divWrapper.clientWidth * -0.5) + ((200 - this.divWrapper.clientWidth) * -0.5) : (this.divWrapper.clientWidth * -0.5) + ((this.divWrapper.clientWidth - 200) * 0.5) : 0;

		return (
			<div onClick={()=> this.handleClick()} className="keyword-item" ref={(element)=> { this.divWrapper = element; }}>
				{this.state.status.isVisible && (
					<div className="ai-status-wrapper" style={{marginLeft:marginOffset + 'px'}}>
						<AIStatus content={this.state.status.content} loading={this.state.status.isLoading} />
					</div>
				)}
				<div className={className}>
					<img className="keyword-item-image" src={'https://via.placeholder.com/60x60'} alt={this.props.title} />
				</div>
				<div className="keyword-item-text">{this.props.title}</div>
			</div>
		);
	}
}

export default KeywordItem;
