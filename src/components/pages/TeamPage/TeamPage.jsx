
import React, { Component } from 'react';
import './TeamPage.css';

import axios from 'axios';
import { Strings } from 'lang-js-utils';
import { Menu, Item, Separator, Submenu, MenuProvider } from 'react-contexify';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TextareaAutosize from 'react-autosize-textarea';

import BasePage from '../BasePage';
import BaseComment from '../../iterables/BaseComment';
import TeamPageFileDrop from './TeamPageFileDrop';
// import ContentDropModal from '../../overlays/ContentDropModal';

import { SORT_BY_DATE } from '../../sections/TopNav/TeamPageHeader';
import { TEAM_TIMESTAMP } from '../../../consts/formats';
// import { BASKSPACE_KEY, TAB_KEY, ALT_KEY, CTRL_KEY, CAP_KEY, SHIFT_KEY, ENTER_KEY, META_LT_KEY } from '../../../consts/key-codes';
import { ENTER_KEY } from '../../../consts/key-codes';
import { API_ENDPT_URL } from '../../../consts/uris';
import { fetchTeamComments, makeComment, makeTeamRule, modifyTeam, setComment, setPlayground, setTypeGroup } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';

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
      sort            : SORT_BY_DATE,
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

    // window.addEventListener('paste', this.handleClipboardPaste);
    // document.addEventListener('keydown', this.handleKeyDown);
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
      const { ruleInput, teamDescription, ruleContent } = this.state;
      // const { ruleInput, commentContent, teamDescription, ruleContent } = this.state;
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

    // const commentContent = event.target.value;
    // this.setState({ commentContent }, ()=> {
    //   this.setState({ commentContent : '' });
    // });
  };

  handlePageKeyPress = (event, key)=> {
    console.log('%s.handlePageKeyPress()', this.constructor.name, { event, key });

    const commentContent = key;
    this.setState({ commentContent });
  };


  handleCommentReply = (comment, key)=> {
    console.log('%s.handleCommentReply()', this.constructor.name, { comment, key });

    const commentContent = key;
    this.setState({ commentContent }, ()=> {
      if (comment !== this.props.comment) {
        this.props.setComment(comment);
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
    const { commentContent, teamDescription, ruleContent, ruleInput, fetching, loading, dragOver } = this.state;

    return (<BasePage { ...this.props } className="team-page">
      {(profile && team)
      ? (<div className="content-wrapper">
          <KeyboardEventHandler handleKeys={['alphanumeric']} onKeyEvent={(key, event)=> this.handlePageKeyPress(event, key)} />
          <div className="comments-wrapper" data-fetching={fetching} data-empty={team && team.comments.length === 0}>
            <div className="header" data-loading={loading}>
              <input type="text" className="comment-txt" placeholder="Typing or Pasting anything…" defaultValue={commentContent} />
              <button disabled={true}>Comment</button>
            </div>

            <div className="empty-comments">No Activity</div>

            <TeamPageCommentsPanel
              profile={profile}
              comments={(sort === SORT_BY_DATE) ? team.comments.sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)) : team.comments.sort((i, ii)=> ((i.score > ii.score) ? -1 : (i.score < ii.score) ? 1 : 0)).filter((comment)=> (comment !== null))}
              fetching={fetching}
              sort={sort}
              onReplyKeyPress={this.handleCommentReply}
            />
          </div>
          <div className="team-wrapper" data-fetching={fetching}>
            <div className="about-wrapper">
              <MenuProvider id="menu_id">
                <div className="header">About</div>
              </MenuProvider>
              <MyAwesomeMenu onClick={({ event, props })=> { console.log('MenuClick', { event, props }); this.props.onPopup({
                type    : POPUP_TYPE_OK,
                content : 'Menu Clicked.',
                delay   : 0
              });}} />
              <div className="content">
                <TextareaAutosize placeholder="Enter Text to Describe you team" value={teamDescription} onChange={(event)=> this.setState({ teamDescription : event.target.value })} /></div>
              <div className="footer">
                <div className="member-count">{team.members.length} {Strings.pluralize('member', team.members.length)}</div>
                <div className="timestamp">CREATED {team.added.format(TEAM_TIMESTAMP)}</div>
              </div>
            </div>
            <div className="rules-wrapper">
              <div className="header">Rules</div>
              <div className="content">
                {(team.rules.map((rule, i)=> (<TeamPageRule key={i} rule={rule} />)))}
              </div>
              <div className="footer" data-input={ruleInput}>
                <TeamPageAddRuleButton onClick={this.handleRuleInput} />
                <TextareaAutosize type="text" placeholder="" value={ruleContent} onChange={(event)=> this.setState({ ruleContent : event.target.value })} />
              </div>
            </div>
          </div>
        </div>)

      : (<div className="content-loading">Loading…</div>)}
      <TeamPageFileDrop dragging={(dragOver)} textContent={commentContent} onClose={this.handleFileDropClose} />
      {/* <ContentDropModal dragging={(dragOver)} textContent={commentContent} onClose={this.handleFileDropClose} /> */}
    </BasePage>);
  }
}

const TeamPageCommentsPanel = (props)=> {
	// console.log('TeamPageCommentsPanel()', { ...props });

	const { loading, profile, comments } = props;
  return (<div className="team-page-comments-panel" data-loading={loading}>
		{(comments.map((comment, i)=> {
			const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);
			return (<TeamPageComment key={i} comment={comment}  loading={loading} vote={vote} onReplyKeyPress={props.onReplyKeyPress} />);
		}))}
	</div>);
}


const TeamPageComment = (props)=> {
  // console.log('TeamPageComment()', { props });

  const { loading, vote, comment } = props;
	return (<div className="team-page-comment" data-id={comment.id} data-author={comment.author.id} data-loading={loading}>
    <BaseComment loading={loading} vote={vote} comment={comment} onReplyKeyPress={props.onReplyKeyPress} />
  </div>);
};

const TeamPageRule = (props)=> {
  // console.log('TeamPageRule()', { props });

  const { rule } = props;
  const { title, content } = rule;
  const text = `${title}${(content) ? `\n${content}` : ''}`;

  return (<div className="team-page-rule">
    <TextareaAutosize disabled={true} value={text} onChange={(event)=> this.setState({ teamDescription : event.target.value })} />
  </div>);
};

const TeamPageAddRuleButton = (props)=> {
  return (<button className="quiet-button team-page-add-rule-button" onClick={props.onClick}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7Z" fill="#909090"/>
    </svg>
  </button>);
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
