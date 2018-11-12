
import React, { Component } from 'react';
import './MissionPage.css';

import { Column, Row } from 'simple-flexbox';

import ReviewItem from '../iterables/ReviewItem';
import reviews from '../../json/reviews.json';

class MissionPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const items = reviews.map((item, i) => {
			return (
				<Column key={i}>
					<ReviewItem author={item.author} image={item.image} quote={item.quote} />
				</Column>
			);
		});

		return (
			<div className="page-wrapper mission-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>Mission</h1></Row>
					<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along.</div>
					<Row horizontal="center">
						<button className="adjacent-button" onClick={()=> window.open('https://www.github.com/de-ai')}>Github</button>
						<button className="adjacent-button" onClick={()=> window.open('https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA')}>Slack</button>
						<button onClick={()=> window.open('https://spectrum.chat/designengine')}>Spectrum</button>
					</Row>
				</div>
				<div>
					<Row><h2 className="mission-page-title">What is Design Engine?</h2></Row>
					<Row><p>We only collect data that can be directly used to improve your product experience. Every piece of data we collect, from your company name to the number of adjectives you use, is collected with specific intentions. We use data to improve our predictive models, so that the more you use Design Engine’s products, the better results you get. </p></Row>
					<Row><h4>User Reviews</h4></Row>
					<Row horizontal="space-around" className="mission-page-reviews-wrapper" style={{flexWrap:'wrap'}}>
						{items}
					</Row>
					<Row>
						<div className="mission-page-column-left">
							<h2>Will Design Engine be a web app or desktop app?</h2>
							<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
							<h2>Will Design Engine be a web app or desktop app?</h2>
							<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
							<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
							<h2>How much does it cost?</h2>
							<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers <span className="page-link" onClick={()=> this.props.onPayment()}>@2.99 per month</span>.</p>
						</div>

						<div className="mission-page-column-right">
							<h2>Will Design Engine be a web app or desktop app?</h2>
							<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
							<h2>Will Design Engine be a web app or desktop app?</h2>
							<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts.</p>
							<button className="stack-button" onClick={()=> this.props.onRegister()}>Sign Up with Email Address</button><br />
							<button onClick={()=> this.props.onRegister()}>Sign In</button>
						</div>
					</Row>
				</div>
			</div>
		);
	}
}

export default MissionPage;
