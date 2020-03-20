import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { fetchBuildPlaygrounds, fetchPlaygroundComponentGroup, setComment, setComponent, setPlayground, setTypeGroup } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import BasePage from '../BasePage';
import AccessibilityPopover from './AccessibilityPopover';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import { COMPONENT_MENU_ITEM_COMMENTS, COMPONENT_MENU_ITEM_COPY } from './PlaygroundContent/ComponentMenu';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundHeader, { BreadcrumbTypes } from './PlaygroundHeader';
import { SettingsMenuItemTypes } from './PlaygroundHeader/UserSettings';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import './PlaygroundPage.css';
import { componentFromComment } from './utils/lookup';
import { reformComment } from './utils/reform';

class PlaygroundPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      typeGroups: null,
      cursor: false,
      accessibility: false,
      share: false,
      fetching: false,
      processing: false
    };
  }


  componentWillMount() {
    console.log('%s.componentWillMount()', this.constructor.name, { props : this.props, state : this.state });
  }

  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    // const { buildID = null, playgroundID = null } = params || {};
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });


    const {
      profile,
      componentTypes,
      playgrounds,
      playground,
      params,
      pathname
    } = this.props;
    const { fetching, accessibility } = this.state;
    
    const {
      teamSlug,
      projectSlug,
      buildID,
      deviceSlug,
      typeGroupSlug,
      componentID,
      commentID
    } = params || {};

    let url = pathname;
       		
