
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

		const btnClass = (this.state.isValidated) ? 'form-button' : 'form-button form-button-disabled';

		return (
			<div style={{width:'100%'}}>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">What type of tone are you looking for?</div>
						<div className="input-title">Select one or more types of tone.</div>
					</Column>
				</Row>
				<Row horizontal="center">
					<button className="form-button form-button-secondary" onClick={()=> this.props.onBack()}>Back</button>
					<button className={btnClass} onClick={()=> this.handleClick()}>Next</button>
				</Row>
				<Row horizontal="space-around" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
			</div>
		);
	}
}

export default TonesForm;
