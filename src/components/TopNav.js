
import React, { Component } from 'react';
import './TopNav.css';

import CurrencyFormat from 'react-currency-format';
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
		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="start">
					<Row vertical="center">
						<a href="/"><img src="/images/logo.png" className="nav-logo" alt="Design Engine" /></a>
						{this.props.step === 0 && (
							<span>
								<span className="nav-link" onClick={()=> this.props.handleStep1()}>Get Started</span>
								<span className="nav-link">View Templates</span>
								<span className="nav-link"><a href="https://spectrum.chat/designengine/login" target="_blank" rel="noopener noreferrer">Support</a></span>
							</span>
						)}

						{this.props.step > 0 && (
							<span className="nav-link" onClick={()=> this.props.handleStep0()}>Cancel</span>
						)}
					</Row>
				</Column>
				<Column flexGrow={1} horizontal="end">
					<Row vertical="center" style={{height:'40px'}}>
						{this.props.step === 0 && (
							<span className="nav-link" ><a href="/tryfree">Menu Bar</a></span>
						)}

						{this.props.step > 0 && (
							<span className="nav-link" >Total <CurrencyFormat value={this.props.amount} displayType={'text'} thousandSeparator={true} prefix={'$'} /> USD</span>
						)}
					</Row>
				</Column>
			</Row>
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

export default TopNav;
