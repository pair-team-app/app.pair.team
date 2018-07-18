
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
		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="start">
					<a href="/"><img src="/images/logo.png" className="logo" alt="Design Engine" /></a>
				</Column>
				<Column flexGrow={1} horizontal="end" style={{height:'60px'}}>
					<Row>
						<span className="nav-link" ><a href="/tryfree">Try Free</a></span>
						<span className="nav-link"><a href="https://designengine.gitbook.io/docs/" target="_blank" rel="noopener noreferrer">Docs</a></span>
						<span className="nav-link"><a href="https://spectrum.chat/designengine/login" target="_blank" rel="noopener noreferrer">Spectrum</a></span>
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
