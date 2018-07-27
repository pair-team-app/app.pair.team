
import React, { Component } from 'react';
import './BottomNav.css';

import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';


class BottomNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div style={{width:'65%'}}>
				<Row vertical="start" horizontal="center" style={{margin:'0 30px'}}>
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
							<a href="" target="_blank" rel="noopener noreferrer"><FontAwesome name="facebook-official" className="footer-icon" /></a>
							<a href="" target="_blank" rel="noopener noreferrer"><FontAwesome name="instagram" className="footer-icon" /></a>
							<a href="" target="_blank" rel="noopener noreferrer"><FontAwesome name="twitter" className="footer-icon" /></a>
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
