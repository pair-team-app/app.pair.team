
import React, { Component } from 'react';
import './TeamPage.css';

import { push } from 'connected-react-router';
import { Strings } from 'lang-js-utils';
import LinkifyIt from 'linkify-it';
import { Menu, Item, Separator, Submenu, MenuProvider } from 'react-contexify';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';
import TextareaAutosize from 'react-autosize-textarea';

import BasePage from '../BasePage';
import BaseComment from '../../iterables/BaseComment';
import TeamPageFileDrop from './TeamPageFileDrop';

import { CommentSortTypes } from '../../sections/TopNav';
import { TEAM_TIMESTAMP } from '../../../consts/formats';
import { ENTER_KEY } from '../../../consts/key-codes';
import { Modals } from '../../../consts/uris';
import { fetchTeamComments, createComment, makeComment, makeTeamRule, modifyTeam, setComment, setPlayground, setTypeGroup, setCommentImage } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';

import 'react-contexify/dist/ReactContexify.min.css';
import { POPUP_TYPE_OK, POPUP_TYPE_ERROR } from '../../overlays/PopupNotification';


class TeamPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topSort         : [ ],
      teamDescription : '',
      ruleContent     : '',
      teamComment     : {
        text     : '',
        url      : null,
        filename : null,
        image    : null,
        code     : false
      },
      ruleInput       : false,
      sort            : CommentSortTypes.DATE,
      fetching        : 0x111,
      loading         : 0x000,
      share           : false,
      dragging        : false,
      keyPress        : false
    };

    this.ruleInput = React.createRef();
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
      this.setState({ fetching : fetching ^ 0x100 });
    }

    if ((loading & 0x001) === 0x001 && prevProps.team.description !== team.description) {
      this.setState({ loading : loading ^ 0x001 });
    }

    if ((loading & 0x010) === 0x010 && prevProps.team.rules !== team.rules) {
      // this.setState({ loading : loading ^ 0x010 });

      this.setState({
        ruleInput   : false,
        ruleContent : '',
        loading     : loading ^ 0x010
      });
    }

    if ((loading & 0x100) === 0x100 && prevProps.team.comments !== team.comments) {
      this.setState({ loading : loading ^ 0x100 });
    }

    if (team && prevProps.team && team.comments.length > prevProps.team.comments.length) {

    }

  }

  componentWillUnmount() {
		// console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });

    this.ruleInput = null;

    window.ondragenter = null;
    window.ondragleave = null;
		window.removeEventListener('paste', this.handleClipboardPaste);
	}

  handleAddRule = (event, key)=> {
    console.log('%s.handleAddRule()', this.constructor.name, { event, key });
    event.preventDefault();
    event.stopPropagation();

    const { ruleContent, loading } = this.state;
    const { keyCode } = event;

    if (key === 'esc') {
      this.setState({
        ruleContent : '',
        ruleInput   : false
      });

    } else if (key === 'ctrl' || key === 'meta' || key === 'shift') {
      if (keyCode === ENTER_KEY) {
        this.setState({ ruleContent  : `${ruleContent}\n` });
      }

    } else {
      if (ruleContent.length > 0 && (keyCode === ENTER_KEY)) {
        trackEvent('text', 'add-team-rule');
        this.setState({ loading : loading ^ 0x010 }, ()=> {
          this.props.makeTeamRule({ title : ruleContent });
          this.setState({ ruleInput : false });
        });
      }
    }
  };

  handleRuleInput = (event=null)=> {
    // console.log('%s.handleRuleInput()', this.constructor.name, { event });

    const { member } = this.props;
    if (member.roles.includes('admin')) {
      trackEvent('button', 'add-rule');

      this.ruleInput.focus();
      this.setState({
        ruleContent : '',
        ruleInput   : true
      });

    } else {
      this.props.onPopup({
        type     : POPUP_TYPE_ERROR,
        content  : 'You don\'t have access to edit this team\'s rules',
        duration : 2000
      });
    }
  };

  handleClipboardPaste = (event)=> {
    console.log('%s.handleClipboardPaste()', this.constructor.name, { event, data : event.clipboardData.getData('Text') });

    const preComment = event.clipboardData.getData('Text');
    if (preComment) {
      this.props.createComment(preComment);
    }
  };

  handleDragEnter = (event)=> {
    console.log('%s.handleDragEnter()', this.constructor.name, { event, dragging : this.state.dragging });
    event.preventDefault();

    const { dragging } = this.state;
    if (!dragging) {
      this.setState({ dragging : true }, ()=> {
        // if (window.location.hash !== Modals.FILE_DROP) {
        //  this.props.push(`${window.location.pathname}${Modals.FILE_DROP}`);
        // }
      });
    }

    // if (!window.location.href.includes(Modals.FILE_DROP)) {
    //   this.props.push(`${window.location.pathname}${Modals.FILE_DROP}`);
    // }
  };

  handleDragLeave = (event)=> {
    console.log('%s.handleDragLeave()', this.constructor.name, { event, client : { x : event.clientX, y : event.clientY }, dragging : this.state.dragging});
    event.preventDefault();

    const { dragging } = this.state;
    const { clientX, clientY } = event;

    if (dragging && (clientX + clientY === 0)) {
    // if (dragging) {
      this.setState({ dragging : false });
    }
  };

  handleFileDropClose = ()=> {
    console.log('%s.handleFileDropClose()', this.constructor.name);
    this.setState({ dragging : false });
  };

  handlePageKeyPress = (event, key)=> {
    console.log('%s.handlePageKeyPress()', this.constructor.name, { event, target : event.target, attribs : { elementID : event.target.id, className : event.target.className, attribs : event.target.getAttributeNames(), hasOverride : (event.target.getAttributeNames().findIndex((attrib)=> (attrib === 'data-keypress-override')) !== -1) }, key });

    const { target } = event;
    const { preComment } = this.props;
    if (target.getAttributeNames().findIndex((attrib)=> (attrib === 'data-keypress-override')) === -1 && !preComment) {
      this.props.createComment(key);
    }
  };

  handleCommentKeyPress = (event, key)=> {
    console.log('%s.handleCommentKeyPress()', this.constructor.name, { event, key });

    const { teamComment } = this.state;
    const { text } = teamComment;

    if (key === 'enter') {
      if (text.length > 0) {
        this.handleSubmitComment(event);
      }

    } else if (key === 'esc') {
      this.setState({
        teamComment : {
          text     : '',
          url      : null,
          image    : null,
          filename : null,
          code     : false
        }
      });
    }
  };

  handleCommentImageClick = (comment)=> {
    console.log('%s.handleCommentImageClick()', this.constructor.name, { comment });
    this.props.setCommentImage(comment);
  }

  handleCommentReply = (comment, key)=> {
    console.log('%s.handleCommentReply()', this.constructor.name, { comment, key });
    if (comment !== this.props.comment) {
      this.props.setComment(comment);
    }
  };

  handleCommentChange = (event)=> {
    console.log('%s.handleCommentChange()', this.constructor.name, { event });

    const { value : text } = event.target;
    const urls = (LinkifyIt().match(text) || []).map(({ url })=> (url));
    const url = (urls.length > 0) ? [ ...urls].shift() : null;

    const { teamComment } = this.state;

    this.setState({ teamComment : { ...teamComment, text }}, ()=> {
      if (url) {
        if (!this.state.teamComment.url && url) {
          this.setState({ teamComment : { ...teamComment, url }});
        }
      }
    });
  };

  handleSubmitComment = (event)=> {
    console.log('%s.handleSubmitComment()', this.constructor.name, { event });

    const { teamComment } = this.state;
    const { text, image, url, code } = teamComment;

    this.props.makeComment({ image,
      link     : (url || null),
			content  : (url !== null) ? null : text,
      format   : (code) ? 'code' : 'text'
    });

    this.setState({
      teamComment : {
        text  : '',
        url   : null,
        image : null,
        code  : false
      }
    });
  };

  handleUpdateTeamDescription = (event, key)=> {
    console.log('%s.handleUpdateTeamDescription()', this.constructor.name, { event, key });
    trackEvent('text', 'update-team-info');

    event.preventDefault();
    event.stopPropagation();

    const { team } = this.props;
    const { teamDescription, loading } = this.state;
    const { keyCode, target } = event;

    if (key === 'esc') {
      target.blur();

    } else if (key === 'meta' || key === 'ctrl') {
      if (keyCode === ENTER_KEY) {
        this.setState({ teamDescription : `${teamDescription}\n` });
      }

    } else {
      if (teamDescription !== team.description && (keyCode === ENTER_KEY)) {
        trackEvent('text', 'update-team-info');

        target.blur();
        this.setState({ loading : loading ^ 0x001 }, ()=> {
          this.props.modifyTeam({ description : teamDescription });
        });
      }
    }
  };

  handleTeamFocus = (event)=> {
    console.log('%s.handleTeamFocus()', this.constructor.name, { event });

    const { member } = this.props;
    if (!member.roles.includes('admin')) {
      this.props.onPopup({
        type     : POPUP_TYPE_ERROR,
        content  : 'You don\'t have access to edit this team',
        duration : 2000
      });
      event.target.blur();
    }
  };

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
    const { profile, team, member, sort } = this.props;
    const { teamDescription, ruleContent, ruleInput, teamComment, fetching, loading, dragging } = this.state;

    const infoLoading = Boolean(((loading << 0) & 0x001) === 0x001);
    const rulesLoading = Boolean(((loading << 0) & 0x010) === 0x010);
    const commentsLoading = Boolean(((loading << 0) & 0x100) === 0x100);
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state, infoLoading, rulesLoading, commentsLoading });
    // console.log('%s.render()', this.constructor.name, { infoLoading, rulesLoading, commentsLoading });

    return (<BasePage { ...this.props } className="team-page" data-file-drop={(window.location.href.includes('#create'))}>
      {(profile && team && member)
      ? (<div className="content-wrapper">
          <TeamPageCommentHeader teamComment={teamComment} onChange={this.handleCommentChange} onKeyPress={this.handleCommentKeyPress} onSubmit={this.handleSubmitComment} />

          <div className="scroll-wrapper">
            <div className="comments-wrapper" data-fetching={Boolean((fetching & 0x010) === 0x010)} data-loading={commentsLoading} data-empty={team && team.comments.length === 0}>
              <TeamPageCommentsPanel
                profile={profile}
                comments={(sort === CommentSortTypes.DATE) ? team.comments.sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)) : team.comments.sort((i, ii)=> ((i.score > ii.score) ? -1 : (i.score < ii.score) ? 1 : 0)).filter((comment)=> (comment !== null))}
                fetching={Boolean((fetching & 0x010) === 0x010)}
                loading={commentsLoading}
                sort={sort}
                onImageClick={this.handleCommentImageClick}
                onReplyKeyPress={this.handleCommentReply}
              />
            </div>

            <div className="team-wrapper" data-fetching={Boolean((fetching & 0x010) === 0x010)}>
              <div className="about-wrapper" data-processing={infoLoading}>
                <MenuProvider id="menu_id" className="menu-provider">
                  <div className="header">About</div>
                </MenuProvider>
                <div className="content"><KeyboardEventHandler handleKeys={['ctrl', 'meta', 'enter', 'esc']} onKeyEvent={(key, event)=> this.handleUpdateTeamDescription(event, key)}>
                  <TextareaAutosize id="team-info-txtarea" className="team-info-txtarea" placeholder="Describe your team" value={teamDescription} onFocusCapture={this.handleTeamFocus} onFocus={(e)=> console.log('=+=+=+=+=+=+=', 'onFocus', { e })} onChange={(event)=> this.setState({ teamDescription : event.target.value })} data-admin={member.roles.includes('admin')} data-keypress-override="true" />
                </KeyboardEventHandler></div>
                <div className="footer">
                  <div className="member-count">{team.userCount} {Strings.pluralize('member', team.userCount)}</div>
                  <div className="timestamp">CREATED {team.added.format(TEAM_TIMESTAMP)}</div>
                </div>
              </div>
              <div className="rules-wrapper" data-processing={rulesLoading}>
                <div className="header">Rules</div>
                <div className="content">
                  {(team.rules.map((rule, i)=> (<TeamPageRule key={i} rule={rule} ind={(i+1)} skeleton={false} />)))}
                  {(rulesLoading) && (<TeamPageRule key={-1} rule={{ title : ruleContent, content : null }} ind={(team.rules.length + 1)} skeleton={true} />)}
                </div>
                <div className="input-wrapper" data-input={ruleInput}>
                  <TeamPageAddRuleButton admin={member.roles.includes('admin')} disabled={rulesLoading} onClick={this.handleRuleInput} />
                  <KeyboardEventHandler handleKeys={['ctrl', 'meta', 'enter', 'esc']} handleFocusableElements onKeyEvent={(key, event)=> this.handleAddRule(event, key)}>
                    <TextareaAutosize id="team-add-rule-txtarea" placeholder="" value={ruleContent} onChange={(event)=> this.setState({ ruleContent : event.target.value })} ref={(el)=> this.ruleInput = (el) ? el : null} />
                  </KeyboardEventHandler>
                </div>
              </div>
            </div>
          </div>
        </div>)

      : (<div className="content-loading">Loading…</div>)}
      <TeamPageFileDrop dragging={(dragging)} onContent={(image)=> this.setState({ dragging : false })} onImageData={(filename, image)=> this.setState({ teamComment : { ...teamComment, filename, image }})} onClose={this.handleFileDropClose} />

      <MyAwesomeMenu onClick={({ event, props })=> { console.log('MenuClick', { event, props }); this.props.onPopup({
        type    : POPUP_TYPE_OK,
        content : 'Menu Clicked.'
      });}} />
    </BasePage>);
  }
}


