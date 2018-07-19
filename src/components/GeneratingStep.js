
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
			}
		};

		this.generatedItems = [{
			id : 1,
			type : 'DESKTOP',
			title : "Desktop",
			image : "https://www.sketchapp.com/images/press/sketch-press-kit/app-icons/sketch-mac-icon@2x.png",
			price : 3.99
		}, {
			id : 2,
			type : 'MOBILE',
			title : "Mobile",
			image : "https://www.sketchapp.com/images/press/sketch-press-kit/app-icons/sketch-mac-icon@2x.png",
			price : 1.99
		}, {
			id : 3,
			type : 'OTHER',
			title : "Mobile",
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

	render() {
		let items = this.generatedItems.map((item, i, arr) => {
			return (
				<Column key={i}>
					<TemplateItem handleClick={(isSelected)=> this.handleClick(item.id, isSelected)} image={item.image} title={item.title} price={item.price} />
				</Column>
			);
		});

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="step-header-text">Generating AI design artboards</div>
					<div className="step-text">For those who have seen the Earth from space, and for the hundreds and perhaps thousands more who will.</div>
					<button className="action-button full-button" onClick={()=> this.props.onClick(this.state)}>Next</button>
					<div className="step-text">You are {this.state.queue.index} of {this.state.queue.total} in line using Design Engine to generate Premium AI Design Templates.</div>
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
