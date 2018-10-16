
import React, { Component } from 'react';
import './GeneratingStep.css';
import tones from '../../json/tones.json';
import colors from '../../json/colors.json';
import parts from '../../json/parts.json';

import axios from "axios/index";
import cookie from 'react-cookies';
import onClickOutside from "react-onclickoutside";
import { Column, Row } from 'simple-flexbox';

import Dropdown from '../elements/Dropdown';
import DropdownMultiple from '../elements/DropdownMultiple';
import LightBox from '../elements/LightBox';
import TemplateItem from '../TemplateItem';

class GeneratingStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			elapsed  : 0,
			files    : [],
			allFiles : [],
			maxFiles : 500,
			tones    : [],
			colors   : [],
			parts    : [],
			status   : 'Design Engine is processing…',
			lightBox : {
				isVisible : false,
				title     : '',
				file_id   : 0,
				price     : 0,
				url       : ''
			}
		};

		this.fileCount = 0;
		this.ddTitle = '';

		this.elapsedInterval = null;
		this.orderInterval = null;
		this.fileInterval = null;
		this.selectedItems = [];

		this.startTime = (new Date()).getTime();
	}

	componentDidMount() {
		let list1 = [];
		tones.forEach(function(item, i) {
			list1.push({
				id       : item.id,
				title    : item.title,
				selected : false,
				key      : 'tones'
			});
		});

		let list2 = [];
		colors.forEach(function(item, i) {
			list2.push({
				id       : item.id,
				title    : item.title,
				hex      : item.hex,
				gradient : item.gradient,
				selected : false,
				key      : 'colors'
			});
		});

		let list3 = [];
		parts.forEach(function(item, i) {
			list3.push({
				id       : item.id,
				title    : item.title,
				selected : false,
				key      : 'parts'
			});
		});

		this.setState({
			tones  : list1,
			colors : list2,
			parts  : list3
		});


		this.checkQueue();

		let self = this;
// 		this.orderInterval = setInterval(function() {
// 			let formData = new FormData();
// 			formData.append('action', 'ORDER_PING');
// 			formData.append('order_id', self.props.orderID);
// 			axios.post('https://api.designengine.ai/templates.php', formData)
// 				.then((response)=> {
// 					console.log("ORDER_PING", response.data);
// 				}).catch((error) => {
// 			});
// 		}, 5000);


		this.elapsedInterval = setInterval(function() {
			self.setState({ elapsed : parseInt((new Date()).getTime() * 0.001, 10) - parseInt(self.startTime * 0.001, 10) });
		}, 1000);

		const system = (cookie.load('template_id') === '2') ? "iOS" : "Material";
		const totals = {
			ios      : [6, 10, 47, 88],
			material : [20, 10, 63, 131]
		};

		let formData = new FormData();
		formData.append('action', 'FILE_CHECK');
		formData.append('order_id', (cookie.load('template_id') === '2') ? "680" : "681");
// 		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("FILE_CHECK", response.data);
				let files = [];

				for (let i=0; i<7; i++) {
					response.data.files.reverse().forEach(file => {
						files.push(file);
					});
				}

				this.setState({ allFiles : files });

				this.props.onTooltip({ txt : 'Loading ' + totals[system.toLowerCase()][0] + ' ' + ((system === 'Material') ? 'Material Design' : system) + ' Views' });
				setTimeout(function() {
					self.props.onTooltip({ txt : 'Loading ' + totals[system.toLowerCase()][1] + ' ' + ((system === 'Material') ? 'Material Design' : system) + ' Presentation Slides' });
				}, 2000);

				setTimeout(function() {
					self.props.onTooltip({ txt : 'Loading ' + totals[system.toLowerCase()][2] + ' ' + ((system === 'Material') ? 'Material Design' : system) + ' Components' });
				}, 4000);

				setTimeout(function() {
					self.props.onTooltip({ txt : 'Loading ' + totals[system.toLowerCase()][3] + ' ' + ((system === 'Material') ? 'Material Design' : system) + ' Symbols' });
				}, 6000);

				setTimeout(function() {
					self.props.onTooltip({ txt : 'Design Engine is ready.' });

					self.fileInterval = setInterval(function () {
						self.checkNewFiles();
					}, 750);
				}, 8000);
			});
	}

	componentWillUnmount() {
		clearInterval(this.elapsedInterval);
		clearInterval(this.orderInterval);
		clearInterval(this.fileInterval);
	}

	checkStatus() {
		let formData = new FormData();
		formData.append('action', 'STATUS_CHECK');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("STATUS_CHECK", response.data);
			}).catch((error) => {
		});
	}

	checkNewFiles() {
		if (++this.fileCount >= this.state.allFiles.length) {
			clearInterval(this.elapsedInterval);
			clearInterval(this.orderInterval);
			clearInterval(this.fileInterval);
			this.props.onTooltip({ txt : 'Design Engine is ready.' });

		} else {
			let files = this.state.allFiles.slice(0, this.fileCount);
// 			const rate = files.length > 0 ? Math.ceil(this.state.files.length / this.state.elapsed) : 0;

			for (let i=files.length; i<this.state.allFiles.length-1; i++) {
				files.push({
					title     : 'Placeholder',
					filename  : 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png',
					per_price : 0
				});
			}

			this.setState({ files : files });
			//this.props.onTooltip({ txt : 'Design Engine is ready (' + this.state.files.length + ' of ' + this.state.maxFiles + '+ Renders)' });
		}

// 		let self = this;
// 		let formData = new FormData();
// 		formData.append('action', 'FILE_CHECK');
// 		formData.append('order_id', this.props.orderID);
// 		axios.post('https://api.designengine.ai/templates.php', formData)
// 			.then((response)=> {
// 				console.log("FILE_CHECK", response.data);
// 				if (!response.data.running) {
// 					clearInterval(self.elapsedInterval);
// 					clearInterval(self.orderInterval);
// 					clearInterval(self.fileInterval);
// 					self.props.onTooltip({ txt : 'Design Engine is ready.' });
//
// 				} else {
// 					if (response.data.files.length !== self.state.files.length || self.state.files.length === 0) {
// 						//const percent = this.state.files.length > 0 ? Math.round((this.state.files.length / this.state.maxFiles) * 100) : 0;
// 						const rate = this.state.files.length > 0 ? Math.ceil(this.state.files.length / this.state.elapsed) : 0;
// 						self.props.onTooltip({
// 							txt : 'Rendering ' + this.state.files.length + ' of ' + this.state.maxFiles + ' Designs, ' + rate + ' per second.'
// 						});
//
// 					}
// 				}
//
// 				let files = [];
// 				response.data.files.reverse().forEach(file => {
// 					files.push(file);
// 				});
// 				this.setState({ files : files });
// 			});
	}

	checkQueue() {
		let self = this;
		let formData = new FormData();
		formData.append('action', 'QUEUE_CHECK');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("QUEUE_CHECK", response.data);
				if (response.data.index > 0) {
					self.props.onTooltip({
						txt : 'You are #' + response.data.index + ' in line, please wait.'
					});
				}
			});
	}

	toggleSelected = (id, key) => {
		console.log('toggleSelected()', id, key);
		let tmp = [...this.state[key]];
		tmp[id-1].selected = !tmp[id-1].selected;
		this.setState({ [key] : tmp });
// 		this.handleDropdownUpdate(key, tmp[id-1].title);
	};

	resetThenSet = (id, key) => {
		let tmp = [...this.state[key]];
		tmp.forEach(item => item.selected = false);
		tmp[id-1].selected = true;
		this.ddTitle = tmp[id-1].title;
// 		this.handleDropdownUpdate(key, tmp[id-1].title);
	};

	handleDropdownUpdate(key, title) {
		clearInterval(this.fileInterval);

		let self = this;
		let imageTotal = 0;

		this.fileCount = 0;
		this.setState({ files : [] });

		this.props.onTooltip({
			isAnimated : false,
			txt        : 'Loading Render Request into AI'
		});

		axios.get('https://api.unsplash.com/search/photos?query=' + title + '&per_page=50', { headers : { Authorization : 'Bearer 946641fbc410cd54ff5bf32dbd0710dddef148f85f18a7b3907deab3cecb1479' } })
			.then((response) => {
				console.log("UNSPLASH", JSON.stringify(response.data.results));
				imageTotal = response.data.results.length;

				const ind = Math.floor(Math.random() * response.data.results.length);
				axios.get('http://192.241.197.211/aws.php?action=REKOGNITION&image_url=' + encodeURIComponent(response.data.results[ind].urls.small))
					.then((response) => {
						console.log("REKOGNITION", response.data);

						let topics = [];
						response.data.rekognition.labels.forEach(function (item, i) {
							if (i < 4) {
								topics.push(item.Name);
							}
						});

						this.props.onTooltip({ txt : response.data.rekognition.labels.length + ' Topics Identified from ' + imageTotal + ' images.' });

						setTimeout(function() {
							self.props.onTooltip({ txt : topics.join(', ') + '… (' + (response.data.rekognition.labels.length - topics.length) + ' more)' });

							setTimeout(function() {
								axios.get('http://192.241.197.211/aws.php?action=COMPREHEND&phrase=' + topics[0])
									.then((response) => {
										console.log("COMPREHEND", response.data);
										const sentiment = response.data.comprehend.sentiment.outcome;
										self.props.onTooltip({ txt : 'Sentiment: ' + Math.round(response.data.comprehend.sentiment.scores[sentiment] * 100) + '% ' + sentiment });

										setTimeout(function () {
											self.props.onTooltip({ txt : 'Design Engine is ready.' });
											self.fileInterval = setInterval(function () {
												self.checkNewFiles();
											}, 750);
										}, 1000);
									}).catch((error) => {
								});
							}, 1000);
						}, 3000);
					}).catch((error) => {
				});
			});
	}

	handleLightBoxClose() {
		let lightBox = this.state.lightBox;
		lightBox.isVisible = false;
		this.setState({ lightBox : lightBox });
	}

	handleImageClick(obj) {
		this.setState({
			lightBox : {
				title     : obj.title,
				file_id   : obj.id,
				price     : obj.per_price,
				url       : obj.filename,
				isVisible : true
			}
		});
	}

	handleSelectClick(id, isSelected) {
		const files = this.state.files;

		let self = this;
		if (isSelected) {
			files.forEach(function(item, i) {
				if (item.id === id) {

					let isFound = false;
					self.selectedItems.forEach(function(itm, j) {
						if (itm.id === id) {
							isFound = true;
						}
					});

					if (!isFound) {
						self.selectedItems.push(item);
					}
				}
			});

		} else {
			this.selectedItems.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedItems.splice(i, 1);
				}
			});
		}

		this.props.onItemToggle(this.selectedItems);
	}

	onSelectAll() {
		let self = this;
		const files = this.state.files;

		if (this.selectedItems.length === files.length) {
			this.selectedItems = [];

		} else {
			files.forEach(function (item, i) {
				let isFound = false;
				self.selectedItems.forEach(function (itm, j) {
					if (itm.id === item.id) {
						isFound = true;
					}
				});

				if (!isFound) {
					self.selectedItems.push(item);
				}
			});
		}

		this.forceUpdate();
		this.props.onItemToggle(this.selectedItems);
	}

	onNext() {
		if (this.selectedItems.length > 0) {
			this.props.onClick(this.selectedItems);
		}
	}

	render() {
		const items = this.state.files.map((item, i, arr) => {
			let isSelected = false;

			this.selectedItems.forEach(function (itm, i) {
				if (itm.id === item.id) {
					isSelected = true;
				}
			});

			return (
				<Column key={i}>
					<TemplateItem
						onImageClick={()=> this.handleImageClick(item)}
						onSelectClick={(isSelected)=> this.handleSelectClick(item.id, isSelected)}
						title={item.title}
// 						description={item.description}
						description="iOS Application, Energetic, Postive Sentiment, 0.9 Confidence."
						image={item.filename}
						price={parseFloat(item.per_price)}
						selected={isSelected} />
				</Column>
			);
		});

		return (
			<div>
				<Row horizontal="center">
					<div style={{width:'100%'}}>
						<Dropdown
							title="Select parts"
							list={this.state.parts}
							resetThenSet={this.resetThenSet}
						/>
						<DropdownMultiple
							titleHelper="Color"
							title="Select color(s)"
							list={this.state.colors}
							toggleItem={this.toggleSelected}
						/>
						<Dropdown
							title="Select tone"
							list={this.state.tones}
							resetThenSet={this.resetThenSet}
						/>
						<button className="action-button form-button" onClick={()=> this.handleDropdownUpdate('tones', this.ddTitle)}>Render</button>
					</div>
				</Row>
				<Row horizontal="center">
					<div className="template-item-wrapper">
						<Row horizontal="center" style={{flexWrap:'wrap'}}>
							{items}
						</Row>
					</div>
				</Row>

				{this.selectedItems.length > 0 && (
					<div className="download-items-wrapper">
						<button className="action-button form-button" style={{backgroundColor:'#61a913'}}>Download ({this.selectedItems.length})</button>
					</div>
				)}

				{this.state.lightBox.isVisible && (
					<LightBox
						type="order"
						title={this.state.lightBox.title + ' - ' + ((cookie.load('template_id') === '2') ? "iOS" : "Material Design")}
						file_id={this.state.lightBox.file_id}
						price={this.state.lightBox.price}
						urls={[this.state.lightBox.url]}
						onSelect={(file_id)=> this.handleSelectClick(file_id, true)}
						onClose={()=> this.handleLightBoxClose()} />
				)}
			</div>
		);
	}
}

export default onClickOutside(GeneratingStep);
