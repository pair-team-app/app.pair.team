
import React, { Component } from 'react';
import './FAQStep.css';

import { Column, Row } from 'simple-flexbox';

class FAQStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	render() {
		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Introducing Design Automation</div>
						<div className="step-text">Design Engine is the first premium design automation tool allowing anyone to generate premium designs using AI. Design Engine uses a combination of curation & speculative design driven by AI software.</div>
						<button className="action-button step-button" onClick={()=> this.props.onClick()}>Read More</button>
						<img src="/images/intro3.png" className="intro-image" alt="MacBook" />
						<div className="step-header-text">Where is Design AI headed?</div>
						<div className="step-text">Listen to Design Engine’s bi-weekly microcast for insights on Design AI.</div>
						<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
						<Row flexGrow={1} style={{width:'100%', flexWrap:'wrap'}} className="flex-wrapper">
							<Column flexGrow={1} horizontal="center"><a href="https://www.youtube.com/watch?v=xYsLayJPBco"><img src="/images/video1.png" className="video-image" alt="Video 1" /></a></Column>
							<Column flexGrow={1} horizontal="center"><a href="https://www.youtube.com/watch?v=xYsLayJPBco"><img src="/images/video2.png" className="video-image" alt="Video 2" /></a></Column>
						</Row>

						<Row flexGrow={1} className="quotes-wrapper">
							<Column flexGrow={1} horizontal="center">
								<div className="step-header-text">What people are saying?</div>
								<div className="step-text step-text-margin">&laquo;Though the gravity still dragged at him, his muscles were making great efforts to adjust. After the daily classes he no longer collapsed immediately into bed.&raquo;</div>
								<div className="step-text-quote">@BennyBossen</div>
								<img src="/images/intro4.png" width="39" height="39" alt="Apple" />
							</Column>
						</Row>

						<Row flexGrow={1} style={{width:'100%', flexWrap:'wrap'}} className="flex-wrapper">
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
							<Column flexGrow={1} horizontal="center"><img src="/images/adobe_logo.png" className="partner-icon" alt="Adobe" /></Column>
						</Row>
					</Column>
				</Row>
			</div>
		);
	}
}

export default FAQStep;
