
import React, { Component } from 'react';
import './ComponentCommentPopover.css';

// import axios from 'axios';
// import { Strings } from 'lang-js-utils';
// import CopyToClipboard from 'react-copy-to-clipboard';

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

		const { component, position } = this.props;
		const { outro } = this.state;

		const payload = { position };
		return (<BasePopover outro={outro} payload={payload} onOutroComplete={this.props.onClose}>
			<div className="component-comment-popover">
				{component.title}
			</div>
		</BasePopover>);
	}
}


export default (ComponentCommentPopover);
