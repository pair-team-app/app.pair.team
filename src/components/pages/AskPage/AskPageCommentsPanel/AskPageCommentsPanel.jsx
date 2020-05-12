
import React from 'react';
import './AskPageCommentsPanel.css';
import PlaygroundBaseComment from '../../PlaygroundPage/PlaygroundBaseComment';


function AskPageCommentsPanel(props) {
	// console.log('AskPageCommentsPanel()', { ...props });

	const { loading, profile, comments } = props;
  return (<div className="ask-page-comments-panel" data-loading={loading}>
		<div className="comments-panel-item-wrapper">
			{(comments.map((comment, i)=> {
        const vote = (comment.votes.find(({ author, score })=> (author.id === profile.id && score !== 0 )) || null);
        return (<AskPageComment key={i} comment={comment}  loading={loading} vote={vote} />);
			}))}
		</div>
	</div>);
}


const AskPageComment = (props)=> {
  // console.log('AskPageComment()', props);

  const { loading, vote, comment } = props;
	return (<div className="ask-page-comment" data-id={comment.id} data-author={comment.author.id} data-loading={loading}>
    <PlaygroundBaseComment loading={loading} vote={vote} comment={comment} />
  </div>);
};


export default (AskPageCommentsPanel);
