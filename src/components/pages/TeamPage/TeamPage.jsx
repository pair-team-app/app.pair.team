
import React, { Component } from 'react';
import './TeamPage.css';

import axios from 'axios';
import { Strings } from 'lang-js-utils';
import TextareaAutosize from 'react-autosize-textarea';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import TeamPageFileDrop from './TeamPageFileDrop';
import BasePage from '../BasePage';
import BaseComment from '../../iterables/BaseComment';
import CreateTeamForm from '../../forms/CreateTeamForm';
import { SORT_BY_DATE, SORT_BY_SCORE } from '../../sections/TopNav/TeamPageHeader';
import { TEAM_TIMESTAMP } from '../../../consts/formats';
import { ENTER_KEY } from '../../../consts/key-codes';
import { API_ENDPT_URL } from '../../../consts/uris';
import { fetchTeamComments, makeComment, makeTeam, makeTeamRule, modifyTeam, setComment, setPlayground, setTypeGroup, toggleCreateTeam } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import btnClear from '../../../assets/images/ui/btn-clear.svg';
import btnCode from '../../../assets/images/ui/btn-code.svg';

class TeamPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topSort         : [ ],
      commentContent  : '',
      codeComment     : false,
      teamDescription : '',
      ruleContent     : '',
      ruleInput       : false,
      sort            : SORT_BY_SCORE,
      fetching        : false,
      loading         : false,
      share           : false,
      richComment     : false,
      url             : null,
      imageComment    : null
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

  handleRuleInput = (event)=> {
    // console.log('%s.handleRuleInput()', this.constructor.name, event);
    trackEvent('button', 'add-rule');

    this.setState({
      ruleContent : '',
      ruleInput   : true
    });
  }

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
    const richComment = (/https?:\/\//i.test(commentContent));

    this.setState({ commentContent, richComment,
      parsing      : richComment,
      imageComment : null
    }, ()=> {
      if (richComment) {
        const url = commentContent.match(/https?:\/\/.+ ?/i).shift().split(' ').shift();
        // if (url !== this.state.url) {
          this.setState({ url }, ()=> {
            axios.post(API_ENDPT_URL, {
              action  : 'SCREENSHOT_URL',
              payload : { url }
            }).then((response)=> {
              const { image } = response.data;
              console.log('SCREENSHOT_URL', { data : response.data });
              this.setState({
                parsing      : false,
                imageComment : image.cdn
               });
            });
          });
        // }
      }
    });
  };

  handleUpdateTeamDescription = (event)=> {
    // console.log('%s.handleUpdateTeamDescription()', this.constructor.name, event);
    trackEvent('button', 'update-team');

    event.preventDefault();
    event.stopPropagation();

    const { teamDescription } = this.state;
    this.props.modifyTeam({ description : teamDescription });
  }

  handleCreateTeamSubmit = ({ title, description, rules, invites })=> {
    console.log('%s.handleCreateTeamSubmit()', this.constructor.name, { title, description, rules, invites });
    this.props.makeTeam({ title, description, rules, invites });
    this.props.toggleCreateTeam(false);
  };

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

    const { profile, team, comments, createTeam } = this.props;
    const { commentContent, teamDescription, ruleContent, ruleInput, fetching, loading, share, sort, topSort, files, richComment, imageComment, codeComment } = this.state;


    const cdnHeaders = {
      'Content-Type' : 'multipart/form-data',
      'Accept'       : 'application/json'
    };

    return (<BasePage { ...this.props } className="team-page">
      {(profile && team) && (<>
        {(!createTeam) ? (<div>
          <div className="comments-wrapper" data-fetching={fetching} data-empty={comments.length === 0}>
            <div>
              <TeamPageAddComment
                loading={loading}
                codeComment={codeComment}
                commentContent={commentContent}
                imageComment={imageComment}
                onClear={this.handleClearComment}
                onCode={this.handleCode}
                onTextChange={this.handleTextChange}
                onSubmit={this.handleAddComment}
              />

              <div className="empty-comments">No Activity</div>

              <TeamPageCommentsPanel
                profile={profile}
                comments={(sort === SORT_BY_DATE) ? comments.sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)) : topSort.map((commentID)=> (comments.find(({ id })=> (id === commentID)) || null)).filter((comment)=> (comment !== null))}
                fetching={fetching}
                sort={sort}
              />
            </div>
          </div>
          <div className="team-wrapper" data-fetching={fetching}>
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
                  return (<TeamPageRule
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
        </div>) : (<div>
          <CreateTeamForm onCancel={()=> this.props.toggleCreateTeam(false)} onSubmit={this.handleCreateTeamSubmit} />
        </div>)}
      </>)}
    </BasePage>);
  }
}

