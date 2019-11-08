
import React, { Component } from 'react';
import './ComponentComment.css';

// import axios from 'axios';
// import { Strings } from 'lang-js-utils';
// import CopyToClipboard from 'react-copy-to-clipboard';

import BasePopover from '../../../../overlays/BasePopover';
// import { API_ENDPT_URL } from '../../../../../consts/uris';
// import { trackEvent } from '../../../../../utils/tracking';


class ComponentComment extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		};
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { component, comment, ind, popover } = this.props;
		const { outro } = this.state;

		return (<div className="component-comment" data-id={component.id}>
			<CommentMarker ind={ind} comment={comment} onClick={this.props.onMarkerClick} />
			{(popover) && (<CommentPopover ind={ind} comment={comment} outro={outro} onClose={this.props.onClose} />)}
		</div>);
	}
}


const CommentMarker = (props)=> {
// 	console.log('CommentMarker()', props);

	const { ind, comment } = props;
	const style = {
		top  : `${comment.position.y}px`,
		left : `${comment.position.x}px`
	};

	return (<div className="component-comment-marker" onClick={(event)=> props.onClick(event, comment)} data-id={comment.id} style={style}>
		<div className="component-comment-marker-content-wrapper">
			<div className="component-comment-content">{ind}</div>
		</div>
	</div>);
};

const CommentPopover = (props)=> {
// 	console.log('CommentPopover()', props);

	const { ind, comment, outro } = props;
	const { position } = comment;
	const payload = { position,
		fixed : false
	};

	return (<BasePopover outro={outro} payload={payload} onOutroComplete={props.onClose}>
		<div className="component-comment-popover">
			<div className="component-comment-popover-header">
				<div className="component-comment-popover-ind">{ind}</div>
				<div className="component-comment-popover-avatar-wrapper">
					<img className="component-comment-popover-avatar" src={comment.author.avatar} alt={comment.author.username} />
				</div>
				<div className="component-comment-popover-header-spacer" />
			</div>
			{comment.content}
		</div>
	</BasePopover>);
};



export default (ComponentComment);
