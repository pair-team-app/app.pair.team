
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

// 						axios.get('http://192.241.197.211/aws.php?action=COMPREHEND&phrase=' + item.title)
// 							.then((response)=> {
// 								console.log("COMPREHEND", JSON.stringify(response.data));
// 								self.showStatus({x:0, y:0}, response.data.comprehend.sentiment.outcome);
// 							}).catch((error) => {
// 							});
					}
				}
			});

		} else {
			this.selectedKeywords.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedKeywords.splice(i, 1);
				}
			});
		}

		this.setState({ isValidated : (this.selectedKeywords.length > 0) });
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
					<KeywordItem title={item.title} img={'https://via.placeholder.com/100x100'} onTooltip={(obj)=> this.props.onTooltip(obj)} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		const btnClass = (this.state.isValidated) ? 'form-button' : 'form-button form-button-disabled';

		return (
			<div style={{width:'100%'}}>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">What do you need designed?</div>
						<div className="input-title">Select one or more types of design.</div>
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

export default KeywordsForm;
