
import React, { Component } from 'react';
import './CornersForm.css';
import corners from '../../corners.json';

import { Column, Row } from 'simple-flexbox';

import KeywordItem from '../KeywordItem';


class CornersForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form: {
				corners : []
			}
		};

		this.selectedCorners = [];
	}

	componentDidMount() {
	}

	handleToggle(id, isSelected) {
		let self = this;

		if (isSelected) {
			corners.forEach(function (item, i) {
				if (item.id === id) {

					let isFound = false;
					self.selectedCorners.forEach(function (itm, j) {
						if (itm.id === id) {
							isFound = true;
						}
					});

					if (!isFound) {
						self.selectedCorners.push(item);
					}
				}
			});

		} else {
			this.selectedCorners.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedCorners.splice(i, 1);
				}
			});
		}

		this.setState({ isValidated : (this.selectedCorners.length > 0) })
	}

	handleClick() {
		if (this.state.isValidated) {
			let form = this.state.form;
			form.corners = this.selectedCorners;
			this.setState({ form : form });
			this.props.onNext(this.state.form);
		}
	}

	render() {
		let items = corners.map((item, i, arr) => {
			return (
				<Column key={i}>
					<KeywordItem title={item.title} img={item.image} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		const btnClass = (this.state.isValidated) ? 'form-button' : 'form-button form-button-disabled';

		return (
			<div style={{width:'100%'}}>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">What type of button shapes?</div>
						<div className="input-title">Select one or more button shapes.</div>
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

export default CornersForm;
