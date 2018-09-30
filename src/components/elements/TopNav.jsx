
import React, { Component } from 'react';
import './TopNav.css';

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
// 		const faqLinkClass = (this.props.step === 1) ? 'nav-link nav-link-active' : 'nav-link';
// 		const usersLinkClass = (this.props.step === 2) ? 'nav-link nav-link-active' : 'nav-link';

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="start">
					<Row vertical="center" style={{height:'40px'}}>
						<div style={{width:'97px'}} />
					</Row>
				</Column>

				<Column flexGrow={1} horizontal="center">
					<Row vertical="center" style={{height:'40px'}}>
						<a href="/"><img src="/images/logo.svg" className="nav-logo" alt="Design Engine" /></a>
					</Row>
				</Column>


				<Column flexGrow={1} horizontal="end">
					<Row vertical="center" horizontal="end" style={{width:'97px',height:'40px'}}>
						{((this.props.step < 3 || this.props.step > 7) && this.props.step !== 10) && (
							<span className="nav-link"><a onClick={()=> this.props.onManifesto()}>Manifesto</a></span>
						)}

						{((this.props.step >= 3 && this.props.step < 8) || (this.props.step === 10)) && (
							<span className="nav-link"><a onClick={()=> this.props.onClose()}>Close</a></span>
						)}
					</Row>
				</Column>
			</Row>
		);
	}
}

export default TopNav;
