
import React, { Component } from 'react';
import './HeaderProfile.css';

import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { ProfileItemTypes } from '.';
import BasePopover from '../../../../overlays/BasePopover';
import { DEFAULT_AVATAR, GITHUB_DOCS } from '../../../../../consts/uris';
import { trackOutbound } from '../../../../../utils/tracking';


class HeaderProfile extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
			outro   : false
		};

		this.wrapper = React.createRef();
	}

	handleItemClick = (itemType, event=null)=> {
		console.log('%s.handleItemClick()', this.constructor.name, itemType, event);

		if (event) {
			event.preventDefault();
		}

		this.setState({ outro : true });

		if (itemType === ProfileItemTypes.DOCS) {
			trackOutbound(GITHUB_DOCS, ()=> {
// 				window.open(GITHUB_DOCS);
			});

			window.open(GITHUB_DOCS);

		} else if (itemType === ProfileItemTypes.LOGOUT) {
			this.props.onLogout();

		} else {
			this.props.onItemClick(itemType);
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
			<div className="profile-popover-item" onClick={()=> props.onItemClick(ProfileItemTypes.EMAIL)}>Change Email</div>
			<div className="profile-popover-item" onClick={()=> props.onItemClick(ProfileItemTypes.USERNAME)}>Change Name</div>
			<div className="profile-popover-item" onClick={()=> props.onItemClick(ProfileItemTypes.TEAM_ACCT)}>Account Plan</div>
			<div className="profile-popover-item" onClick={()=> props.onItemClick(ProfileItemTypes.DELETE)}>Delete Account</div>
			<div className="profile-popover-item"><NavLink to={GITHUB_DOCS} target="_blank" onClick={(event)=> props.onItemClick(ProfileItemTypes.DOCS, event)}>Docs</NavLink></div>
			<div className="profile-popover-item" onClick={()=> props.onItemClick(ProfileItemTypes.LOGOUT)}>Logout</div>
		</div>
	</BasePopover>);
};


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


export default connect(mapStateToProps)(HeaderProfile);
