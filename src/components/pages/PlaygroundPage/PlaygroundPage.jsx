
import React, { Component } from 'react';
import './PlaygroundPage.css';

import axios from 'axios';
import moment from 'moment';

import BasePage from '../BasePage';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import PlaygroundHeader from './PlaygroundHeader';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import phComments from '../../../assets/json/placeholder-comments';
import {API_ENDPT_URL, DEFAULT_AVATAR} from '../../../consts/uris';
import { decryptObject, decryptText } from './utils/crypto';
// import { trackEvent } from '../../../utils/tracking';


class PlaygroundPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			playground : null,
			comments   : {
				visible : false,
				entries : phComments.map((comment, i)=> ({ ...comment,
					ind       : i,
					timestamp : moment(comment.added).add((moment().utcOffset() << 0), 'minute')
				})).sort((i, j)=> ((i.ind > j.ind) ? -1 : (i.ind < j.ind) ? 1 : 0))
			}
		};
	}

	componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		axios.post(API_ENDPT_URL, {
			action  : 'PLAYGROUND',
			payload : {
				playground_id : 317,
			}
		}).then((response) => {
// 			console.log('PLAYGROUND', response.data);

			const { playground } = response.data;
			this.setState({ playground : { ...playground,
				html   : decryptText(playground.html).replace(/"/g, '"'),
				styles : decryptObject(playground.styles),
				components : playground.components.map((component, i)=> ({ ...component,
					html     : decryptText(component.html).replace(/"/g, '"'),
					styles   : decryptObject(component.styles),
					path     : component.path.split(' '),
					children : component.children.map((child, i)=> ({ ...child,
						html   : decryptText(child.html).replace(/"/g, '"'),
						styles : decryptObject(child.styles),
						path   : child.path.split(' ')
					}))
				}))
			}});

		}).catch((error)=> {
		});
	}

	handleDeleteComment = (comment)=> {
// 		console.log('%s.handleDeleteComment()', this.constructor.name, this.state.comments, comment);

		const { comments } = this.state;
		this.setState({
			comments : { ...comments,
				entries : comments.entries.filter((item) => (item.id !== comment.id)).sort((i, j) => ((i.ind > j.ind) ? -1 : (i.ind < j.ind) ? 1 : 0))
			}
		});
	};

	handleToggleComments = (event)=> {
// 		console.log('%s.handleToggleComments()', this.constructor.name, event, this.state.comments);
		const { comments } = this.state;

		this.setState({
			comments : { ...comments,
				visible : !comments.visible
			}
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props.match.params, this.state);

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
		const { comments, playground } = this.state;

		return (
			<BasePage className={`page-wrapper playground-page-wrapper${(comments.visible) ? ' playground-page-wrapper-comments' : ''}`}>
				<PlaygroundNavPanel
					team={team}
					items={items} />

				{(playground) && (<div className="playground-page-content-wrapper">
					<PlaygroundContent
						playground={playground}
					/>

					<PlaygroundHeader
						params={params} />

					<PlaygroundFooter
						comments={comments}
						onToggleComments={this.handleToggleComments}
					/>
				</div>)}

				<PlaygroundCommentsPanel
					comments={comments}
					onDelete={this.handleDeleteComment}
				/>
			</BasePage>
		);
	}
}


export default (PlaygroundPage);
