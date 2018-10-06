
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<div className="home-page-wrapper">
				HOME PAGE - ({this.props.section})
			</div>
		);
	}
}

export default HomePage;
