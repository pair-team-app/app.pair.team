
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
import { ENTER_KEY, ESCAPE_KEY } from '../../../consts/key-codes';
import { API_ENDPT_URL } from '../../../consts/uris';
import { fetchTeamComments, createComment, makeComment, makeTeamRule, modifyTeam, setComment, setPlayground, setTypeGroup } from '../../../redux/actions';
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
      fetching       : 0x111,
      loading        : 0x000,
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
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevFetching : prevState.fetching.toString(16), fetching : this.state.fetching.toString(16), prevLoading : prevState.loading.toString(16), loading : this.state.loading.toString(16) });

    const { profile, team, comment } = this.props;
    const { fetching, loading, teamDescription } = this.state;

    if (prevProps.team !== team && team && teamDescription !== team.description) {
      this.setState({ teamDescription : team.description });
    }

    if ((fetching & 0x001) === 0x001 && profile && !prevProps.profile) {
      this.setState({ fetching : fetching ^ 0x001 });
    }

    if ((fetching & 0x010) === 0x010 && team && !prevProps.team) {
      this.setState({ fetching : fetching ^ 0x010 });
    }

    if ((fetching & 0x100) === 0x100 && comment && !prevProps.comment) {
      this.setState({ fetching : loading ^ 0x100 });
    }

    if ((loading & 0x001) === 0x001 && prevProps.team.description !== team.description) {
      this.setState({ loading : loading ^ 0x001 });
    }

    if ((loading & 0x010) === 0x010 && prevProps.team.rules !== team.rules) {
      // this.setState({ loading : loading ^ 0x010 });

      this.setState({
        ruleInput : false,
        ruleContent : '',
        loading : loading ^ 0x010
      });
    }

    if ((loading & 0x100) === 0x100 && prevProps.team.comments !== team.comments) {
      this.setState({ loading : loading ^ 0x100 });
    }

  }

  componentWillUnmount() {
		// console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });

    window.ondragenter = null;
    window.ondragleave = null;
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
    console.log('%s.handleAddRule()', this.constructor.name, { event });
    event.preventDefault();
    event.stopPropagation();

    const { keyCode } = event;
    if (keyCode === ESCAPE_KEY) {
      this.setState({
        ruleContent : '',
        ruleInput   : false
      });

    } else {
      trackEvent('text', 'add-team-rule');
      const { ruleContent, loading } = this.state;

      this.setState({ loading  : loading ^ 0x010 }, ()=> {
        this.props.makeTeamRule({ title : ruleContent });
      });
    }
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

  handleRuleInput = (event)=> {
    // console.log('%s.handleRuleInput()', this.constructor.name, { event });
    trackEvent('button', 'add-rule');

    // this.addRuleTxt.focus();
    this.setState({
      ruleContent : '',
      ruleInput   : true
    });
  }

  handlePageKeyPress = (event, key)=> {
    console.log('%s.handlePageKeyPress()_____', this.constructor.name, { event, target : event.target, attribs : { elementID : event.target.id, className : event.target.className, attribs : event.target.getAttributeNames(), hasOverride : (event.target.getAttributeNames().findIndex((attrib)=> (attrib === 'data-keypress-override')) !== -1) }, key });

    const { target } = event;
    const { preComment } = this.props;
    if (target.getAttributeNames().findIndex((attrib)=> (attrib === 'data-keypress-override')) === -1 && !preComment) {
      this.props.createComment(key);
    }
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


  handleUpdateTeamDescription = (event, key)=> {
    // console.log('%s.handleUpdateTeamDescription()', this.constructor.name, { event, key });
    trackEvent('text', 'update-team-info');

    event.preventDefault();
    event.stopPropagation();

    const { team } = this.props;
    const { teamDescription, loading } = this.state;
    if (key !== 'meta' && key !== 'ctrl') {
      this.setState({ teamDescription : `${teamDescription}\n` });

    } else {
    if (teamDescription.length > 0 && teamDescription !== team.description && event.keyCode === ENTER_KEY) {
      trackEvent('text', 'update-team-info');

      event.target.blur();
      this.setState({ loading : loading ^ 0x001 }, ()=> {
        this.props.modifyTeam({ description : teamDescription });
      });
    }}
  }

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
    const { profile, team, sort } = this.props;
    const { teamDescription, ruleContent, ruleInput, fetching, loading, dragOver } = this.state;

    const infoLoading = Boolean(((loading << 0) & 0x001) === 0x001);
    const rulesLoading = Boolean(((loading << 0) & 0x010) === 0x010);
    const commentsLoading = Boolean(((loading << 0) & 0x100) === 0x100);
    // console.log('%s.render()', this.constructor.name, { infoLoading, rulesLoading, commentsLoading });

    return (<BasePage { ...this.props } className="team-page">
      {(profile && team)
      ? (<div className="content-wrapper">
          <KeyboardEventHandler handleKeys={['alphanumeric']} onKeyEvent={(key, event)=> this.handlePageKeyPress(event, key)} />
          <div className="comments-wrapper" data-fetching={Boolean((fetching & 0x010) === 0x010)} data-loading={commentsLoading} data-empty={team && team.comments.length === 0}>
            <div className="header" data-loading={Boolean((fetching & 0x010) === 0x010)}>
              <input type="text" className="comment-txt" placeholder="Typing or Pasting anything…" value="" onChange={(event)=> this.handlePageKeyPress(event, event.target.value)} />
              <button disabled={true}>Comment</button>
            </div>

            <div className="empty-comments">No Activity</div>

            <TeamPageCommentsPanel
              profile={profile}
              comments={(sort === SORT_BY_DATE) ? team.comments.sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)) : team.comments.sort((i, ii)=> ((i.score > ii.score) ? -1 : (i.score < ii.score) ? 1 : 0)).filter((comment)=> (comment !== null))}
              fetching={Boolean((fetching & 0x010) === 0x010)}
              loading={commentsLoading}
              sort={sort}
              onReplyKeyPress={this.handleCommentReply}
            />
          </div>
          <div className="team-wrapper" data-fetching={Boolean((fetching & 0x010) === 0x010)}>
            <div className="about-wrapper" data-loading={infoLoading}>
              <MenuProvider id="menu_id">
                <div className="header">About</div>
              </MenuProvider>
              <MyAwesomeMenu onClick={({ event, props })=> { console.log('MenuClick', { event, props }); this.props.onPopup({
                type    : POPUP_TYPE_OK,
                content : 'Menu Clicked.',
                delay   : 0
              });}} />
              <div className="content"><KeyboardEventHandler handleKeys={['ctrl', 'meta', 'enter']} onKeyEvent={(key, event)=> this.handleUpdateTeamDescription(event, key)}>
                <TextareaAutosize id="team-info-txtarea" className="team-info-txtarea" placeholder="Enter Text to Describe you team" value={teamDescription} onChange={(event)=> this.setState({ teamDescription : event.target.value })} data-keypress-override="true" />
              </KeyboardEventHandler></div>
              <div className="footer">
                <div className="member-count">{team.members.length} {Strings.pluralize('member', team.members.length)}</div>
                <div className="timestamp">CREATED {team.added.format(TEAM_TIMESTAMP)}</div>
              </div>
            </div>
            <div className="rules-wrapper"  data-loading={rulesLoading}>
              <div className="header">Rules</div>
              <div className="content">
                {(team.rules.map((rule, i)=> (<TeamPageRule key={i} rule={rule} />)))}
              </div>
              <div className="footer" data-input={ruleInput}>
                <TeamPageAddRuleButton onClick={this.handleRuleInput} />
                {/* <KeyboardEventHandler handleKeys={['enter']} handleFocusableElements onKeyEvent={(key, event)=> this.handlePageKeyPress(event, key)}> */}
                <KeyboardEventHandler handleKeys={['enter', 'esc']} handleFocusableElements onKeyEvent={(key, event)=> this.handleAddRule(event)}>
                  <TextareaAutosize id="team-add-rule-txtarea" placeholder="" value={ruleContent} onChange={(event)=> this.setState({ ruleContent : event.target.value })} />
                </KeyboardEventHandler>
              </div>
            </div>
          </div>
        </div>)

      : (<div className="content-loading">Loading…</div>)}
      <TeamPageFileDrop dragging={(dragOver)} onClose={this.handleFileDropClose} />
      {/* <ContentDropModal dragging={(dragOver)} textContent={commentContent} onClose={this.handleFileDropClose} /> */}
    </BasePage>);
  }
}

const TeamPageCommentsPanel = (props)=> {
	// console.log('TeamPageCommentsPanel()', { ...props });

	const { fetching, loading, profile, comments } = props;
  return (<div className="team-page-comments-panel" data-loading={fetching}>
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
    {text}
  </div>);
};

const TeamPageAddRuleButton = (props)=> {
  // console.log('TeamPageAddRuleButton()', { props });

  return (<button className="quiet-button team-page-add-rule-button" onClick={props.onClick}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" width="2" height="16" fill="#CCCCCC"/>
      <rect x="16" y="7" width="2" height="16" transform="rotate(90 16 7)" fill="#CCCCCC"/>
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
    createComment     : (payload)=> dispatch(createComment(payload)),
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
    preComment : state.comments.preComment,
    comment    : state.comments.comment,
    profile    : state.user.profile,
    team       : state.teams.team,
    sort       : state.teams.sort,
    playground : state.playground
  });
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamPage));
