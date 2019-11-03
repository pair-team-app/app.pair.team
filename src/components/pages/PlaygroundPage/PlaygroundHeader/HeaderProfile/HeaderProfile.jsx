
import React, { Component } from 'react';
import './HeaderProfile.css';

import { connect } from 'react-redux';

import BasePopover from '../../../../overlays/BasePopover';
import { DEFAULT_AVATAR } from '../../../../../consts/uris';

const PROFILE_EMAIL = 'PROFILE_EMAIL';
const PROFILE_NAME = 'PROFILE_NAME';
const PROFILE_ACCOUNT = 'PROFILE_ACCOUNT';
const PROFILE_DELETE = 'PROFILE_DELETE';
const PROFILE_LOGOUT = 'PROFILE_LOGOUT';


class HeaderProfile extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
			outro   : false
		};

		this.wrapper = React.createRef();
	}

	handleItemClick = (type)=> {
// 		console.log('%s.handleItemClick()', this.constructor.name, type);
		this.setState({ outro : true });

		if (type === PROFILE_EMAIL) {
		} else if (type === PROFILE_NAME) {
		} else if (type === PROFILE_ACCOUNT) {
		} else if (type === PROFILE_DELETE) {
		} else if (type === PROFILE_LOGOUT) {
			this.props.onLogout();
		}
	};

	handleShowPopover = ()=> {
// 		console.log('%s.handleShowPopover()', this.constructor.name);
		this.setState({
			popover : true,
			outro   : false
		});
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { profile } = this.props;
		const { avatar } = (profile || { avatar : DEFAULT_AVATAR });
		const { popover, outro } = this.state;

		return (<div className="header-profile" ref={(element)=> { this.wrapper = element; }}>
			<div className="header-profile-title" onClick={this.handleShowPopover}>Profile</div>
			<div className="header-profile-avatar-wrapper" onClick={this.handleShowPopover}>
				<img className="header-profile-avatar-image" src={avatar} alt="Avatar" />
			</div>

			{(popover) && (<ProfilePopover
				position={{ x : this.wrapper.offsetLeft, y : this.wrapper.offsetTop }}
				outro={outro}
				onItemClick={this.handleItemClick}
				onClose={()=> this.setState({ popover : false })}
			/>)}
		</div>);
	}
}


const ProfilePopover = (props)=> {
// 	console.log('ProfilePopover()', props);

	const { position, outro } = props;
	const payload = {
		position : {
			x : position.x + 50,
			y : position.y + 7
		}
	};

	return (<BasePopover outro={outro} payload={payload} onOutroComplete={props.onClose}>
		<div className="profile-popover">
			<div className="profile-popover-item" onClick={()=> props.onItemClick(PROFILE_EMAIL)}>Change Email</div>
			<div className="profile-popover-item" onClick={()=> props.onItemClick(PROFILE_NAME)}>Change Name</div>
			<div className="profile-popover-item" onClick={()=> props.onItemClick(PROFILE_ACCOUNT)}>Account Plan</div>
			<div className="profile-popover-item" onClick={()=> props.onItemClick(PROFILE_DELETE)}>Delete Account</div>
			<div className="profile-popover-item" onClick={()=> props.onItemClick(PROFILE_LOGOUT)}>Logout</div>
		</div>
	</BasePopover>);
};


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


export default connect(mapStateToProps)(HeaderProfile);
