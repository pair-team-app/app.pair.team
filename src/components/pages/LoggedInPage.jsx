
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
							<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
							<Row horizontal="center"><button onClick={()=> this.props.onPage('upload')}>New Project</button></Row>
						</div>
					</Column>
				</Row>
				<Row>
					<div className="logged-out-page-column-left">
						<h2>Will Design Engine be a web app or desktop app?</h2>
						<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
						<h2>Will Design Engine be a web app or desktop app?</h2>
						<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
						<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
						<h2>How much does it cost?</h2>
						<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers <span className="page-link" onClick={()=> this.props.onPayment()}>@2.99 per month</span>.</p>
					</div>

					<div className="logged-out-page-column-right">
						<h2>Will Design Engine be a web app or desktop app?</h2>
						<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
						<h2>Will Design Engine be a web app or desktop app?</h2>
						<p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts.</p>
						<button className="stack-button" onClick={()=> this.props.onPage('register')}>Sign Up with Email Address</button><br />
						<button onClick={()=> this.props.onPage('login')}>Sign In</button>
					</div>
				</Row>
			</div>
		);
	}
}

export default LoggedInPage;