const TeamPageCommentHeader = (props)=> {
  console.log('TeamPageCommentHeader()', { ...props });

  const { teamComment } = props;
  const { text, image, filename, url, code } = teamComment;

  return (<div className="team-page-comment-header">
    <KeyboardEventHandler handleKeys={['enter', 'esc']} onKeyEvent={(key, event)=> props.onKeyPress(event, key)}>
      <input type="text" className="comment-txt" placeholder="Type anything…" value={text} onChange={props.onChange} />
    </KeyboardEventHandler>
    {(image) && (<img src={image} alt={filename} />)}
    <button disabled={text.length === 0 && image === null} onClick={props.onSubmit}>Comment</button>
  </div>);
};

const TeamPageCommentsPanel = (props)=> {
	// console.log('TeamPageCommentsPanel()', { ...props });

	const { fetching, loading, profile, comments } = props;
  return (<div className="team-page-comments-panel" data-loading={fetching} data-empty={comments.length === 0}>
    <div className="empty-comments">No Comments</div>
		{(comments.map((comment, i)=> {
			const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);
			return (<TeamPageComment key={i} comment={comment}  loading={loading} vote={vote} onImageClick={props.onImageClick} onReplyKeyPress={props.onReplyKeyPress} />);
		}))}
	</div>);
};


