
import React, { Component } from 'react';
import './SideNavItem.css'

import FontAwesome from 'react-fontawesome';

class SideNavItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		const className = (this.props.isSelected) ? 'side-nav-item side-nav-item-selected' : 'side-nav-item';

		return (
			<div className={className} onClick={()=> this.props.onClick()}>
				{(this.props.selected) && (<FontAwesome name="caret-right" className="side-nav-item-arrow" />)}
				{this.props.title}
			</div>
		);
	}
}

export default SideNavItem;
