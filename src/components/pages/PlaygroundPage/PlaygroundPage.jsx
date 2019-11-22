
import React, { Component } from 'react';
import './PlaygroundPage.css';

import axios from 'axios';
import { connect } from 'react-redux';

import BasePage from '../BasePage';
import PlaygroundAccessibilty from './PlaygroundAccessibility';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import PlaygroundHeader from './PlaygroundHeader';
import { SettingsMenuItemTypes } from './PlaygroundHeader/UserSettings';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import { commentByID, componentByID, componentFromComment, typeGroupByComponent } from './utils/lookup';
import { reformComment, reformComponent } from './utils/reform';
import { replacePlayground } from './utils/replace';
import { Modals, API_ENDPT_URL } from '../../../consts/uris';
import { decryptObject, decryptText } from './utils/crypto';
import { trackEvent } from '../../../utils/tracking';


class PlaygroundPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			typeGroups    : null,
			typeGroup     : null,
			playgrounds   : null,
			playground    : null,
			component     : null,
			comment       : null,
			cursor        : false,
			accessibility : false,
			fetching      : false
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		if (!this.props.profile) {
			this.props.onModal(Modals.LOGIN);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { profile, team, componentTypes, match } = this.props;
		const { typeGroups, playground, fetching } = this.state;

		const { teamSlug, projectSlug, buildID, playgroundID, componentsSlug, componentID, commentID } = match.params;
// 		console.log('params', match.params);

		// init typeGroups
		if (!prevProps.componentTypes && componentTypes) {
			this.setState({ typeGroups : componentTypes });
		}

		// logged in
		if (!prevProps.profile && profile) {
			if (!playground && !fetching) {
				if (buildID) {
					this.onFetchBuildPlaygrounds(buildID, playgroundID << 0);
				}
			}
		}

		// team
		if (!prevProps.team && team) {
			if (teamSlug !== team.title) {
// 				console.log('***** REDIRECT *******', team.title);
			}
		}

		// refresh typegroups
		if (!prevState.playground && playground) {
			if (typeGroups && !this.state.typeGroup && componentsSlug) {
				const typeGroup = typeGroups.find(({ key })=> (key === componentsSlug));
				if (typeGroup) {
					this.setState({ typeGroup });
				}
			}


			if (componentID) {
				if (prevProps.componentID !== componentID) {
					const component = componentByID(playground.components, componentID);

					if (component) {
						this.setState({ component }, () => {
							if (commentID) {
								if (prevProps.commentID !== commentID) {
									const comment = commentByID(component.comments, commentID);

									if (comment) {
										this.setState({ comment });
									}
								}

							} else {
								this.setState({ comment : null });
							}
						});
					}
				}

			} else {
				this.setState({ component : null });
			}
		}
	}

	handleAddComment = ({ content, itemID, position })=> {
// 		console.log('%s.handleAddComment()', this.constructor.name, { content, itemID, position });
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
						comments : ((component.id === itemID) ? [ ...component.comments, reformComment(comment)] : component.comments).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0))
					}))
				}
			}, ()=> {
				const { playgrounds, playground } = this.state;
				const component = componentByID(playground.components, itemID);

				this.setState({ component,
					playgrounds : replacePlayground(playgrounds, playground),
					comment     : reformComment(comment)
				}, ()=> {
					const { teamSlug, projectSlug, buildID } = this.props.match.params;
					const { typeGroup, component } = this.state;

					this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}/comments/${comment.id}`);
				});
			});

		}).catch((error)=> {
		});
	};

	handleCommentMarkerClick = ({ comment })=> {
// 		console.log('%s.handleCommentMarkerClick()', this.constructor.name, { comment });

		if (!this.state.component || !this.state.comment) {
			const { typeGroups, playground } = this.state;
			const component = componentFromComment(playground.components, comment);

			this.setState({ component, comment }, ()=> {
				const { teamSlug, projectSlug, buildID } = this.props.match.params;
				const typeGroup = (this.state.typeGroup || typeGroupByComponent(typeGroups, component));
				this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}/comments/${comment.id}`);
			});
		}
	};

	handleComponentClick = ({ component })=> {
		console.log('%s.handleComponentClick()', this.constructor.name, { component });

		const { teamSlug, projectSlug, buildID } = this.props.match.params;
		const { typeGroups, playground } = this.state;

		const typeGroup = (this.state.typeGroup || typeGroupByComponent(typeGroups, component));

// 		console.log('%s.handleComponentClick()', this.constructor.name, playground, typeGroup, component);
		this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}${(this.state.component && component.id === this.state.component.id && window.location.href.includes('/comments')) ? '/comments' : ''}`);

		component.selected = true;
		this.setState ({ component,
			cursor : false
		});
	};

	handleComponentMenuShow = ({ componentID })=> {
// 		console.log('%s.handleComponentMenuShow()', this.constructor.name, { componentID });

		const { components } = this.state.playground;
		const component = components.find(({ id })=> (id === componentID));
		this.setState ({ component });
	};

	handleCompomentMenuItem = ({ type, itemID })=> {
// 		console.log('%s.handleCompomentMenuItem()', this.constructor.name, { type, itemID });

		if (type === 'comments') {
			const { teamSlug, projectSlug, buildID } = this.props.match.params;
			const { typeGroups, playground } = this.state;

			const component = componentByID(playground.components, itemID);
			const typeGroup = (this.state.typeGroup || typeGroupByComponent(typeGroups, component));
			this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}${(!window.location.href.includes('/comments')) ? '/comments' : ''}`);
		}
	};

	handleComponentPopoverClose = ()=> {
// 		console.log('%s.handleComponentPopoverClose()', this.constructor.name);

		this.setState({ comment : null }, ()=> {
			const { teamSlug, projectSlug, buildID } = this.props.match.params;
			const { typeGroups, playground, component } = this.state;
			const typeGroup = (this.state.typeGroup || typeGroupByComponent(typeGroups, component));
			this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}${(window.location.href.includes('/comments')) ? '/comments' : ''}`);
		});
	};

	handleDeleteComment = (commentID)=> {
// 		console.log('%s.handleDeleteComment()', this.constructor.name, commentID);
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
			}, ()=> {
				const { playgrounds, playground, typeGroup } = this.state;

				this.setState({
					playgrounds : replacePlayground(playgrounds, playground),
					component   : componentByID(playground.components, component.id),
					comment     : null
				}, ()=> {
					const { teamSlug, projectSlug, buildID } = this.props.match.params;
					this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}/comments`);
				});
			});

		}).catch((error)=> {
		});
	};

	handleNavGroupItemClick = (typeGroup)=> {
// 		console.log('%s.handleNavGroupItemClick()', this.constructor.name, typeGroup);

		const { teamSlug, projectSlug, buildID } = this.props.match.params;
		const { playground } = this.state;

		typeGroup.expanded = !typeGroup.expanded;
		typeGroup.selected = !typeGroup.selected;

		this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}`);
		this.setState({ typeGroup,
			comment   : null,
			component : null
		});
	};

	handleNavTypeItemClick = (typeGroup, typeItem)=> {
// 		console.log('%s.handleNavTypeItemClick()', this.constructor.name, typeGroup, typeItem);

		const { teamSlug, projectSlug, buildID } = this.props.match.params;
		const { playground } = this.state;

		this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${typeItem.id}`);
		this.setState({ component : typeItem });
	};

	handleSettingsItem = (itemType)=> {
		console.log('%s.handleSettingsItem()', this.constructor.name, itemType);

		if (itemType === SettingsMenuItemTypes.DELETE) {
			this.props.onModal(Modals.PROFILE);

		} else {
			this.props.onModal(Modals.PROFILE);
		}
	};

	handleToggleAccessibility = ()=> {
		console.log('%s.handleToggleAccessibility()', this.constructor.name, this.state.accessibility);

		const { accessibility } = this.state;
		this.setState({ accessibility : !accessibility });
	};

	handleToggleCommentCursor = (event)=> {
// 		console.log('%s.handleToggleCommentCursor()', this.constructor.name, event, this.state.cursor, !this.state.cursor);

		const { cursor } = this.state;
		this.setState({ cursor : !cursor });
	};

	handleTogglePlayground = ()=> {
// 		console.log('%s.handleTogglePlayground()', this.constructor.name, this.state.playground.deviceID);
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
						html          : decryptText(playground.html),
						styles        : decryptObject(playground.styles),
						deviceID      : device_id,
						components    : playground.components.map((component)=> (reformComponent(component, { selected : (component.id === (componentID << 0)) })))
					});
				});

				const playground = (playgroundID) ? playgrounds.find(({ id })=> (id === playgroundID)) : playgrounds.find(({ deviceID })=> (deviceID === 1));
				this.setState({ playgrounds, playground,
					fetching : false

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



	handleStripeModal = ()=> {
		console.log('%s.handleStripeModal()', this.constructor.name);
		this.props.onModal(Modals.STRIPE, {
			price  : 27.99,
			total  : 50,
			teamID : this.props.team.id
		});
	};




	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { profile, team } = this.props;
		const { params } = this.props.match;
		const { teamSlug, projectSlug, componentsSlug } = params;
		const { typeGroups, typeGroup, playgrounds, playground, component, comment, cursor, accessibility } = this.state;

		return (<BasePage className={`page-wrapper playground-page-wrapper${(component && (window.location.href.includes('/comments'))) ? ' playground-page-wrapper-comments' : ''}`}>
			{(profile && playground) && (<PlaygroundNavPanel
				params={params}
				team={team}
				typeGroups={typeGroups}
				typeItems={playground.components}
				component={component}
				onTypeGroupClick={this.handleNavGroupItemClick}
				onTypeItemClick={this.handleNavTypeItemClick}
			/>)}

			{(profile && playground) && (<div className="playground-page-content-wrapper">
				{(!accessibility) ?
					(<PlaygroundContent
						typeGroup={typeGroup}
						playground={playground}
						component={component}
						comment={comment}
						cursor={cursor}
						onComponentClick={this.handleComponentClick}
						onMarkerClick={this.handleCommentMarkerClick}
						onMenuShow={this.handleComponentMenuShow}
						onMenuItem={this.handleCompomentMenuItem}
						onAddComment={this.handleAddComment}
						onDeleteComment={this.handleDeleteComment}
						onPopoverClose={this.handleComponentPopoverClose}
					/>) :
					(<PlaygroundAccessibilty
						typeGroups={typeGroups}
						playground={playground}
						component={component}
						comment={comment}
					/>)
				}

				<PlaygroundHeader
					playground={playground}
					component={component}
					projectSlug={projectSlug}
					componentsSlug={componentsSlug}
					onPopup={this.props.onPopup}
					onSettingsItem={this.handleSettingsItem}
					onLogout={this.props.onLogout}
				/>

				<PlaygroundFooter
					accessibility={accessibility}
					cursor={cursor}
					playground={playground}
					builds={playgrounds.length}
// 					onToggleAccessibility={this.handleStripeModal}
					onToggleAccessibility={this.handleToggleAccessibility}
					onToggleCursor={this.handleToggleCommentCursor}
					onToggleDesktop={this.handleTogglePlayground}
					onToggleMobile={this.handleTogglePlayground}
				/>
			</div>)}

			{(profile) && (<PlaygroundCommentsPanel
				comments={(component) ? component.comments : []}
				onDelete={this.handleDeleteComment}
			/>)}
		</BasePage>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile        : state.userProfile,
		componentTypes : state.componentTypes,
		eventGroups    : state.eventGroups,
		team           : state.teams[0]
	});
};


export default connect(mapStateToProps)(PlaygroundPage);
