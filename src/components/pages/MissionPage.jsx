
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
		const items = reviews.map((item, i, arr) => {
			return (
				<Column key={i}>
					<ReviewItem author={item.author} image={item.image} quote={item.quote} />
				</Column>
			);
		});

		return (
			<div className="page-wrapper mission-page-wrapper">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="page-header">
							<Row horizontal="center"><h1>Our Mission</h1></Row>
							<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
							<Row horizontal="center"><button className="adjacent-button" onClick={()=> window.open('https://www.youtube.com')}>Watch Video</button><button onClick={()=> window.location.href = '/mission'}>Mission</button></Row>
						</div>
						<div>
							<Row><h3>Mission</h3></Row>
							<Row><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam luctus vitae massa id porta. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque posuere, elit et pharetra egestas, ligula tellus fermentum purus, at lacinia nisi nibh et libero. Maecenas tristique nulla id lorem semper, non feugiat velit consectetur. Maecenas tristique enim sit amet luctus malesuada. Sed non nunc laoreet, fringilla metus sit amet, scelerisque dolor. Praesent nec dui vulputate libero ultricies condimentum.</p></Row>
							<Row horizontal="space-around" className="mission-page-reviews-wrapper" style={{flexWrap:'wrap'}}>
								{items}
							</Row>
							<Row horizontal="space-around" style={{flexWrap:'wrap'}}>
								<Column className="mission-page-faq">
									<h2>Will Design Engine be a web app or desktop app?</h2>
									<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
								</Column>
								<Column className="mission-page-faq">
									<h2>Will Design Engine be a web app or desktop app?</h2>
									<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
								</Column>
								<Column className="mission-page-faq">
									<h2>Will Design Engine be a web app or desktop app?</h2>
									<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
								</Column>
								<Column className="mission-page-faq">
									<h2>Will Design Engine be a web app or desktop app?</h2>
									<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
								</Column>
							</Row>
							<Row><h3>Founders</h3></Row>
							<Row><p>Vestibulum suscipit sem odio, quis interdum purus pharetra at. Aliquam dictum blandit ex ultricies convallis. Quisque venenatis lacus vitae nibh aliquet aliquet. Curabitur ut lacinia dolor. Pellentesque rutrum, nulla auctor laoreet euismod, nisl lorem aliquam lorem, pellentesque interdum felis mauris nec turpis. Ut condimentum, nibh gravida congue pharetra, nibh felis malesuada odio, at tempus tortor risus quis orci. Aenean nisi nulla, mollis eget rutrum ultrices, efficitur eget orci. Nam nec diam pharetra, rhoncus massa id, commodo metus. Mauris accumsan nunc et efficitur accumsan. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam erat volutpat. Aliquam efficitur vulputate purus in volutpat.</p></Row>
							<Row><p><img className="mission-page-founders-image" src="http://static1.businessinsider.com/image/5ada303319ee8642008b4679-2400/oceans%20venture%20group.jpg" alt="Founders" /></p></Row>
							<Row><h3>Press</h3></Row>
							<Row><div className="page-link" onClick={()=> this.props.onPage('branding')}>Branding</div></Row>
							<Row><div className="page-link" onClick={()=> this.props.onPage('founders')}>Founder's Photos</div></Row>
						</div>
					</Column>
				</Row>
			</div>
		);
	}
}

export default MissionPage;
