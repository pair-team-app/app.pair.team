
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
				visible : true,
				entries : phComments.map((comment, i)=> ({ ...comment,
					ind       : i,
					timestamp : moment(comment.added).add((moment().utcOffset() << 0), 'minute')
				})).sort((i, j)=> ((i.ind > j.ind) ? -1 : (i.ind < j.ind) ? 1 : 0))
			}
		};
	}

	componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);
		this.fetchPlayground(327)
	}

	fetchPlayground = (playgroundID)=> {
		console.log('%s.fetchPlayground()', this.constructor.name, playgroundID);

		axios.post(API_ENDPT_URL, {
			action  : 'PLAYGROUND',
			payload : {
				playground_id : playgroundID,
			}
		}).then((response) => {
			console.log('PLAYGROUND', response.data);

			const { playground } = response.data;
			this.setState({ playground : { ...playground,
					html       : decryptText(playground.html).replace(/"/g, '"'),
					styles     : decryptObject(playground.styles),
					deviceID   : playground.device_id,
					components : playground.components.map((component, i)=> ({ ...component,
						html     : decryptText(component.html).replace(/"/g, '"'),
						styles   : decryptObject(component.styles),
						path     : component.path.split(' ').filter((i)=> (i.length > 0)),
						children : component.children.map((child, i)=> ({ ...child,
							html   : decryptText(child.html).replace(/"/g, '"'),
							styles : decryptObject(child.styles),
							path   : child.path.split(' ').filter((i)=> (i.length > 0))
						})),
						comments : component.comments.map((comment, i)=> ({ ...comment,
							ind       : i,
							visible   : true,
							timestamp : moment(comment.added).add((moment().utcOffset() << 0), 'minute')
						})).sort((i, j)=> ((i.ind > j.ind) ? -1 : (i.ind < j.ind) ? 1 : 0))
					}))
				}});

		}).catch((error)=> {
		});
	};

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

	handleToggleDesktop = ()=> {
		console.log('%s.handleToggleDesktop()', this.constructor.name, this.state.playground.deviceID);
		//trackEvent('button', 'desktop-toggle');

		const { playground } = this.state;
		if (playground.device_id === 2) {
			this.fetchPlayground(327);
		}
	};

	handleToggleMobile = ()=> {
		console.log('%s.handleToggleMobile()', this.constructor.name, this.state.playground.deviceID);
// 		trackEvent('button', 'mobile-toggle');

		const { playground } = this.state;
		if (playground.device_id === 1) {
			this.fetchPlayground(328);
		}
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
						desktop={(playground.deviceID === 1)}
						mobile={(playground.deviceID === 2)}
						onToggleComments={this.handleToggleComments}
						onToggleDesktop={this.handleToggleDesktop}
						onToggleMobile={this.handleToggleMobile}
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
