
import React, { Component } from 'react';
import './TonesForm.css';
import tones from '../../tones.json';

import { Column, Row } from 'simple-flexbox';

import KeywordItem from '../KeywordItem';


class TonesForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form : {
				tones : []
			},
			isValidated : false
		};

		this.selectedTones = [];
	}

	handleToggle(id, isSelected) {
		console.log("handleToggle()", id, isSelected);
		let self = this;

		if (isSelected) {
			if (this.selectedTones.length < 3) {
				tones.forEach(function (item, i) {
					if (item.id === id) {

						let isFound = false;
						self.selectedTones.forEach(function (itm, j) {
							if (itm.id === id) {
								isFound = true;
							}
						});

						if (!isFound) {
							self.selectedTones.push(item);
						}
					}
				});
			}

		} else {
			this.selectedTones.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedTones.splice(i, 1);
				}
			});
		}

		this.setState({ isValidated : (this.selectedTones.length > 0) })

	}

	handleClick() {
		if (this.state.isValidated) {
			let form = this.state.form;
			form.tones = this.selectedTones;
			this.setState({ form : form });
			this.props.onNext(form);
		}
	}

	render() {
		const items = tones.map((item, i, arr) => {
			return (
				<Column key={i}>
					<KeywordItem title={item.title} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		const btnClass = (this.state.isValidated) ? 'action-button step-button' : 'action-button step-button disabled-button';

		return (
			<div style={{width:'100%'}} className="debug-border">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Step 3</div>
						<div className="step-text">What type of tone do you want?</div>
					</Column>
				</Row>
				<Row horizontal="space-around" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
				<button className="action-button step-button" onClick={()=> this.props.onBack()}>Back</button>
				<button className={btnClass} onClick={()=> this.handleClick()}>Next Step</button>
			</div>
		);
	}
}

export default TonesForm;
