
import React, { Component } from 'react';
import './SideNavBack.css'

class SideNavBack extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<div className="side-nav-back" onClick={()=> this.props.onClick()}>
				<div className="side-nav-back-text"><img className="side-nav-back-arrow" src="/images/chevron-left.svg" alt="chevron-left" />Back</div>
			</div>
		);
	}
}

export default SideNavBack;
