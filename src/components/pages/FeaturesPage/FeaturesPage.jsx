
import React, { Component } from 'react';
import './FeaturesPage.css';

import BasePage from '../BasePage';


class FeaturesPage extends Component {
	constructor(props) {
		super(props);

		this.state = {

		};
	}

	componentDidMount() {
// 		console.log(this.constructor.name, '.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log(this.constructor.name, '.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}

	render() {
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

		return (
			<BasePage className="features-page-wrapper">
			</BasePage>
		);
	}
}


export default (FeaturesPage);
