
import React, { Component } from 'react';
import './GeneratingStep.css';

import axios from "axios/index";
import { Column, Row } from 'simple-flexbox';

import LightBox from '../elements/LightBox';
import TemplateItem from '../TemplateItem';

class GeneratingStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			queue : {
				index : 1,
				total : 1
			},
			files : [],
			lightBox : {
				isVisible : false,
				title     : '',
				url       : ''
			}
		};

		this.interval = null;
		this.selectedItems = [];
	}

	componentDidMount() {
		let self = this;
		this.interval = setInterval(function() {
			self.checkNewFiles();
		}, 10000);
		this.checkNewFiles()
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	checkNewFiles() {
		let formData = new FormData();
		formData.append('action', 'FILE_CHECK');
		formData.append('order_id', this.props.orderID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("FILE_CHECK", JSON.stringify(response.data));
				let files = [];
				response.data.files.forEach(file => {
					files.push(file);
				});
				this.setState({ files : files });
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

	onNext() {
		if (this.selectedItems.length > 0) {
			this.props.onClick(this.selectedItems);
		}
	}

	render() {
		const items = this.state.files.map((item, i, arr) => {
			return (
				<Column key={i}>
					<TemplateItem
						onImageClick={()=> this.handleImageClick(item)}
						onSelectClick={(isSelected)=> this.handleSelectClick(item.id, isSelected)}
						image={item.filename} title={item.title+' - '+(i+1)}
						price={parseFloat(item.per_price)}
						selected={false} />
				</Column>
			);
		});

		const btnClass = (this.selectedItems.length > 0) ? 'action-button full-button' : 'action-button full-button disabled-button';

		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Select the designs you want to keep</div>
						<div className="step-text">Select only the design files that work for you and click Next.</div>
						<button className={btnClass} onClick={()=> this.onNext()}>Next</button>
						<div className="step-text">{this.state.files.length} custom design files generated.</div>
						<div className="template-item-wrapper">
							<Row horizontal="center" style={{flexWrap:'wrap'}}>
								{items}
							</Row>
						</div>
					</Column>
				</Row>

				{this.state.lightBox.isVisible && (
					<LightBox title={this.state.lightBox.title} url={this.state.lightBox.url} onClick={()=> this.handleLightBoxClick()} />
				)}
			</div>
		);
	}
}

export default GeneratingStep;
