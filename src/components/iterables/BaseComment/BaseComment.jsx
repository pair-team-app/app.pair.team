
import React, { Component } from 'react';
import './BaseComment.css';
import { VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT, VOTE_ACTION_UP } from './index';

import 'emoji-mart/css/emoji-mart.css';
import FontAwesome from 'react-fontawesome';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';

import { COMMENT_TIMESTAMP } from '../../../consts/formats';
import { ENTER_KEY } from '../../../consts/key-codes';
import { USER_DEFAULT_AVATAR } from '../../../consts/uris';
import { makeComment, makeVote, modifyComment } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';

class BaseComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
			replyContent : ''
		};
	}

	componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

		document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

	componentWillUnmount() {
		// console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });

		document.removeEventListener('keydown', this.handleKeyDown);
	}


	handleDeleteComment = (comment)=> {
		console.log('%s.handleDeleteComment()', this.constructor.name, { comment });
		this.props.modifyComment({ comment, action : 'deleted' });
	};

	handleKeyDown = (event)=> {
    // console.log('%s.handleKeyDown()', this.constructor.name, { event });

    const { replyContent } = this.state;
    if (event.keyCode === ENTER_KEY && replyContent.length > 0) {
      this.handleReplySubmit(event);
    }
  }

	handleTextChange = (event)=> {
		// console.log('%s.handleTextChange()', this.constructor.name, { event });

    const replyContent = event.target.value;
    this.setState({ replyContent });
	};

	handleEmoji = (emoji, event)=> {
		console.log('BaseComment.handleEmoji()', { emoji, event });
	};


	handleReplyKeyPress = (event, key)=> {
		console.log('BaseCommentContent.handleReplyKeyPress()', this.constructor.name, { props : this.props, event, key });

		const { comment } = this.props;
		this.setState({ replyContent : key }, ()=> {
			this.setState({ replyContent : '' }, ()=> {
				this.props.onReplyKeyPress(comment, key);
			});
		});
	};

	handleReplySubmit = (event)=> {
    console.log('BaseCommentContent.handleReplySubmit()', this.constructor.name, { event });

		const { comment } = this.props;
		const { replyContent } = this.state;

		trackEvent('button', 'reply-comment', comment.id);

    event.preventDefault();
    event.stopPropagation();


		this.props.makeComment({ comment,
			content  : replyContent,
			position : comment.position
		});

		this.setState({ replyContent : '' });
  };

	handleVote = ({ comment, action })=> {
		console.log('BaseComment.handleVote()', this.constructor.name, { comment, action });

		// trackEvent('button', (action === VOTE_ACTION_UP) ? 'upvote-comment' : (action === VOTE_ACTION_DOWN) ? 'downvote-comment' : 'retract-vote');
    this.props.makeVote({ comment, action });
	}


	render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { profile, comment } = this.props;
		const { replyContent } = this.state;

		const contentProps = { ...this.props, replyContent };

		return (<div className="base-comment" data-id={comment.id} data-type={comment.type} data-author={comment.author.id === profile.id} data-votable={comment.votable} data-selected={comment.selected}>
			<BaseCommentHeader { ...this.props} onDelete={this.handleDeleteComment} />
			<div className="comment-body">
				{(comment.votable) && (<BaseCommentVote { ...this.props } onVote={this.handleVote} />)}
				{/* <BaseCommentContent { ...contentProps } onTextChange={this.handleTextChange} onDeleteReply={this.handleDeleteComment} /> */}
				<BaseCommentContent { ...contentProps } onReplyKeyPress={this.handleReplyKeyPress} onDeleteReply={this.handleDeleteComment} />
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

	const { profile, ind, comment } = props;
	const { author } = comment;
	// const { roles } = author;

	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment);
	};

	return (<div className="base-comment-header">
		<div className="icon-wrapper">
			{(ind >= 0) && (<div className="icon avatar-wrapper"><div>{ind}</div></div>)}
			<div className="icon avatar-wrapper"><img src={(!author.avatar) ? USER_DEFAULT_AVATAR : author.avatar} alt={author.username} data-id={author.id} /></div>
		</div>
		<div className="spacer" />
		<div className="link-wrapper">
			{(profile.id === author.id) && (<div className="link" onClick={handleDelete}>Delete</div>)}
		</div>
	</div>);
};


const BaseCommentContent = (props)=> {
	// console.log('BaseComment.BaseCommentContent()', { props });

	const { comment, replyContent } = props;
	const { author, types, content, timestamp } = comment;

	return (<div className="base-comment-content">
		<div className="timestamp" dangerouslySetInnerHTML={{ __html : timestamp.format(COMMENT_TIMESTAMP).replace(/(\d{1,2})(\w{2}) @/, (match, p1, p2)=> (`${p1}<sup>${p2}</sup> @`)) }} />
		{(content) && (<div className="content" dangerouslySetInnerHTML={{ __html : content.replace(author.username, `<span class="txt-bold">${author.username}</span>`) }} />)}
		{(comment.state !== 'closed' && types.find((type)=> (type === 'op'))) && (<KeyboardEventHandler className="reply-form" handleKeys={['alphanumeric']} isDisabled={(replyContent.length > 0)} onKeyEvent={(key, event)=> props.onReplyKeyPress(event, key)}>
			{/* <input type="text" placeholder="Reply…" value={replyContent} onChange={props.onTextChange} autoComplete="new-password" /> */}
			<input type="text" placeholder="Reply…" value={replyContent} readOnly autoComplete="new-password" />
			{/* <Picker set="apple" onSelect={this.handleEmoji} onClick={this.handleEmoji} perline={9} emojiSize={24} native={true} sheetSize={20} showPreview={true} showSkinTones={true} title="Pick your emoji…" emoji="point_up" style={{ position : 'relative', bottom : '20px', right : '20px' }} /> */}
		</KeyboardEventHandler>)}
		{(comment.replies.length > 0) && (<BaseCommentReplies { ...props } onDelete={props.onDeleteReply} />)}
	</div>
	);
}


const BaseCommentReplies = (props)=> {
	// console.log('BaseComment.BaseCommentReplies()', { props });

	const { profile, comment } = props;

	const handleDelete = (event, reply)=> {
		event.preventDefault();
		props.onDelete(reply);
	};

	return(<div className="base-comment-replies">
		{(comment.replies.map((reply, i)=> {
			const replyProps = { ...props, comment : reply }

			return (<div key={i} className="base-comment base-comment-reply" data-id={comment.id} data-type={comment.type} data-author={comment.author.id === profile.id} data-votable={comment.votable} data-selected={comment.selected}>
				<BaseCommentHeader { ...replyProps } onDelete={handleDelete} />
				<div className="comment-body">
					{(comment.votable) && (<BaseCommentVote { ...props } onVote={props.handleVote} />)}
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
    modifyComment : (payload)=> dispatch(modifyComment(payload)),
		makeVote      : (payload)=> dispatch(makeVote(payload))
	});
};


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.user.profile
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(BaseComment);
