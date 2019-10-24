
import React, { Component } from 'react';
import './PlaygroundPage.css';

import BasePage from '../BasePage';
import PlaygroundPageContent from './PlaygroundPageContent';
import PlaygroundPageHeader from './PlaygroundPageHeader';
import PlaygroundPageNav from './PlaygroundPageNav';
// import { trackEvent } from '../../../utils/tracking';

class PlaygroundPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	render() {
		console.log(this.constructor.name, '.render()', this.props, this.state);

		return (
			<BasePage className="playground-page-wrapper">
				<PlaygroundPageNav />
				<PlaygroundPageHeader />
				<PlaygroundPageContent>
				</PlaygroundPageContent>
			</BasePage>
		);
	}
}


export default (PlaygroundPage);
