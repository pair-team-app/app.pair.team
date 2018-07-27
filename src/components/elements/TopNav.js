
import React, { Component } from 'react';
import './TopNav.css';

import FontAwesome from 'react-fontawesome';
// import CurrencyFormat from 'react-currency-format';
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
// 		const projectsClass = (this.props.isProjects) ? 'nav-link nav-link-active' : 'nav-link';
// 		const faqClass = (this.props.isProjects) ? 'nav-link nav-link-active' : 'nav-link';

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="start">
					<Row vertical="center">
						<a href="/"><img src="/images/logo.png" className="nav-logo" alt="Design Engine" /></a>
						{/*{this.props.step > 0 && (*/}
							{/*<span className="nav-link" onClick={()=> this.props.onStep0()}>Cancel</span>*/}
						{/*)}*/}
					</Row>
				</Column>

				{this.props.step === 0 && (
					<Column flexGrow={1} horizontal="center">
						<Row vertical="center" style={{height:'40px'}}>
							<span>
								<span className="nav-link" onClick={()=> this.props.onStep1()}>Get Started</span>
								<span className="nav-link" onClick={()=> this.props.onProjects()}>View Examples</span>
								<span className="nav-link" onClick={()=> this.props.onFAQ()}>What is Design AI?</span>
							</span>
						</Row>
					</Column>
				)}

				<Column flexGrow={1} horizontal="end">
					<Row vertical="center" style={{height:'40px'}}>
						{this.props.step === 0 && (
							<span className="nav-link"><a href="http://designengine.ai/tryfree" target="_blank" rel="noopener noreferrer">Free Users</a></span>
// 							<span className="nav-link"><a href="https://spectrum.chat/designengine/login" target="_blank" rel="noopener noreferrer">What is Design AI?</a></span>
						)}

						{this.props.step > 0 && (
							<FontAwesome name="times" className="nav-link-close" onClick={()=> this.props.onStep0()} />
							//<span className="nav-link" >Total: <CurrencyFormat value={this.props.amount} displayType={'text'} thousandSeparator={true} prefix={'$'} /> USD</span>
						)}
					</Row>
				</Column>
			</Row>
		);
	}
}

export default TopNav;
