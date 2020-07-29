
import React, { Component } from 'react';
import './TeamPage.css';

import axios from 'axios';
import { Arrays, Strings } from 'lang-js-utils';
import { Menu, Item, Separator, Submenu, MenuProvider } from 'react-contexify';
import TextareaAutosize from 'react-autosize-textarea';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import TeamPageFileDrop from './TeamPageFileDrop';
import BasePage from '../BasePage';
import BaseComment from '../../iterables/BaseComment';
import CreateTeamForm from '../../forms/CreateTeamForm';
import { SORT_BY_DATE, SORT_BY_SCORE } from '../../sections/TopNav/TeamPageHeader';
import { TEAM_TIMESTAMP } from '../../../consts/formats';
import { BASKSPACE_KEY, TAB_KEY, ALT_KEY, CTRL_KEY, CAP_KEY, SHIFT_KEY, ENTER_KEY, META_LT_KEY } from '../../../consts/key-codes';
import { API_ENDPT_URL } from '../../../consts/uris';
import { fetchTeamComments, makeComment, makeTeamRule, modifyTeam, setComment, setPlayground, setTypeGroup } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import btnCode from '../../../assets/images/ui/btn-code.svg';

import 'react-contexify/dist/ReactContexify.min.css';
import { POPUP_TYPE_OK } from '../../overlays/PopupNotification';


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
      urlComment      : false,
      dataURI         : null,
      dragOver        : false,
      keyPress        : false
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    const { playground } = this.props;
    if (playground) {
      this.props.setPlayground(null);
    }

    window.ondragenter = this.handleDragEnter;
    window.ondragleave = this.handleDragLeave;

    window.addEventListener('paste', this.handleClipboardPaste);
    document.addEventListener('keydown', this.handleKeyDown);
    // window.addEventListener('paste', (event)=> {
    //   console.log('%s.componentDidUpdate()', this.constructor.name, { event, data : event.clipboardData.getData('Text') });

    //   const clipboardText = event.clipboardData.getData('Text');
    //   if (clipboardText) {

    //   }
    // });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { team } = this.props;
    const { teamDescription } = this.state;

    if (prevProps.team !== team && team && teamDescription !== team.description) {
      this.setState({ teamDescription : team.description });
    }
  }

  componentWillUnmount() {
		// console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });

    window.ondragenter = null;
    window.ondragleave = null;
		document.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('paste', this.handleClipboardPaste);
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

  handleClipboardPaste = (event)=> {
    console.log('%s.handleClipboardPaste()', this.constructor.name, { event, data : event.clipboardData.getData('Text') });

    const commentContent = event.clipboardData.getData('Text');
    if (commentContent) {
      const urlComment = (/https?:\/\//i.test(commentContent));

      this.setState({ commentContent, urlComment,
        parsing      : urlComment,
      }, ()=> {
        if (urlComment) {
          const url = commentContent.match(/https?:\/\/.+ ?/i).shift().split(' ').shift();
          axios.post(API_ENDPT_URL, {
            action  : 'SCREENSHOT_URL',
            payload : { url }
          }).then((response)=> {
            const { image } = response.data;
            console.log('SCREENSHOT_URL', { data : response.data });
            this.setState({
              parsing : false,
              dataURI : image.data
              });
          });
        }
      });
    }
  }

  handleCode = (event)=> {
    console.log('%s.handleCode()', this.constructor.name, { event });
    this.setState({ codeComment : !this.state.codeComment });
  };

  handleDragEnter = (event)=> {
    console.log('%s.handleDragEnter()', this.constructor.name, { event });
    event.preventDefault();

    const { dragOver } = this.state;
    if (!dragOver) {
      this.setState({ dragOver : true });
    }
  };

  handleDragLeave = (event)=> {
    console.log('%s.handleDragLeave()', this.constructor.name, { event, client : { x : event.clientX, y : event.clientY }});
    event.preventDefault();

    const { dragOver } = this.state;
    const { clientX, clientY } = event;

    if (dragOver && (clientX + clientY === 0)) {
      this.setState({ dragOver : false });
    }
  };

  handleFileDropClose = ()=> {
    console.log('%s.handleFileDropClose()', this.constructor.name);
    this.setState({
      dragOver       : false,
      commentContent : '',
      dataURI        : null,
      codeComment    : false,
      urlComment     : false
    });
  };

  handleKeyDown = (event)=> {
    console.log('%s.handleKeyDown()', this.constructor.name, { event });

    if (event.keyCode === ENTER_KEY) {
      const { ruleInput, commentContent, teamDescription, ruleContent } = this.state;
      // if (commentContent.length > 0) {
      //   this.handleAddComment(event);
      // }

      if (teamDescription.length > 0) {
        this.handleUpdateTeamDescription(event);
      }

      if (ruleContent.length > 0 && ruleInput) {
        this.handleAddRule(event);
      }
    }

    // } else if (event.keyCode !== META_LT_KEY && event.keyCode !== BASKSPACE_KEY && event.keyCode !== TAB_KEY && event.keyCode !== ALT_KEY && event.keyCode !== CTRL_KEY && event.keyCode !== CAP_KEY && event.keyCode !== SHIFT_KEY) {
    //   const { keyPress, commentContent } = this.state;
    //   // if (!keyPress) {
    //     this.setState({
    //       keyPress       : true,
    //       commentContent : `${commentContent}${event.key}`
    //     });
    //   // }
    // }
  }

  handleRuleInput = (event)=> {
    // console.log('%s.handleRuleInput()', this.constructor.name, event);
    trackEvent('button', 'add-rule');

    this.setState({
      ruleContent : '',
      ruleInput   : true
    });
  }

  handleTextChange = (event)=> {
    // console.log('%s.handleTextChange()', this.constructor.name, event);

    const commentContent = event.target.value;
    const urlComment = (/https?:\/\//i.test(commentContent));

    this.setState({ commentContent, urlComment,
      parsing      : urlComment,
    }, ()=> {
      if (urlComment) {
        const url = commentContent.match(/https?:\/\/.+ ?/i).shift().split(' ').shift();
        axios.post(API_ENDPT_URL, {
          action  : 'SCREENSHOT_URL',
          payload : { url }
        }).then((response)=> {
          const { image } = response.data;
          console.log('SCREENSHOT_URL', { data : response.data });
          this.setState({
            parsing : false,
            dataURI : image.data
            });
        });
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

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, team, sort } = this.props;
    const { commentContent, teamDescription, ruleContent, ruleInput, fetching, loading, dataURI, codeComment, dragOver } = this.state;


    const cdnHeaders = {
      'Content-Type' : 'multipart/form-data',
      'Accept'       : 'application/json'
    };

    return (<BasePage { ...this.props } className="team-page">
      {(profile && team) && (<>
        <div className="content-wrapper">
          <div className="comments-wrapper" data-fetching={fetching} data-empty={team && team.comments.length === 0}>
            <div>
              <TeamPageAddComment
                loading={loading}
                codeComment={codeComment}
                commentContent={commentContent}
                onClear={this.handleClearComment}
                onCode={this.handleCode}
                onTextChange={this.handleTextChange}
                onSubmit={this.handleAddComment}
              />

              <div className="empty-comments">No Activity</div>

              {(team) && (<TeamPageCommentsPanel
                profile={profile}
                comments={(sort === SORT_BY_DATE) ? team.comments.sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)) : team.comments.sort((i, ii)=> ((i.score > ii.score) ? -1 : (i.score < ii.score) ? 1 : 0)).filter((comment)=> (comment !== null))}
                // comments={(sort === SORT_BY_DATE) ? Arrays.shuffle(team.comments) : team.comments.sort((i, ii)=> ((i.score > ii.score) ? -1 : (i.score < ii.score) ? 1 : 0)).filter((comment)=> (comment !== null))}
                fetching={fetching}
                sort={sort}
              />)}
            </div>
          </div>
          <div className="team-wrapper" data-fetching={fetching}>
            <div className="about-wrapper">
              <div>
                <MenuProvider id="menu_id">
                  <div className="header">About</div>
                </MenuProvider>
                <MyAwesomeMenu onClick={({ event, props })=> { console.log('MenuClick', { event, props }); this.props.onPopup({
        type    : POPUP_TYPE_OK,
        content : 'Menu Clicked.',
        delay   : 0
      });}} />
              </div>
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
        </div>
        {/* <TeamPageFileDrop hidden={false} onClose={()=> this.setState({ dragOver : false })} />) */}
        <TeamPageFileDrop dragging={(dragOver)} dataURI={dataURI} textComment={commentContent} onClose={this.handleFileDropClose} />
      </>)}
    </BasePage>);
  }
}

const TeamPageAddComment = (props)=> {
  // console.log('TeamPageAddComment()', { props });

  const { loading, codeComment, commentContent } = props;
  const urlComment = (/https?:\/\//i.test(commentContent));

  return (<div className="team-page-add-comment" data-loading={loading}><form>
    <div className="content-wrapper">
      {(commentContent.length > 0 && !urlComment) && (<div>
        <img src={btnCode} className="code-btn" onClick={props.onCode} alt="Code" />
      </div>)}
      <TextareaAutosize className="comment-txt" placeholder="Start Typing or Pasting…" value={commentContent} onChange={props.onTextChange} data-code={codeComment} />
    </div>
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
  // console.log('TeamPageComment()', { props });

  const { loading, vote, comment } = props;
	return (<div className="team-page-comment" data-id={comment.id} data-author={comment.author.id} data-loading={loading}>
    <BaseComment loading={loading} vote={vote} comment={comment} />
  </div>);
};

const TeamPageRule = (props)=> {
  // console.log('TeamPageRule()', { props });

  const { ind, rule } = props;
  return (<div className="team-page-rule">
    {ind}. {rule.title} {rule.content}
  </div>);
};




const MyAwesomeMenu = (props)=> {
  console.log('MyAwesomeMenu()', { props });

  return (<Menu id="menu_id">
     <Item onClick={props.onClick}>Lorem</Item>
     <Item onClick={props.onClick}>Ipsum</Item>
     <Separator />
     <Item disabled>Dolor</Item>
     <Separator />
     <Submenu label="Foobar">
      <Item onClick={props.onClick}>Foo</Item>
      <Item onClick={props.onClick}>Bar</Item>
     </Submenu>
  </Menu>);
};


const mapDispatchToProps = (dispatch)=> {
  return ({
    fetchTeamComments : (payload)=> dispatch(fetchTeamComments(payload)),
    makeComment       : (payload)=> dispatch(makeComment(payload)),
    makeTeamRule      : (payload)=> dispatch(makeTeamRule(payload)),
    modifyTeam        : (payload)=> dispatch(modifyTeam(payload)),
    setPlayground     : (payload)=> dispatch(setPlayground(payload)),
    setTypeGroup      : (payload)=> dispatch(setTypeGroup(payload)),
    setComment        : (payload)=> dispatch(setComment(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    comment    : state.comments.comment,
    profile    : state.user.profile,
    team       : state.teams.team,
    sort       : state.teams.sort,
    playground : state.playground
  });
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamPage));
