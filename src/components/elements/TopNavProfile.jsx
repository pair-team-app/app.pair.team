
import React, { Component } from 'react';
import './TopNavProfile.css';

import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

const PROFILE = 'PROFILE';
const LOGOUT = 'LOGOUT';

const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


class TopNavProfile extends Component {
	constructor(props) {
		super(props);

		this.state = {
			bubble : false
		};
	}

	componentDidMount() {
// 		console.log('TopNavProfile.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('TopNavProfile.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}

	handleClickOutside(event) {
		this.setState({ bubble : false });
	}

	handleLinkClick = (type)=> {
		this.setState({ bubble : false });

		if (type === PROFILE) {
			this.props.onPage('profile');

		} else if (type === LOGOUT) {
			this.props.onLogout()
		}
	};

	render() {
// 		console.log('TopNavProfile.render()', this.props, this.state);

		const { avatar } = (this.props.profile) ? this.props.profile : { avatar : 'http://cdn.designengine.ai/profiles/default-avatar.png' };
		const { bubble } = this.state;

		return (
			<div className="top-nav-profile">
				<div className="top-nav-profile-wrapper"><Row vertical="center">
					<img src={avatar} className="top-nav-profile-avatar" alt="Avatar" />
					<FontAwesome name="caret-down" className="top-nav-profile-arrow" onClick={()=> this.setState({ bubble : !bubble })} />
				</Row></div>

				{(bubble) && (<div className="top-nav-profile-bubble-wrapper">
					<FontAwesome name="caret-up" className="top-nav-profile-bubble-notch" />
					<div className="top-nav-profile-link" onClick={()=> this.handleLinkClick(PROFILE)}>Profile</div>
					<div className="top-nav-profile-link" onClick={()=> this.handleLinkClick(LOGOUT)}>Logout</div>
				</div>)}
			</div>
		);
	}
}

export default connect(mapStateToProps)(onClickOutside(TopNavProfile));
