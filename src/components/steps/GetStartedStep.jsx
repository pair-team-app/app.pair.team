
import React, { Component } from 'react';
import './GetStartedStep.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';

import LightBox from '../elements/LightBox';
import ProjectItem from '../ProjectItem';

class GetStartedStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			renders  : [],
			lightBox : {
				isVisible : false,
				url : ''
			}
		};
	}

	componentDidMount() {
		let formData = new FormData();
		formData.append('action', 'RECENT_RENDERS');
		formData.append('amount', '10');
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response) => {
				console.log("RECENT_RENDERS", JSON.stringify(response.data));
				this.setState({ renders : response.data.renders });
			}).catch((error) => {
		});
	}

	handleProject(img) {
		let lightBox = {
			isVisible : true,
			url : img
		};

		this.setState({ lightBox : lightBox });
	}

	handleLightBoxClick() {
		let lightBox = this.state.lightBox;
		lightBox.isVisible = false;
		this.setState({ lightBox : lightBox });
	}

	render() {
		const items = this.state.renders.map((item, i, arr) => {
			return (
				<Column key={i}>
					<ProjectItem image={item.filename} title={item.title} onClick={()=> this.handleProject(item.filename)} />
				</Column>
			);
		});

		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Engineers, start your Design Engine</div>
						<div className="step-text">Accelerate your best ideas with Design Engine’s AI powered Premium Design Systems.</div>
						{/*<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>*/}
						<Row horizontal="center">
							<button className="action-button step-button" onClick={()=> this.props.onSystem(2)} style={{marginRight:'20px'}}>iOS 12</button>
							<button className="action-button step-button" onClick={()=> this.props.onSystem(3)}>Material Design</button>
						</Row>
						<img src="/images/intro1.png" className="intro-image" alt="MacBook" />

						<div className="step-text step-text-underline">Recent Renders</div>
						<div className="project-item-wrapper">
							<Row horizontal="center" style={{flexWrap:'wrap'}}>
								{items}
							</Row>
						</div>
					</Column>
				</Row>

				{this.state.lightBox.isVisible && (
					<LightBox
						type="project"
						title=""
						urls={[this.state.lightBox.url]}
						onTemplateStep={()=> this.props.onClick()}
						onClick={()=> this.handleLightBoxClick()} />
				)}
			</div>
		);
	}
}

export default GetStartedStep;
