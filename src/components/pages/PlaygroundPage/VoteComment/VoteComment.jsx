
import React from 'react';
import './VoteComment.css';

import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import PlaygroundBaseComment from '../PlaygroundBaseComment';
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
