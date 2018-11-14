
import React, { Component } from 'react';
import './LoggedInPage.css'

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
							<Row horizontal="center"><h1>Welcome Back</h1></Row>
							<div className="page-header-text">Design Engine is a design platform built for engineers. From open source projects to enterprise apps, you can inspect designs, download parts, copy code, and build interfaces faster.</div>
							<Row horizontal="center"><button onClick={()=> this.props.onPage('upload')}>New Project</button></Row>
						</div>
					</Column>
				</Row>
				<Row>
					<div className="logged-out-page-column-left">
						<h2>How is Design Engine useful?</h2>
						<p>Design Engine automates unnecessary and repetitive design production tasks that slow engineering projects down. Designers upload their files and invite engineering teammates, Design Engine handles the rest. </p>
						<h2>What does Design Engine do?</h2>
						<p>Design Engine parses design project's files and automatically produces real-time specifications of every view. Every page, art-board, layer, component, slice, group, and hot zone element gets analyzed, measured, and documented for distribution. This dramatically speeds up R&D and production time spent going back and forth with design teams to make sure their views are implemented correctly. The Design Engine Platform is also intended to scale without the worry or commitment to any specific design tool or development framework. Our platform of design tools does not require any IDE or to download of the native design source file's format.</p>
						<h2>How much does it cost?</h2>
						<p>Design Engine is free to use for all public projects. Simply upload your design files to get started. In the future, Design Engine will offer private projects @ <span className="page-link" onClick={()=> this.props.onPayment()}>$2.99 per month</span>.</p>
					</div>

					<div className="logged-out-page-column-right">
						<h2>Parts on-demand</h2>
						<p>Design Engine processes every design file's slice, button, icon and more for export every time you upload a  file. Whether you are developing an iOS 12 Mobile App or for an Android Tablet, Design Engine handles parts on-demand.</p>
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
