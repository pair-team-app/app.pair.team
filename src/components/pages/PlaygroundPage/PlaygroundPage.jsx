import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { fetchBuildPlaygrounds, setComment, setComponent, setPlayground, setTypeGroup } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import BasePage from '../BasePage';
import AccessibilityPopover from './AccessibilityPopover';
import DevicesPopover from './DevicesPopover';
import PlaygroundCommentsPanel from './PlaygroundCommentsPanel';
import PlaygroundContent from './PlaygroundContent';
import { COMPONENT_MENU_ITEM_COMMENTS, COMPONENT_MENU_ITEM_COPY } from './PlaygroundContent/ComponentMenu';
import PlaygroundFooter from './PlaygroundFooter';
import PlaygroundHeader, { BreadcrumbTypes } from './PlaygroundHeader';
import { SettingsMenuItemTypes } from './PlaygroundHeader/UserSettings';
import PlaygroundNavPanel from './PlaygroundNavPanel';
import './PlaygroundPage.css';
import { reformComment } from './utils/reform';

class PlaygroundPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      devices       : false,
      cursor        : false,
      accessibility : false,
      share         : false
    };
  }


  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  handleAddComment = ({ component=null, position={ x : 0, y : 0 }, content=null})=> {
    console.log('%s.handleAddComment()', this.constructor.name, { component, position, content });
    trackEvent('button', 'add-comment');

    const { profile } = this.props;
    axios.post(API_ENDPT_URL, {
      action  : 'ADD_COMMENT',
      payload : { content, position,
        user_id      : profile.id,
        component_id : component.id
      }
    }).then((response)=> {
      const comment = reformComment(response.data.comment);
      console.log('ADD_COMMENT', response.data, comment);

      component.comments = [...component.comments, comment].sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : ((i.type === 'bot') ? -1 : (ii.type === 'bot') ? 1 : 0)));
      const playground = { ...this.props.playground,
        components : this.props.playground.components.map((item)=> (item.id === component.id ? component : item))
      };

      this.props.setPlayground(playground);
      this.props.setComponent(component);
      this.props.setComment(comment);
    }).catch((error)=> {});
  };

  handleBreadCrumbClick = ({ type=null, payload=null })=> {
    console.log('%s.handleBreadCrumbClick()', this.constructor.name, { type, payload });

    if (type === BreadcrumbTypes.DEVICE) {
      const playground = payload;
      this.props.setPlayground(playground);

    } else if (type === BreadcrumbTypes.TYPE_GROUP) {
      const typeGroup = payload;
      this.props.setTypeGroup(typeGroup);
      
    } else if (type === BreadcrumbTypes.COMPONENT) {
      const component = payload;
      this.props.setComponent(component);

    } else if (type === BreadcrumbTypes.ACCESSIBILITY) {
    } else if (type === BreadcrumbTypes.COMMENTS) {
      this.props.setComment(null);
      
    } else if (type === BreadcrumbTypes.COMMENT) {
    }
  };

  handleCommentMarkerClick = ({ comment=null })=> {
    this.props.setComment(comment);
  };

  handleComponentClick = ({ component=null })=> {
    // console.log('%s.handleComponentClick()', this.constructor.name, { component });

    if (!this.props.component) {
      this.props.setComponent(component);
    }

    this.setState({ cursor : false });
  };

  handleComponentMenuShow = ({ component=null })=> {
    //.log('%s.handleComponentMenuShow()', this.constructor.name, { component });
    //     this.props.setComponent(component);
  };

  handleComponentMenuItem = ({ menuItem=null })=> {
    //.log('%s.handleComponentMenuItem()', this.constructor.name, { menuItem });

    if (menuItem === COMPONENT_MENU_ITEM_COMMENTS) {
      const { pathname } = this.props.location;
      if (/\/comments.*$/.test(pathname)) {

        setTimeout(()=> {
          this.props.history.push(pathname.replace(/\/comments.*$/, ''));
        }, ((/\/comments\/\d+$/.test(pathname))) * 200);

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
    this.props.setComment(null);
  };

  handleDeleteComment = (comment)=> {
    console.log('%s.handleDeleteComment()', this.constructor.name, comment.id);
    trackEvent('button', 'delete-comment');

    axios.post(API_ENDPT_URL, {
      action  : 'UPDATE_COMMENT',
      payload : {
        comment_id : comment.id,
        state      : 'deleted'
      } 
    }).then((response)=> {
			// console.log('UPDATE_COMMENT', response.data);

      const component = { ...this.props.component,
        comments : this.props.component.comments.filter(({ id })=> (id !== comment.id)).sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0))
      };

      this.props.setComponent(component);

      const { pathname } = this.props.location;
      if (!pathname.includes('/comments')) {
        this.props.history.push(`${pathname}/comments`);
      }
    }).catch((error)=> {});
  };

  handleDeviceClick = (device)=> {
    console.log('%s.handleDeviceClick()', this.constructor.name, { device });

    const { playgrounds, playground } = this.props;
    this.setState({ devices : false }, ()=> {
      this.props.setPlayground(playgrounds.find(({ buildID, deviceID })=> (buildID === playground.buildID && deviceID === device.id)) || null);
    });
  };

  handlePlaygroundClick = (playground)=> {
    console.log('%s.handlePlaygroundClick()', this.constructor.name, playground);
    this.props.setPlayground(playground);

    const { buildID } = playground;
    this.props.fetchBuildPlaygrounds({ buildID });
  };

  handleNavGroupItemClick = (typeGroup)=> {
    console.log('%s.handleNavGroupItemClick()', this.constructor.name, { typeGroup });

    // typeGroup.selected = !typeGroup.selected;
    this.props.setTypeGroup(typeGroup);
  };

  handleNavTypeItemClick = (typeGroup, typeItem)=> {
    //.log('%s.handleNavTypeItemClick()', this.constructor.name, typeGroup, typeItem);

    this.props.setComponent(typeItem);
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
    this.setState({ cursor : !cursor });
  };

  handleToggleDevices = ()=> {
    console.log('%s.handleToggleDevices()', this.constructor.name);

    const { devices } = this.state;
    this.setState({ 
      devices : !devices, 
      cursor  : false
    });
  };

  handleStripeModal = ()=> {
    //.log('%s.handleStripeModal()', this.constructor.name);
    this.props.onModal(Modals.STRIPE);
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, team, playgrounds, playground, component, comment } = this.props;
    const { cursor, accessibility, share, devices } = this.state;
    const { params = null } = this.props || { params : null };

    return (<BasePage { ...this.props } className="playground-page" data-component={(component !== null)} data-comments={component && window.location.href.includes('/comments')}>
      {(profile && team) && (<div>
        <PlaygroundNavPanel
          params={params}
          onPlaygroundClick={this.handlePlaygroundClick}
          onTypeGroupClick={this.handleNavGroupItemClick}
          onTypeItemClick={this.handleNavTypeItemClick} />

        <PlaygroundHeader
          popover={share}
          onBreadCrumbClick={this.handleBreadCrumbClick}
          onPopup={this.props.onPopup}
          onSharePopoverClose={()=> this.setState({ share : false })}
          onModal={this.props.onModal}
          onSettingsItem={this.handleSettingsItem}
          onLogout={this.props.onLogout} />
      </div>)}

      {(profile && playground) && (<div className="playground-page-content-wrapper">
        <PlaygroundContent
          cursor={cursor}
          onComponentClick={this.handleComponentClick}
          onMarkerClick={this.handleCommentMarkerClick}
          onMenuShow={this.handleComponentMenuShow}
          onMenuItem={this.handleComponentMenuItem}
          onAddComment={this.handleAddComment}
          onDeleteComment={this.handleDeleteComment}
          onPopoverClose={this.handleComponentPopoverClose} />

        <PlaygroundFooter
          accessibility={accessibility}
          cursor={cursor}
          playground={playground}
          component={component}
          devices={devices}
          onToggleAccessibility={this.handleToggleAccessibility}
          onToggleCursor={this.handleToggleCommentCursor}
          onToggleDevices={this.handleToggleDevices} />
            
        {(component && accessibility) && (<AccessibilityPopover onClose={this.handleToggleAccessibility} />)}
        {(devices) && (<DevicesPopover deviceIDs={((playgrounds && playground) ? playgrounds.filter(({ buildID })=> (buildID === playground.buildID)).map(({ deviceID })=> (deviceID)) : [])} onDeviceClick={this.handleDeviceClick} onClose={this.handleToggleDevices} />)}
      </div>)}
        
      {(profile && team && playground && component) && (<PlaygroundCommentsPanel comments={component.comments} commentID={(comment) ? comment.id : 0} onDelete={this.handleDeleteComment} />)}
    </BasePage>);
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    fetchBuildPlaygrounds : (payload)=> dispatch(fetchBuildPlaygrounds(payload)),
    setPlayground         : (payload)=> dispatch(setPlayground(payload)),
    setTypeGroup          : (payload)=> dispatch(setTypeGroup(payload)),
    setComponent          : (payload)=> dispatch(setComponent(payload)),
    setComment            : (payload)=> dispatch(setComment(payload))
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    playgrounds : state.playgrounds,
    playground  : state.playground,
    typeGroup   : state.typeGroup,
    component   : state.component,
    comment     : state.comment,
    profile     : state.userProfile,
    team        : state.team
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaygroundPage));
// export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundPage);
