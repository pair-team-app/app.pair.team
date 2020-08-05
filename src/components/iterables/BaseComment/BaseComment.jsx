
import React, { Component } from 'react';
import './BaseComment.css';
import { VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT, VOTE_ACTION_UP } from './index';

import 'emoji-mart/css/emoji-mart.css';
import FontAwesome from 'react-fontawesome';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';

import { COMMENT_TIMESTAMP } from '../../../consts/formats';
import { USER_DEFAULT_AVATAR } from '../../../consts/uris';
import { createComment, setComment, makeVote, modifyComment } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';

class BaseComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
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


	handleDeleteComment = (comment)=> {
		console.log('%s.handleDeleteComment()', this.constructor.name, { comment });
		trackEvent('button', 'delete-comment');
		this.props.modifyComment({ comment, action : 'deleted' });
	};

	handleEmoji = (emoji, event)=> {
		console.log('BaseComment.handleEmoji()', { emoji, event });
	};


	handleReplyKeyPress = (event, key)=> {
		console.log('BaseCommentContent.handleReplyKeyPress()', this.constructor.name, { props : this.props, event, key });

		const { comment, preComment } = this.props;
		if (!preComment) {
			this.props.setComment(comment);
			this.props.createComment(key);
		}
	};

	handleVote = ({ comment, action })=> {
		console.log('BaseComment.handleVote()', this.constructor.name, { comment, action });

		trackEvent('button', (action === VOTE_ACTION_UP) ? 'upvote-comment' : (action === VOTE_ACTION_DOWN) ? 'downvote-comment' : 'retract-vote');
    this.props.makeVote({ comment, action });
	}


	render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { profile, comment } = this.props;
		return (<div className="base-comment" data-id={comment.id} data-type={comment.type} data-author={comment.author.id === profile.id} data-votable={comment.votable} data-selected={comment.selected}>
			<BaseCommentHeader { ...this.props} onDelete={this.handleDeleteComment} />
			<div className="comment-body">
				{(comment.votable) && (<BaseCommentVote { ...this.props } onVote={this.handleVote} />)}
				<BaseCommentContent { ...this.props } onReplyKeyPress={this.handleReplyKeyPress} onDeleteReply={this.handleDeleteComment} />
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

	const { comment, preComment } = props;
	const { author, types, content, timestamp } = comment;

	return (<div className="base-comment-content">
		<div className="timestamp" dangerouslySetInnerHTML={{ __html : timestamp.format(COMMENT_TIMESTAMP).replace(/(\d{1,2})(\w{2}) @/, (match, p1, p2)=> (`${p1}<sup>${p2}</sup> @`)) }} />
		{(content) && (<div className="content" dangerouslySetInnerHTML={{ __html : content.replace(author.username, `<span class="txt-bold">${author.username}</span>`) }} />)}
		{(comment.state !== 'closed' && types.find((type)=> (type === 'op'))) && (<KeyboardEventHandler className="reply-form" handleKeys={['alphanumeric']} isDisabled={(preComment !== null)} onKeyEvent={(key, event)=> props.onReplyKeyPress(event, key)}>
			<input type="text" placeholder="Reply…" value="" onChange={(event)=> null} autoComplete="new-password" />
		</KeyboardEventHandler>)}
		{(comment.replies.length > 0) && (<BaseCommentReplies { ...props } onDelete={props.onDeleteReply} />)}
	</div>
	);
}


const BaseCommentReplies = (props)=> {
	console.log('BaseComment.BaseCommentReplies()', { props });

	const { profile, comment } = props;
	return(<div className="base-comment-replies">
		{(comment.replies.map((reply, i)=> {
			const replyProps = { ...props, comment : reply }

			return (<div key={i} className="base-comment base-comment-reply" data-id={comment.id} data-type={comment.type} data-author={comment.author.id === profile.id} data-votable={comment.votable} data-selected={comment.selected}>
				<BaseCommentHeader { ...replyProps } onDelete={props.onDelete} />
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
		createComment   : (payload)=> dispatch(createComment(payload)),
		setComment      : (payload)=> dispatch(setComment(payload)),
    modifyComment   : (payload)=> dispatch(modifyComment(payload)),
		makeVote        : (payload)=> dispatch(makeVote(payload))
	});
};


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile    : state.user.profile,
		preComment : state.comments.preComment
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(BaseComment);
