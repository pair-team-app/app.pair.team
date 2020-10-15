
import React, { Component } from 'react';
import './BaseComment.css';
import { VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT, VOTE_ACTION_UP } from './index';

import { URIs } from 'lang-js-utils';
import LinkifyIt from 'linkify-it';
import FontAwesome from 'react-fontawesome';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';

import TeamPageFileDrop from '../../pages/TeamPage/TeamPageFileDrop';
import { CommentFilterTypes } from '../../sections/TopNav';
import { COMMENT_TIMESTAMP } from '../../../consts/formats';
import { makeComment, setComment, makeVote, modifyComment, setCommentImage } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';

import 'emoji-mart/css/emoji-mart.css';
class BaseComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
			replyContent : '',
			filename     : null,
      image        : null,
			codeType     : false,
			format       : CommentFilterTypes.NONE
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
		this.setState({ codeType : !this.state.codeType });
	};

	handleDeleteComment = (comment)=> {
		console.log('%s.handleDeleteComment()', this.constructor.name, { comment });
		trackEvent('button', 'delete-comment');

		this.props.modifyComment({ comment, action : 'deleted' });
		this.props.setComment(null);
	};

	handleResolveComment = (comment)=> {
		console.log('%s.handleResolveComment()', this.constructor.name, { comment });
		trackEvent('button', 'resolve-comment');

		this.props.modifyComment({ comment, action : (comment.state === 'open') ? 'resolved' : 'open' });
		this.props.setComment(null);
	};

	handleEmoji = (emoji, event)=> {
		console.log('%s.handleEmoji()', this.constructor.name, { emoji, event });
	};

	handleImageClick = (event)=> {
		console.log('%s.handleImageClick()', this.constructor.name, { event, comment : this.props.comment });
		const { comment } = this.props;
		this.props.setComment(comment);
		this.props.setCommentImage(true);
	};

	handleTextChange = (event)=> {
		// console.log('%s.handleTextChange()', this.constructor.name, event);
    const replyContent = event.target.value;

    this.setState({ replyContent });
	};

	handleReplyBlur = (event)=>{
		console.log('%s.handleReplyBlur()', this.constructor.name, { event });
		// this.props.setComment(null);
	};

	handleReplyKeyPress = (event, key)=> {
		console.log('%s.handleReplyKeyPress()', this.constructor.name, { props : this.props, event, key });

		const { replyContent } = this.state;
    if (key === 'enter' && replyContent.length > 0) {
      this.handleReplySubmit(event);

		} else if (key === 'esc') {
			this.setState({
				replyContent : '',
				codeType     : false
			}, ()=> {
				event.target.blur();
				this.props.setComment(null);
			});
		}
	};

	handleReplyFormat = (format)=> {
		console.log('%s.handleReplySubmit()', this.constructor.name, { format });
		this.setState({ format : (this.state.format === format) ? CommentFilterTypes.NONE : format });
	}

	handleReplyImage = (filename, image)=> {
		console.log('%s.handleReplyImage()', this.constructor.name, { filename, image });

		this.setState({ filename, image }, ()=> {
			const { comment } = this.props;
			this.props.setComment(comment);
		})
	};

	handleReplySubmit = (event)=> {
    console.log('%s.handleReplySubmit()', this.constructor.name, { event, comment : this.props.comment, state : this.state });

		const { comment } = this.props;
		const { format, replyContent, codeType : code, image } = this.state;

		trackEvent('button', 'reply-comment', comment.id);

		event.target.blur();
    event.preventDefault();
    event.stopPropagation();

		const urls = (LinkifyIt().match(replyContent) || []).map(({ url })=> (url));
    const url = (urls.length > 0) ? [ ...urls].shift() : null;

		const content = replyContent.replace(url, `<a href="${url}" target="_blank">${url}</a>`);

		this.props.makeComment({ code, format, image, content,
			link     : null,
			position : comment.position
		});

		this.setState({
			replyContent : '' ,
			codeType     : false,
			format       : CommentFilterTypes.NONE,
			image        : null,
			filename     : null
		});
  };

	handleVote = ({ comment, action })=> {
		console.log('%s.handleVote()', this.constructor.name, { comment, action });

		trackEvent('button', (action === VOTE_ACTION_UP) ? 'upvote-comment' : (action === VOTE_ACTION_DOWN) ? 'downvote-comment' : 'retract-vote');
    this.props.makeVote({ comment, action });
	};


	render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { profile, comment } = this.props;
		const { replyContent, codeType, format, image, filename } = this.state;
		const contentProps = { ...this.props, replyContent, codeType, format, image, filename };

		return (<div className="base-comment" data-id={comment.id} data-type={comment.type} data-author={comment.author.id === profile.id} data-votable={comment.votable} data-selected={comment.selected}>
			<BaseCommentHeader { ...this.props} onResolve={this.handleResolveComment} onDelete={this.handleDeleteComment} />
			<div className="comment-body">
				{(comment.votable) && (<BaseCommentVote { ...this.props } onVote={this.handleVote} />)}
				<BaseCommentContent { ...contentProps } onImageClick={this.handleImageClick} onReplyFocus={this.handleReplyFocus} onReplyBlur={this.handleReplyBlur} onReplyFormatClick={this.handleReplyFormat} onReplyKeyPress={this.handleReplyKeyPress} onReplySubmit={this.handleReplySubmit} onTextChange={this.handleTextChange} onDeleteReply={this.handleDeleteComment} onCodeToggle={this.handleCodeToggle} onImageData={this.handleReplyImage} />
				{/* <Picker set="apple" onSelect={this.handleEmoji} onClick={this.handleEmoji} perline={9} emojiSize={24} native={true} sheetSize={16} showPreview={false} showSkinTones={false} title="Pick your emoji…" emoji="point_up" style={{ position : 'relative', bottom : '20px', right : '20px' }} /> */}
			</div>
		</div>);
	}
}


