
import React, { Component } from 'react';
import './BasePopover.css';

import onClickOutside from 'react-onclickoutside';

//import { trackEvent } from '../../../utils/tracking';


class BasePopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	handleClickOutside(event) {
		console.log('BasePopover.handleClickOutside()');
		this.props.onClose();
	}

	render() {
		const { pos, children } = this.props;

		const styles = {
			left : `${pos.x}px`,
			top  : `${pos.y}px`
		};

		return (<div className="base-popover" style={styles}>
			<div className="base-popover-content-wrapper">{children}</div>
		</div>);
	}
}


export default onClickOutside(BasePopover);
