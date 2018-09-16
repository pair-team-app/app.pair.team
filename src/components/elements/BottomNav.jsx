
import React, { Component } from 'react';
import './BottomNav.css';

import FontAwesome from 'react-fontawesome';
import MediaQuery from 'react-responsive';
import { Column, Row } from 'simple-flexbox';


class BottomNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const urls = {
			crunchbase : 'https://www.crunchbase.com/organization/design-engine',
			twitter    : 'https://twitter.com/designengineai',
			instagram  : 'https://www.instagram.com/designengine.ai',
			youtube    : 'https://www.youtube.com/channel/UCmn_myR8ZGlQLCRhRZQKQoA/',
			spectrum   : 'https://spectrum.chat/designengine',
			slack      : 'https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA',
			facebook   : 'https://www.facebook.com/designengineai/',
			messenger  : 'https://www.m.me/designengineai/',
			blog       : 'https://medium.com/@jasonfesta?source=linkShare-aae22e53724a-1533684578',
			privacy    : 'https://designengine.gitbook.io/docs/privacy',
			terms      : 'https://designengine.gitbook.io/docs/terms-of-service',
			dmg        : 'http://designengine.ai/tryfree',
			login      : ''
		};

		return (
				<div className="footer-wrapper">
					<MediaQuery minWidth={840}>
						<Row vertical="start" horizontal="center" style={{margin:'0 30px'}}>
							<Column flexGrow={1} horizontal="start">
								<a href="/"><img src="/images/logo_footer.svg" className="footer-logo" alt="Design Engine" /></a>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Company</div>
								<div className="footer-link" onClick={()=> this.props.onFAQ()}>What is Design AI?</div>
								<div className="footer-link"><a href={urls.crunchbase} target="_blank" rel="noopener noreferrer">Crunchbase</a></div>
								<div className="footer-link"><a href={urls.messenger} target="_blank" rel="noopener noreferrer">Chat Now</a></div>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Products</div>
								<div className="footer-link" onClick={()=> this.props.onStep1()}>Get Started</div>
								<div className="footer-link" onClick={()=> this.props.onStep1()}>View Examples</div>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Legal</div>
								<div className="footer-link" onClick={()=> this.props.onTerms()}>Terms of Service</div>
								<div className="footer-link" onClick={()=> this.props.onPrivacy()}>Privacy Policy</div>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Support</div>
								<div className="footer-link"><a href={urls.messenger} target="_blank" rel="noopener noreferrer">Chat Now</a></div>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Follow Us</div>
								<div className="footer-icons">
									<a href={urls.facebook} target="_blank" rel="noopener noreferrer"><FontAwesome name="facebook-official" className="footer-icon" /></a>
									<a href={urls.instagram} target="_blank" rel="noopener noreferrer"><FontAwesome name="instagram" className="footer-icon" /></a>
									<a href={urls.twitter} target="_blank" rel="noopener noreferrer"><FontAwesome name="twitter" className="footer-icon" /></a>
									<a href={urls.youtube} target="_blank" rel="noopener noreferrer"><FontAwesome name="youtube-play" className="footer-icon" /></a>
									<a href={urls.slack} target="_blank" rel="noopener noreferrer"><FontAwesome name="slack" className="footer-icon" /></a>
								</div>
							</Column>
						</Row>
						<Row horizontal="center">
							<div className="copyright">&copy; {new Date().getFullYear()} Design Engine AI, Inc.</div>
						</Row>
					</MediaQuery>

					<MediaQuery maxWidth={840}>
						<div style={{marginLeft:'20px'}}>
							<div className="footer-title">Company</div>
							<div className="footer-link" onClick={()=> this.props.onFAQ()}>What is Design AI?</div>
							<div className="footer-link"><a href={urls.crunchbase} target="_blank" rel="noopener noreferrer">Crunchbase</a></div>
							<div className="footer-link"><a href={urls.messenger} target="_blank" rel="noopener noreferrer">Chat Now</a></div>
						</div>
						<div style={{margin:'20px 0 0 20px'}}>
							<div className="footer-title">Products</div>
							<div className="footer-link" onClick={()=> this.props.onStep1()}>Get Started</div>
							<div className="footer-link" onClick={()=> this.props.onStep1()}>View Examples</div>
						</div>
						<div style={{margin:'20px 0 0 20px'}}>
							<div className="footer-title">Legal</div>
							<div className="footer-link" onClick={()=> this.props.onPrivacy()}>Privacy Policy</div>
							<div className="footer-link" onClick={()=> this.props.onTerms()}>Terms of Serices</div>
						</div>
						<div style={{margin:'20px 0 0 20px'}}>
							<div className="footer-title">Support</div>
							<div className="footer-link"><a href={urls.messenger} target="_blank" rel="noopener noreferrer">Chat Now</a></div>
						</div>
						<div style={{margin:'20px 0 0 20px'}}>
							<div className="footer-title">Follow Us</div>
							<div className="footer-icons">
								<a href={urls.facebook} target="_blank" rel="noopener noreferrer"><FontAwesome name="facebook-official" className="footer-icon" /></a>
								<a href={urls.instagram} target="_blank" rel="noopener noreferrer"><FontAwesome name="instagram" className="footer-icon" /></a>
								<a href={urls.twitter} target="_blank" rel="noopener noreferrer"><FontAwesome name="twitter" className="footer-icon" /></a>
								<a href={urls.youtube} target="_blank" rel="noopener noreferrer"><FontAwesome name="youtube-play" className="footer-icon" /></a>
								<a href={urls.slack} target="_blank" rel="noopener noreferrer"><FontAwesome name="slack" className="footer-icon" /></a>
							</div>
						</div>
						<Row horizontal="center">
							<div className="copyright">&copy; {new Date().getFullYear()} Design Engine AI, Inc.</div>
						</Row>
					</MediaQuery>
				</div>
		);
	}
}

export default BottomNav;
