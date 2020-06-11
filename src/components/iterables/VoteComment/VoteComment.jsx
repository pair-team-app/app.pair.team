
import React from 'react';
import './VoteComment.css';

import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import BaseComment from '../BaseComment';
import { VOTE_ACTION_UP, VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT } from './index';


function VoteComment(props) {
	// console.log('VoteComment()', { ...props });

	const { loading, profile, activeComment, comment } = props;
  const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);
  const disabled = (comment.author.id === profile.id || loading);

	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment);
	};

  const handleSelect = (event)=> {
    props.setComment(comment);
  };

  const handleVote = (event, { comment, action })=> {
    event.preventDefault();

    if (action === VOTE_ACTION_UP) {
      if (!vote || vote.score !== 1) {
        props.onVote({ comment, action });
      }

    } else if (action === VOTE_ACTION_DOWN) {
      if (!vote || vote.score !== -1) {
        props.onVote({ comment, action });
      }

    } else if (action === VOTE_ACTION_RETRACT) {
      if (vote) {
        props.onVote({ comment, action });
      }
    }
  };

  const { comment } = this.props;
  const { replyContent } = this.state;

  const contentProps = { ...this.props, replyContent};

  return (<BaseComment
  
  <div className="base-comment" data-id={comment.id} data-type={comment.type} data-votable={comment.votable} data-selected={comment.selected}>
    <BaseCommentHeader { ...this.props} onDelete={this.handleDeleteComment} />
    <div className="comment-body">
      {(comment.votable) && (<BaseCommentVote { ...this.props } onVote={this.handleVote} />)}
      <BaseCommentContent { ...contentProps } onTextChange={this.handleTextChange} onDeleteReply={this.handleDeleteComment} />
      {/* <Picker set="apple" onSelect={this.handleEmoji} onClick={this.handleEmoji} perline={9} emojiSize={24} native={true} sheetSize={16} showPreview={false} showSkinTones={false} title="Pick your emoji…" emoji="point_up" style={{ position : 'relative', bottom : '20px', right : '20px' }} /> */}
    </div>
  </div>);

	return (<div className="vote-comment" data-id={comment.id} data-loading={loading}>
    <div className="vote-wrapper" data-disabled={disabled} data-voted={vote !== null}>
      <FontAwesome name="sort-up" className="vote-arrow vote-arrow-up" data-selected={vote && vote.score === 1} onClick={(event)=> handleVote(event, { comment, action : VOTE_ACTION_UP })} />
      <div className="vote-score" onClick={(event)=> handleVote(event, { comment, action : VOTE_ACTION_RETRACT })}>{comment.score}</div>
      <FontAwesome name="sort-down" className="vote-arrow vote-arrow-dn" data-selected={vote && vote.score === -1} onClick={(event)=> handleVote(event, { comment, action : VOTE_ACTION_DOWN })} />
    </div>
		<PlaygroundBaseComment ind={-1} comment={{ ...comment, selected : (comment.id === activeComment.id) }} onSelect={handleSelect} onDelete={handleDelete} />
 	</div>);
};


const mapStateToProps = (state, ownProps)=> {
  return {
    activeComment : state.comment,
    profile       : state.userProfile
  };
};


export default  connect(mapStateToProps)(VoteComment);
