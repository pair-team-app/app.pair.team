
import React, { Component } from 'react';
import './BottomNav.css';

import { Column, Row } from 'simple-flexbox';


class BottomNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="start">
						<a href="/"><img src="/images/logo.png" className="footer-logo" alt="Design Engine" /></a>
					</Column>
					<Column flexGrow={1} horizontal="start">
						<div className="footer-title">Company</div>
						<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Crunchbase</a></div>
						<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Support</a></div>
						<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Blog</a></div>
					</Column>
					<Column flexGrow={1} horizontal="start">
						<div className="footer-title">Legal</div>
						<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Privacy</a></div>
						<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Terms</a></div>
					</Column>
					<Column flexGrow={1} horizontal="start">
						<div className="footer-title">Products</div>
						<div className="footer-link" onClick={()=> this.props.handleStep1()}>Get Started</div>
						<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">View Templates</a></div>
						<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Menu Bar</a></div>
					</Column>
					<Column flexGrow={1} horizontal="start">
						<div className="footer-title">Account</div>
						<div className="footer-link"><a href="https://" target="_blank" rel="noopener noreferrer">Login</a></div>
					</Column>
					<Column flexGrow={1} horizontal="start">
						<div className="footer-title">Follow Us</div>
						<div className="footer-icons">
							<a href="" target="_blank" rel="noopener noreferrer"><img className="footer-icon" src="/images/facebook.png" alt="Facebook" /></a>
							<a href="" target="_blank" rel="noopener noreferrer"><img className="footer-icon" src="/images/instagram.png" alt="Instagram" /></a>
							<a href="" target="_blank" rel="noopener noreferrer"><img className="footer-icon" src="/images/twitter.png" alt="Twitter" /></a>
						</div>
					</Column>
				</Row>
				<Row horizontal="center">
					<div className="copyright">&copy; {new Date().getFullYear()} Design Engine AI, Inc.</div>
				</Row>
			</div>
// 			<Row vertical='center' horizontal='spaced'>
// 				<Column vertical='end'>
// 					<span> Content 1 </span>
// 					<span> Content 2 </span>
// 				</Column>
// 				<Column>
// 					<span> Content 3 </span>
// 					<span> Content 4 </span>
// 					<span> Content 5 </span>
// 				</Column>
// 			</Row>
		);
	}
}

export default BottomNav;
