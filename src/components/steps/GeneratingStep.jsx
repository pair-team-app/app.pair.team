
import React, { Component } from 'react';
import './GeneratingStep.css';
import tones from '../../tones.json';
import colors from '../../colors.json';

import axios from "axios/index";
import { Column, Row } from 'simple-flexbox';

import LightBox from '../elements/LightBox';
import TemplateItem from '../TemplateItem';

class GeneratingStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			elapsed  : 0,
			files    : [],
			maxFiles : 0,
			tones    : 0,
			colors   : 0,
			status   : 'Design Engine is processing…',
			lightBox : {
				isVisible : false,
				title     : '',
				file_id   : 0,
				price     : 0,
				url       : ''
			}
		};

		this.elapsedInterval = null;
		this.orderInterval = null;
		this.fileInterval = null;
		this.statusInterval = null;
		this.selectedItems = [];

		this.startTime = (new Date()).getTime();

		this.handleFilterChange = this.handleFilterChange.bind(this);
	}

	componentDidMount() {
		this.checkQueue();

		let self = this;
		this.orderInterval = setInterval(function() {
			let formData = new FormData();
			formData.append('action', 'ORDER_PING');
			formData.append('order_id', self.props.orderID);
			axios.post('https://api.designengine.ai/templates.php', formData)
				.then((response)=> {
				}).catch((error) => {
			});
		}, 5000);


		this.elapsedInterval = setInterval(function() {
			self.setState({ elapsed : parseInt((new Date()).getTime() * 0.001, 10) - parseInt(self.startTime * 0.001, 10) });
		}, 1000);

// 		this.statusInterval = setInterval(function() {
// 			self.checkStatus();
// 		}, 1000);
// 		this.checkStatus();

		this.fileInterval = setInterval(function() {
			self.checkNewFiles();
		}, 3000);
		this.checkNewFiles();


		let formData = new FormData();
		formData.append('action', 'COLOR_SETS');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("COLOR_SETS", JSON.stringify(response.data));
				self.setState({ maxFiles : 500 });
			});
	}

	componentWillUnmount() {
		clearInterval(this.elapsedInterval);
		clearInterval(this.orderInterval);
		clearInterval(this.fileInterval);
		clearInterval(this.statusInterval);
	}

	checkStatus() {
		let formData = new FormData();
		formData.append('action', 'STATUS_CHECK');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("STATUS_CHECK", JSON.stringify(response.data));
			}).catch((error) => {
		});
	}

	checkNewFiles() {
		let self = this;
		let formData = new FormData();
		formData.append('action', 'FILE_CHECK');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("FILE_CHECK", JSON.stringify(response.data));
				if (!response.data.running) {
					clearInterval(self.elapsedInterval);
					clearInterval(self.orderInterval);
					clearInterval(self.fileInterval);
					clearInterval(self.statusInterval);
					self.props.onTooltip({ txt : 'Design Engine is ready.' });
				}

				if (response.data.files.length !== self.state.files.length || self.state.files.length === 0) {
					//const percent = this.state.files.length > 0 ? Math.round((this.state.files.length / this.state.maxFiles) * 100) : 0;
					const rate = this.state.files.length > 0 ? Math.ceil(this.state.files.length / this.state.elapsed) : 0;


					if (self.state.files.length === 0) {
						//setTimeout(function() {
							self.props.onTooltip({
								txt : 'Rendering ' + self.state.files.length + ' of ' + self.state.maxFiles + ' Designs, ' + rate + ' per second.'
							});
						//}, 2000);

					} else {
						self.props.onTooltip({
							txt : 'Rendering ' + this.state.files.length + ' of ' + this.state.maxFiles + ' Designs, ' + rate + ' per second.'
						});
					}
				}

				let files = [];
				response.data.files.reverse().forEach(file => {
					files.push(file);
				});
				this.setState({ files : files });
			});
	}

	checkQueue() {
		let self = this;
		let formData = new FormData();
		formData.append('action', 'QUEUE_CHECK');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("QUEUE_CHECK", JSON.stringify(response.data));
				if (response.data.index > 0) {
					self.props.onTooltip({
						txt : 'You are #' + response.data.index + ' in line, please wait.'
					});
				}
			});
	}

	handleFilterChange(event) {
		console.log("handleFilterChange("+event+")", [event.target.name]);
		this.setState({ [event.target.name] : event.target.value });
	}

	handleLightBoxClick() {
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

// 		const btnSelectClass = (this.selectedItems.length === this.state.files.length) ? 'action-button step-button selected-button' : 'action-button step-button';
// 		const btnSelectCaption = (this.selectedItems.length === this.state.files.length) ? 'Select None' : 'Select All ('+this.state.files.length+')';

		return (
			<div>
				<Row horizontal="center">
					<div style={{width:'100%'}}>
						<select name="tones" value={this.tones} onChange={this.handleFilterChange}>
							{tones.map(item => {
								return (
									<option key={item.id} value={item.id}>{item.title}</option>
								);
							})}
						</select>
						<select name="colors" value={this.colors} onChange={this.handleFilterChange}>
							{colors.map(item => {
								return (
									<option key={item.id} value={item.id}>{item.title}</option>
								);
							})}
						</select>
					</div>
				</Row>
				<Row horizontal="center">
					<div className="template-item-wrapper">
						<Row horizontal="center" style={{flexWrap:'wrap'}}>
							{items}
						</Row>
					</div>
				</Row>

				{this.state.lightBox.isVisible && (
					<LightBox
						type="order"
						title={this.state.lightBox.title}
						file_id={this.state.lightBox.file_id}
						price={this.state.lightBox.price}
						urls={[this.state.lightBox.url]}
						onSelect={(file_id)=> this.handleSelectClick(file_id, true)}
						onClick={()=> this.handleLightBoxClick()} />
				)}
			</div>
		);
	}
}

export default GeneratingStep;
