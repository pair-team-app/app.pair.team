
import React, { Component } from 'react';
import './GetStartedStep.css';
import projects from '../../projects.json';

import FontAwesome from 'react-fontawesome';
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

	handleDownload() {
		window.location = 'http://designengine.ai/tryfree';
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

		if (this.props.isFAQ) {
			goToAnchor('faq');
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

// 		const faStyle = {
// 			color: '#0000ff',
// 			fontSize: '14px',
// 			marginRight: '5px'
// 		};

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
							<MediaQuery minDeviceWidth={1224}>
								<Column flexGrow={1} horizontal="start">
									<div className="step-header-text" style={lAlignStyle}>Fully editable, developer ready.</div>
									<div className="step-text" style={lAlignStyle}>Generate fully editable design files that works perfectly with Adobe, Sketch, Figma, Google, & more.</div>
									<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
								</Column>
							</MediaQuery>
							<MediaQuery maxDeviceWidth={1224}>
								<Column flexGrow={1} horizontal="center">
									<div className="step-header-text">Fully editable, developer ready.</div>
									<div className="step-text">Generate fully editable design files that works perfectly with Adobe, Sketch, Figma, Google, & more.</div>
									<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
								</Column>
							</MediaQuery>
							<MediaQuery minDeviceWidth={1224}>
								<Column flexGrow={1}>
									<img src="/images/intro2.png" alt="iPhone" width="209" height="291" />
								</Column>
							</MediaQuery>
						</Row>

						<Row flexGrow={1} style={{width:'100%', flexWrap:'wrap'}} className="app-icons-wrapper">
							<Column flexGrow={1} horizontal="center">
								<img src="https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png" width="50" height="50" alt="Sketch" />
							</Column>
							<Column flexGrow={1} horizontal="center">
								<img src="https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png" width="50" height="50" alt="Sketch" />
							</Column>
							<Column flexGrow={1} horizontal="center">
								<img src="https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png" width="50" height="50" alt="Sketch" />
							</Column>
							<Column flexGrow={1} horizontal="center">
								<img src="https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png" width="50" height="50" alt="Sketch" />
							</Column>
							<Column flexGrow={1} horizontal="center">
								<img src="https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png" width="50" height="50" alt="Sketch" />
							</Column>
						</Row>

						<ScrollableAnchor id="faq"><div className="step-header-text">Introducing Design Automation</div></ScrollableAnchor>
						<div className="step-text">Design Engine is the first premium design automation tool allowing anyone to generate premium designs using AI. Design Engine uses a combination of curation & speculative design driven by AI software.</div>
						<button className="action-button step-button" onClick={()=> this.props.onClick()}>Read More</button>
						<img src="/images/macbook.png" className="intro-image" alt="MacBook" />
						<div className="step-header-text">A new era of design will be AI driven</div>
						<div className="step-text">Accelerate your best ideas with Design Engine’s AI powered Premium Design Systems.</div>
						<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
						<img src="/images/macbook.png" className="intro-image" alt="MacBook" />
						<div className="step-header-text">What people are saying about Design AI</div>
						<div className="step-text">&laquo;Though the gravity still dragged at him, his muscles were making great efforts to adjust. After the daily classes he no longer collapsed immediately into bed.&raquo;</div>
						<div className="step-text"><strong>@BennyBossen</strong></div>
						<img src="/images/macbook.png" width="80" alt="Apple" />

						<div className="step-header-text">Get FREE users to rate your designs</div>
						<div className="step-text">Download Design Engine’s Menu Bar to receive FREE feedback on your designs.</div>
						<button className="action-button step-button" onClick={()=> this.handleDownload()}>Download Menu Bar</button>
						<img src="/images/macbook.png" className="intro-image" alt="MacBook" />
						<div className="step-header-text">Wait, what, where is the catch</div>
						<div className="step-text">The implications of this vary across design disciplines. In architecture, the parametric movement dubbed Parametricism 2.0 demonstrates the potential of technologically enhanced creativity. Its implications are already being explored in the gaming industry, as we design virtual environments.</div>
						<button className="action-button step-button" onClick={()=> this.handleDownload()}>Download Menu Bar</button>
						<div className="step-header-text">Get a daily report on design feedback</div>
						<div className="step-text">Accelerate your best ideas with Design Engine’s AI powered Premium Design Systems.</div>
						<button className="action-button step-button" onClick={()=> this.handleDownload()}>Download Menu Bar</button>

						<div className="reviews-wrapper">
							<Row flexGrow={1} className="review-item">
									<Column flexGrow={1}>
										<img className="review-image" src="https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png" alt="Sketch" />
									</Column>
								<Column vertical="center" style={{marginLeft:'20px'}}>
									<Row horizontal="start">
										<FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star-empty" /><FontAwesome name="star" className="review-star-empty" />
									</Row>
									<Row horizontal="start" className="review-quote">
										&laquo;Though the gravity still dragged at him, his muscles were making great efforts to adjust. After the daily classes he no longer collapsed immediately into bed.&raquo;
									</Row>
								</Column>
							</Row>

							<Row flexGrow={1} className="review-item">
								<Column flexGrow={1}>
									<img className="review-image" src="https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png" alt="Sketch" />
								</Column>
								<Column vertical="center" style={{marginLeft:'20px'}}>
									<Row horizontal="start">
										<FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star-empty" /><FontAwesome name="star" className="review-star-empty" />
									</Row>
									<Row horizontal="start" className="review-quote">
										&laquo;Though the gravity still dragged at him, his muscles were making great efforts to adjust. After the daily classes he no longer collapsed immediately into bed.&raquo;
									</Row>
								</Column>
							</Row>

							<Row flexGrow={1} className="review-item">
								<Column flexGrow={1}>
									<img className="review-image" src="https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png" alt="Sketch" />
								</Column>
								<Column vertical="center" style={{marginLeft:'20px'}}>
									<Row horizontal="start">
										<FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star" /><FontAwesome name="star" className="review-star-empty" /><FontAwesome name="star" className="review-star-empty" />
									</Row>
									<Row horizontal="start" className="review-quote">
										&laquo;Though the gravity still dragged at him, his muscles were making great efforts to adjust. After the daily classes he no longer collapsed immediately into bed.&raquo;
									</Row>
								</Column>
							</Row>
						</div>
					</Column>
				</Row>

				{this.state.lightBox.isVisible && (
					<LightBox title="" urls={[this.state.lightBox.url]} onClick={()=> this.handleLightBoxClick()} />
				)}
			</div>
		);
	}
}

export default GetStartedStep;
