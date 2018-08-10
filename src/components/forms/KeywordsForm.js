
import React, { Component } from 'react';
import './KeywordsForm.css';
import keywords from '../../keywords.json';

import { Column, Row } from 'simple-flexbox';

import KeywordItem from '../KeywordItem';


class KeywordsForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form : {
				keywords : []
			},
			isValidated : false
		};

		this.selectedKeywords = [];
	}

	handleToggle(id, isSelected) {
		console.log("handleToggle()", id, isSelected);
		let self = this;

		if (isSelected) {
			if (this.selectedKeywords.length < 3) {
				keywords.forEach(function (item, i) {
					if (item.id === id) {

						let isFound = false;
						self.selectedKeywords.forEach(function (itm, j) {
							if (itm.id === id) {
								isFound = true;
							}
						});

						if (!isFound) {
							self.selectedKeywords.push(item);
						}
					}
				});
			}

		} else {
			this.selectedKeywords.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedKeywords.splice(i, 1);
				}
			});
		}

		this.setState({ isValidated : (this.selectedKeywords.length > 0) })

	}

	handleClick() {
		if (this.state.isValidated) {
			let form = this.state.form;
			form.keywords = this.selectedKeywords;
			this.setState({ form : form });
			this.props.onNext(form);
		}
	}

	render() {
		const items = keywords.map((item, i, arr) => {
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
						<div className="step-header-text">Step 2</div>
						<div className="step-text">What are you looking to design?</div>
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

export default KeywordsForm;
