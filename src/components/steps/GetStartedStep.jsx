
import React, { Component } from 'react';
import './GetStartedStep.css';
import projects from '../../projects.json';

import MediaQuery from 'react-responsive';
import { Column, Row } from 'simple-flexbox';
import ScrollableAnchor, { goToAnchor, removeHash } from 'react-scrollable-anchor';

import LightBox from '../elements/LightBox';
import ProjectItem from '../ProjectItem';

class GetStartedStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			lightBox : {
				isVisible : false,
				url : ''
			}
		};
	}

	componentDidMount() {
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
		if (this.props.isProjects) {
			goToAnchor('projects');
			setTimeout(function() {
				removeHash();
			}, 750);
		}

		const items = projects.map((item, i, arr) => {
			return (
				<Column key={i}>
					<ProjectItem image={item.image} title={item.title} onClick={()=> this.handleProject(item.image)} />
				</Column>
			);
		});

		const lAlignStyle = {
			textAlign: 'left'
		};

		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Use AI to design sites, apps, decks, more</div>
						<div className="step-text">Accelerate your best ideas with Design Engine’s AI powered Premium Design Systems.</div>
						<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
						<img src="/images/intro1.png" className="intro-image" alt="MacBook" />

						<ScrollableAnchor id="projects"><div className="step-header-text">Accelerate your best ideas using AI</div></ScrollableAnchor>
						<div className="step-text">The following Design Systems projects have been generated with Design Engine.</div>
						<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
						<div className="project-item-wrapper">
							<Row horizontal="center" style={{flexWrap:'wrap'}}>
								{items}
							</Row>
						</div>

						<Row flexGrow={1} className="intro-projects">
							<MediaQuery minWidth={840}>
								<Column flexGrow={1} horizontal="start" vertical="center">
									<div className="step-subheader-text" style={lAlignStyle}>Fully editable, developer ready.</div>
									<div className="step-text" style={lAlignStyle}>Generate fully editable design files that works perfectly with Adobe, Sketch, Figma, & Google.</div>
									<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
								</Column>
							</MediaQuery>
							<MediaQuery maxWidth={840}>
								<Column flexGrow={1} horizontal="center" vertical="center">
									<div className="step-header-text">Fully editable, developer ready.</div>
									<div className="step-text">Generate fully editable design files that works perfectly with Adobe, Sketch, Figma, & Google.</div>
									<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
								</Column>
							</MediaQuery>
							<MediaQuery minWidth={840}>
								<Column flexGrow={1} vertical="end">
									<img src="/images/intro2.png" alt="iPhone" width="300" height="371" />
								</Column>
							</MediaQuery>
						</Row>

						<Row flexGrow={1} horizontal="space-between" className="flex-wrapper app-icon-wrapper">
							<Column flexGrow={1} horizontal="center"><img src="/images/sketch_icon.png" width="50" height="48" alt="Sketch" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/figma_icon.png" width="32" height="48" alt="Figma" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/framer_icon.png" width="33" height="48" alt="Framer" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/xd_icon.png" width="50" height="48" alt="Adobe XD" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/google_icon.png" width="38" height="48" alt="Google" /></Column>
						</Row>
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
