import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ENTER_KEY } from '../../../consts/key-codes';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { fetchTeamComments, setTeam, setPlayground, setTypeGroup, setComment } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import BasePage from '../BasePage';
import './AskPage.css';
import AskPageHeader, { SORT_BY_SCORE, SORT_BY_DATE } from './AskPageHeader';
import AskPageCommentsPanel, { VOTE_ACTION_UP, VOTE_ACTION_DOWN } from './AskPageCommentsPanel';
import { SettingsMenuItemTypes } from '../PlaygroundPage/PlaygroundHeader/UserSettings';
import PlaygroundNavPanel from '../PlaygroundPage/PlaygroundNavPanel';
import { reformComment } from '../PlaygroundPage/utils/reform';

class AskPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topSort        : [],
      commentContent : '',
      sort           : SORT_BY_SCORE,
      fetching       : false,
      share          : false,
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    const { playground } = this.props;

    if (playground) {
      this.props.setPlayground(null);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { comments } = this.props;
    const { fetching, topSort } = this.state;
  
  
    if (fetching) {
      if ((comments.filter(({ content })=> (content === null)).length === 0)) {
        this.setState({ fetching : false });
      }
    
    } else {
      if (comments.filter(({ content })=> (content === null)).length > 0) {
        this.setState({ fetching : true });
      }
    }

    if (topSort.length !== comments.length) {
      this.setState({ topSort : comments.sort((i, ii)=> ((i.score > ii.score) ? -1 : (i.score < ii.score) ? 1 : 0)).map(({ id })=> (id)) });
    }
  }

  handleAddComment = (event)=> {
    console.log('%s.handleAddComment()', this.constructor.name, { event, props : this.props, state : this.state });
    trackEvent('button', 'add-comment');

    event.preventDefault();
    event.stopPropagation();

    const { profile, team } = this.props;
    const { commentContent } = this.state;

    // this.setState({ fetching : true }, ()=> {
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

        this.setState({ commentContent : '' }, ()=> {
          this.onReloadComments();
        });
        
      }).catch((error)=> {});
    // });
  };


  handleDeleteComment = (comment)=> {
    //console.log('%s.handleDeleteComment()', this.constructor.name, { comment });
    trackEvent('button', 'delete-comment');

    axios.post(API_ENDPT_URL, {
      action: 'UPDATE_COMMENT',
      payload: {
        comment_id: comment.id,
        state: 'deleted'
      }
    }).then((response)=> {
      console.log('UPDATE_COMMENT', response.data);
      this.onReloadComments();

    }).catch((error)=> {});
  };

  handleKeyDown = (event)=> {
    // console.log('%s.handleKeyDown()', this.constructor.name, event);

    const { commentContent } = this.state;
    if (event.keyCode === ENTER_KEY && commentContent.length > 0) {
      this.handleAddComment(event);
    }
  }

  handleNavGroupItemClick = (typeGroup)=> {
    // console.log('%s.handleNavGroupItemClick()', this.constructor.name, { typeGroup });
  };

  handlePlaygroundClick = (playground, typeGroup)=> {
    // console.log('%s.handlePlaygroundClick()', this.constructor.name, { playground, typeGroup });

    this.props.setPlayground(playground);
    this.props.setTypeGroup(typeGroup);
  };

  handleSettingsItem = (itemType)=> {
    //console.log('%s.handleSettingsItem()', this.constructor.name, itemType);

    if (itemType === SettingsMenuItemTypes.DELETE_ACCT) {
      this.props.onModal(Modals.DISABLE);

    } else if (itemType === SettingsMenuItemTypes.PROFILE) {
      this.props.onModal(Modals.PROFILE);
    }
  };

  handleSortClick = (sort)=> {
    // console.log('%s.handleSortClick()', this.constructor.name, sort);

    this.setState({ sort }, ()=> {
      if (sort === SORT_BY_SCORE) {
        this.onReloadComments();
      }
    });
  }

  handleTextChange = (event)=> {
    console.log('%s.handleTextChange()', this.constructor.name, event);

    const commentContent = event.target.value;
    this.setState({ commentContent });
  };

  handleVote = ({ comment, action })=> {
    trackEvent('button', (action === VOTE_ACTION_UP) ? 'upvote-comment' : (action === VOTE_ACTION_DOWN) ? 'downvote-comment' : 'retract-vote');
    
    const { profile, team, comments } = this.props;
    const score = (action === VOTE_ACTION_UP) ? 1 : (action === VOTE_ACTION_DOWN) ? -1 : 0;

    axios.post(API_ENDPT_URL, {
      action: 'VOTE_COMMENT',
      payload: { score,
        user_id    : profile.id,
        comment_id : comment.id
      }
    }).then((response)=> {
			console.log('VOTE_COMMENT', response.data);

      const comment = reformComment(response.data.comment);
      const { comments } = this.props;

      

      team.comments = team.comments.map((i)=> ((i.id === comment.id) ? comment : i));

      this.props.setTeam(team);
      this.onReloadComments(false);

    }).catch((error)=> {});
  };

  onReloadComments = (refresh=true)=> {
    console.log('%s.onReloadComments()', this.constructor.name, { refresh });

    const { team } = this.props;
    const { topSort } = this.state;

    this.setState({ 
      fetching : true,
      topSort  : (refresh) ? [] : topSort
    }, ()=> {
      this.props.fetchTeamComments({ team });
    });
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, team, comments } = this.props;
    const { commentContent, fetching, share, sort, topSort } = this.state;

    return (<BasePage { ...this.props } className="ask-page">
      {profile && team && (<>
        <PlaygroundNavPanel
          onPlaygroundClick={this.handlePlaygroundClick}
          onTypeGroupClick={this.handleNavGroupItemClick}
          onTypeItemClick={this.handleNavTypeItemClick}
        />
        <AskPageHeader 
          sort={sort} 
          popover={share} 
          onSortClick={this.handleSortClick} 
          onPopup={this.props.onPopup} 
          onSharePopoverClose={()=> this.setState({ share : false })} 
          onSettingsItem={this.handleSettingsItem} 
          onLogout={this.props.onLogout} 
        />

        <div className="ask-page-scroll-wrapper">
          <div className="ask-page-content-wrapper" data-loading={fetching}>
            <AskPageContentHeader 
              loading={fetching} 
              commentContent={commentContent} 
              onTextChange={this.handleTextChange} 
              onSubmit={this.handleAddComment}
            />

            <AskPageCommentsPanel 
              profile={profile} 
              comments={(sort === SORT_BY_DATE) ? comments.sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)) : topSort.map((commentID)=> (comments.find(({ id })=> (id === commentID)) || null)).filter((comment)=> (comment !== null))} 
              loading={fetching}
              sort={sort}
              onVote={this.handleVote} 
              onDelete={this.handleDeleteComment} 
            />
          </div>
        </div>
      </>)}
    </BasePage>);
  }
}

const AskPageContentHeader = (props)=> {
  // console.log('AskPageContentHeader()', props);

  const { loading, commentContent } = props;
  return (<div className="ask-page-content-header" data-loading={loading}>
    <form>
      <input type="text" placeholder="Ask your team anything…" value={commentContent} onChange={props.onTextChange} autoComplete="new-password" autoFocus />
      <button type="submit" disabled={commentContent.length === 0} onClick={props.onSubmit}>Submit</button>
    </form>
  </div>);
};


const mapDispatchToProps = (dispatch)=> {
  return {
    fetchTeamComments : (payload)=> dispatch(fetchTeamComments(payload)),
    setPlayground     : (payload)=> dispatch(setPlayground(payload)),
    setTeam           : (payload)=> dispatch(setTeam(payload)),
    setTypeGroup      : (payload)=> dispatch(setTypeGroup(payload)),
    setComment        : (payload)=> dispatch(setComment(payload))
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    comment    : state.comment,
    profile    : state.userProfile,
    team       : state.team,
    comments   : state.comments,
    playground : state.playground
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AskPage));
