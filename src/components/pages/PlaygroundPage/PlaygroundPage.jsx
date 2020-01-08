
import React, { Component } from 'react';
import './PlaygroundPage.css';

import axios from 'axios';
import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';

import BasePage from '../BasePage';
import PlaygroundAccessibility from './PlaygroundAccessibility';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import PlaygroundHeader, { BreadcrumbTypes } from './PlaygroundHeader';
import PlaygroundProcessingOverlay from './PlaygroundProcessingOverlay';
import { SettingsMenuItemTypes } from './PlaygroundHeader/UserSettings';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import {
  typeGroupByID,
  commentByID,
  componentByID,
  componentFromComment,
  playgroundByID,
  typeGroupByKey, componentsFromTypeGroup
} from './utils/lookup';
import { reformComment, reformComponent } from './utils/reform';
import { Modals, API_ENDPT_URL } from '../../../consts/uris';
import { fetchPlaygroundComponentGroup, setPlayground, setTypeGroup, setComponent, setComment } from '../../../redux/actions';
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
			share         : false,
			fetching      : false,
			processing    : false
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { profile, componentTypes, playground, match, location } = this.props;
		const { fetching, accessibility, processing } = this.state;

		const { pathname } = location;
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
					this.onFetchBuildPlaygrounds2(buildID, playgroundID << 0);
				}
			}
		}

		if (playground && this.props.typeGroup && fetching) {
      const components = componentsFromTypeGroup(playground.components, this.props.typeGroup).filter(({ image, root_styles, styles, html, rootStyles }) => (html && styles && rootStyles));

      if (componentsFromTypeGroup(playground.components, this.props.typeGroup).length === components.length) {
        this.setState({ fetching : false }, ()=> {
        });
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

			let url = pathname;

			if (teamSlug && teamSlug !== playground.team.title) {
				url = pathname.replace(teamSlug, playground.team.title);
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
				}

			} else {
				typeGroup = componentTypes.find(({ key })=> (key === 'views'));
				url = url.replace(new RegExp(`/${componentsSlug}.*$`, 'g'), '/views');
			}

      const components = componentsFromTypeGroup(playground.components, typeGroup);
      console.log('::COMP TEST::', { tgComponents  : components, processed : components.filter(({ html, styles, rootStyles })=> (html && styles && rootStyles )).length });

      this.props.setTypeGroup(typeGroup);
			this.onFetchTypeGroupComponents(typeGroup);


			if (component) {
				this.props.setComponent(component);

// 			} else {
// 				component = firstComponentViewType(playground.components);
//         this.props.setComponent(component)
			}

			if (comment) {
				this.props.setComment(comment);
			}

			if (pathname !== url) {
				this.props.history.push(url);
			}

			if (pathname.includes('/accessibility')) {
				this.setState({ accessibility : true });
			}

			// swapped out url
		} else if (playground && prevProps.playground) {
			const { typeGroup, component, comment } = this.props;
			let url = pathname;


//       console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, state : this.state, typeGroup, component, prevTypeGroup : prevProps.typeGroup, prevComponent : prevProps.component, curr : pathname, prev : prevProps.location.pathname });
//       console.log('%s.componentDidUpdate()', this.constructor.name, { curr : pathname, prev : prevProps.location.pathname, storePathname : this.props.pathname });

			const prev = prevProps.location.pathname;
			const curr = this.props.location.pathname;

      if (curr !== prev) {
        if (this.state.playgrounds.length > 0 && playgroundID && playgroundID !== prevProps.match.params.playgroundID) {
          this.props.setPlayground(playgroundByID(this.state.playgrounds, playgroundID << 0));

        } else if (!playgroundID) {
          this.props.setPlayground(null);
        }

        if (this.state.typeGroups && playgroundID && componentsSlug && componentsSlug !== prevProps.match.params.componentsSlug) {
          this.props.setTypeGroup(typeGroupByKey(this.state.typeGroups, componentsSlug));

        } else if (!componentsSlug) {
          this.props.setTypeGroup(null);
        }


        if (this.state.playgrounds.length > 0 && playgroundID && componentsSlug && componentID !== prevProps.match.params.componentID) {
          this.props.setComponent(componentByID(playgroundByID(this.state.playgrounds, playgroundID << 0).components, componentID << 0));

        } else if (!componentID) {
          this.props.setComponent(null);
        }

//         if (this.state.playgrounds.length > 0 && playgroundID && componentsSlug && componentID && curr.includes('/comments') && commentID && commentID !== prevProps.match.params.commentID) {
//         } else if (!curr.includes('/comments') || !commentID) {
//           this.props.setComment(null);
//
//         } else if (curr.includes('/comments')) {
//
//         }

				this.setState({ accessibility : curr.includes('/accessibility') });

      } else {
        if (playgroundID << 0 !== playground.id) {
          url = `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}`;
        }

        if (typeGroup && typeGroup !== prevProps.typeGroup) {
          url = `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}${(url.includes('/accessibility')) ? '/accessibility' : ''}`;
        }

        if (component && component !== prevProps.component) {
          url = `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}${(url.includes('/accessibility')) ? '/accessibility' : ''}${(url.endsWith('/comments')) ? '/comments' : ''}`;

        }

        if (comment && comment !== prevProps.comment) {
          url = (prevProps.comment) ? url.replace(prevProps.comment.id, comment.id) : `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}/${component.id}${(url.includes('/accessibility')) ? '/accessibility' : ''}/comments/${comment.id}`;
        }

        if (component && !comment && prevProps.comment) {
          url = (prevProps.history.location.pathname.includes('/comments/')) ? url.replace(/\/comments\/?.*$/, '') : url.replace(/(\/comments)\/?(.*)$/, '$1');
        }

        if (accessibility && !prevState.accessibility && !this.props.location.pathname.includes('/accessibility')) {
          url = `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}${(component) ? `/${component.id}` : ''}/accessibility`;
        }

        if (!accessibility && prevState.accessibility && this.props.location.pathname.includes('/accessibility')) {
          url = url.replace(/\/accessibility.*$/, '');
        }

        if (this.props.location.pathname !== url) {
          this.props.history.push(url);
        }
			}
		}

