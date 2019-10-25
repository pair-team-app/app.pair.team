
import React, { Component } from 'react';
import './PlaygroundPage.css';

import BasePage from '../BasePage';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import PlaygroundHeader from './PlaygroundHeader';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import { DEFAULT_AVATAR } from '../../../consts/uris';
// import { trackEvent } from '../../../utils/tracking';


class PlaygroundPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			comments : false
		};
	}

	handleToggleComments = (event)=> {
// 		console.log(this.constructor.name, '.handleToggleComments()', event, this.state.comments);
		const { comments } = this.state;

		this.setState({ comments : !comments });
	};


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
		const { comments } = this.state;

		return (
			<BasePage className={`page-wrapper playground-page-wrapper${(comments) ? ' playground-page-wrapper-comments' : ''}`}>
				<PlaygroundNavPanel
					team={team}
					items={items} />

				<div className="playground-page-content-wrapper">
					<PlaygroundContent />

					<PlaygroundHeader
						params={params} />

					<PlaygroundFooter
						comments={comments}
						onToggleComments={this.handleToggleComments}
					/>
				</div>

				<PlaygroundCommentsPanel
					collapsed={{comments}}
				/>
			</BasePage>
		);
	}
}


export default (PlaygroundPage);
