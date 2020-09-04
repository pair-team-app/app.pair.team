
import React, { Component } from 'react';
import './BaseComment.css';
import { VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT, VOTE_ACTION_UP } from './index';

import { URIs } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';

import { COMMENT_TIMESTAMP } from '../../../consts/formats';
import { USER_DEFAULT_AVATAR } from '../../../consts/uris';
import { makeComment, setComment, makeVote, modifyComment } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';

import 'emoji-mart/css/emoji-mart.css';
class BaseComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
			replyContent : '',
			codeFormat   : false
		};
	}

	componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

	componentWillUnmount() {
		// console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });
	}

	handleReplyFocus = ()=> {
		// console.log('%s.handleReplyFocus()', this.constructor.name);
		const { comment } = this.props;
		this.props.setComment(comment);
	};

	handleCodeToggle = ()=> {
		console.log('%s.handleCodeToggle()', this.constructor.name);
		this.setState({ codeFormat : !this.state.codeFormat });
	};

	handleDeleteComment = (comment)=> {
		console.log('%s.handleDeleteComment()', this.constructor.name, { comment });
		trackEvent('button', 'delete-comment');
		this.props.modifyComment({ comment, action : 'deleted' });
		this.props.setComment(null);
	};

	handleEmoji = (emoji, event)=> {
		console.log('BaseComment.handleEmoji()', { emoji, event });
	};

	handleTextChange = (event)=> {
		// console.log('%s.handleTextChange()', this.constructor.name, event);
    const replyContent = event.target.value;
    this.setState({ replyContent });
	};

	handleReplyKeyPress = (event, key)=> {
		console.log('BaseCommentContent.handleReplyKeyPress()', this.constructor.name, { props : this.props, event, key });

		const { replyContent } = this.state;
    if (key === 'enter' && replyContent.length > 0) {
      this.handleReplySubmit(event);

		} else if (key === 'esc') {
			this.setState({
				replyContent : '',
				codeFormat   : false
			}, ()=> {
				event.target.blur();
				this.props.setComment(null);
			});
		}
	};

	handleReplySubmit = (event)=> {
    console.log('BaseCommentContent.handleReplySubmit()', this.constructor.name, { event });

		const { comment } = this.props;
		const { replyContent, codeFormat } = this.state;

		trackEvent('button', 'reply-comment', comment.id);

		event.target.blur();
    event.preventDefault();
    event.stopPropagation();

		this.props.makeComment({ comment,
			content  : replyContent,
			format   : (codeFormat) ? 'code' : 'text',
			position : comment.position
		});

		this.setState({
			replyContent : '' ,
			codeFormat   : false
		});
  };

	handleVote = ({ comment, action })=> {
		console.log('BaseComment.handleVote()', this.constructor.name, { comment, action });

		trackEvent('button', (action === VOTE_ACTION_UP) ? 'upvote-comment' : (action === VOTE_ACTION_DOWN) ? 'downvote-comment' : 'retract-vote');
    this.props.makeVote({ comment, action });
	}


	render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { profile, comment } = this.props;
		const { replyContent, codeFormat } = this.state;
		const contentProps = { ...this.props, replyContent, codeFormat };

		return (<div className="base-comment" data-id={comment.id} data-type={comment.type} data-author={comment.author.id === profile.id} data-votable={comment.votable} data-selected={comment.selected}>
			<BaseCommentHeader { ...this.props} onDelete={this.handleDeleteComment} />
			<div className="comment-body">
				{(comment.votable) && (<BaseCommentVote { ...this.props } onVote={this.handleVote} />)}
				<BaseCommentContent { ...contentProps } onReplyFocus={this.handleReplyFocus} onReplyKeyPress={this.handleReplyKeyPress} onTextChange={this.handleTextChange} onDeleteReply={this.handleDeleteComment} onCodeToggle={this.handleCodeToggle} />
				{/* <Picker set="apple" onSelect={this.handleEmoji} onClick={this.handleEmoji} perline={9} emojiSize={24} native={true} sheetSize={16} showPreview={false} showSkinTones={false} title="Pick your emoji…" emoji="point_up" style={{ position : 'relative', bottom : '20px', right : '20px' }} /> */}
			</div>
		</div>);
	}
}


