
import React, { Component } from 'react';
import './CompletionStep.css'

// import axios from 'axios';
// import cookie from 'react-cookies';
import { Row } from 'simple-flexbox';

class CompletionStep extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render() {


		return (
			<div className="processing-wrapper" onClick={()=> this.props.onClick()}>
				<div className="processing-content">
					{status}
				</div>
			</div>
		);
	}
}

export default CompletionStep;
