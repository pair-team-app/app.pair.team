
import React, { Component } from 'react';
import './GeneratingStep.css';
import tones from '../../tones.json';
import colors from '../../colors.json';
import parts from '../../parts.json';

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
			maxFiles : 0,
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
// 				}).catch((error) => {
// 			});
// 		}, 5000);


		this.elapsedInterval = setInterval(function() {
			self.setState({ elapsed : parseInt((new Date()).getTime() * 0.001, 10) - parseInt(self.startTime * 0.001, 10) });
		}, 1000);

		let formData = new FormData();
		formData.append('action', 'COLOR_SETS');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("COLOR_SETS", JSON.stringify(response.data));
				self.setState({ maxFiles : 500 });
			});

		formData = new FormData();
		formData.append('action', 'FILE_CHECK');
		formData.append('order_id', (cookie.load('template_id') === 2) ? "599" : "600");
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("FILE_CHECK", JSON.stringify(response.data));
				let files = [];
				response.data.files.reverse().forEach(file => {
					files.push(file);
				});
				this.setState({ allFiles : files });
				this.fileInterval = setInterval(function() {
					self.checkNewFiles();
				}, 750);
				this.checkNewFiles();
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
				console.log("STATUS_CHECK", JSON.stringify(response.data));
			}).catch((error) => {
		});
	}

	checkNewFiles() {
		let files = this.state.allFiles.slice(0, Math.min(++this.fileCount, this.state.allFiles.length));
		const rate = files.length > 0 ? Math.ceil(this.state.files.length / this.state.elapsed) : 0;

		this.setState({ files : files });
		this.props.onTooltip({
			txt : 'Rendering ' + this.state.files.length + ' of ' + this.state.maxFiles + ' Designs, ' + rate + ' per second.'
		});

// 		let self = this;
// 		let formData = new FormData();
// 		formData.append('action', 'FILE_CHECK');
// 		formData.append('order_id', this.props.orderID);
// 		axios.post('https://api.designengine.ai/templates.php', formData)
// 			.then((response)=> {
// 				console.log("FILE_CHECK", JSON.stringify(response.data));
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
				console.log("QUEUE_CHECK", JSON.stringify(response.data));
				if (response.data.index > 0) {
					self.props.onTooltip({
						txt : 'You are #' + response.data.index + ' in line, please wait.'
					});
				}
			});
	}

	toggleSelected = (id, key) => {
		console.log('toggleSelected()', id, key);
		let temp = [...this.state[key]];
		temp[id-1].selected = !temp[id-1].selected;
		this.setState({ [key] : temp });
	};

	resetThenSet = (id, stateKey) => {
		let tones = [...this.state[stateKey]];
		tones.forEach(item => item.selected = false);
		tones[id-1].selected = true;
	};

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

export default onClickOutside(GeneratingStep);