// 		if (processing && playground && this.props.typeGroup && componentsFromTypeGroup(playground.components, this.props.typeGroup).every(({ html, styles, rootStyles })=> (html && styles && rootStyles))) {
// 			this.setState({ processing : false });
// 		}
	}

	handleAddComment = ({ component, position, content })=> {
// 		console.log('%s.handleAddComment()', this.constructor.name, { component, position, content });
		trackEvent('button', 'add-comment');

		const { profile } = this.props;
		axios.post(API_ENDPT_URL, {
			action  : 'ADD_COMMENT',
			payload : { content, position,
				user_id      : profile.id,
				component_id : component.id
			}
		}).then((response) => {
			const comment = reformComment(response.data.comment);
			console.log('ADD_COMMENT', response.data, comment);

			component.comments = [ ...component.comments, comment].sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0));
			const playground = { ...this.props.playground,
				components : this.props.playground.components.map((item)=> ((item.id === component.id) ? component : item))
			};

			this.props.setPlayground(playground);
			this.props.setComponent(component);
			this.props.setComment(comment);

			this.setState({ cursor : false });

		}).catch((error)=> {
		});
	};

  handleBreadCrumbClick = ({ type, payload })=> {
    console.log('%s.handleBreadCrumbClick()', this.constructor.name, { type, payload });

    if (type === BreadcrumbTypes.PLAYGROUND) {
      this.props.setTypeGroup(typeGroupByID(this.state.typeGroups, 187));
      this.props.setComponent(null);
      this.props.setComment(null);

    } else if (type === BreadcrumbTypes.TYPE_GROUP) {
    	const { componentsSlug } = this.props.match.params;
      this.props.history.push(this.props.location.pathname.replace(new RegExp(`(/${componentsSlug}).*$`), '$1'));
      this.props.setComponent(null);
      this.props.setComment(null);

    } else if (type === BreadcrumbTypes.COMPONENT) {
      this.props.setComment(null);
      this.props.history.push(this.props.location.pathname.replace(/\/comments.*$/, ''));

    } else if (type === BreadcrumbTypes.ACCESSIBILITY) {
    } else if (type === BreadcrumbTypes.COMMENTS) {
      if (/\/comments\/.*$/.test(this.props.location.pathname)) {
        this.props.history.push(this.props.location.pathname.replace(/(\/comments)\/?(.*)$/, '$1'));
        this.props.setComment(null);
      }

		} else if (type === BreadcrumbTypes.COMMENT) {
      this.props.setComment(payload);
		}
	};

	handleCommentMarkerClick = ({ comment })=> {

		const { playground } = this.props;
		const component = componentFromComment(playground.components, comment);

 		console.log('%s.handleCommentMarkerClick()', this.constructor.name, { comment, components : playground.components, component });
		if (component) {
			this.props.setComponent(component);
			this.props.setComment(comment);
		}
	};

	handleComponentClick = ({ component })=> {
		console.log('%s.handleComponentClick()', this.constructor.name, { component });

		component.selected = true;
		this.props.setComponent(component);
// 		this.setState({ cursor : false });
	};

	handleComponentMenuShow = ({ component })=> {
		console.log('%s.handleComponentMenuShow()', this.constructor.name, { component });
//     this.props.setComponent(component);
	};

	handleComponentMenuItem = ({ type, component })=> {
 		console.log('%s.handleComponentMenuItem()', this.constructor.name, { type, component });

    this.props.setComponent(component);
		if (type === 'comments') {
			if (/\/comments.*$/.test(this.props.location.pathname)) {
				this.props.setComment(null);
				this.props.history.push(this.props.location.pathname.replace(/\/comments.*$/, ''));

			} else {
				this.props.history.push(`${this.props.location.pathname}/comments`);
			}

		} else if (type === 'share') {
			if (!this.state.share) {
				this.setState({ share : true });
			}
		}
	};

	handleComponentPopoverClose = ()=> {
		console.log('%s.handleComponentPopoverClose()', this.constructor.name);
		this.props.setComment(null);
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

			const component = { ...this.props.component,
				comments : this.props.component.comments.filter(({ id }) => (id !== commentID)).sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0))
			};

			const playground = { ...this.props.playground,
				components : this.props.playground.components.map((item)=> ((item.id === component.id) ? component : item))
			};

			this.props.setPlayground(playground);
			this.props.setComponent(component);
			this.props.setComment(null);
      this.props.history.push(`${this.props.location.pathname}/comments`);

		}).catch((error)=> {
		});
	};

	handleNavGroupItemClick = (typeGroup)=> {
		console.log('%s.handleNavGroupItemClick()', this.constructor.name, typeGroup);

		typeGroup.selected = !typeGroup.selected;

		this.onFetchTypeGroupComponents(typeGroup);
		this.props.setTypeGroup(typeGroup);
		this.props.setComponent(null);
		this.props.setComment(null);
	};

	handleNavTypeItemClick = (typeGroup, typeItem)=> {
		console.log('%s.handleNavTypeItemClick()', this.constructor.name, typeGroup, typeItem);

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

		const { comment } = this.props;
		setTimeout(()=> {
			const { accessibility } = this.state;
			this.setState({ accessibility : !accessibility });
		}, (((comment !== null) << 0) * 150));
	};

	handleToggleCommentCursor = (event)=> {
// 		console.log('%s.handleToggleCommentCursor()', this.constructor.name, event, this.state.cursor, !this.state.cursor);

		const { cursor } = this.state;
		this.setState({ cursor : !cursor });
	};

	handleTogglePlayground = ()=> {
		console.log('%s.handleTogglePlayground()', this.constructor.name, this.state.playground.deviceID);

		trackEvent('button', (this.props.playground.deviceID === 1) ? 'mobile-toggle' : 'desktop-toggle');
		const { playgrounds } = this.state;
		const playground = playgrounds.find(({ deviceID })=> (deviceID !== this.props.playground.deviceID));
		if (playground) {
			this.props.setPlayground(playground);
			this.props.setComponent(null);
			this.props.setComment(null);
		}
	};

	handleStripeModal = ()=> {
		console.log('%s.handleStripeModal()', this.constructor.name);

		const { team, products } = this.props;
		const product = [...products].pop();
		this.props.onModal(Modals.STRIPE, { team, product });
	};


  onFetchBuildPlaygrounds = (buildID, playgroundID=null)=> {
    console.log('%s.onFetchBuildPlaygrounds()', this.constructor.name, buildID, playgroundID);

    this.setState({ fetching : true }, ()=> {
      axios.post(API_ENDPT_URL, {
        action  : 'BUILD_PLAYGROUNDS',
        payload : {
          build_id : buildID,
        }
      }).then(async(response) => {
        console.log('BUILD_PLAYGROUNDS', response.data);

        const playgrounds = await Promise.all(response.data.playgrounds.map(async(playground)=> {
          const { device_id, team, components } = playground;
          delete (playground['device_id']);

          const { logo_url } = team;
          delete (team['logo_url']);

//					console.log('playground', { id : playground.id, device_id, components });
          return ({ ...playground,
            deviceID   : device_id,
            team       : { ...team,
              logoURL : logo_url,
              members : team.members.map((member)=> ({ ...member,
                id : member.id << 0
              }))
            },
            components : await Promise.all(components.map(async(component)=> (await reformComponent(component))))
          });
        }));

        const playground = ((playgroundID) ? playgrounds.find(({ id })=> (id === playgroundID)) : playgrounds.find(({ deviceID })=> (deviceID === 2)) || playgrounds[0]);
        this.props.setPlayground(playground);

        this.setState({ playgrounds, playground,
          fetching : false

        }, ()=> {
          if (!this.props.match.params.playgroundID) {
            this.props.history.push(`${this.props.location.pathname}/${playground.id}`);
          }
        });

      }).catch((error)=> {
      });
    });
  };


  onFetchTypeGroupComponents = (typeGroup)=> {

    const { playground } = this.props;
    console.log('%s.onFetchTypeGroupComponents()', this.constructor.name, { typeGroup, components : componentsFromTypeGroup(playground.components, typeGroup) });
    if (!componentsFromTypeGroup(playground.components, typeGroup).every(({ html, styles, rootStyles })=> (html && styles && rootStyles))) {
      this.setState({ processing : true }, ()=> {
        this.props.fetchPlaygroundComponentGroup({ playground, typeGroup });
			});
		}
	};

  onFetchBuildPlaygrounds2 = (buildID, playgroundID=null)=> {
    console.log('%s.onFetchBuildPlaygrounds2()', this.constructor.name, buildID, playgroundID);

    this.setState({
			fetching   : true,
			processing : true
		}, ()=> {
      axios.post(API_ENDPT_URL, {
        action  : 'BUILD_PLAYGROUNDS',
        payload : {
          build_id : buildID
        }
      }).then(async(response) => {
        console.log('BUILD_PLAYGROUNDS', response.data);

        const playgrounds = await Promise.all(response.data.playgrounds.map(async(playground)=> {
          const { device_id, team, components } = playground;
          delete (playground['device_id']);

          const { logo_url } = team;
          delete (team['logo_url']);

//					console.log('playground', { id : playground.id, device_id, components });
          return ({ ...playground,
            deviceID   : device_id,
            team       : { ...team,
              logoURL : logo_url,
              members : team.members.map((member)=> ({ ...member,
                id : member.id << 0
              }))
            },
            components : await Promise.all(components.map(async(component)=> (await reformComponent(component))))
          });
        }));

        const playground = ((playgroundID) ? playgrounds.find(({ id })=> (id === playgroundID)) : playgrounds.find(({ deviceID })=> (deviceID === 2)) || playgrounds[0]);
        this.props.setPlayground(playground);

        this.setState({ playgrounds, playground,
          fetching : false

        }, ()=> {
          if (!this.props.match.params.playgroundID) {
            this.props.history.push(`${this.props.location.pathname}/${playground.id}`);
          }
        });

      }).catch((error)=> {
      });
    });
  };




  render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { profile, playground, typeGroup, component } = this.props;
		const { playgrounds, cursor, accessibility, share, processing } = this.state;
		const { params } = this.props.match;

		return (<BasePage className={`playground-page${(component && (window.location.href.includes('/comments'))) ? ' playground-page-comments' : ''}`}>
			{(processing) && (<PlaygroundProcessingOverlay onComplete={()=> this.setState({ processing : false })} />)}
			{/*<PlaygroundProcessingOverlay outro={!processing} />*/}
			{/*<PlaygroundProcessingOverlay outro={false} />*/}

			{(profile && playground && typeGroup) && (<PlaygroundNavPanel
				params={params}
				onTypeGroupClick={this.handleNavGroupItemClick}
				onTypeItemClick={this.handleNavTypeItemClick}
			/>)}

			{(profile && playground && typeGroup) && (<div className={`playground-page-content-wrapper ${(typeGroup.id === 187 && !component) ? ' playground-page-content-wrapper-views' : ''}`}>
				{(!accessibility)
					? (<PlaygroundContent
							cursor={cursor}
							onComponentClick={this.handleComponentClick}
							onMarkerClick={this.handleCommentMarkerClick}
							onMenuShow={this.handleComponentMenuShow}
							onMenuItem={this.handleComponentMenuItem}
							onAddComment={this.handleAddComment}
							onDeleteComment={this.handleDeleteComment}
							onPopoverClose={this.handleComponentPopoverClose}
						/>)
					: (<PlaygroundAccessibility />)
				}

				<PlaygroundHeader
          accessibility={accessibility}
					popover={share}
          onBreadCrumbClick={this.handleBreadCrumbClick}
					onPopup={this.props.onPopup}
					onSharePopoverClose={()=> this.setState({ share : false })}
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
    fetchPlaygroundComponentGroup : (payload)=> dispatch(fetchPlaygroundComponentGroup(payload)),
		setPlayground                 : (payload)=> dispatch(setPlayground(payload)),
		setTypeGroup                  : (payload)=> dispatch(setTypeGroup(payload)),
		setComponent                  : (payload)=> dispatch(setComponent(payload)),
		setComment                    : (payload)=> dispatch(setComment(payload))
	});
};

const mapStateToProps = (state, ownProps)=> {
	console.log('PlaygroundPage().mapDispatchToProps()',{ ownProps });
	return ({
		playground     : state.playground,
		typeGroup      : state.typeGroup,
		component      : state.component,
		comment        : state.comment,
		profile        : state.userProfile,
		componentTypes : state.componentTypes,
		eventGroups    : state.eventGroups,
		team           : state.teams[0],
		products       : state.products,
		pathname       : state.pathname
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundPage);
