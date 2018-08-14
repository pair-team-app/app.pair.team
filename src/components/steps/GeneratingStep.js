
import React, { Component } from 'react';
import './GeneratingStep.css';

import axios from "axios/index";
import { Column, Row } from 'simple-flexbox';

import LightBox from '../elements/LightBox';
import NextButton from './../elements/NextButton';
import TemplateItem from '../TemplateItem';

class GeneratingStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			elapsed : 0,
			files : [],
			maxFiles : 0,
			lightBox : {
				isVisible : false,
				title     : '',
				url       : ''
			}
		};

		this.interval = null;
		this.selectedItems = [];

		this.startTime = (new Date()).getTime();
	}

	componentDidMount() {
		this.props.onTooltip({
			'img' : '/images/logo_icon.png',
			'txt' : 'Starting up engine…'
		});

		let self = this;
		setInterval(function() {
			self.setState({ elapsed : parseInt((new Date()).getTime() * 0.001) - parseInt(self.startTime * 0.001) });
		}, 1000);

		this.interval = setInterval(function() {
			self.checkNewFiles();
		}, 5000);
		this.checkNewFiles();
		this.checkQueue();

		this.repeater();
		setInterval(function() {
			self.repeater();
		}, 8000);


		let formData = new FormData();
		formData.append('action', 'COLOR_SETS');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("COLOR_SETS", JSON.stringify(response.data));
				this.setState({ maxFiles : response.data.color_sets * 40 });
			});
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	repeater() {
		let self = this;
		this.props.onTooltip({
			'img' : '/images/logo_icon.png',
			'txt' : 'Altering colors…'
		});

		setTimeout(function() {
			self.props.onTooltip({
				'img' : '/images/logo_icon.png',
				'txt' : 'Getting images…'
			});

			setTimeout(function() {
				self.props.onTooltip({
					'img' : '/images/logo_icon.png',
					'txt' : 'Generating preview…'
				});
			}, 3333);

		}, 3333);
	}

	checkNewFiles() {
		this.props.onTooltip({
			'img' : '/images/logo_icon.png',
			'txt' : 'Retrieving preview…'
		});

		let formData = new FormData();
		formData.append('action', 'FILE_CHECK');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("FILE_CHECK", JSON.stringify(response.data));
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
						'img' : '/images/logo_icon.png',
						'txt' : 'You are #' + response.data.index + ' in line, please wait.'
					});
				}
			});
	}

	handleLightBoxClick() {
		let lightBox = this.state.lightBox;
		lightBox.isVisible = false;
		this.setState({ lightBox : lightBox });
	}

	handleImageClick(obj) {
		this.setState({
			lightBox : {
				title : obj.title,
				url : obj.filename,
				isVisible : true
			}
		});
	}

	handleSelectClick(id, isSelected) {
		console.log("handleClick("+id+", "+isSelected+")");

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
						image={item.filename} title={item.title+' - '+(i+1)}
						price={parseFloat(item.per_price)}
						selected={isSelected} />
				</Column>
			);
		});

		const btnSelectClass = (this.selectedItems.length === this.state.files.length) ? 'action-button step-button selected-button' : 'action-button step-button';
		const btnSelectCaption = (this.selectedItems.length === this.state.files.length) ? 'Select None' : 'Select All ('+this.state.files.length+')';

		return (
			<div>
				<div className="debug-window debug-border">{this.state.elapsed} seconds<br />{this.state.files.length} files / {this.state.maxFiles} expected files</div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Select the designs that you like</div>
						<div className="step-text">The following Design Systems examples have been generated from Design Engine.</div>
						<Row horizontal="end" style={{width:'100%', marginRight:'20px'}}><div className="step-text-margin"><button className={btnSelectClass} onClick={()=> this.onSelectAll()}>{btnSelectCaption}</button></div></Row>
						<div className="template-item-wrapper">
							<Row horizontal="center" style={{flexWrap:'wrap'}}>
								{items}
							</Row>
						</div>
					</Column>
				</Row>

				{this.state.lightBox.isVisible && (
					<LightBox title={this.state.lightBox.title} urls={[this.state.lightBox.url]} onClick={()=> this.handleLightBoxClick()} />
				)}
				<NextButton isEnabled={(this.selectedItems.length > 0)} onClick={()=> this.onNext()} />
			</div>
		);
	}
}

export default GeneratingStep;
