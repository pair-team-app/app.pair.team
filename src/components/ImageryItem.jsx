
import React, { Component } from 'react';
import './ImageryItem.css';

import axios from "axios/index";

import AIStatus from './elements/AIStatus';

class ImageryItem extends Component {
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
		}, 2000);
	}

	handleClick() {
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onClick(isSelected);

		let self = this;
		if (isSelected) {
			axios.get('http://192.241.197.211/aws.php?action=REKOGNITION&image_url=' + encodeURIComponent(this.props.url))
				.then((response)=> {
					console.log("REKOGNITION", JSON.stringify(response.data));
					self.showStatus({x:0, y:0}, 'Topic: ' + response.data.rekognition.labels[0].Name);
				}).catch((error) => {
			});
		}
	}

	render() {
		const className = (this.state.isSelected) ? 'imagery-item-image imagery-item-image-selected' : 'imagery-item-image';
		const marginOffset = -100;//(this.divWrapper) ? (this.divWrapper.clientWidth < 200) ? (200 - this.divWrapper.clientWidth) * -0.5 : (this.divWrapper.clientWidth - 200) * 0.5 : 0;

		return (
			<div onClick={()=> this.handleClick()} className="imagery-item" ref={(element)=> { this.divWrapper = element; }}>
				{this.state.status.isVisible && (
					<div className="ai-status-wrapper" style={{marginLeft:marginOffset + 'px'}}>
						<AIStatus content={this.state.status.content} coords={this.state.status.coords} />
					</div>
				)}
				<img src={this.props.url} className={className} alt={this.props.title} />
			</div>
		);
	}
}

export default ImageryItem;
