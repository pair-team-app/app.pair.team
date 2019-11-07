
import React, { Component } from 'react';
import './PlaygroundPage.css';

import axios from 'axios';
import moment from 'moment';
import { connect } from 'react-redux';

import BasePage from '../BasePage';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import PlaygroundHeader from './PlaygroundHeader';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import { Modals, API_ENDPT_URL, DEFAULT_AVATAR } from '../../../consts/uris';
import { decryptObject, decryptText } from './utils/crypto';
import { trackEvent } from '../../../utils/tracking';


class PlaygroundPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			typeGroups  : null,
			playgrounds : null,
			playground  : null,
			component   : null,
			fetching    : false
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		if (!this.props.profile) {
			this.props.onModal(Modals.LOGIN);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { componentTypes, match } = this.props;
		const { playground, fetching } = this.state;

		if (!prevProps.componentTypes && componentTypes) {
			this.setState({ typeGroups : componentTypes });
		}

		if (!prevProps.profile && this.props.profile) {
			if (!playground && !fetching) {
				const { buildID, playgroundID } = match.params;

				if (buildID) {
					this.onFetchBuildPlaygrounds(buildID, playgroundID << 0);
				}
			}
		}

		if (!prevState.playground && playground && !this.state.component) {
			const { componentID } = match.params;
			if (componentID) {
				const component = playground.components.find(({ id })=> (id === componentID << 0));
				if (component) {
					this.setState({ component });
				}
			}
		}
	}

	handleAddComment = ({ content, itemID, position })=> {
		console.log('%s.handleAddComment()', this.constructor.name, { content, itemID, position });
		trackEvent('button', 'add-comment');

		const { profile } = this.props;

		axios.post(API_ENDPT_URL, {
			action  : 'ADD_COMMENT',
			payload : { content, position,
				user_id      : profile.id,
				component_id : itemID
			}
		}).then((response) => {
			console.log('ADD_COMMENT', response.data);
			const { comment } = response.data;

			const { playground } = this.state;
			this.setState({
				playground : { ...playground,
					components : playground.components.map((component)=> ({ ...component,
						comments : ((component.id === itemID) ? [ ...component.comments, { ...comment,
							position  : JSON.parse(comment.position),
							author    : {
								id       : comment.author.id,
								username : comment.author.username,
								email    : comment.author.email,
								avatar   : comment.author.avatar
							},
							epoch     : (moment.utc(comment.added).valueOf() * 0.001) << 0,
							timestamp : moment(comment.added).add((moment().utcOffset() << 0), 'minute')
						}] : component.comments).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0))
					}))
				}
			}, ()=> {
				const { playgrounds, playground } = this.state;
				this.setState({
					playgrounds : playgrounds.map((item)=> (item.id === playground.id) ? playground : item),
					component   : playground.components.find(({ id })=> (id === itemID))
				});
			});

		}).catch((error)=> {
		});
	};

	handleCompomentMenuItem = ({ type, itemID })=> {
		console.log('%s.handleCompomentMenuItem()', this.constructor.name, { type, itemID });
	};

	handleDeleteComment = (commentID)=> {
		console.log('%s.handleDeleteComment()', this.constructor.name, commentID);
		trackEvent('button', 'delete-comment');

		axios.post(API_ENDPT_URL, {
			action  : 'UPDATE_COMMENT',
			payload : {
				comment_id : commentID,
				state      : 'deleted'
			}
		}).then((response) => {
			console.log('UPDATE_COMMENT', response.data);

			const { playground, component } = this.state;
			this.setState({
				playground : { ...playground,
					components : playground.components.map((component)=> ({ ...component,
						comments : component.comments.filter(({ id }) => (id !== commentID)).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0))
					}))
				},
// 				component  : { ...component,
// 					comments : component.comments.filter(({ id }) => (id !== comment.id)).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0))
// 				}
			}, ()=> {
				const { playgrounds, playground } = this.state;
				this.setState({
					playgrounds : playgrounds.map((item)=> (item.id === playground.id) ? playground : item),
					component   : playground.components.find(({ id })=> (id === component.id))
				});
			});

		}).catch((error)=> {
		});
	};

	handleNavTypeItemClick = (typeGroup, typeItem)=> {
		console.log('%s.handleNavTypeItemClick()', this.constructor.name, typeGroup, typeItem);

		const { teamSlug, projectSlug, buildID } = this.props.match.params;
		const { playground } = this.state;

		this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${typeItem.id}`);
		this.setState({ component : typeItem });
	};

	handleToggleComments = (event)=> {
// 		console.log('%s.handleToggleComments()', this.constructor.name, event, this.state.comments);

// 		this.setState({
// 			comments : { ...comments,
// 				visible : !comments.visible
// 			}
// 		});
	};

	handleTogglePlayground = ()=> {
		console.log('%s.handleTogglePlayground()', this.constructor.name, this.state.playground.deviceID);
		const { playgrounds, playground } = this.state;
		this.setState({ playground : playgrounds.find(({ deviceID })=> (deviceID !== playground.deviceID))}, ()=> {
			const { teamSlug, projectSlug, buildID } = this.props.match.params;
			const { playground } = this.state;

			this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}`);
			trackEvent('button', (playground.deviceID === 1) ? 'desktop-toggle' : 'mobile-toggle');
		});
	};

	onFetchBuildPlaygrounds = (buildID, playgroundID=null)=> {
		console.log('%s.onFetchBuildPlaygrounds()', this.constructor.name, buildID, playgroundID);

		this.setState({ fetching : true }, ()=> {
			axios.post(API_ENDPT_URL, {
				action  : 'BUILD_PLAYGROUNDS',
				payload : {
					build_id : buildID,
				}
			}).then((response) => {
				console.log('BUILD_PLAYGROUNDS', response.data);
				const { componentID } = this.props.match.params;


				const playgrounds = response.data.playgrounds.map((playground)=> {
					const { device_id } = playground;
					delete (playground['device_id']);

					return ({ ...playground,
						html       : decryptText(playground.html),
						styles     : decryptObject(playground.styles),
						deviceID   : device_id,
						components : playground.components.map((component)=> {
							const { type_id, event_type_id, tag_name } = component;
							delete (component['type_id']);
							delete (component['event_type_id']);
							delete (component['tag_name']);

							return ({ ...component,
								typeID      : type_id,
								eventTypeID : event_type_id,
								title       : (component.title.length === 0) ? tag_name : component.title,
								tagName     : tag_name,
								html        : decryptText(component.html),
								styles      : decryptObject(component.styles),
								path        : component.path.split(' ').filter((i)=> (i.length > 0)),
// 								meta        : JSON.parse(component.meta.replace(/"/g, '\'')),
								selected    : (component.id === componentID << 0),
								children    : component.children.map((child)=> {
									const { tag_name } = child;
									delete (child['tag_name']);

									return ({ ...child,
										title   : (child.title.length === 0) ? tag_name : child.title,
										tagName : tag_name,
										html    : decryptText(child.html),
										styles  : decryptObject(child.styles),
										path    : child.path.split(' ').filter((i)=> (i.length > 0))
									});
								}),
								comments    : component.comments.map((comment)=> {
									const { added } = comment;
									delete (comment['added']);

									return ({ ...comment,
										position  : JSON.parse(comment.position),
										author    : {
											id       : comment.author.id,
											username : comment.author.username,
											email    : comment.author.email,
											avatar   : comment.author.avatar
										},
										epoch     : (moment.utc(added).valueOf() * 0.001) << 0,
										timestamp : moment(added).add((moment().utcOffset() << 0), 'minute')
									});
								}).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0))
							});
						})
					});
				});

				const playground = (playgroundID) ? playgrounds.find(({ id })=> (id === playgroundID)) : playgrounds.find(({ deviceID })=> (deviceID === 1));
				this.setState({ playgrounds, playground,
					fetching   : false

				}, ()=> {
					if (!this.props.match.params.playgroundID) {
						const { playground } = this.state;
						this.props.history.push(`${this.props.location.pathname}/${playground.id}`);
					}
				});

			}).catch((error)=> {
			});
		});
	};


	render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { profile } = this.props;
		const { teamSlug, projectSlug, componentsSlug, componentID } = this.props.match.params;
		const { typeGroups, playground, component } = this.state;

		const team = {
			title : teamSlug,
			logo  : DEFAULT_AVATAR
		};


		return (
			<BasePage className={`page-wrapper playground-page-wrapper${(component && component.comments.length > 0) ? ' playground-page-wrapper-comments' : ''}`}>
				{(profile && playground) && (<PlaygroundNavPanel
					team={team}
					typeGroups={typeGroups}
					typeItems={playground.components}
					componentID={componentID}
					onNavTypeItemClick={this.handleNavTypeItemClick}
				/>)}

				{(profile && playground) && (<div className="playground-page-content-wrapper">
					<PlaygroundContent
						playground={playground}
						onMenuItem={this.handleCompomentMenuItem}
						onAddComment={this.handleAddComment}
					/>

					<PlaygroundHeader
						playground={playground}
						projectSlug={projectSlug}
						componentsSlug={componentsSlug}
						component={component}
						onLogout={this.props.onLogout}
					/>

					<PlaygroundFooter
						comments={(component) ? component.comments : []}
						desktop={(playground.deviceID === 1)}
						mobile={(playground.deviceID === 2)}
						onToggleComments={this.handleToggleComments}
						onToggleDesktop={this.handleTogglePlayground}
						onToggleMobile={this.handleTogglePlayground}
					/>
				</div>)}

				{(profile) && (<PlaygroundCommentsPanel
					comments={(component) ? component.comments : []}
					onDelete={this.handleDeleteComment}
				/>)}
			</BasePage>
		);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile        : state.userProfile,
		componentTypes : state.componentTypes,
		eventGroups    : state.eventGroups
	});
};


export default connect(mapStateToProps)(PlaygroundPage);
