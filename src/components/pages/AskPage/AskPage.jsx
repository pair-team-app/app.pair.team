import axios from 'axios';
import { Strings } from 'lang-js-utils';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ENTER_KEY } from '../../../consts/key-codes';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { setComment } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import BasePage from '../BasePage';
import './AskPage.css';
import AskPageHeader from './AskPageHeader';
import PlaygroundCommentsPanel from '../PlaygroundPage/PlaygroundCommentsPanel';
import { SettingsMenuItemTypes } from '../PlaygroundPage/PlaygroundHeader/UserSettings';
import PlaygroundNavPanel from '../PlaygroundPage/PlaygroundNavPanel';
import { reformComment } from '../PlaygroundPage/utils/reform';

class AskPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comments       : [], 
      commentContent : '',
      fetching       : false,
      share          : false
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

    const { profile, params, pathname } = this.props;
    const { fetching } = this.state;
    
    const { teamSlug, commentID } = params || {};    
  }

  handleAddComment = (event)=> {
    console.log('%s.handleAddComment()', this.constructor.name, { event });
    trackEvent('button', 'add-comment');

    event.preventDefault();``
    event.stopPropagation();

    const { profile, team } = this.props;
    const { commentContent } = this.state; 

    axios.post(API_ENDPT_URL, {
      action  : 'ADD_COMMENT',
      payload : { 
        position : null,
        user_id  : profile.id,
        team_id  : team.id,
        content  : commentContent 
      }
    }).then((response)=> {
      const comment = reformComment(response.data.comment);
      console.log('ADD_COMMENT', response.data, comment);

      this.props.setComment(comment);
    }).catch((error)=> {});
  };


  handleDeleteComment = (comment)=> {
    //.log('%s.handleDeleteComment()', this.constructor.name, comment.id);
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

  handleKeyDown = (event)=> {
    console.log('%s.handleKeyDown()', this.constructor.name, event);

    const { commentContent } = this.state;
    if (event.keyCode === ENTER_KEY && commentContent.length > 0) {
      this.handleAddComment(event);
    }
  }

  handleSettingsItem = (itemType)=> {
    //console.log('%s.handleSettingsItem()', this.constructor.name, itemType);

    if (itemType === SettingsMenuItemTypes.DELETE_ACCT) {
      this.props.onModal(Modals.DISABLE);
    } else if (itemType === SettingsMenuItemTypes.PROFILE) {
      this.props.onModal(Modals.PROFILE);
    }
  };

  handleStripeModal = ()=> {
    //.log('%s.handleStripeModal()', this.constructor.name);

    const { team, products } = this.props;
    const product = [...products].pop();
    this.props.onModal(Modals.STRIPE, { team, product });
  };

  handleTextChange = (event)=> {
      console.log('%s.handleTextChange()', this.constructor.name, event);

    const commentContent = event.target.value;
    this.setState({ commentContent });
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
    // 		console.log('%s.render()', this.constructor.name, { fetching : this.state.fetching, processing : this.state.processing });

    const { profile, team, comment } = this.props;
    const { comments, commentContent, fetching, share } = this.state;
    const { params = null } = this.props || { params : null };


    return (<BasePage { ...this.props } className="ask-page">
      {profile && team && (
        <>
          <PlaygroundNavPanel
            params={params}
            onPlaygroundClick={this.handlePlaygroundClick}
            onTypeGroupClick={this.handleNavGroupItemClick}
            onTypeItemClick={this.handleNavTypeItemClick}
          />
          <AskPageHeader 
            sort="DATE" popover={share} 
            onSortClick={this.handleSortClick} 
            onPopup={this.props.onPopup} 
            onSharePopoverClose={()=> this.setState({ share:  false })} 
            onSettingsItem={this.handleSettingsItem} 
            onLogout={this.props.onLogout} 
          />

          <div className="ask-page-content-wrapper" data-loading={fetching}>
            <AskPageContentHeader 
              loading={fetching} 
              commentContent={commentContent} 
              onTextChange={this.handleTextChange} 
              onSubmit={this.handleAddComment}
            />
          </div>
        </>
      )}
    </BasePage>);
  }
}

const AskPageContentHeader = (props)=> {
  console.log('AskPageContentHeader()', props);

  const { loading, commentContent } = props;
  return (<div className="ask-page-content-header">
    <form>
      <input type="text" placeholder="Ask your team anything…" onChange={props.onTextChange} />
      <button type="submit" disabled={commentContent.length === 0} onClick={props.onSubmit}>Submit</button>
    </form>
  </div>);
};



const mapDispatchToProps = (dispatch)=> {
  return {
    setComment  : (payload)=> dispatch(setComment(payload))
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    comment  : state.comment,
    profile  : state.userProfile,
    team     : state.team,
    products : state.products,
    pathname : state.pathname
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AskPage));
