
import React from 'react';
import './PlaygroundBaseComment.css';

import { connect } from 'react-redux';

import { COMMENT_TIMESTAMP } from '../../../../consts/formats';
import { USER_DEFAULT_AVATAR } from '../../../../consts/uris';
import { NavLink } from 'react-router-dom';
import { Strings } from 'lang-js-utils';


function PlaygroundBaseComment(props) {
// 	console.log('PlaygroundBaseComment()', props);

	const { profile, ind, comment } = props;
	const { id, src, type, author, content, uri, timestamp } = comment;


	return (<div className="playground-base-comment" data-id={id} data-type={type} data-selected={comment.selected}>
		<div className="playground-base-comment-header-wrapper">
			<div className="playground-base-comment-header-icon-wrapper">
				{(src !== 'npm' && ind >= 0) && (<div className="playground-base-comment-header-icon avatar-wrapper"><div>{ind}</div></div>)}
				<div className="playground-base-comment-header-icon avatar-wrapper"><img src={(!author.avatar) ? USER_DEFAULT_AVATAR : author.avatar} alt={author.username} data-id={author.id} /></div>
			</div>
			<div className="playground-base-comment-header-spacer" />
			<div className="playground-base-comment-header-link-wrapper">
				{(profile && profile.id === author.id && src === 'user') && (<div className="playground-base-comment-header-link" onClick={props.onDelete}>Delete</div>)}
			</div>
		</div>

		<div className="playground-base-comment-timestamp" dangerouslySetInnerHTML={{ __html : timestamp.format(COMMENT_TIMESTAMP).replace(/(\d{1,2})(\w{2}) @/, (match, p1, p2)=> (`${p1}<sup>${p2}</sup> @`)) }} />
		{(content) && (<div className="playground-base-comment-content" dangerouslySetInnerHTML={{ __html : content.replace(author.username, `<span class="txt-bold">${author.username}</span>`) }} />)}

		
		{/* {(type === 'component') && (<NavLink className="playground-base-comment-uri" to={uri}>{window.location.href.replace(/\/app\/.*$/, comment.uri)}</NavLink>)} */}
		{(type === 'component') && (<div className="playground-base-comment-uri" onClick={props.onClick}>{Strings.truncate(window.location.href.replace(/\/app\/.*$/, comment.uri), 60)}</div>)}
		{(comment.replies.length > 0) && (<div className="base-comment-replies-wrapper">
			{(comment.replies.map((reply, i)=> {
				return (<BaseCommentReply key={i} comment={reply} onDelete={props.onDelete} />);
			}))}
		</div>)}
	</div>);
}


const BaseCommentReply = (props)=> {
	console.log('PlaygroundBaseComment.BaseCommentReply()', props);

	const { profile, comment } = props;
	const { id, src, type, author, content, uri, timestamp } = comment;

	return (<div className="base-comment-reply">
		<div className="playground-base-comment-timestamp" dangerouslySetInnerHTML={{ __html : timestamp.format(COMMENT_TIMESTAMP).replace(/(\d{1,2})(\w{2}) @/, (match, p1, p2)=> (`${p1}<sup>${p2}</sup> @`)) }} />
		{(content) && (<div className="playground-base-comment-content" dangerouslySetInnerHTML={{ __html : content.replace(author.username, `<span class="txt-bold">${author.username}</span>`) }} />)}
	</div>);
};



const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};


export default connect(mapStateToProps)(PlaygroundBaseComment);
