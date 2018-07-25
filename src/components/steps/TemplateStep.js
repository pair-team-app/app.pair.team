
import React, { Component } from 'react';
import './TemplateStep.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';

import TemplateButton from '../TemplateButton'

class TemplateStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			templates : [],
		};
	}

	componentDidMount() {
		let formData = new FormData();
		formData.append('action', 'TEMPLATES');
		formData.append('template_id', this.templateID);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("TEMPLATES", JSON.stringify(response.data));
				let templates = [];
				response.data.templates.forEach(template => {
					templates.push(template);
				});
				this.setState({ templates : templates });
			}).catch((error) => {
		});
	}

	handleClick(id) {
		this.props.onClick(id);
	}

	render() {
		let items = this.state.templates.map((item, i, arr) => {
			return (
				<Column key={i}>
					<TemplateButton onClick={()=> this.handleClick(item.id)} image={item.preview} title={item.title} />
				</Column>
			);
		});

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="step-header-text">Select a design template</div>
					<div className="step-text">Select from over <strong>{this.state.templates.length} Sketch</strong>, <strong>Figma</strong>, <strong>Framer</strong>, <strong>Adobe XD</strong>, &amp; <strong>Adobe Photoshop</strong> AI powered Design Templates.</div>
					<div className="template-button-wrapper">
						<Row horizontal="center" style={{flexWrap:'wrap'}}>
							{items}
						</Row>
					</div>
				</Column>
			</Row>
		);
	}
}

export default TemplateStep;
