
import React, { Component } from 'react';
import './TopNavProfile.css';

import FontAwesome from 'react-fontawesome';
import onClickOutside from "react-onclickoutside";
import { Row } from 'simple-flexbox';

class TopNavProfile extends Component {
	constructor(props) {
		super(props);

		this.state = {
			bubble : false
		};
	}

	componentDidMount() {
	}

	handleClickOutside(e) {
		this.setState({ bubble : false });
	}

	handleLinkClick = (type)=> {
		this.setState({ bubble : false });

		if (type === 'profile') {
			this.props.onPage('profile');

		} else if (type === 'logout') {
			this.props.onLogout()
		}
	};

	render() {
		const { bubble } = this.state;

		return (
			<div className="top-nav-profile">
				<div className="top-nav-profile-wrapper"><Row vertical="center">
					<img src={this.props.avatar} className="top-nav-profile-avatar" alt="Avatar" />
					<FontAwesome name="caret-down" className="top-nav-profile-arrow" onClick={()=> this.setState({ bubble : !bubble })} />
				</Row></div>

				{(bubble) && (<div className="top-nav-profile-bubble-wrapper">
					<FontAwesome name="caret-up" className="top-nav-profile-bubble-notch" />
					<div className="nav-link" onClick={()=> this.handleLinkClick('profile')}>Profile</div>
					<div className="nav-link" onClick={()=> this.handleLinkClick('logout')}>Logout</div>
				</div>)}
			</div>
		);
	}
}

export default onClickOutside(TopNavProfile);