const BaseCommentVote = (props=> {
	// console.log('BaseComment.BaseCommentVote()', { ...props });

	const { profile, comment, loading } = props;
	const vote = comment.votes.find(({ author })=> (author === profile.id));

	if (comment.id === 17371) {
		console.log('BaseComment.BaseCommentVote()', { ...props, vote });
	}

  return (<div className="base-comment-vote" data-id={comment.id} data-loading={loading} data-disabled={(comment.author.id === profile.id || loading)} data-voted={typeof vote !== 'undefined'}>
		<div className="vote-arrow" data-selected={typeof vote !== 'undefined' && vote.score === 1}><FontAwesome name="sort-up" onClick={()=> ((comment.author.id === profile.id) || (typeof vote !== 'undefined' && vote.score === 1)) ? null : props.onVote({ comment, action : VOTE_ACTION_UP })} /></div>
		<div className="score" onClick={()=> (comment.author.id !== profile.id && typeof vote !== 'undefined') ? props.onVote({ comment, action : VOTE_ACTION_RETRACT }) : null}>{comment.score}</div>
		<div className="vote-arrow" data-selected={typeof vote !== 'undefined' && vote.score === -1}><FontAwesome name="sort-down" onClick={()=> ((comment.author.id === profile.id) || (typeof vote !== 'undefined' && vote.score === -1)) ? null : props.onVote({ comment, action : VOTE_ACTION_DOWN })} /></div>
 	</div>);
});


const BaseCommentHeader = (props)=> {
	// console.log('BaseComment.BaseCommentHeader()', { props });

	const { profile, comment } = props;
	const { author, timestamp, types, format, state } = comment;
	// const { roles } = author;

	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment);
	};

	const handleResolve = (event)=> {
		event.preventDefault();
		props.onResolve(comment);
	};

	return (<div className="base-comment-header">
		<div className="avatar-wrapper">
			<div className="avatar-ico" data-id={author.id}>{author.email.split('').shift().toUpperCase()}</div>
		</div>
		<div className="info-wrapper">
			<div className="timestamp">Commented @ {timestamp.format(COMMENT_TIMESTAMP)}</div>
			{(state === 'resolved') && (<div className="link" onClick={handleResolve}>Reopen</div>)}
			{(format !== CommentFilterTypes.NONE && state === 'open' && (types.includes('op') || types.includes('project'))) && (<div className="link" onClick={handleResolve}>Resolve</div>)}
			{(profile.id === author.id) && (<div className="link" onClick={handleDelete}>Delete</div>)}
		</div>
	</div>);
};


