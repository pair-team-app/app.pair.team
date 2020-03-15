import axios from 'axios';
import { Strings } from 'lang-js-utils';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ENTER_KEY } from '../../../consts/key-codes';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { fetchTeamComments, setComment } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import BasePage from '../BasePage';
import './AskPage.css';
import AskPageHeader, { SORT_BY_DATE, SORT_BY_SCORE } from './AskPageHeader';
import AskPageCommentsPanel, { VOTE_ACTION_UP, VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT } from './AskPageCommentsPanel';
import { SettingsMenuItemTypes } from '../PlaygroundPage/PlaygroundHeader/UserSettings';
import PlaygroundNavPanel from '../PlaygroundPage/PlaygroundNavPanel';
import { reformComment } from '../PlaygroundPage/utils/reform';

class AskPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      commentContent : '',
      fetching       : false,
      share          : false,
      sort           : SORT_BY_SCORE
    };
  }


  componentWillMount() {
    console.log('%s.componentWillMount()', this.constructor.name, { props : this.props, state : this.state });

    this.setState({ fetching : true });
  }

  // componentDidMount() {
  //   console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  // }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { profile, team, params, pathname } = this.props;
    const { fetching } = this.state;
    
    const { teamSlug, commentID } = params || {};

    if (team) {
      if (fetching && team.comments.filter(({ content })=> (content !== '¡!¡')).length === team.comments.length) {
        this.setState({ fetching : false });
      }
    }
  }

  handleAddComment = (event)=> {
    console.log('%s.handleAddComment()', this.constructor.name, { event });
    trackEvent('button', 'add-comment');

    event.preventDefault();
    event.stopPropagation();

    const { profile, team } = this.props;
    const { commentContent } = this.state;

    this.setState({ fetching : true }, ()=> {
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
        this.props.fetchTeamComments({ team });
        
      }).catch((error)=> {});
    });
  };


  handleDeleteComment = (comment)=> {
    //.log('%s.handleDeleteComment()', this.constructor.name, comment.id);
    trackEvent('button', 'delete-comment');

    axios.post(API_ENDPT_URL, {
      action: 'UPDATE_COMMENT',
      payload: {
        comment_id: comment.id,
        state: 'deleted'
      }
    }).then((response)=> {
      // 			console.log('UPDATE_COMMENT', response.data);
    }).catch((error)=> {});
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

  handleSortClick = (sort)=> {
    console.log('%s.handleSortClick()', this.constructor.name, sort);

    this.setState({ sort });
  }

  handleTextChange = (event)=> {
    console.log('%s.handleTextChange()', this.constructor.name, event);

    const commentContent = event.target.value;
    this.setState({ commentContent });
  };

  handleVote = ({ comment, action, vote })=> {
    trackEvent('button', (!vote) ? (action === VOTE_ACTION_UP) ? 'upvote-comment' : 'downvote-comment' : 'retract-vote');
    
    const { profile, team } = this.props;
    const { comments } = team;

    // const score = (!vote) ? (action === VOTE_ACTION_UP) ? 1 : -1 : (vote.score === 1 && action === VOTE_ACTION_UP) ? -1 : 1;
    const score = (!vote) ? (action === VOTE_ACTION_UP) ? 1 : -1 : vote.score * -1;
    comment.score += score;

    console.log('%s.handleVote()', this.constructor.name, { comment, action, vote, score });

    this.setState({ comments : comments.map((item)=> ((item.id === comment.id) ? comment : item))});
    axios.post(API_ENDPT_URL, {
      action: 'VOTE_COMMENT',
      payload: { score,
        user_id    : profile.id,
        comment_id : comment.id
      }
    }).then((response)=> {
			console.log('VOTE_COMMENT', response.data);
      this.props.fetchTeamComments({ team });

    }).catch((error)=> {});
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
    // 		console.log('%s.render()', this.constructor.name, { fetching : this.state.fetching, processing : this.state.processing });

    const { profile, team, comment } = this.props;
    const { commentContent, fetching, share, sort } = this.state;
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
            sort={sort} 
            popover={share} 
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

            <AskPageCommentsPanel 
              profile={profile} 
              comments={team.comments} 
              loading={fetching}
              sort={sort}
              onVote={this.handleVote} 
              onDelete={this.handleDeleteComment} 
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
    fetchTeamComments : (payload)=> dispatch(fetchTeamComments(payload)),
    setComment        : (payload)=> dispatch(setComment(payload))
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
