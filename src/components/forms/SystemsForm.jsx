
import React, { Component } from 'react';
import './SystemsForm.css';
import systems from '../../systems.json';

import { Column, Row } from 'simple-flexbox';

import KeywordItem from '../KeywordItem';


class SystemsForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form: {
				systems : []
			}
		};

		this.selectedSystems = [];
	}

	componentDidMount() {
	}

	handleToggle(id, isSelected) {
		let self = this;

		if (isSelected) {
			systems.forEach(function (item, i) {
				if (item.id === id) {

					let isFound = false;
					self.selectedSystems.forEach(function (itm, j) {
						if (itm.id === id) {
							isFound = true;
						}
					});

					if (!isFound) {
						self.selectedSystems.push(item);
					}
				}
			});

		} else {
			this.selectedSystems.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedSystems.splice(i, 1);
				}
			});
		}

		this.setState({ isValidated : (this.selectedSystems.length > 0) })
	}

	handleClick() {
		if (this.state.isValidated) {
			let form = this.state.form;
			form.systems = this.selectedSystems;
			this.setState({ form : form });
			this.props.onNext(this.state.form);
		}
	}

	render() {
		let items = systems.map((item, i, arr) => {
			return (
				<Column key={i}>
					<KeywordItem title={item.title} img={item.image} onTooltip={(obj)=> this.props.onTooltip(obj)} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		const btnClass = (this.state.isValidated) ? 'form-button' : 'form-button form-button-disabled';

		return (
			<div style={{width:'100%'}}>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">What type of interface design?</div>
						<div className="input-title">Select one interface design style.</div>
					</Column>
				</Row>
				<Row horizontal="center">
					<button className="form-button form-button-secondary" onClick={()=> this.props.onBack()}>Cancel</button>
					<button className={btnClass} onClick={()=> this.handleClick()}>Next <img className="next-glyph" src="/images/arrow.svg" alt="Next"/></button>
				</Row>
				<Row horizontal="space-around" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
			</div>
		);
	}
}

export default SystemsForm;
