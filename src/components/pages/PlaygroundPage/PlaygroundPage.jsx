
import React, { Component } from 'react';
import './PlaygroundPage.css';

import BasePage from '../BasePage';
import PlaygroundPageContent from './PlaygroundPageContent';
import PlaygroundPageHeader from './PlaygroundPageHeader';
import PlaygroundPageNav from './PlaygroundPageNav';
import { DEFAULT_AVATAR } from '../../../consts/uris';
// import { trackEvent } from '../../../utils/tracking';

class PlaygroundPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	render() {
		console.log(this.constructor.name, '.render()', this.props.match.params, this.state);

		const team = {
			title : this.props.match.params.teamSlug,
			logo  : DEFAULT_AVATAR
		};

		const items = [{
			title : 'Pages',
			items : []
		}, {
			title : 'Links',
			items : []
		}, {
			title : 'Images',
			items : []
		}];

		const { params } = this.props.match;

		return (
			<BasePage className="playground-page-wrapper">
				<PlaygroundPageNav
					team={team}
					items={items} />

				<PlaygroundPageHeader
					params={params} />

				<PlaygroundPageContent />
			</BasePage>
		);
	}
}


export default (PlaygroundPage);
