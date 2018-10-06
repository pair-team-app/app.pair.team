
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';


class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<div className="inspector-page-wrapper">
				INSPECTOR PAGE
			</div>
		);
	}
}

export default InspectorPage;
