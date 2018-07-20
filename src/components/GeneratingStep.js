
import React, { Component } from 'react';
import './GeneratingStep.css';

import { Column, Row } from 'simple-flexbox';

import TemplateItem from './TemplateItem'

class GeneratingStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			queue : {
				index : 1,
				total : 1
			},
			files : {
				created : 0,
				total : 0
			}
		};

		this.generatedItems = [{
			id : 1,
			type : 'DESKTOP',
			title : "Layout I",
			image : "https://www.sketchapp.com/images/press/sketch-press-kit/app-icons/sketch-mac-icon@2x.png",
			price : 3.99
		}, {
			id : 2,
			type : 'MOBILE',
			title : "Layout II",
			image : "https://www.sketchapp.com/images/press/sketch-press-kit/app-icons/sketch-mac-icon@2x.png",
			price : 1.99
		}, {
			id : 3,
			type : 'OTHER',
			title : "Layout III",
			image : "https://www.sketchapp.com/images/press/sketch-press-kit/app-icons/sketch-mac-icon@2x.png",
			price : 4.99
		}];

		this.selectedItems = [];
	}

	handleClick(id, isSelected) {
		console.log("handleClick("+id+", "+isSelected+")");

		let self = this;
		if (isSelected) {

			this.generatedItems.forEach(function(item, i) {
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
		let items = this.generatedItems.map((item, i, arr) => {
			return (
				<Column key={i}>
					<TemplateItem handleClick={(isSelected)=> this.handleClick(item.id, isSelected)} image={item.image} title={item.title} price={item.price} selected={false} />
				</Column>
			);
		});

		let btnClass = (this.selectedItems.length > 0) ? 'action-button full-button' : 'action-button full-button disabled-button';

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="step-header-text">Select the designs you want to keep</div>
					<div className="step-text">Select only the design files that work for you and click Next.</div>
					<button className={btnClass} onClick={()=> this.onNext()}>Next</button>
					<div className="step-text">{this.generatedItems.length} custom design files generated.</div>
					<div className="template-item-wrapper">
						<Row horizontal="center" style={{flexWrap:'wrap'}}>
							{items}
						</Row>
					</div>
				</Column>
			</Row>
		);
	}
}

export default GeneratingStep;
