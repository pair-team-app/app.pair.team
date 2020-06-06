
import React from 'react';
import PlaygroundBaseComment from '../../../iterables/BaseComment';
import './TeamPageCommentsPanel.css';


function TeamPageCommentsPanel(props) {
	// console.log('TeamPageCommentsPanel()', { ...props });

	const { loading, profile, comments } = props;
  return (<div className="ask-page-comments-panel" data-loading={loading}>
		<div className="comments-panel-item-wrapper">
			{(comments.map((comment, i)=> {
        const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);
        return (<TeamPageComment key={i} comment={comment}  loading={loading} vote={vote} />);
			}))}
		</div>
	</div>);
}


const TeamPageComment = (props)=> {
  // console.log('TeamPageComment()', props);

  const { loading, vote, comment } = props;
	return (<div className="ask-page-comment" data-id={comment.id} data-author={comment.author.id} data-loading={loading}>
    <PlaygroundBaseComment loading={loading} vote={vote} comment={comment} />
  </div>);
};


export default (TeamPageCommentsPanel);
