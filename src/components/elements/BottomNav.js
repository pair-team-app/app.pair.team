
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
		return (
				<div className="footer-wrapper">
					<MediaQuery minWidth={840}>
						<Row vertical="start" horizontal="center" style={{margin:'0 30px'}}>
							<Column flexGrow={1} horizontal="start">
								<a href="/"><img src="/images/logo_footer.png" className="footer-logo" alt="Design Engine" /></a>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Company</div>
								<div className="footer-link"><a href="https://www.crunchbase.com/organization/design-engine" target="_blank" rel="noopener noreferrer">Crunchbase</a></div>
								<div className="footer-link"><a href="https://spectrum.chat/designengine/login" target="_blank" rel="noopener noreferrer">Support</a></div>
								<div className="footer-link"><a href="https://medium.com/@jasonfesta?source=linkShare-aae22e53724a-1533684578" target="_blank" rel="noopener noreferrer">Blog</a></div>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Legal</div>
								<div className="footer-link"><a href="https://designengine.gitbook.io/docs/privacy" target="_blank" rel="noopener noreferrer">Privacy</a></div>
								<div className="footer-link"><a href="https://designengine.gitbook.io/docs/terms-of-service" target="_blank" rel="noopener noreferrer">Terms</a></div>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Products</div>
								<div className="footer-link" onClick={()=> this.props.handleStep1()}>Get Started</div>
								<div className="footer-link" onClick={()=> this.props.handleStep1()}>View Templates</div>
								<div className="footer-link"><a href="http://designengine.ai/tryfree" target="_blank" rel="noopener noreferrer">Menu Bar</a></div>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Account</div>
								<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Login</a></div>
							</Column>
							<Column flexGrow={1} horizontal="start">
								<div className="footer-title">Follow Us</div>
								<div className="footer-icons">
									<a href="https://www.facebook.com/designengineai/" target="_blank" rel="noopener noreferrer"><FontAwesome name="facebook-official" className="footer-icon" /></a>
									<a href="https://www.instagram.com/designengine.ai" target="_blank" rel="noopener noreferrer"><FontAwesome name="instagram" className="footer-icon" /></a>
									<a href="https://twitter.com/designengineai" target="_blank" rel="noopener noreferrer"><FontAwesome name="twitter" className="footer-icon" /></a>
									<a href="https://www.youtube.com/channel/UCmn_myR8ZGlQLCRhRZQKQoA/" target="_blank" rel="noopener noreferrer"><FontAwesome name="youtube-play" className="footer-icon" /></a>
									<a href="https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA" target="_blank" rel="noopener noreferrer"><FontAwesome name="slack" className="footer-icon" /></a>
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
							<div className="footer-link"><a href="https://www.crunchbase.com/organization/design-engine" target="_blank" rel="noopener noreferrer">Crunchbase</a></div>
							<div className="footer-link"><a href="https://spectrum.chat/designengine/login" target="_blank" rel="noopener noreferrer">Support</a></div>
							<div className="footer-link"><a href="https://medium.com/@jasonfesta?source=linkShare-aae22e53724a-1533684578" target="_blank" rel="noopener noreferrer">Blog</a></div>
						</div>
						<div style={{margin:'20px 0 0 20px'}}>
							<div className="footer-title">Legal</div>
							<div className="footer-link"><a href="https://designengine.gitbook.io/docs/privacy" target="_blank" rel="noopener noreferrer">Privacy</a></div>
							<div className="footer-link"><a href="https://designengine.gitbook.io/docs/terms-of-service" target="_blank" rel="noopener noreferrer">Terms</a></div>
						</div>
						<div style={{margin:'20px 0 0 20px'}}>
							<div className="footer-title">Products</div>
							<div className="footer-link" onClick={()=> this.props.handleStep1()}>Get Started</div>
							<div className="footer-link" onClick={()=> this.props.handleStep1()}>View Templates</div>
							<div className="footer-link"><a href="http://designengine.ai/tryfree" target="_blank" rel="noopener noreferrer">Menu Bar</a></div>
						</div>
						<div style={{margin:'20px 0 0 20px'}}>
							<div className="footer-title">Support</div>
							<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Chat Now</a></div>
						</div>
						<div style={{margin:'20px 0 0 20px'}}>
							<div className="footer-title">Follow Us</div>
							<div className="footer-icons">
								<a href="https://www.facebook.com/designengineai/" target="_blank" rel="noopener noreferrer"><FontAwesome name="facebook-official" className="footer-icon" /></a>
								<a href="https://www.instagram.com/designengine.ai" target="_blank" rel="noopener noreferrer"><FontAwesome name="instagram" className="footer-icon" /></a>
								<a href="https://twitter.com/designengineai" target="_blank" rel="noopener noreferrer"><FontAwesome name="twitter" className="footer-icon" /></a>
								<a href="https://www.youtube.com/channel/UCmn_myR8ZGlQLCRhRZQKQoA/" target="_blank" rel="noopener noreferrer"><FontAwesome name="youtube-play" className="footer-icon" /></a>
								<a href="https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA" target="_blank" rel="noopener noreferrer"><FontAwesome name="slack" className="footer-icon" /></a>
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
