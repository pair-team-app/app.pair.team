
import React, { Component } from 'react';
import './UserSettings.css';

import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { SettingsMenuItemTypes } from '.';
import BasePopover from '../../../../overlays/BasePopover';
import { DEFAULT_AVATAR, GITHUB_DOCS } from '../../../../../consts/uris';
import { trackOutbound } from '../../../../../utils/tracking';


class UserSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
			outro   : false
		};

		this.wrapper = React.createRef();
	}

	handleItemClick = (itemType, event=null)=> {
// 		console.log('%s.handleItemClick()', this.constructor.name, itemType, event);

		if (event) {
			event.preventDefault();
		}

		this.setState({ outro : true }, ()=> {
			if (itemType === SettingsMenuItemTypes.DOCS) {
				trackOutbound(GITHUB_DOCS, ()=> {
					window.open(GITHUB_DOCS);
				});

				window.open(GITHUB_DOCS);

			} else if (itemType === SettingsMenuItemTypes.LOGOUT) {
				this.props.onLogout();

			} else {
				this.props.onMenuItem(itemType);
			}
		});
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

		return (<div className="user-settings" ref={(element)=> { this.wrapper = element; }}>
			<div className="user-settings-title" onClick={this.handleShowPopover}>Settings</div>
			<div className="user-settings-avatar-wrapper" onClick={this.handleShowPopover}>
				<img className="user-settings-avatar-image" src={avatar} alt="Avatar" />
			</div>

			{(popover) && (<UserSettingsPopover
				position={{ x : this.wrapper.offsetLeft, y : this.wrapper.offsetTop }}
				outro={outro}
				onItemClick={this.handleItemClick}
				onClose={()=> this.setState({ popover : false })}
			/>)}
		</div>);
	}
}


const UserSettingsPopover = (props)=> {
// 	console.log('UserSettingsPopover()', props);

	const { position, outro } = props;
	const payload = {
		position : {
			x : position.x + 50,
			y : position.y + 7
		}
	};

	return (<BasePopover outro={outro} payload={payload} onOutroComplete={props.onClose}>
		<div className="user-settings-popover">
			<div className="user-settings-popover-item" onClick={()=> props.onItemClick(SettingsMenuItemTypes.PROFILE)}>Profile</div>
			<div className="user-settings-popover-item" onClick={()=> props.onItemClick(SettingsMenuItemTypes.DELETE_ACCT)}>Delete Account</div>
			<div className="user-settings-popover-item"><NavLink to={GITHUB_DOCS} target="_blank" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.DOCS, event)}>Docs</NavLink></div>
			<div className="user-settings-popover-item" onClick={()=> props.onItemClick(SettingsMenuItemTypes.LOGOUT)}>Logout</div>
		</div>
	</BasePopover>);
};


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


export default connect(mapStateToProps)(UserSettings);