const BaseCommentVote = (props=> {
	// console.log('BaseComment.BaseCommentVote()', { props });

	const { profile, comment, loading, vote } = props;
  return (<div className="base-comment-vote" data-id={comment.id} data-loading={loading} data-disabled={(comment.author.id === profile.id || loading)} data-voted={vote !== null}>
		<FontAwesome name="sort-up" className="vote-arrow vote-arrow-up" data-selected={vote && vote.score === 1} onClick={()=> ((comment.author.id === profile.id) || (vote && vote.score === 1)) ? null : props.onVote({ comment, action : VOTE_ACTION_UP })} />
		<div className="score" onClick={()=> (comment.author.id !== profile.id && vote) ? props.onVote({ comment, action : VOTE_ACTION_RETRACT }) : null}>{comment.score}</div>
		<FontAwesome name="sort-down" className="vote-arrow vote-arrow-dn" data-selected={vote && vote.score === -1} onClick={()=> ((comment.author.id === profile.id) || (vote && vote.score === -1)) ? null : props.onVote({ comment, action : VOTE_ACTION_DOWN })} />
 	</div>);
});


const BaseCommentHeader = (props)=> {
	// console.log('BaseComment.BaseCommentHeader()', { props });

	const { profile, comment } = props;
	const { author, timestamp } = comment;
	// const { roles } = author;

	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment);
	};

	return (<div className="base-comment-header">
		<div className="avatar-wrapper">
			<img className="avatar-ico" src={(!author.avatar) ? USER_DEFAULT_AVATAR : author.avatar} alt={author.username} data-id={author.id} />
		</div>
		<div className="info-wrapper">
			{/* <div className="timestamp" dangerouslySetInnerHTML={{ __html : timestamp.format(COMMENT_TIMESTAMP).replace(/(\d{1,2})(\w{2}) @/, (match, p1, p2)=> (`${p1}<sup>${p2}</sup> @`)) }} /> */}
			<div className="timestamp">Commented @ {timestamp.format(COMMENT_TIMESTAMP)}</div>
			{(profile.id === author.id) && (<div className="link" onClick={handleDelete}>Delete</div>)}
		</div>
	</div>);
};


const BaseCommentContent = (props)=> {
	// console.log('BaseComment.BaseCommentContent()', { props });

	const { comment, replyContent, codeFormat, preComment } = props;
	const { types, format, content, image, link } = comment;

	return (<div className="base-comment-content">
		{(content) && (<div className="content" data-format={format}>{content}</div>)}
		{(image) && (<div className="image"><img src={image} alt={URIs.lastComponent(image)} /></div>)}
		{(link) && (<div className="link" dangerouslySetInnerHTML={{ __html : `<a href="${link}" target="_blank">${link}</a>`}}></div>)}
		{(comment.state !== 'closed' && types.includes('team') && types.includes('op')) && (<div className="reply-form">
			<KeyboardEventHandler handleKeys={['enter', `esc`]} isDisabled={(preComment !== null)} onKeyEvent={(key, event)=> props.onReplyKeyPress(event, key)}>
				<input type="text" placeholder="Reply…" value={replyContent} onFocus={props.onReplyFocus} onChange={props.onTextChange} data-code={codeFormat} autoComplete="new-password" />
			</KeyboardEventHandler>
			{/* <img src={btnCode} className="code-button" onClick={props.onCodeToggle} alt="Code" /> */}
		</div>)}

		{(comment.replies.length > 0) && (<BaseCommentReplies { ...props } onDelete={props.onDeleteReply} />)}
	</div>
	);
}


const BaseCommentReplies = (props)=> {
	// console.log('BaseComment.BaseCommentReplies()', { props });

	const { profile, comment } = props;
	return(<div className="base-comment-replies">
		{(comment.replies.map((reply, i)=> {
			const replyProps = { ...props, comment : reply }

			return (<div key={i} className="base-comment base-comment-reply" data-id={comment.id} data-type={comment.type} data-author={comment.author.id === profile.id} data-votable={comment.votable} data-selected={comment.selected}>
				<BaseCommentHeader { ...replyProps } onDelete={props.onDelete} />
				<div className="comment-body">
					{(comment.votable) && (<BaseCommentVote { ...replyProps } onVote={props.handleVote} />)}
					<BaseCommentContent { ...replyProps } onTextChange={props.handleTextChange} onDeleteReply={props.handleDeleteComment} />
					{/* <Picker set="apple" onSelect={this.handleEmoji} onClick={this.handleEmoji} perline={9} emojiSize={24} native={true} sheetSize={16} showPreview={false} showSkinTones={false} title="Pick your emoji…" emoji="point_up" style={{ position : 'relative', bottom : '20px', right : '20px' }} /> */}
				</div>
			</div>);
		}))}
	</div>);
};


const mapDispatchToProps = (dispatch)=> {
  return ({
		makeComment   : (payload)=> dispatch(makeComment(payload)),
		setComment    : (payload)=> dispatch(setComment(payload)),
    modifyComment : (payload)=> dispatch(modifyComment(payload)),
		makeVote      : (payload)=> dispatch(makeVote(payload))
	});
};


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile    : state.user.profile,
		preComment : state.comments.preComment
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(BaseComment);
