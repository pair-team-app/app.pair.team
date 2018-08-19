
import React, { Component } from 'react';
import './TopNav.css';

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
		//const faGlyph = (this.props.isTooltip) ? 'spinner' : 'times';

		const faqLinkClass = (this.props.step === 1) ? 'nav-link nav-link-active' : 'nav-link';
		const usersLinkClass = (this.props.step === 2) ? 'nav-link nav-link-active' : 'nav-link';

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="start">
					<Row vertical="center">
						<a href="/"><img src="/images/logo_header.svg" className="nav-logo" alt="Design Engine" /></a>
					</Row>
				</Column>

				{this.props.step < 3 && (
					<Column flexGrow={1} horizontal="center">
						<Row vertical="center" style={{height:'18px'}}>
							<MediaQuery minWidth={840}>
								<span>
									<span className="nav-link" onClick={()=> this.props.onStep1()}>Get Started</span>
									<span className="nav-link" onClick={()=> this.props.onProjects()}>View Examples</span>
									<span className={faqLinkClass} onClick={()=> this.props.onFAQ()}>What is Design AI?</span>
								</span>
							</MediaQuery>
						</Row>
					</Column>
				)}

				<Column flexGrow={1} horizontal="end">
					<Row vertical="center" style={{height:'18px'}}>
						<MediaQuery minWidth={840}>
							{this.props.step < 3 && (
								<span className={usersLinkClass} onClick={()=> this.props.onUsers()}>Free Users</span>
							)}

							{this.props.step >= 3 && (
								<img src="/images/close.png" className="nav-link-close" alt="Close" onClick={()=> this.props.onStep0()} />
							)}
						</MediaQuery>
						<MediaQuery maxWidth={840}>
							<span className="nav-link" onClick={()=> this.props.onStep1()}>Get Started</span>
						</MediaQuery>
					</Row>
				</Column>
			</Row>
		);
	}
}

export default TopNav;
