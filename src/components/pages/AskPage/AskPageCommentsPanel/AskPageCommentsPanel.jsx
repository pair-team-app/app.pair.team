
import React from 'react';
import './AskPageCommentsPanel.css';

import FontAwesome from 'react-fontawesome';
import PlaygroundBaseComment from '../../PlaygroundPage/PlaygroundBaseComment';

import { SORT_BY_SCORE, SORT_BY_DATE } from '../AskPageHeader';
import { VOTE_ACTION_UP, VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT } from './index';


function AskPageCommentsPanel(props) {
// 	console.log('AskPageCommentsPanel()', props);

	const { loading, profile, sort, comments } = props;
  const handleVote = ({ comment, action })=> {
    const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);
    // console.log('AskPageCommentsPanel.handleVote()', { comment, action, vote });

    props.onVote({ comment, action, vote });
  };

	return (<div className="ask-page-comments-panel" data-loading={loading}>
		<div className="comments-panel-item-wrapper">
			{(comments.sort((i, ii)=> ((sort === SORT_BY_SCORE) ? (i.score > ii.score) ? -1 : (i.score < ii.score) ? 1 : 0 : (i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)).map((comment, i)=> {
        const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);

				return (<AskPageComment 
          key={i} 
          loading={loading} 
          disabled={(comment.author.id === profile.id)} 
          vote={vote}
          comment={comment} 
          onVote={handleVote}
          onDelete={props.onDelete} 
        />);
			}))}
		</div>
	</div>);
}

const AskPageComment = (props)=> {
  console.log('AskPageComment()', props);

  const { loading, disabled, vote, comment } = props;

	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment.id);
	};

	return (<div className="ask-page-comment" data-id={comment.id} data-loading={loading}>
    <div className="vote-wrapper" data-disabled={disabled}>
      <FontAwesome name="sort-up" className="vote-arrow vote-arrow-up" data-selected={vote && vote.score === 1} onClick={()=> props.onVote({ comment, action : VOTE_ACTION_UP })} />
      <div className="vote-score">{comment.score}</div>
      <FontAwesome name="sort-down" className="vote-arrow vote-arrow-dn" data-selected={vote && vote.score === -1} onClick={()=> props.onVote({ comment, action : VOTE_ACTION_DOWN })} />
    </div>
		<PlaygroundBaseComment ind={-1} comment={comment} onDelete={handleDelete} />
 	</div>);
};


export default (AskPageCommentsPanel);
