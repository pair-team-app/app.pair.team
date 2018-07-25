
import React, { Component } from 'react';
import './ColorsForm.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';

import ColorSwatch from '../ColorSwatch'


class ColorsForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			colors : []
		};

		this.selectedColors = [];
	}

	componentDidMount() {
		let formData = new FormData();
		formData.append('action', 'TEMPLATE_COLORS');
		formData.append('template_id', this.props.templateID);
		axios.post('http://api.designengine.ai/templates.php', formData)
			.then((response) => {
				console.log("TEMPLATE_COLORS", JSON.stringify(response.data));

				let colors = [];
				response.data.colors.forEach(color => {
					colors.push(color);
				});
				this.setState({ colors : colors });
			}).catch((error) => {
		});
	}

	handleToggle(id, isSelected) {
		let colors = this.state.colors;
		let self = this;

		if (isSelected) {
			colors.forEach(function(item, i) {
				if (item.id === id) {

					let isFound = false;
					self.selectedColors.forEach(function(itm, j) {
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

		console.log(JSON.stringify(this.selectedColors));
		this.props.onToggle(this.selectedColors);
	}

	render() {
		let colors = this.state.colors.map((item, i, arr) => {
			return (
				<Column key={i}>
					<ColorSwatch title={item.title} swatch={item.hex} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		return (
			<div style={{textAlign:'left'}}>
				<div className="input-title">Colors</div>
				<div className="step-text" style={{marginBottom:'10px'}}>Select up to three colors for your design system.</div>
				<div className="color-item-wrapper">
					<Row horizontal="start" style={{flexWrap:'wrap'}}>
						{colors}
					</Row>
				</div>
			</div>
		);
	}
}

export default ColorsForm;
