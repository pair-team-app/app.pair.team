
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
					<div className="page-header-text">Our mission is to provide a design platform that connects designers with engineers worldwide using web based tools to help them make software together, faster.</div>
					<Row horizontal="center">
						<button className="adjacent-button" onClick={()=> this.props.onPage('api')}>API</button>
						<button className="adjacent-button" onClick={()=> window.open('https://www.github.com/de-ai')}>Github</button>
						<button className="adjacent-button" onClick={()=> window.open('https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA')}>Slack</button>
						<button onClick={()=> window.open('https://spectrum.chat/designengine')}>Spectrum</button>
					</Row>
				</div>
				<div>
					<Row><h2 className="mission-page-title">Why did Matt and Jason build Design Engine?</h2></Row>
					<Row><p>Design Engine was created by Matt Holcombe (Engineer) &amp; Jason Festa (Designer). Matt &amp; Jason co-founded Design Engine with two values, 1) We wanted to create Design Software we would actually use and 2) We wanted to provide a tool to allow engineers to build interfaces faster. Matt &amp; Jason together have developed…
						{/*<span className="page-link">Read More</span>*/}
					</p></Row>
					<Row><h4>Customer Reviews</h4></Row>
					<Row horizontal="space-around" className="mission-page-reviews-wrapper" style={{flexWrap:'wrap'}}>
						{items}
					</Row>
					<Row>
						<div className="mission-page-column-left">
							<h2>Design is on <span role="img" aria-label="Fire">🔥</span></h2>
							<p>Design in 2018 has really taken off with the introductions of new design tools and the mainstream adoption of design systems now  being embraced by both large scale technology companies and small open source projects.</p>
							<h2>Production ready</h2>
							<p>Design Engine renders production ready design on-demand for engineering teams & organizations to view designs, download parts, inspect source and make software projects faster. Designers simply upload their design source & invite engineering teammates to their projects. Design Engine automatically generates specifications, cuts parts, and generates code snippets to inspect & re-use.</p>
							<p>Design Engine solves a variety of design production issues to help engienering teams speed up the development of their projects.</p>
							<h2>Roadmap</h2>
							<p>Design Engine is just getting started. We are excited to be creating Design Software for Engineers, you can review our companies roadmap on Trello here.</p>
						</div>

						<div className="mission-page-column-right">
							<h2>Support</h2>
							<p>Are you looking for Design Engine support? You can always find us on Slack and Spectrum.</p>
							<h2>Sign up</h2>
							<p>Sign up for Design Engine to inspect parts, download source, and start building interface.</p>
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
