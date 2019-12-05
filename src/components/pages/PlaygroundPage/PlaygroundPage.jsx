
import React, { Component } from 'react';
import './PlaygroundPage.css';

import axios from 'axios';
import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';

import BasePage from '../BasePage';
import PlaygroundAccessibility from './PlaygroundAccessibility';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import PlaygroundHeader from './PlaygroundHeader';
import { SettingsMenuItemTypes } from './PlaygroundHeader/UserSettings';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import { commentByID, componentByID, componentFromComment } from './utils/lookup';
import { reformComment, reformComponent } from './utils/reform';
import { Modals, API_ENDPT_URL } from '../../../consts/uris';
import { decryptObject, decryptText } from './utils/crypto';
import { setPlayground, setTypeGroup, setComponent, setComment } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';


class PlaygroundPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			typeGroups    : null,
			playgrounds   : [],
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
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { profile, componentTypes, playground, match } = this.props;
		const { fetching } = this.state;

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


		// playground first load
		if (!prevProps.playground && playground) {
			let typeGroup = null;
			let component = null;
			let comment = null;

			const isMember = playground.team.members.some(({ id })=> (id === profile.id));
			if (!isMember) {
				this.props.onModal(Modals.NO_ACCESS);
			}

			let url = window.location.pathname;
			if (teamSlug !== playground.team.title) {
				url = window.location.pathname.replace(teamSlug, playground.team.title);

			}

			if (projectSlug !== Strings.slugifyURI(playground.title)) {
				url = url.replace(projectSlug, Strings.slugifyURI(playground.title));
			}

			if (playgroundID << 0 !== playground.id) {
				url = url.replace(playgroundID, playground.id);
			}

			if (componentsSlug && componentTypes) {
				typeGroup = componentTypes.find(({ key })=> (key === componentsSlug));

				if (typeGroup) {
					typeGroup.expanded = true;
					typeGroup.selected = true;

					if (componentsSlug !== typeGroup.key) {
						url = url.replace(componentsSlug, typeGroup.key);
					}

					if (componentID) {
						component = componentByID(playground.components, componentID);

						if (component) {
							component.selected = true;
							if (componentID << 0 !== component.id) {
								url = url.replace(componentID, component.id);
							}

							if (commentID) {
								comment = commentByID(component.comments, commentID);

								if (comment) {
									comment.selected = true;
									if (commentID << 0 !== comment.id) {
										url = url.replace(commentID, comment.id);
									}

								} else {
									url = url.replace(new RegExp(`/comments.*$`), '/comments');
								}
							}

						} else {
							url = url.replace(new RegExp(`/${componentID}.*$`), '');
						}
					}

				} else {
// 					typeGroup = componentTypes.find(({ key })=> (key === 'views'));
// 					url = url.replace(new RegExp(`/${componentsSlug}.*$`, 'g'), '/views');
				}

// 				this.props.setTypeGroup(typeGroup);
// 				this.props.setComponent(component);
// 				this.props.setComment(comment);
//
// 				if (window.location.pathname !== url) {
// 					this.props.history.push(url);
// 				}

			} else {
				typeGroup = componentTypes.find(({ key })=> (key === 'views'));
				url = url.replace(new RegExp(`/${componentsSlug}.*$`, 'g'), '/views');
			}

			this.props.setTypeGroup(typeGroup);
			this.props.setComponent(component);
			this.props.setComment(comment);

			if (window.location.pathname !== url) {
				this.props.history.push(url);
			}

		}


		// switching out
