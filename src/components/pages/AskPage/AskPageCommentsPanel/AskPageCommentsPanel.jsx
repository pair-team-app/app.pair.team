
import React from 'react';
import './AskPageCommentsPanel.css';

import FontAwesome from 'react-fontawesome';
import PlaygroundBaseComment from '../../PlaygroundPage/PlaygroundBaseComment';

import { VOTE_ACTION_UP, VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT } from './index';


function AskPageCommentsPanel(props) {
	console.log('AskPageCommentsPanel()', { ...props });

	const { loading, profile, comments } = props;


  const handleCommentClick = (event, comment)=> {

    event.preventDefault();
    window.location.href = `${window.location.href.replace(/\/app\/.*$/, comment.uri)}`;
  }


  return (<div className="ask-page-comments-panel" data-loading={loading}>
		<div className="comments-panel-item-wrapper">
			{(comments.map((comment, i)=> {
        const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);

        return (<PlaygroundBaseComment key={i} loading={loading} vote={vote} comment={comment} />);

				{/* return (<AskPageComment 
          key={i} 
          loading={loading} 
          author={(comment.author.id === profile.id)}
          vote={vote}
          comment={comment} 
          onClick={handleCommentClick}
          onVote={props.onVote}
          onDelete={props.onDelete} 
        />); */}
			}))}
		</div>
	</div>);
}

const AskPageComment = (props)=> {
  // console.log('AskPageComment()', props);

  const { loading, vote, comment, author } = props;

	const handleDelete = (event)=> {
		event.preventDefault();
		props.onDelete(comment);
	};

	return (<div className="ask-page-comment" data-id={comment.id} data-author={author} data-loading={loading}>
    <div className="vote-wrapper" data-disabled={(author || loading)} data-voted={vote !== null}>
      <FontAwesome name="sort-up" className="vote-arrow vote-arrow-up" data-selected={vote && vote.score === 1} onClick={()=> (vote && vote.score === 1) ? null : props.onVote({ comment, action : VOTE_ACTION_UP })} />
      <div className="vote-score" onClick={()=> (vote) ? props.onVote({ comment, action : VOTE_ACTION_RETRACT }) : null}>{comment.score}</div>
      <FontAwesome name="sort-down" className="vote-arrow vote-arrow-dn" data-selected={vote && vote.score === -1} onClick={()=> (vote && vote.score === -1) ? null : props.onVote({ comment, action : VOTE_ACTION_DOWN })} />
    </div>
		<PlaygroundBaseComment ind={-1} comment={{ ...comment, content : (comment.content || '--') }} onClick={(event)=> props.onClick(event, comment)} onDelete={handleDelete} />
 	</div>);
};


export default (AskPageCommentsPanel);
