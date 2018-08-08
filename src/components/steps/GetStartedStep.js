
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

		console.log(this.props.isUsers);
		if (this.props.isUsers) {
			goToAnchor('users');
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
							<MediaQuery minWidth={840}>
								<Column flexGrow={1} horizontal="start">
									<div className="step-subheader-text" style={lAlignStyle}>Fully editable, developer ready.</div>
									<div className="step-text" style={lAlignStyle}>Generate fully editable design files that works perfectly with Adobe, Sketch, Figma, Google, & more.</div>
									<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
								</Column>
							</MediaQuery>
							<MediaQuery maxWidth={840}>
								<Column flexGrow={1} horizontal="center">
									<div className="step-header-text">Fully editable, developer ready.</div>
									<div className="step-text">Generate fully editable design files that works perfectly with Adobe, Sketch, Figma, Google, & more.</div>
									<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
								</Column>
							</MediaQuery>
							<MediaQuery minWidth={840}>
								<Column flexGrow={1} vertical="end">
									<img src="/images/intro2.png" alt="iPhone" width="300" height="371" />
								</Column>
							</MediaQuery>
						</Row>

						<Row flexGrow={1} style={{width:'100%', flexWrap:'wrap'}} className="app-icons-wrapper">
							<Column flexGrow={1} horizontal="center"><img src="/images/sketch_icon.png" width="50" height="48" alt="Sketch" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/figma_icon.png" width="32" height="48" alt="Figma" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/framer_icon.png" width="33" height="48" alt="Framer" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/xd_icon.png" width="50" height="48" alt="Adobe XD" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/google_icon.png" width="38" height="48" alt="Google" /></Column>
						</Row>

						<ScrollableAnchor id="faq"><div className="step-header-text">Introducing Design Automation</div></ScrollableAnchor>
						<div className="step-text">Design Engine is the first premium design automation tool allowing anyone to generate premium designs using AI. Design Engine uses a combination of curation & speculative design driven by AI software.</div>
						<button className="action-button step-button" onClick={()=> this.props.onClick()}>Read More</button>
						<img src="/images/intro3.png" className="intro-image" alt="MacBook" />
						<div className="step-header-text">Where is Design AI headed?</div>
						<div className="step-text">Listen to Design Engine’s bi-weekly microcast for insights on Design AI.</div>
						<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
						<Row flexGrow={1} style={{width:'100%', flexWrap:'wrap'}} className="app-icons-wrapper">
							<Column flexGrow={1} horizontal="center"><a href="#"><img src="/images/video1.png" className="video-image" alt="Video 1" /></a></Column>
							<Column flexGrow={1} horizontal="center"><a href="#"><img src="/images/video2.png" className="video-image" alt="Video 2" /></a></Column>
						</Row>

						<Row flexGrow={1} className="quotes-wrapper">
							<Column flexGrow={1} horizontal="center">
								<div className="step-header-text">What people are saying?</div>
								<div className="step-text step-text-margin">&laquo;Though the gravity still dragged at him, his muscles were making great efforts to adjust. After the daily classes he no longer collapsed immediately into bed.&raquo;</div>
								<div className="step-text-quote">@BennyBossen</div>
								<img src="/images/intro4.png" width="39" height="39" alt="Apple" />
							</Column>
						</Row>

						<Row flexGrow={1} style={{width:'100%', flexWrap:'wrap'}} className="app-icons-wrapper">
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
						</Row>

						<ScrollableAnchor id="users"><div className="step-header-text">Want free user feedback?</div></ScrollableAnchor>
						<div className="step-text">Download Design Engine’s Menu Bar to receive FREE feedback on your designs.</div>
						<button className="action-button step-button" onClick={()=> this.handleDownload()}>Download Menu Bar</button>
						<img src="/images/intro5.png" className="intro-image" alt="MacBook" />
						<div className="step-header-text">Wait, where is the catch?</div>
						<div className="step-text">There is no catch! You simply install Design Engine’s Menu Bar and let our platform learn from your design skills. In return we provide free user feedback on the design artboards you sync with us.</div>
						<button className="action-button step-button" onClick={()=> this.handleDownload()}>Download Menu Bar</button>
						<div className="step-header-text">Get a daily report of user feedback</div>
						<div className="step-text">Design Engine will send you a daily design report detailing rating, sentiment & feedback.</div>
						<button className="action-button step-button" onClick={()=> this.handleDownload()}>Download Menu Bar</button>

						<div className="reviews-wrapper">
							<Row flexGrow={1} className="review-item">
									<Column flexGrow={1}>
										<img className="review-image" src="/images/review1.png" alt="Sketch" />
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
									<img className="review-image" src="/images/review2.png" alt="Sketch" />
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
									<img className="review-image" src="/images/review3.png" alt="Sketch" />
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
									<img className="review-image" src="/images/review4.png" alt="Sketch" />
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