// 		console.log('%s.componentDidUpdate()', this.constructor.name, playgroundID, playground, prevProps.playground);

		if (playground && prevProps.playground) {
			const { typeGroup, component, comment } = this.props;

			if (playgroundID << 0 !== playground.id) {
				this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}`);
			}

			if (typeGroup && typeGroup !== prevProps.typeGroup) {
				this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}`);
			}

			if (component && component !== prevProps.component) {
				this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}`);
			}

			if (comment && comment !== prevProps.comment) {
				this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}/comments/${comment.id}`);
			}

			if (component && !comment && prevProps.comment) {
				this.props.history.push(`/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}`);
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
			const comment = reformComment(response.data.comment);
			console.log('ADD_COMMENT', response.data, comment);

			const component = { ...this.props.component,
				comments : ((this.props.component.id === itemID) ? [ ...this.props.component.comments, comment] : this.props.component.comments).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0))
			};
			const playground = { ...this.props.playground,
				components : this.props.playground.components.map((item)=> ((item.id === itemID) ? component : item))
			};

			this.props.setPlayground(playground);
			this.props.setComponent(component);
			this.props.setComment(comment);

		}).catch((error)=> {
		});
	};

	handleCommentMarkerClick = ({ comment })=> {
// 		console.log('%s.handleCommentMarkerClick()', this.constructor.name, { comment });

		const { playground } = this.props;
		const component = componentFromComment(playground.components, comment);

		if (component) {
			this.props.setComponent(component);
			this.props.setComment(comment);
		}
	};

	handleComponentClick = ({ component })=> {
		console.log('%s.handleComponentClick()', this.constructor.name, { component });

		component.selected = true;
		this.props.setComponent(component);
		this.setState({ cursor : false });
	};

	handleComponentMenuShow = ({ componentID })=> {
// 		console.log('%s.handleComponentMenuShow()', this.constructor.name, { componentID });

		const { playground } = this.props;
		const component = playground.components.find(({ id })=> (id === componentID));

		if (component) {
			this.props.setComponent(component);
			this.props.setComment(null);
		}
	};

	handleComponentMenuItem = ({ type, itemID })=> {
// 		console.log('%s.handleComponentMenuItem()', this.constructor.name, { type, itemID });

		if (type === 'comments') {
			if (/\/comments.*$/.test(window.location.pathname)) {
				this.props.setComment(null);
				this.props.history.push(window.location.pathname.replace(/\/comments/, ''));

			} else {
				this.props.history.push(`${window.location.pathname}/comments`);
			}
		}
	};

	handleComponentPopoverClose = ()=> {
// 		console.log('%s.handleComponentPopoverClose()', this.constructor.name);
		this.props.setComment(null);
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

			const component = { ...this.props.component,
				comments : this.props.component.comments.filter(({ id }) => (id !== commentID)).sort((i, j)=> ((i.epoch > j.epoch) ? -1 : (i.epoch < j.epoch) ? 1 : 0))
			};
			const playground = { ...this.props.playground,
				components : this.props.playground.components.map((item)=> ((item.id === component.id) ? component : item))
			};

			this.props.setPlayground(playground);
			this.props.setComponent(component);
			this.props.setComment(null);

		}).catch((error)=> {
		});
	};

	handleNavGroupItemClick = (typeGroup)=> {
// 		console.log('%s.handleNavGroupItemClick()', this.constructor.name, typeGroup);

		typeGroup.expanded = !typeGroup.expanded;
		typeGroup.selected = !typeGroup.selected;

		this.props.setTypeGroup(typeGroup);
		this.props.setComponent(null);
		this.props.setComment(null);
	};

	handleNavTypeItemClick = (typeGroup, typeItem)=> {
// 		console.log('%s.handleNavTypeItemClick()', this.constructor.name, typeGroup, typeItem);

		this.props.setComponent(typeItem);
		this.props.setComment(null);
	};

	handleSettingsItem = (itemType)=> {
		console.log('%s.handleSettingsItem()', this.constructor.name, itemType);

		if (itemType === SettingsMenuItemTypes.DELETE_ACCT) {
			this.props.onModal(Modals.DISABLE);

		} else if (itemType === SettingsMenuItemTypes.PROFILE) {
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

		trackEvent('button', (this.props.playground.deviceID === 1) ? 'mobile-toggle' : 'desktop-toggle');
		const { playgrounds } = this.state;

		const playground = playgrounds.find(({ deviceID })=> (deviceID !== this.props.playground.deviceID));
		if (playground) {
			this.props.setPlayground(playground);
			this.props.setComponent(null);
			this.props.setComment(null);
		}
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

				const playgrounds = response.data.playgrounds.map((playground)=> {
					const { device_id, team } = playground;
					delete (playground['device_id']);


					return ({ ...playground,
						html       : decryptText(playground.html),
						styles     : decryptObject(playground.styles),
						deviceID   : device_id,
						team       : { ...team,
							members : team.members.map((member)=> ({ ...member,
								id : member.id << 0
							}))
						},
						components : playground.components.map((component)=> (reformComponent(component)))
					});
				});

				const playground = (playgroundID) ? playgrounds.find(({ id })=> (id === playgroundID)) : playgrounds.find(({ deviceID })=> (deviceID === 1));
				this.props.setPlayground(playground);

				this.setState({ playgrounds, playground,
					fetching : false

				}, ()=> {
					if (!this.props.match.params.playgroundID) {
// 						const { playground } = this.state;
						this.props.history.push(`${this.props.location.pathname}/${playground.id}`);
					}
				});

			}).catch((error)=> {
			});
		});
	};



	handleStripeModal = ()=> {
		console.log('%s.handleStripeModal()', this.constructor.name);

		const { team, products } = this.props;
		const product = [...products].pop();
		this.props.onModal(Modals.STRIPE, { team, product });
	};




	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { profile, playground, typeGroup, component } = this.props;
		const { params } = this.props.match;
		const { playgrounds, cursor, accessibility } = this.state;

		return (<BasePage className={`playground-page${(component && (window.location.href.includes('/comments'))) ? ' playground-page-comments' : ''}`}>
			{(profile && playground && typeGroup) && (<PlaygroundNavPanel
				params={params}
				onTypeGroupClick={this.handleNavGroupItemClick}
				onTypeItemClick={this.handleNavTypeItemClick}
			/>)}

			{(profile && playground && typeGroup) && (<div className="playground-page-content-wrapper">
				{(!accessibility) ?
					(<PlaygroundContent
						cursor={cursor}
						onComponentClick={this.handleComponentClick}
						onMarkerClick={this.handleCommentMarkerClick}
						onMenuShow={this.handleComponentMenuShow}
						onMenuItem={this.handleComponentMenuItem}
						onAddComment={this.handleAddComment}
						onDeleteComment={this.handleDeleteComment}
						onPopoverClose={this.handleComponentPopoverClose}
					/>) :
					(<PlaygroundAccessibility />)
				}

				<PlaygroundHeader
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


const mapDispatchToProps = (dispatch)=> {
	return ({
		setPlayground : (payload)=> dispatch(setPlayground(payload)),
		setTypeGroup  : (payload)=> dispatch(setTypeGroup(payload)),
		setComponent  : (payload)=> dispatch(setComponent(payload)),
		setComment    : (payload)=> dispatch(setComment(payload))
	});
};

const mapStateToProps = (state, ownProps)=> {
	return ({
		playground     : state.playground,
		typeGroup      : state.typeGroup,
		component      : state.component,
		comment        : state.comment,
		profile        : state.userProfile,
		componentTypes : state.componentTypes,
		eventGroups    : state.eventGroups,
		team           : state.teams[0],
		products       : state.products
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundPage);
