
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
		console.log(this.props.title + '.render()', this.props.selected);
		const faClass = (this.props.selected) ? 'side-nav-item-arrow side-nav-item-arrow-selected' : 'side-nav-item-arrow';
		const textClass = (this.props.selected) ? 'side-nav-item-text side-nav-item-text-selected' : 'side-nav-item-text';

		return (
			<div className="side-nav-item" onClick={()=> this.props.onClick()}>
				<div className={textClass}>{(this.props.selected) && (<FontAwesome name="caret-right" className={faClass} />)}{this.props.title}</div>
			</div>
		);
	}
}

export default SideNavItem;
