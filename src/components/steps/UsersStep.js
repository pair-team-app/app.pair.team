
import React, { Component } from 'react';
import './UsersStep.css';

import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';

class UsersStep extends Component {
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

	render() {
		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Want free user feedback?</div>
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
			</div>
		);
	}
}

export default UsersStep;
