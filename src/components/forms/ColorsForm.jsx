
import React, { Component } from 'react';
import './ColorsForm.css';
import colors from '../../colors.json';

// import axios from 'axios';
import { Column, Row } from 'simple-flexbox';

import ColorSwatch from '../ColorSwatch';


class ColorsForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			colors: [],
			form: {
				colors : []
			}
		};

		this.selectedColors = [];
	}

	componentDidMount() {
		this.setState({ colors : colors });

// 		let formData = new FormData();
// 		formData.append('action', 'TEMPLATE_COLORS');
// 		formData.append('template_id', this.props.templateID);
// 		axios.post('http://api.designengine.ai/templates.php', formData)
// 			.then((response) => {
// 				console.log("TEMPLATE_COLORS", JSON.stringify(response.data));
//
// 				let colors = [];
// 				response.data.colors.forEach(color => {
// 					colors.push(color);
// 				});
// 				this.setState({ colors : colors });
// 			}).catch((error) => {
// 		});
	}

	handleToggle(id, isSelected) {
		let colors = this.state.colors;
		let self = this;

		if (isSelected) {
			colors.forEach(function (item, i) {
				if (item.id === id) {

					let isFound = false;
					self.selectedColors.forEach(function (itm, j) {
						if (itm.id === id) {
							isFound = true;
						}
					});

					if (!isFound) {
						self.selectedColors.push(item);
					}
				}
			});

		} else {
			this.selectedColors.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedColors.splice(i, 1);
				}
			});
		}

		this.setState({ isValidated : (this.selectedColors.length > 0) })
	}

	handleClick() {
		if (this.state.isValidated) {
			let form = this.state.form;
			form.colors = this.selectedColors;
			this.setState({ form : form });
			this.props.onNext(this.state.form);
		}
	}

	render() {
		let colors = this.state.colors.map((item, i, arr) => {
			return (
				<Column key={i}>
					<ColorSwatch title={item.title} gradient={item.gradient} swatch={item.hex} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		const btnClass = (this.state.isValidated) ? 'form-button' : 'form-button form-button-disabled';

		return (
			<div style={{width:'100%'}}>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">What colors are you looking for?</div>
						<div className="input-title">Select one or more color gradients.</div>
					</Column>
				</Row>
				<Row horizontal="center">
					<button className="form-button form-button-secondary" onClick={()=> this.props.onBack()}>Back</button>
					<button className={btnClass} onClick={()=> this.handleClick()}>Next</button>
				</Row>
				<Row horizontal="space-around" style={{flexWrap:'wrap'}}>
					{colors}
				</Row>
			</div>
		);
	}
}

export default ColorsForm;
