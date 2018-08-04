
import React, { Component } from 'react';
import './TopNav.css';

import FontAwesome from 'react-fontawesome';
import MediaQuery from 'react-responsive';
import { Column, Row } from 'simple-flexbox';


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	toggle() {
		this.setState(prevState => ({
			dropdownOpen: !prevState.dropdownOpen
		}));
	}

	render() {
		const faGlyph = (this.props.isStatus) ? 'spinner' : 'times';

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="start">
					<Row vertical="center">
						<a href="/"><img src="/images/logo.png" className="nav-logo" alt="Design Engine" /></a>
					</Row>
				</Column>

				{this.props.step === 0 && (
					<Column flexGrow={1} horizontal="center">
						<Row vertical="center" style={{height:'40px'}}>
							<MediaQuery minDeviceWidth={1224}>
								<span>
									<span className="nav-link" onClick={()=> this.props.onStep1()}>Get Started</span>
									<span className="nav-link" onClick={()=> this.props.onProjects()}>View Examples</span>
									<span className="nav-link" onClick={()=> this.props.onFAQ()}>What is Design AI?</span>
								</span>
							</MediaQuery>
						</Row>
					</Column>
				)}

				<Column flexGrow={1} horizontal="end">
					<Row vertical="center" style={{height:'40px'}}>
						<MediaQuery minDeviceWidth={1224}>
							{this.props.step === 0 && (
								<span className="nav-link"><a href="http://designengine.ai/tryfree" target="_blank" rel="noopener noreferrer">Free Users</a></span>
							)}

							{this.props.step > 0 && (
								<FontAwesome name={faGlyph} className="nav-link-close" onClick={()=> this.props.onStep0()} />
							)}
						</MediaQuery>
						<MediaQuery maxDeviceWidth={1224}>
							<span className="nav-link" onClick={()=> this.props.onStep1()}>Get Started</span>
						</MediaQuery>
					</Row>
				</Column>
			</Row>
		);
	}
}

export default TopNav;
