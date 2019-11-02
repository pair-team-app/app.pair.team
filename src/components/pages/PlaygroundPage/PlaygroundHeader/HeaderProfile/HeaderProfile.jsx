
import React, { Component } from 'react';
import './HeaderProfile.css';

import { Strings, URIs } from 'lang-js-utils';
// import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';
import { connect } from 'react-redux';

import { DEFAULT_AVATAR } from '../../../../../consts/uris';

const PROFILE = 'PROFILE';
const TEAM = 'TEAM';
const LOGOUT = 'LOGOUT';


class HeaderProfile extends Component {
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

		if (type === PROFILE) {
			this.props.onLink('profile');

		} else if (type === TEAM) {
			this.props.onLink((URIs.subdomain() && URIs.subdomain() !== 'earlyaccess') ? 'team' : 'history');

		} else if (type === LOGOUT) {
			this.props.onLogout();
		}
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { avatar } = (this.props.profile) ? this.props.profile : { avatar : DEFAULT_AVATAR };
		const { bubble } = this.state;

// 		const faName = (bubble) ? 'caret-up' : 'caret-down';
		const bubbleClass = `header-profile-bubble-wrapper ${(bubble) ? 'header-profile-intro' : 'header-profile-outro'}`;

		return (<div className="header-profile">
				Profile
				{/*<FontAwesome name={faName} className="header-profile-arrow" onClick={()=> this.setState({ bubble : !bubble })} />*/}

				<div className="header-profile-avatar-wrapper" onClick={()=> this.setState({ bubble : !bubble })}>
					<img className="header-profile-avatar-image" src={avatar} alt="Avatar" />
				</div>

				{/*<img src={avatar} className="header-profile-avatar" alt="" onClick={()=> this.setState({ bubble : !bubble })} />*/}


			{(bubble) && (<div className={bubbleClass}>
				<div className="header-profile-link" onClick={()=> this.handleLinkClick(PROFILE)}>Profile</div>
				<div className="header-profile-link" onClick={()=> this.handleLinkClick(TEAM)}>{(URIs.subdomain()) ? `Team ${Strings.capitalize(URIs.subdomain() && URIs.subdomain() !== 'earlyaccess')}` : `History`}</div>
				<div className="header-profile-link" onClick={()=> this.handleLinkClick(LOGOUT)}>Logout</div>
			</div>)}
		</div>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


export default connect(mapStateToProps)(onClickOutside(HeaderProfile));