const TeamPageAddComment = (props)=> {
  // console.log('TeamPageAddComment()', { props });

  const { loading, codeComment, commentContent, imageComment } = props;
  const isURL = (/https?:\/\//i.test(props.commentContent));

  return (<div className="team-page-add-comment" data-loading={loading}><form>
    <div className="content-wrapper">
      {(commentContent.length > 0) && (<div>
        <img src={btnClear} className="clear-btn" onClick={props.onClear} alt="Clear" />
        <img src={btnCode} className="code-btn" onClick={props.onCode} alt="Code" />
      </div>)}
      {(isURL)
      ? (<div className="rich-content">
          <div className="image-wrapper"><img src={imageComment} alt="" /></div>
          <TextareaAutosize className="comment-txt" placeholder="Add a comment to this image…" value={commentContent} onChange={props.onTextChange} data-code={codeComment} />
        </div>)
      : (<TextareaAutosize className="comment-txt" placeholder="Text, Paste or Drag to ask you team anything…" value={commentContent} onChange={props.onTextChange} data-code={codeComment} />)
    }</div>
    <button type="submit" disabled={commentContent.length === 0} onClick={props.onSubmit}>Submit</button>
  </form></div>);
};



const TeamPageCommentsPanel = (props)=> {
	// console.log('TeamPageCommentsPanel()', { ...props });

	const { loading, profile, comments } = props;
  return (<div className="team-page-comments-panel" data-loading={loading}>
		{(comments.map((comment, i)=> {
			const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);
			return (<TeamPageComment key={i} comment={comment}  loading={loading} vote={vote} />);
		}))}
	</div>);
}


const TeamPageComment = (props)=> {
  // console.log('TeamPageComment()', props);

  const { loading, vote, comment } = props;
	return (<div className="team-page-comment" data-id={comment.id} data-author={comment.author.id} data-loading={loading}>
    <BaseComment loading={loading} vote={vote} comment={comment} />
  </div>);
};

const TeamPageRule = (props)=> {
  // console.log('TeamPageRule()', props);

  const { ind, rule } = props;
  return (<div className="team-page-rule">
    {ind}. {rule.title} {rule.content}
  </div>);
};


const mapDispatchToProps = (dispatch)=> {
  return {
    fetchTeamComments : (payload)=> dispatch(fetchTeamComments(payload)),
    makeComment       : (payload)=> dispatch(makeComment(payload)),
    makeTeam          : (payload)=> dispatch(makeTeam(payload)),
    makeTeamRule      : (payload)=> dispatch(makeTeamRule(payload)),
    modifyTeam        : (payload)=> dispatch(modifyTeam(payload)),
    setPlayground     : (payload)=> dispatch(setPlayground(payload)),
    setTypeGroup      : (payload)=> dispatch(setTypeGroup(payload)),
    setComment        : (payload)=> dispatch(setComment(payload)),
    toggleCreateTeam  : (payload)=> dispatch(toggleCreateTeam(payload))
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    comment    : state.comments.comment,
    createTeam : state.teams.createTeam,
    profile    : state.user.profile,
    team       : state.teams.team,
    comments   : state.comments.comments,
    playground : state.playground
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamPage));
