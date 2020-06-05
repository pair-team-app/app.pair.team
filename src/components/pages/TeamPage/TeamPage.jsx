
import { Strings } from 'lang-js-utils';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { TEAM_TIMESTAMP } from '../../../consts/formats';
import { ENTER_KEY } from '../../../consts/key-codes';
import { Modals } from '../../../consts/uris';
import { fetchTeamComments, makeComment, makeTeamRule, modifyTeam, setComment, setPlayground, setTypeGroup } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import BasePage from '../BasePage';
import { SettingsMenuItemTypes } from '../PlaygroundPage/PlaygroundHeader/UserSettings';
import './TeamPage.css';
import TeamPageCommentsPanel from './TeamPageCommentsPanel';
import TeamPageHeader, { SORT_BY_DATE, SORT_BY_SCORE } from './TeamPageHeader';



class TeamPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topSort         : [],
      commentContent  : '',
      teamDescription : '',
      ruleContent     : '',
      ruleInput       : false,
      sort            : SORT_BY_SCORE,
      fetching        : false,
      share           : false
    };
  }

  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    const { playground } = this.props;
    if (playground) {
      this.props.setPlayground(null);
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { team, comments } = this.props;
    const { teamDescription, fetching, topSort } = this.state;
  
  
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

    if (prevProps.team !== team && team && teamDescription !== team.description) { 
      this.setState({ teamDescription : team.description });
    }
  }

  componentWillUnmount() {
		// console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });

		document.removeEventListener('keydown', this.handleKeyDown);
	}


  handleAddComment = (event)=> {
    // console.log('%s.handleAddComment()', this.constructor.name, { event, props : this.props, state : this.state });
    trackEvent('button', 'add-comment');

    event.preventDefault();
    event.stopPropagation();

    const { commentContent } = this.state;
    this.props.makeComment({ 
      comment  : null, 
			content  : commentContent,
      position : null
		});

    this.setState({ commentContent : '' });
  };

  handleAddRule = (event)=> {
    // console.log('%s.handleAddRule()', this.constructor.name, event);
    trackEvent('button', 'add-rule');

    event.preventDefault();
    event.stopPropagation();

    const { ruleContent } = this.state;
    this.props.makeTeamRule({ title : ruleContent });
    this.setState({ 
      ruleInput   : false
      // ruleContent : ''
    });
  }

  handleKeyDown = (event)=> {
    // console.log('%s.handleKeyDown()', this.constructor.name, event);

    const { ruleInput, commentContent, teamDescription, ruleContent } = this.state;
    if (event.keyCode === ENTER_KEY) {
      if (commentContent.length > 0) {
        this.handleAddComment(event);
      }

      if (teamDescription.length > 0) {
        this.handleUpdateTeamDescription(event);
      }

      if (ruleContent.length > 0 && ruleInput) {
        this.handleAddRule(event);
      }

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

  handleRuleInput = (event)=> {
    // console.log('%s.handleRuleInput()', this.constructor.name, event);
    trackEvent('button', 'add-rule');

    this.setState({ 
      ruleContent : '',
      ruleInput   : true 
    });
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
    // console.log('%s.handleSortClick()', this.constructor.name, sort);

    this.setState({ sort }, ()=> {
      if (sort === SORT_BY_SCORE) {
        this.onReloadComments();
      }
    });
  }

  handleTextChange = (event)=> {
    // console.log('%s.handleTextChange()', this.constructor.name, event);

    const commentContent = event.target.value;
    this.setState({ commentContent });
  };

  handleUpdateTeamDescription = (event)=> {
    // console.log('%s.handleUpdateTeamDescription()', this.constructor.name, event);
    trackEvent('button', 'update-team');

    event.preventDefault();
    event.stopPropagation();

    const { teamDescription } = this.state;
    this.props.modifyTeam({ description : teamDescription });
  }

  onReloadComments = (refresh=true)=> {
    // console.log('%s.onReloadComments()', this.constructor.name, { refresh });

    const { team } = this.props;
    const { topSort } = this.state;

    this.setState({ 
      fetching : true,
      topSort  : (refresh) ? [] : topSort
    }, ()=> {
      // this.props.fetchTeamComments({ team });
    });
  };

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, team, comments } = this.props;
    const { commentContent, teamDescription, ruleContent, ruleInput, fetching, share, sort, topSort } = this.state;

    return (<BasePage { ...this.props } className="team-page">
      {profile && team && (<>
        <TeamPageHeader 
          sort={sort} 
          popover={share} 
          onSortClick={this.handleSortClick} 
          onPopup={this.props.onPopup} 
          onSharePopoverClose={()=> this.setState({ share : false })} 
          onSettingsItem={this.handleSettingsItem} 
          onLogout={this.props.onLogout} 
        />

        <div className="content-wrapper">
          <div className="comments-wrapper" data-loading={fetching}>
            <div>
              <TeamPageAddComment 
                loading={fetching} 
                commentContent={commentContent} 
                onTextChange={this.handleTextChange} 
                onSubmit={this.handleAddComment}
              />

              <TeamPageCommentsPanel 
                profile={profile} 
                comments={(sort === SORT_BY_DATE) ? comments.sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)) : topSort.map((commentID)=> (comments.find(({ id })=> (id === commentID)) || null)).filter((comment)=> (comment !== null))} 
                loading={fetching}
                sort={sort}
              />
            </div>
          </div>
          <div className="team-wrapper" data-loading={fetching}>
            <div className="about-wrapper">
              <div className="header">About</div>
              <div className="content"><textarea placeholder="Enter Text to Describe you team" value={teamDescription} onChange={(event)=> this.setState({ teamDescription : event.target.value })}></textarea></div>
              <div className="footer">
                <div>{team.members.length} {Strings.pluralize('member', team.members.length)}</div>
                <div className="timestamp">CREATED {team.added.format(TEAM_TIMESTAMP)}</div>
              </div>
            </div>
            <div className="rules-wrapper">
              <div className="header"><span>Rules</span></div>
              {(team) && (<div className="content">
                {(team.rules.map((rule, i)=> {
                  return (<TeamPageTeamRule 
                    key={i} 
                    ind={i+1} 
                    rule={rule} 
                  />);
                }))}
              </div>)}
              <div className="footer" data-input={ruleInput}>
                <button className="quiet-button" onClick={this.handleRuleInput}>+</button>
                <input type="text" placeholder="" value={ruleContent} onChange={(event)=> this.setState({ ruleContent : event.target.value })} />
              </div>
            </div>
          </div>
        </div>
      </>)}
    </BasePage>);
  }
}

const TeamPageAddComment = (props)=> {
  // console.log('TeamPageAddComment()', props);

  const { loading, commentContent } = props;
  return (<div className="team-page-add-comment" data-loading={loading}>
    <form>
      <input type="text" placeholder="Ask your team anything…" value={commentContent} onChange={props.onTextChange} autoComplete="new-password" />
      <button type="submit" disabled={commentContent.length === 0} onClick={props.onSubmit}>Submit</button>
    </form>
  </div>);
};



const TeamPageTeamRule = (props)=> {
  // console.log('TeamPageTeamRule()', props);

  const { ind, rule } = props;
  return (<div className="team-page-team-rule">
    {ind}. {rule.title} {rule.content}
  </div>);
};


const mapDispatchToProps = (dispatch)=> {
  return {
    fetchTeamComments : (payload)=> dispatch(fetchTeamComments(payload)),
    makeComment       : (payload)=> dispatch(makeComment(payload)),
    makeTeamRule      : (payload)=> dispatch(makeTeamRule(payload)),
    modifyTeam        : (payload)=> dispatch(modifyTeam(payload)),
    setPlayground     : (payload)=> dispatch(setPlayground(payload)),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamPage));