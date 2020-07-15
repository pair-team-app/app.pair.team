
import React from 'react';
import './TeamPageCommentsPanel.css';
import PlaygroundBaseComment from '../../../iterables/BaseComment';


function TeamPageCommentsPanel(props) {
	// console.log('TeamPageCommentsPanel()', { ...props });

	const { loading, profile, comments } = props;
  return (<div className="team-page-comments-panel" data-loading={loading}>
		{(comments.map((comment, i)=> {
			const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);
			return (<TeamPageComment key={i} comment={comment}  loading={loading} vote={vote} />);
		}))}
	</div>);
}


const TeamPageComment = (props)=> {
  console.log('TeamPageComment()', props);

  const { loading, vote, comment } = props;
	return (<div className="team-page-comment" data-id={comment.id} data-author={comment.author.id} data-loading={loading}>
    <PlaygroundBaseComment loading={loading} vote={vote} comment={comment} />
  </div>);
};


export default (TeamPageCommentsPanel);
