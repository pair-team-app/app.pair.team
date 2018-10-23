
import React, { Component } from 'react';
import './SystemsForm.css';
import systems from '../../json/systems.json';

import { Column, Row } from 'simple-flexbox';

import KeywordItem from '../KeywordItem';


class SystemsForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			systems : systems,
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
					self.selectedSystems = [item];
				}

// 					let isFound = false;
// 					self.selectedSystems.forEach(function (itm, j) {
// 						if (itm.id === id) {
// 							isFound = true;
// 						}
// 					});
//
// 					if (!isFound) {
// 						self.selectedSystems.push(item);
// 					}
// 				}
			});

			let sys = this.state.systems;
			sys.forEach(function (item, i) {
				item.isSelected = (item.id === id);
			});

			this.setState({ systems : sys });

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
		let items = this.state.systems.map((item, i, arr) => {
			return (
				<Column key={i}>
					<KeywordItem
						section="system"
						title={item.title}
						img={item.image}
						selected={item.isSelected}
						onTooltip={(obj)=> this.props.onTooltip(obj)}
						onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		const btnClass = (this.state.isValidated) ? 'form-button' : 'form-button form-button-disabled';

		return (
			<div style={{width:'100%'}}>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="page-header-text">What Design Framework are you using?</div>
						<div className="input-title">Select one Design System you are working with.</div>
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
