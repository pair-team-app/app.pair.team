
import React, { Component } from 'react';
import './TopNavProfile.css';

import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import { DEFAULT_AVATAR } from '../../consts/uris';
import { trackEvent } from '../../utils/tracking';

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

	handleClickOutside(event) {
		this.setState({ bubble : false });
	}

	handleLinkClick = (type)=> {
		this.setState({ bubble : false });

		trackEvent('top-nav', type.toLowerCase());
		if (type === PROFILE) {
			this.props.onPage('profile');

		} else if (type === LOGOUT) {
			this.props.onLogout()
		}
	};

	render() {
// 		console.log('TopNavProfile.render()', this.props, this.state);

		const { avatar } = (this.props.profile) ? this.props.profile : { avatar : DEFAULT_AVATAR };
		const { bubble } = this.state;

		return (<div className="top-nav-profile-wrapper">
			<Row vertical="center">
				<img src={avatar} className="top-nav-profile-avatar" alt="Avatar" onClick={()=> this.setState({ bubble : !bubble })} />
				<FontAwesome name="caret-down" className="top-nav-profile-arrow" onClick={()=> this.setState({ bubble : !bubble })} />
			</Row>

			{(bubble) && (<div className="top-nav-profile-bubble-wrapper">
				<FontAwesome name="caret-up" className="top-nav-profile-bubble-notch" />
				<div className="top-nav-profile-link" onClick={()=> this.handleLinkClick(PROFILE)}>Profile</div>
				<div className="top-nav-profile-link" onClick={()=> this.handleLinkClick(LOGOUT)}>Logout</div>
			</div>)}
			</div>);
	}
}

export default connect(mapStateToProps)(onClickOutside(TopNavProfile));
