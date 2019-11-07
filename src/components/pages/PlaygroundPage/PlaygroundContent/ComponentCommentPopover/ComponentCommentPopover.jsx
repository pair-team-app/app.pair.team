
import React, { Component } from 'react';
import './ComponentCommentPopover.css';

// import axios from 'axios';
// import { Strings } from 'lang-js-utils';
// import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';

import BasePopover from '../../../../overlays/BasePopover';
// import { API_ENDPT_URL } from '../../../../../consts/uris';
// import { trackEvent } from '../../../../../utils/tracking';


class ComponentCommentPopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		};
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { position } = this.props;
		const { outro } = this.state;

		const payload = {
			position : {
				x : position.x - 20,
				y : position.y + 7
			}
		};

		return (<BasePopover outro={outro} payload={payload} onOutroComplete={this.props.onClose}>
			<div className="component-comment-popover">
				component-comment
			</div>
		</BasePopover>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile,
	});
};


export default connect(mapStateToProps)(ComponentCommentPopover);