/*
  
    // playground first load
    if (!prevProps.playground && playground) {
      let url = pathname;

      let typeGroup = null;
      let component = null;
      let comment = null;

      if (teamSlug && teamSlug !== playground.team.title) {
        url = pathname.replace(teamSlug, playground.team.title);
      }

      if (projectSlug !== Strings.slugifyURI(playground.title)) {
        url = url.replace(projectSlug, Strings.slugifyURI(playground.title));
      }

      if (playgroundID << 0 !== playground.id) {
        url = url.replace(playgroundID, playground.id);
      }

      if (typeGroupSlug && componentTypes) {
        typeGroup = componentTypes.find(({ key })=> key === typeGroupSlug);

        if (typeGroup) {
          typeGroup.selected = true;

          if (typeGroupSlug !== typeGroup.key) {
            url = url.replace(typeGroupSlug, typeGroup.key);
          }

          if (componentID) {
            component = componentByID(playground.components, componentID);

            if (component) {
              component.selected = true;
              if (componentID << 0 !== component.id) {
                url = url.replace(componentID, component.id);
              }

              //              console.log('=-=-=-=-=-=--=', { commentID, comment : commentByID(component.comments, commentID) });
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
              //              console.log('=-=-=-=-=-=--2=', { commentID, comment : commentByID(component.comments, commentID) });
              url = url.replace(new RegExp(`/${componentID}.*$`), '');
            }
          }
        }
      } else {
        typeGroup = componentTypes.find(({ key })=> key === 'views');
        url = url.replace(new RegExp(`/${typeGroupSlug}.*$`, 'g'), '/views');
      }

      // this.props.setTypeGroup(typeGroup);
      this.onFetchTypeGroupComponents(typeGroup);

      if (component) {
        this.props.setComponent(component);
      }

      if (comment) {
        this.props.setComment(comment);
      }

      if (pathname !== url) {
        this.props.history.push(url);
      }

      if (pathname.includes('/accessibility')) {
        this.setState({ accessibility: true });
      }

      // swapped out url
    } else if (playground && prevProps.playground) {
      const { typeGroup, component, comment } = this.props;
      let url = pathname;

      //      //    console.log('%s.componentDidUpdate()', this.constructor.name, { playgroundID : this.props.playground.id, prev : prevProps.playground.id, fetching, processing });
      if (playground.id !== prevProps.playground.id && !fetching) {
        this.onFetchTypeGroupComponents(typeGroup);
      }

      //       console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, state : this.state, typeGroup, component, prevTypeGroup : prevProps.typeGroup, prevComponent : prevProps.component, curr : pathname, prev : prevProps.pathname });
      //       console.log('%s.componentDidUpdate()', this.constructor.name, { curr : pathname, prev : prevProps.pathname, storePathname : this.props.pathname });

      const prev = prevProps.pathname;
      const curr = this.props.pathname;

      if (curr !== prev) {
        if (
          playgrounds.length > 0 &&
          playgroundID &&
          playgroundID !== prevProps.params.playgroundID
        ) {
          this.props.setPlayground(
            playgroundByID(playgrounds, playgroundID << 0)
          );
        } else if (!playgroundID) {
          this.props.setPlayground(null);
        }

        // if (
        //   this.state.typeGroups &&
        //   playgroundID &&
        //   typeGroupSlug &&
        //   typeGroupSlug !== prevProps.params.typeGroupSlug
        // ) {
        //   this.props.setTypeGroup(
        //     typeGroupByKey(this.state.typeGroups, typeGroupSlug)
        //   );
        // } else if (!typeGroupSlug) {
        //   this.props.setTypeGroup(null);
        // }

        if (
          playgrounds.length > 0 &&
          playgroundID &&
          typeGroupSlug &&
          componentID !== prevProps.params.componentID
        ) {
          this.props.setComponent(
            componentByID(
              playgroundByID(playgrounds, playgroundID << 0).components,
              componentID << 0
            )
          );
        } else if (!componentID) {
          this.props.setComponent(null);
        }

        // console.log('_-_--------', { commentID, comment });
        // if (!commentID && comment) {
        //   this.props.setComment(null);
        // }

        this.setState({ accessibility: curr.includes('/accessibility') });
      } else {
        if (playgroundID << 0 !== playground.id) {
          url = `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${typeGroup.key}`;
        }

        if (typeGroup && typeGroup !== prevProps.typeGroup && !comment) {
          if (!/\/accessibility\/.*$/.test(url)) {
            this.props.pathname.replace(/(\/comments)$/, '');
          }

          url = `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${
            typeGroup.key
          }${url.includes('/accessibility') ? '/accessibility' : ''}`;
        }

        if (component && component !== prevProps.component && !comment) {
          url = `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${
            typeGroup.key
          }/${component.id}${
            url.includes('/accessibility') ? '/accessibility' : ''
          }`;

          url = url.replace(/\/comments.*$/, '');
        }

        if (comment && comment !== prevProps.comment) {
          url = prevProps.comment
            ? url.replace(prevProps.comment.id, comment.id)
            : `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${
                typeGroup.key
              }/${component.id}${
                url.includes('/accessibility') ? '/accessibility' : ''
              }/comments/${comment.id}`;
        }

        if (
          component &&
          !comment &&
          prevProps.comment &&
          !commentID &&
          prevProps.commentID
        ) {
          url = prevProps.history.pathname.includes('/comments/')
            ? url.replace(/\/comments\/?.*$/, '')
            : url.replace(/(\/comments)\/?(.*)$/, '$1');
        }

        if (
          accessibility &&
          !prevState.accessibility &&
          !this.props.pathname.includes('/accessibility')
        ) {
          url = `/app/${teamSlug}/${projectSlug}/${buildID}/${playground.id}/${
            typeGroup.key
          }${component ? `/${component.id}` : ''}/accessibility`;
        }

        if (
          !accessibility &&
          prevState.accessibility &&
          this.props.pathname.includes('/accessibility')
        ) {
          url = url.replace(/\/accessibility.*$/, '');
        }

        if (this.props.pathname !== url) {
          this.props.history.push(url);
        }
      }
    }*/
  }

  handleAddComment = ({
    component = null,
    position = { x: 0, y: 0 },
    content = null
  })=> {
    // 		console.log('%s.handleAddComment()', this.constructor.name, { component, position, content });
    trackEvent('button', 'add-comment');

    const { profile } = this.props;
    axios
      .post(API_ENDPT_URL, {
        action: 'ADD_COMMENT',
        payload: {
          content,
          position,
          user_id: profile.id,
          component_id: component.id
        }
      })
      .then((response)=> {
        const comment = reformComment(response.data.comment);
        // 			console.log('ADD_COMMENT', response.data, comment);

        component.comments = [...component.comments, comment].sort((i, ii)=>
          i.epoch > ii.epoch ? -1 : i.epoch < ii.epoch ? 1 : 0
        );
        const playground = {
          ...this.props.playground,
          components: this.props.playground.components.map((item)=>
            item.id === component.id ? component : item
          )
        };

        this.props.setPlayground(playground);
        // this.props.setComponent(component);
        // this.props.setComment(comment);

        this.setState({ cursor: false });
      })
      .catch((error)=> {});
  };

  handleBreadCrumbClick = ({ type = null, payload = null })=> {
    //     console.log('%s.handleBreadCrumbClick()', this.constructor.name, { type, payload });

    if (type === BreadcrumbTypes.PLAYGROUND) {
      // this.props.setTypeGroup(typeGroupByID(this.state.typeGroups, 187));
      // this.props.setComponent(null);
      // this.props.setComment(null);

    } else if (type === BreadcrumbTypes.TYPE_GROUP) {
      const typeGroup = payload;
      this.props.setTypeGroup(typeGroup);
      
    } else if (type === BreadcrumbTypes.COMPONENT) {
      const component = payload;
      this.props.setComponent(component);

    } else if (type === BreadcrumbTypes.ACCESSIBILITY) {
    } else if (type === BreadcrumbTypes.COMMENTS) {
      const { pathname } = this.props.location;

      if (/\/comments\/.*$/.test(pathname)) {
        this.props.history.push(pathname.replace(/(\/comments)\/?(.*)$/, '$1'));
        this.props.setComment(null);
      }

    } else if (type === BreadcrumbTypes.COMMENT) {
      this.props.setComment(payload);
    }
  };

  handleCommentMarkerClick = ({ comment = null })=> {
    const { playground } = this.props;
    const component = componentFromComment(playground.components, comment);
    //
    // console.log('%s.handleCommentMarkerClick()', this.constructor.name, {
      // comment,
      // components: playground.components,
      // component
    // });
    if (component && component !== this.props.component) {
      this.props.setComponent(component);
    }
    this.props.setComment(comment);
  };

  handleComponentClick = ({ component = null })=> {
    // console.log('%s.handleComponentClick()', this.constructor.name, { component });

    if (!component.selected) {
      component.selected = true;
      this.props.setComponent(component);
      this.setState({ cursor: false });
    }
  };

  handleComponentMenuShow = ({ component = null })=> {
    //.log('%s.handleComponentMenuShow()', this.constructor.name, { component });
    //     this.props.setComponent(component);
  };

  handleComponentMenuItem = ({ menuItem = null })=> {
    //.log('%s.handleComponentMenuItem()', this.constructor.name, { menuItem });

    //     this.props.setComponent(component);

    if (menuItem === COMPONENT_MENU_ITEM_COMMENTS) {
      const { pathname } = this.props.location;
      if (/\/comments.*$/.test(pathname)) {
        this.props.setComment(null);
        this.props.history.push(pathname.replace(/\/comments.*$/, ''));

      } else {
        this.props.history.push(`${pathname}/comments`);
      }
    } else if (menuItem === COMPONENT_MENU_ITEM_COPY) {
      if (!this.state.share) {
        this.setState({ share: true });
      }
    }
  };

  handleComponentPopoverClose = ()=> {
    console.log('%s.handleComponentPopoverClose()', this.constructor.name);

    const pushURL = /\/comments\/.*$/.test(this.props.pathname)
      ? this.props.pathname.replace(/\/comments\/.*$/, '/comments')
      : null;

    console.log('%s.handleComponentPopoverClose()', this.constructor.name, {
      pathname: this.props.pathname,
      hasComments: /\/comments.*$/.test(this.props.pathname),
      pushURL
    });

    if (pushURL) {
      this.props.history.push(pushURL);
    }
  };

  handleDeleteComment = (comment)=> {
    console.log('%s.handleDeleteComment()', this.constructor.name, comment.id);
    trackEvent('button', 'delete-comment');

    axios
      .post(API_ENDPT_URL, {
        action: 'UPDATE_COMMENT',
        payload: {
          comment_id: comment.id,
          state: 'deleted'
        }
      })
      .then((response)=> {
        // 			console.log('UPDATE_COMMENT', response.data);

        const component = {
          ...this.props.component,
          comments: this.props.component.comments
            .filter(({ id })=> id !== comment.id)
            .sort((i, ii)=>
              i.epoch > ii.epoch ? -1 : i.epoch < ii.epoch ? 1 : 0
            )
        };

        this.props.setComponent(component);
        if (!this.props.pathname.includes('/comments')) {
          this.props.history.push(`${this.props.pathname}/comments`);
        }
      })
      .catch((error)=> {});
  };

  handlePlaygroundClick = (playground)=> {
    console.log('%s.handlePlaygroundClick()', this.constructor.name, playground);

    const { team } = this.props;

    playground.selected = !playground.selected;

    // if (playground.selected) {
      // this.props.history.push(`/app/${team.title}/${Strings.slugifyURI(playground.title)}/${playground.buildID}/desktop-macos`);
      // this.props.fetchPlaygroundComponentGroup({ playground, typeGroup : { id : 187 } })
    
    // } else {
      // this.props.history.push(`/app/${team.title}`);
    // }
    
    this.props.setPlayground(playground);
    // this.props.setComponent(null);
    // this.props.setComment(null);
  };

  handleNavGroupItemClick = (typeGroup)=> {
    console.log('%s.handleNavGroupItemClick()', this.constructor.name, { typeGroup });

    typeGroup.selected = !typeGroup.selected;

    // this.onFetchTypeGroupComponents(typeGroup);
    // this.props.fetchPlaygroundComponentGroup(typeGroup);
    this.props.setTypeGroup(typeGroup);
    // this.props.setComponent(null);
    // this.props.setComment(null);
  };

  handleNavTypeItemClick = (typeGroup, typeItem)=> {
    //.log('%s.handleNavTypeItemClick()', this.constructor.name, typeGroup, typeItem);

    this.props.setComponent(typeItem);
    // this.props.setComment(null);
  };

  handleSettingsItem = (itemType)=> {
    //.log('%s.handleSettingsItem()', this.constructor.name, itemType);

    if (itemType === SettingsMenuItemTypes.DELETE_ACCT) {
      this.props.onModal(Modals.DISABLE);
      
    } else if (itemType === SettingsMenuItemTypes.PROFILE) {
      this.props.onModal(Modals.PROFILE);
    }
  };

  handleToggleAccessibility = ()=> {
    //.log('%s.handleToggleAccessibility()', this.constructor.name, this.state.accessibility);

    const { accessibility } = this.state;

    this.setState({
      accessibility : !accessibility,
      cursor        : false
    });
  };

  handleToggleCommentCursor = (event)=> {
    //.log('%s.handleToggleCommentCursor()', this.constructor.name, event, this.state.cursor, !this.state.cursor);

    const { cursor } = this.state;
    this.setState({ cursor: !cursor });
  };

  handleTogglePlayground = ()=> {
    //.log('%s.handleTogglePlayground()', this.constructor.name, this.props.playground.deviceID);

    trackEvent(
      'button',
      this.props.playground.deviceID === 1 ? 'mobile-toggle' : 'desktop-toggle'
    );

    const { playgrounds } = this.props;
    const playground = playgrounds.find(
      ({ deviceID })=> deviceID !== this.props.playground.deviceID
    );
    if (playground) {
      this.props.setPlayground(playground);
      // this.props.setComponent(null);
      // this.props.setComment(null);

      this.setState({ cursor: false });
    }
  };

  handleStripeModal = ()=> {
    //.log('%s.handleStripeModal()', this.constructor.name);

    const { team, products } = this.props;
    const product = [...products].pop();
    this.props.onModal(Modals.STRIPE, { team, product });
  };

  onFetchTypeGroupComponents = (typeGroup)=> {
    // const { playground } = this.props;
    // //  console.log('%s.onFetchTypeGroupComponents()', this.constructor.name, { typeGroup, components : componentsFromTypeGroup(playground.components, typeGroup) });
    // if (!typeGroupComponentsProcessed(typeGroup, playground.components)) {
    //   this.setState({ processing: true }, ()=> {
    //     this.props.fetchPlaygroundComponentGroup({ playground, typeGroup });
    //   });
    // }
  };

  onFetchBuildPlaygrounds = (buildID, playgroundID = null)=> {
    //  console.log('%s.onFetchBuildPlaygrounds()', this.constructor.name, buildID, playgroundID);

    this.setState(
      {
        fetching: true
      },
      ()=> {
        // this.props.fetchBuildPlaygrounds({ buildID, playgroundID });
      }
    );
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
    // 		console.log('%s.render()', this.constructor.name, { fetching : this.state.fetching, processing : this.state.processing });

    const {
      profile,
      team,
      playgrounds,
      playground,
      typeGroup,
      component
    } = this.props;
    const { cursor, accessibility, share, fetching } = this.state;
    const { params = null } = this.props || { params : null };


    return (
      <BasePage { ...this.props } className="playground-page" data-comments={component && window.location.href.includes('/comments')}>
        {profile && team && (
          <div>
            <PlaygroundNavPanel
              params={params}
              onPlaygroundClick={this.handlePlaygroundClick}
              onTypeGroupClick={this.handleNavGroupItemClick}
              onTypeItemClick={this.handleNavTypeItemClick}
            />
            <PlaygroundHeader
              accessibility={accessibility}
              popover={share}
              onBreadCrumbClick={this.handleBreadCrumbClick}
              onPopup={this.props.onPopup}
              onSharePopoverClose={()=> this.setState({ share: false })}
              onSettingsItem={this.handleSettingsItem}
              onLogout={this.props.onLogout}
            />
          </div>
        )}
        {profile && playground && (
          <div
            className="playground-page-content-wrapper"
            data-component={component !== null}
            data-processed={component && component.processed}
          >
            <PlaygroundContent
              cursor={cursor}
              onComponentClick={this.handleComponentClick}
              onMarkerClick={this.handleCommentMarkerClick}
              onMenuShow={this.handleComponentMenuShow}
              onMenuItem={this.handleComponentMenuItem}
              onAddComment={this.handleAddComment}
              onDeleteComment={this.handleDeleteComment}
              onPopoverClose={this.handleComponentPopoverClose}
            />

            {/* {typeGroup && component && ( */}
              <PlaygroundFooter
                accessibility={accessibility}
                cursor={cursor}
                playground={playground}
                component={component}
                builds={playgrounds.length}
                // 					onToggleAccessibility={this.handleStripeModal}
                onToggleAccessibility={this.handleToggleAccessibility}
                onToggleCursor={this.handleToggleCommentCursor}
                onToggleDesktop={this.handleTogglePlayground}
                onToggleMobile={this.handleTogglePlayground}
              />
            {/* )} */}

            {(accessibility) && (<AccessibilityPopover onClose={this.handleToggleAccessibility} />)}
          </div>
        )}
        
        {profile && team && playground && component && (
          <PlaygroundCommentsPanel
            comments={component.comments}
            onDelete={this.handleDeleteComment}
          />
        )}
      </BasePage>
    );
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    fetchBuildPlaygrounds         : (payload)=> dispatch(fetchBuildPlaygrounds(payload)),
    fetchPlaygroundComponentGroup : (payload)=> dispatch(fetchPlaygroundComponentGroup(payload)),
    setPlayground                 : (payload)=> dispatch(setPlayground(payload)),
    setTypeGroup                  : (payload)=> dispatch(setTypeGroup(payload)),
    setComponent                  : (payload)=> dispatch(setComponent(payload)),
    setComment                    : (payload)=> dispatch(setComment(payload))
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    playgrounds    : state.playgrounds,
    playground     : state.playground,
    typeGroup      : state.typeGroup,
    component      : state.component,
    comment        : state.comment,
    profile        : state.userProfile,
    componentTypes : state.componentTypes,
    eventGroups    : state.eventGroups,
    team           : state.team,
    products       : state.products,
    pathname       : state.pathname
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaygroundPage));
// export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundPage);
