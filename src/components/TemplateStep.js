
import React, { Component } from 'react';
import './TemplateStep.css';

import { Column, Row } from 'simple-flexbox';

import TemplateButton from './TemplateButton'

class TemplateStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	handleClick(id) {
		this.props.onClick(id);
	}

	render() {
		let buttons = [
			{
				id : 1,
				type : 'DESKTOP',
				title : "Desktop",
				image : "https://www.sketchapp.com/images/press/sketch-press-kit/app-icons/sketch-mac-icon@2x.png"
			}, {
				id : 2,
				type : 'MOBILE',
				title : "Mobile",
				image : "https://www.sketchapp.com/images/press/sketch-press-kit/app-icons/sketch-mac-icon@2x.png"
			}
		];

		let items = buttons.map((item, i, arr) => {
			return (
				<Column key={i}>
					<TemplateButton onClick={()=> this.handleClick(item.type)} image={item.image} title={item.title} />
				</Column>
			);
		});

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="intro-text">Select design template</div>
					<div className="template-button-wrapper">
						<Row>
							{items}
						</Row>
					</div>
				</Column>
			</Row>
		);
	}
}

export default TemplateStep;