const TeamPageComment = (props)=> {
  // console.log('TeamPageComment()', { props });

  const { loading, vote, comment } = props;
	return (<div className="team-page-comment" data-id={comment.id} data-author={comment.author.id} data-loading={loading}>
    <BaseComment loading={loading} vote={vote} comment={comment} onImageClick={props.onImageClick} onReplyKeyPress={props.onReplyKeyPress} />
  </div>);
};

const TeamPageRule = (props)=> {
  // console.log('TeamPageRule()', { props });

  const { rule, ind, skeleton } = props;
  const { title, content } = rule;
  const text = `${ind}. ${title}${(content) ? `\n${content}` : ''}`;
  return (<div className="team-page-rule" data-skeleton={skeleton}>{text}</div>);
};

const TeamPageAddRuleButton = (props)=> {
  // console.log('TeamPageAddRuleButton()', { props });
  const { admin, disabled } = props;

  return (<button disabled={disabled} className="quiet-button team-page-add-rule-button" onClick={props.onClick} data-admin={admin}>
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
    setComment        : (payload)=> dispatch(setComment(payload)),
    setCommentImage   : (payload)=> dispatch(setCommentImage(payload)),
    push              : (payload)=> dispatch(push(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    preComment : state.comments.preComment,
    comment    : state.comments.comment,
    profile    : state.user.profile,
    team       : state.teams.team,
    member     : state.teams.member,
    sort       : state.teams.sort,
    playground : state.playground
  });
};

// export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamPage));
export default connect(mapStateToProps, mapDispatchToProps)(TeamPage);