const BaseCommentContent = (props)=> {
	// console.log('BaseComment.BaseCommentContent()', { props });

	const { comment, replyContent, codeType, preComment, format, image : replyImage, filename } = props;
	const { types, code, content, image, link, state } = comment;

	return (<div className="base-comment-content" data-format={format} data-resolved={(state === 'resolved')}>
		{(content) && (<div className="content" data-code={code}><span dangerouslySetInnerHTML={{ __html : content }}></span></div>)}
		{(image) && (<div className="image" onClick={props.onImageClick}><img src={image} alt={URIs.lastComponent(image)} /></div>)}
		{(link) && (<div className="link" dangerouslySetInnerHTML={{ __html : `<a href="${link}" target="_blank">${link}</a>`}}></div>)}
		{(comment.state !== 'resolved' && comment.state !== 'closed' && types.includes('team') && types.includes('op')) && (<div className="reply-form">
			<div>
				<KeyboardEventHandler handleKeys={['enter', `esc`]} isDisabled={(preComment !== null)} onKeyEvent={(key, event)=> props.onReplyKeyPress(event, key)}>
					<input type="text" placeholder="Reply…" value={replyContent} onFocus={props.onReplyFocus} onBlur={props.onReplyBlur} onChange={props.onTextChange} data-code={codeType} autoComplete="new-password" />
					<div className="format-wrapper">
						<label><input type="radio" name={`${comment.id}_format`} value={CommentFilterTypes.ISSUES} checked={(format === CommentFilterTypes.ISSUES)} onChange={()=> props.onReplyFormatClick(CommentFilterTypes.ISSUES)} onClick={(event)=> (event.target.checked && props.onReplyFormatClick(CommentFilterTypes.NONE))} />Issue</label>
          	<label><input type="radio" name={`${comment.id}_format`} value={CommentFilterTypes.BUGS} checked={(format === CommentFilterTypes.BUGS)} onChange={()=> props.onReplyFormatClick(CommentFilterTypes.BUGS)} onClick={(event)=> (event.target.checked && props.onReplyFormatClick(CommentFilterTypes.NONE))} />Bug</label>
          	<label><input type="radio" name={`${comment.id}_format`} value={CommentFilterTypes.REQUESTS} checked={(format === CommentFilterTypes.REQUESTS)} onChange={()=> props.onReplyFormatClick(CommentFilterTypes.REQUESTS)} onClick={(event)=> (event.target.checked && props.onReplyFormatClick(CommentFilterTypes.NONE))} />Request</label>
					</div>
				</KeyboardEventHandler>
			</div>
			{(replyImage)
      	? (<img src={replyImage} alt={filename} data-upload={replyImage !== null} />)
				: (<TeamPageFileDrop onContent={props.onContent} onImageData={props.onImageData} />)
			}
			<button disabled={replyContent.length === 0 && replyImage === null} onClick={props.onReplySubmit}>Reply</button>
			{/* <img src={btnCode} className="code-button" onClick={props.onCodeToggle} alt="Code" /> */}

		</div>)}

		{(comment.replies.length > 0) && (<BaseCommentReplies { ...props } onDelete={props.onDeleteReply} />)}
	</div>
	);
};


const BaseCommentReplies = (props)=> {
	// console.log('BaseComment.BaseCommentReplies()', { props });

	const { profile, comment } = props;
	return(<div className="base-comment-replies">
		{(comment.replies.map((reply, i)=> {
			const replyProps = { ...props, comment : reply }

			return (<div key={i} className="base-comment base-comment-reply" data-id={reply.id} data-type={comment.type} data-author={comment.author.id === profile.id} data-votable={comment.votable} data-selected={comment.selected}>
				<BaseCommentHeader { ...replyProps } onDelete={props.onDelete} />
				<div className="comment-body">
					<BaseCommentContent { ...replyProps } onTextChange={props.handleTextChange} onDeleteReply={props.handleDeleteComment} />
					{/* <Picker set="apple" onSelect={this.handleEmoji} onClick={this.handleEmoji} perline={9} emojiSize={24} native={true} sheetSize={16} showPreview={false} showSkinTones={false} title="Pick your emoji…" emoji="point_up" style={{ position : 'relative', bottom : '20px', right : '20px' }} /> */}
				</div>
			</div>);
		}))}
	</div>);
};


const mapDispatchToProps = (dispatch)=> {
  return ({
		makeComment     : (payload)=> dispatch(makeComment(payload)),
		setComment      : (payload)=> dispatch(setComment(payload)),
		setCommentImage : (payload)=> dispatch(setCommentImage(payload)),
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
