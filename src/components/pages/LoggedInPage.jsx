
import React, { Component } from 'react';
import './LoggedInPage.css'

import cookie from "react-cookies";
import { Column, Row } from 'simple-flexbox';


class LoggedInPage extends Component {
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
						<div className="page-header">
							<Row horizontal="center"><h1>{cookie.load('user_email')}</h1></Row>
							<div className="page-header-text">Design Engine is a design platform built for engineers. From open source projects to enterprise apps, you can inspect designs, download parts, copy code, and build interfaces faster.</div>
							<Row horizontal="center"><button onClick={()=> this.props.onPage('upload')}>New Project</button></Row>
						</div>
					</Column>
				</Row>
				<Row>
					<div className="logged-in-page-column-left">
						<h2>How is Design Engine useful?</h2>
						<p>Design Engine automates unnecessary and repetitive design production tasks that slow engineering projects down. Designers upload their files and invite engineering teammates, Design Engine handles the rest. </p>
						<div className="logged-in-page-video-wrapper">
							<button className="logged-in-page-video-button">Play Video</button>
						</div>
						<h2>Parts on-demand</h2>
						<p>Design Engine processes every design file's slice, button, icon and more for export every time you upload a  file. Whether you are developing an iOS 12 Mobile App or for an Android Tablet, Design Engine handles parts on-demand.</p>
					</div>

					<div className="logged-in-page-column-right">
						<h2>How much does it cost?</h2>
						<p>Design Engine is free to use for all public projects. Simply upload your design files to get started. In the future, Design Engine will offer private projects @ <span className="page-link" onClick={()=> this.props.onPayment()}>$2.99 per month</span>.</p>
						<h2>Sign up free</h2>
						<p>Sign up for Design Engine to inspect parts, download source, and start building interfaces faster.</p>
						<button className="stack-button" onClick={()=> this.props.onPage('register')}>Sign Up with Email Address</button><br />
						<button onClick={()=> this.props.onPage('login')}>Sign In</button>
					</div>
				</Row>
			</div>
		);
	}
}

export default LoggedInPage;
