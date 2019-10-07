
import React, { Component } from 'react';
import './TopNavProfile.css';

import { Strings, URIs } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import ImageLoader from 'react-loading-image';
import onClickOutside from 'react-onclickoutside';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import { DEFAULT_AVATAR } from '../../../../consts/uris';

const PROFILE = 'PROFILE';
const TEAM = 'TEAM';
const LOGOUT = 'LOGOUT';


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

		if (type === PROFILE) {
			this.props.onLink('profile');

		} else if (type === TEAM) {
			this.props.onLink((URIs.subdomain() && URIs.subdomain() !== 'earlyaccess') ? 'team' : 'history');

		} else if (type === LOGOUT) {
			this.props.onLogout()
		}
	};

	render() {
// 		console.log('TopNavProfile.render()', this.props, this.state);

		const { avatar } = (this.props.profile) ? this.props.profile : { avatar : DEFAULT_AVATAR };
		const { bubble } = this.state;

		const faName = (bubble) ? 'caret-up' : 'caret-down';
		const bubbleClass = `top-nav-profile-bubble-wrapper ${(bubble) ? 'top-nav-profile-intro' : 'top-nav-profile-outro'}`;

		return (<div className="top-nav-profile">
			<Row vertical="center">
				<FontAwesome name={faName} className="top-nav-profile-arrow" onClick={()=> this.setState({ bubble : !bubble })} />


				<div className="top-nav-profile-avatar-wrapper" onClick={()=> this.setState({ bubble : !bubble })}>
					<ImageLoader
						src={avatar}
						image={(props)=> (<img className="top-nav-profile-avatar-image" { ...props } src={avatar} alt="" />)}
						loading={()=> (<div className="top-nav-profile-avatar-image top-nav-profile-avatar-image-loading"><FontAwesome name="circle-o-notch" size="2x" pulse fixedWidth /></div>)}
						error={()=> (<div className="top-nav-profile-avatar-image top-nav-profile-avatar-image-error"><FontAwesome name="exclamation-circle" size="2x" /></div>)}
					/>
				</div>

				{/*<img src={avatar} className="top-nav-profile-avatar" alt="" onClick={()=> this.setState({ bubble : !bubble })} />*/}
			</Row>

			{(bubble) && (<div className={bubbleClass}>
				<div className="top-nav-profile-link" onClick={()=> this.handleLinkClick(PROFILE)}>Profile</div>
				<div className="top-nav-profile-link" onClick={()=> this.handleLinkClick(TEAM)}>{(URIs.subdomain()) ? `Team ${Strings.capitalize(URIs.subdomain() && URIs.subdomain() !== 'earlyaccess')}` : `History`}</div>
				<div className="top-nav-profile-link" onClick={()=> this.handleLinkClick(LOGOUT)}>Logout</div>
			</div>)}
		</div>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


export default connect(mapStateToProps)(onClickOutside(TopNavProfile));
