
import React, { Component } from 'react';
import './PlaygroundPage.css';

import moment from 'moment';

import BasePage from '../BasePage';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import PlaygroundHeader from './PlaygroundHeader';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import phComments from '../../../assets/json/placeholder-comments';
import { DEFAULT_AVATAR } from '../../../consts/uris';
// import { trackEvent } from '../../../utils/tracking';


class PlaygroundPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			comments : {
				visible : false,
				entries : phComments.map((comment, i)=> ({ ...comment,
					ind       : i,
					timestamp : moment(comment.added).add((moment().utcOffset() << 0), 'minute')
				})).sort((i, j)=> ((i.ind > j.ind) ? -1 : (i.ind < j.ind) ? 1 : 0))
			}
		};
	}

	handleDeleteComment = (comment)=> {
		console.log(this.constructor.name, '.handleDeleteComment()', this.state.comments, comment);

		const { comments } = this.state;
		this.setState({
			comments : { ...comments,
				entries : comments.entries.filter((item) => (item.id !== comment.id)).sort((i, j) => ((i.ind > j.ind) ? -1 : (i.ind < j.ind) ? 1 : 0))
			}
		});
	};

	handleToggleComments = (event)=> {
// 		console.log(this.constructor.name, '.handleToggleComments()', event, this.state.comments);
		const { comments } = this.state;

		this.setState({
			comments : { ...comments,
				visible : !comments.visible
			}
		});
	};


	render() {
		console.log(this.constructor.name, '.render()', this.props.match.params, this.state.comments);

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
			<BasePage className={`page-wrapper playground-page-wrapper${(comments.visible) ? ' playground-page-wrapper-comments' : ''}`}>
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
					comments={comments}
					onDelete={this.handleDeleteComment}
				/>
			</BasePage>
		);
	}
}


export default (PlaygroundPage);
