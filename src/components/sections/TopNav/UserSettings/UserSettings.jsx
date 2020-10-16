
import React, { Component } from 'react';
import './UserSettings.css';

import { push } from 'connected-react-router';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { TWITTER_SUPPORT, NPM_DE_PLAYGROUND, Popovers } from '../../../../consts/uris';
import { trackOutbound } from '../../../../utils/tracking';
import BasePopover from '../../../overlays/BasePopover';
import { SettingsMenuItemTypes } from './';


const POPOVER_PAYLOAD = {
  fixed    : false,
  position : {
    x : -238,
    y : 10
  }
};

class UserSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover  : false,
			outro    : false,
			itemType : null
		};
	}

	componentDidMount() {
		// console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

		// const { hash } = window.location;
		// if (hash === Popovers.SETTINGS && !this.state.popover) {
		// 	this.setState({ popover : true });
		// }
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state, location : window.location });
		// console.log('%s.componentDidUpdate()', this.constructor.name, { left : shareLink.offsetLeft, top : shareLink.offsetTop });

		// const { hash } = this.props;
		// if ((hash === Popovers.SETTINGS) && !this.state.popover) {
		// 	this.setState({ popover : true });
		// }

		// if (hash !== Popovers.SETTINGS && this.state.popover) {
		// 	this.setState({ popover : false });
		// }
	}

	handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name, { props : this.props, state : this.state, pathname : window.location });

		// window.location.href = window.location.href.replace('#settings', '');

    this.setState({ popover : false }, ()=> {
			const { itemType } = this.state;
			if (itemType) {
				if (itemType === SettingsMenuItemTypes.LOGOUT) {
					cookie.save('user_id', '0', { path : '/', sameSite : false });
					this.props.onLogout();

				} else if (itemType !== SettingsMenuItemTypes.DOCS && itemType !== SettingsMenuItemTypes.INSTALL) {
					this.props.onMenuItem(itemType);

					if (window.location.hash === Popovers.SETTINGS) {
						this.props.push(window.location.pathname);
					}
				}

				this.setState({ itemType : null });

			} else {
				if (window.location.hash === Popovers.SETTINGS) {
					this.props.push(window.location.pathname);
				}
			}
		});
	};

	handleItemClick = (itemType, event=null)=> {
		console.log('%s.handleItemClick()', this.constructor.name, { itemType, event });

		event.preventDefault();
		this.setState({ itemType,
			outro : true
		}, ()=> {
			if (itemType === SettingsMenuItemTypes.DOCS) {
				this.props.push(window.location.pathname);
				trackOutbound(TWITTER_SUPPORT);

			} else if (itemType === SettingsMenuItemTypes.INSTALL) {
				this.props.push(window.location.pathname);
				trackOutbound(NPM_DE_PLAYGROUND);
			}
		});
	};

	handleShowPopover = ()=> {
// console.log('%s.handleShowPopover()', this.constructor.name);

		// if (window.location.hash !== Popovers.SETTINGS) {
		// 	this.props.push(`${window.location.pathname}${Popovers.SETTINGS}`);
		// }

		this.setState({
			popover : true,
			outro   : false
		});

		// this.setState({ outro : false });
	};

	render() {
		// console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { profile } = this.props;
		const { popover, outro } = this.state;

		return (<div className="user-settings">
			<div className="avatar-wrapper" onClick={this.handleShowPopover}>
				<div className="avatar-ico">{profile.email.split('').shift().toUpperCase()}</div>
			</div>

			{(popover) && (<UserSettingsPopover
				outro={outro}
				onItemClick={this.handleItemClick}
				onClose={()=> this.setState({ popover : false })}
				onComplete={this.handleComplete}
			/>)}
		</div>);
	}
}


const UserSettingsPopover = (props)=> {
// console.log('UserSettingsPopover()', { props });


	const { outro } = props;
	return (<BasePopover outro={outro} payload={POPOVER_PAYLOAD} onOutroComplete={props.onComplete}>
		<div className="user-settings-popover">
			<div className="settings-item" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.PROFILE, event)}>Profile</div>
			{/* <div className="settings-item"><NavLink to={NPM_DE_PLAYGROUND} target="_blank" className="user-settings-link" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.INSTALL, event)}>Install</NavLink></div> */}
			<div className="settings-item"><NavLink to={TWITTER_SUPPORT} target="_blank" className="user-settings-link" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.DOCS, event)}>Support</NavLink></div>
			<div className="settings-item" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.LOGOUT, event)}>Logout</div>
		</div>
	</BasePopover>);
};


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.user.profile,
		hash    : state.router.location.hash
	});
};


export default connect(mapStateToProps, { push })(UserSettings);
