
import React from 'react';
import './ComponentComment.css';

import { connect } from 'react-redux';

import { MOMENT_TIMESTAMP } from '../../../../consts/formats';
import { DEFAULT_AVATAR } from '../../../../consts/uris';


function ComponentComment(props) {
// 	console.log('PlaygroundComment()', props);

	const { profile, ind, comment } = props;
	const { id, type, author, content, timestamp } = comment;

	return (<div className="component-comment" data-id={id}>
		<div className="component-comment-header-wrapper">
			<div className="component-comment-header-icon-wrapper">
				{(type !== 'init') && (<div className="component-comment-header-icon">{ind}</div>)}
				<div className="component-comment-header-icon"><img src={(!author.avatar) ? DEFAULT_AVATAR : author.avatar} alt={author.username} /></div>
			</div>
			<div className="component-comment-header-spacer" />
			<div className="component-comment-header-link-wrapper">
				{(profile && profile.id === author.id && type !== 'init') && (<div className="component-comment-header-link" onClick={props.onDelete}>Delete</div>)}
			</div>
		</div>

		<div className="component-comment-timestamp" dangerouslySetInnerHTML={{ __html : timestamp.format(MOMENT_TIMESTAMP).replace(/(\d{1,2})(\w{2}) @/, (match, p1, p2)=> (`${p1}<sup>${p2}</sup> @`)) }} />
		<div className="component-comment-content" dangerouslySetInnerHTML={{ __html : content.replace(author.username, `<strong>@${author.username}</strong>`) }} />
	</div>);
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};


export default connect(mapStateToProps)(ComponentComment);
