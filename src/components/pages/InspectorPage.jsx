
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
// import { Column, Row } from 'simple-flexbox';


class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			itemID : 0
		};
	}

	componentDidMount() {
		const { itemID } = this.props.match.params;
		this.setState({ itemID : itemID });
	}

	render() {
		return (
			<div className="inspector-page-wrapper">
				INSPECTOR PAGE ({this.state.itemID})
			</div>
		);
	}
}

export default InspectorPage;
