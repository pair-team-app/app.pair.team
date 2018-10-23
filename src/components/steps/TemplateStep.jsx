
import React, { Component } from 'react';
import './TemplateStep.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';

import TemplateButton from '../TemplateButton';

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
				console.log("TEMPLATES", response.data);
				let templates = [];
				response.data.templates.forEach(template => {
					templates.push(template);
				});
				this.setState({ templates : templates });
			}).catch((error) => {
		});
	}

	render() {
		const items = this.state.templates.map((item, i, arr) => {
			return (
				<Column key={i}>
					<TemplateButton
						onClick={()=> this.props.onClick(item.id)}
						image={item.preview}
						gif={item.gif}
						title={item.title}
						info={item.info}
						pending={item.pending}
					/>
				</Column>
			);
		});

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="page-header-text">Select a Design Engine System</div>
					<div className="input-title">To begin select a design system.</div>
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
