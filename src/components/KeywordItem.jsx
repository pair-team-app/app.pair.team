
import React, { Component } from 'react';
import './KeywordItem.css';

import axios from "axios/index";
import FontAwesome from 'react-fontawesome';

import AIStatus from './elements/AIStatus';

class KeywordItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			section    : '',
			isSelected : this.props.selected,
			image      : this.props.img,
			status     : {
				isVisible : false,
				content   : '',
				isLoading : false
			}
		};

		this.divWrapper = null;
		this.topics = [];
		this.ind = 0;
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

	showTopic() {
		let self = this;
		setTimeout(function() {
			self.props.onTooltip({ txt : self.topics[self.ind] });
			if (++self.ind < self.topics.length) {
				self.showTopic();

			} else {
				self.props.onTooltip({ txt : 'Design Engine is ready.' });
			}
		}, 1500);
	}

	handleClick() {
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onClick(isSelected);

		if (isSelected) {
			let self = this;
			this.showStatus(true, '…');

			axios.get('http://192.241.197.211/aws.php?action=COMPREHEND&phrase=' + this.props.title)
				.then((response)=> {
					console.log("COMPREHEND", response.data);
					const val = response.data.comprehend.sentiment.scores[response.data.comprehend.sentiment.outcome].toFixed(1);
					this.showStatus(false, response.data.comprehend.sentiment.outcome + ' (' + val + ')');
				}).catch((error) => {
			});


			if (this.props.section === 'keyword') {
				this.props.onTooltip({
					isAnimated : true,
					txt        : 'Sending "' + this.props.title + '" Design Type into AI'
				});

				axios.get('https://api.unsplash.com/search/photos?query=' + this.props.title + '&per_page=50', { headers : { Authorization : 'Bearer 946641fbc410cd54ff5bf32dbd0710dddef148f85f18a7b3907deab3cecb1479' } })
					.then((response) => {
						console.log("UNSPLASH", JSON.stringify(response.data.results));

						const ind = Math.floor(Math.random() * response.data.results.length);
						axios.get('http://192.241.197.211/aws.php?action=REKOGNITION&image_url=' + encodeURIComponent(response.data.results[ind].urls.small))
							.then((response) => {
								console.log("REKOGNITION", response.data);

								let topics = [];
								let avg = 0;
								response.data.rekognition.labels.forEach(function (item, i) {
									if (i < 3) {
										topics.push(item.Name.toLowerCase());
									}

									avg += item.Confidence;
								});

								self.props.onTooltip({ txt : 'Identified ' + response.data.rekognition.labels.length + ' topics… ' + topics.join(', ') });
								avg /= response.data.rekognition.labels.length;
								setTimeout(function() {
									self.props.onTooltip({ txt : 'Confidence… ' + (Math.round(avg) * 0.01).toFixed(2) });
								}, 3000);

								setTimeout(function() {
									self.props.onTooltip({ txt : 'Design Engine is ready.' });
								}, 4000);

							}).catch((error) => {
						});
					});

			} else if (this.props.section === 'tone') {
				axios.get('https://api.unsplash.com/search/photos?query=' + this.props.title + '&per_page=50', { headers : { Authorization : 'Bearer 946641fbc410cd54ff5bf32dbd0710dddef148f85f18a7b3907deab3cecb1479' } })
					.then((response) => {
						console.log("UNSPLASH", JSON.stringify(response.data.results));

						self.props.onTooltip({
							isAnimated : true,
							txt        : 'Sending ' + response.data.results.length + ' "' + this.props.title + '" images into AI'
						});

						const ind = Math.floor(Math.random() * response.data.results.length);
						axios.get('http://192.241.197.211/aws.php?action=REKOGNITION&image_url=' + encodeURIComponent(response.data.results[ind].urls.small))
							.then((response) => {
								console.log("REKOGNITION", response.data);

								let topics = [];
								let avg = 0;
								response.data.rekognition.labels.forEach(function (item, i) {
									if (i < 3) {
										topics.push(item.Name.toLowerCase());
									}

									avg += item.Confidence;
								});

								self.props.onTooltip({ txt : 'Identified ' + response.data.rekognition.labels.length + ' topics… ' + topics.join(', ') });
								avg /= response.data.rekognition.labels.length;
								setTimeout(function() {
									self.props.onTooltip({ txt : 'Confidence… ' + (Math.round(avg) * 0.01).toFixed(2) });
								}, 3000);

								setTimeout(function() {
									self.props.onTooltip({ txt : 'Design Engine is ready.' });
								}, 4000);

							}).catch((error) => {
						});
					});

			} else if (this.props.section === 'system') {
				self.props.onTooltip({
					isAnimated : true,
					txt        : 'Sending "' + this.props.title + '" Design System into AI'
				});

				setTimeout(function() {
					self.props.onTooltip({ txt : 'Identified ' + (Math.floor(Math.random() * 50) + 100) + ' components… menubar, tabbar, listview' });
				}, 3000);

				setTimeout(function() {
					self.props.onTooltip({ txt : 'Confidence… ' + ((Math.random() * 0.5) + 0.5).toFixed(2) });
				}, 4000);

				setTimeout(function() {
					self.props.onTooltip({ txt : 'Design Engine is ready.' });
				}, 5000);
			}

		} else {
			this.setState({ image : this.props.img });
		}
	}

	render() {
		if (this.props.section === 'system' && !this.props.selected && this.state.isSelected) {
			this.setState({ isSelected : false });
		}

		const faClass = (this.state.isSelected) ? 'keyword-item-check' : 'keyword-item-check is-hidden';
		const className = (this.state.isSelected) ? 'selected-opacity' : 'unselected-opacity';
		const marginOffset = (this.divWrapper) ? (this.divWrapper.clientWidth < 200) ? (this.divWrapper.clientWidth * -0.5) + ((200 - this.divWrapper.clientWidth) * -0.5) : (this.divWrapper.clientWidth * -0.5) + ((this.divWrapper.clientWidth - 200) * 0.5) : 0;
		const imgStyle = (this.props.section === 'tones2' && this.state.isSelected) ? {
			width     : '100%',
			height    : '100%',
			marginTop : '0',
			clipPath  : 'inset(0 0 0 0 round 50%)'
		} : {};

		return (
			<div onClick={()=> this.handleClick()} className="keyword-item" ref={(element)=> { this.divWrapper = element; }}>
				{this.state.status.isVisible && (
					<div className="ai-status-wrapper" style={{marginLeft:marginOffset + 'px'}}>
						<AIStatus content={this.state.status.content} loading={this.state.status.isLoading} />
					</div>
				)}
				<div className={className}>
					<div className="keyword-item-image-wrapper">
						<img className="keyword-item-image" src={this.state.image} alt={this.props.title} style={imgStyle} />
						<FontAwesome name="check-circle" className={faClass} />
					</div>
					<div className="keyword-item-text">{this.props.title}</div>
				</div>
			</div>
		);
	}
}

export default KeywordItem;
