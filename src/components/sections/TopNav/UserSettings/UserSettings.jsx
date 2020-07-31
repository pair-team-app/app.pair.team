
import React, { Component } from 'react';
import './UserSettings.css';

import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { GITHUB_DOCS, Modals, NPM_DE_PLAYGROUND, USER_DEFAULT_AVATAR } from '../../../../consts/uris';
import { trackOutbound } from '../../../../utils/tracking';
import BasePopover from '../../../overlays/BasePopover';
import { SettingsMenuItemTypes } from './';



class UserSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover  : false,
			outro    : false,
			itemType : null
		};

		this.wrapper = React.createRef();
	}

	componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

		const { hash } = this.props;
		if (hash === '#settings' && !this.state.popover) {
			this.setState({ popover : true });
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
		// console.log('%s.componentDidUpdate()', this.constructor.name, { left : shareLink.offsetLeft, top : shareLink.offsetTop });

		const { hash } = this.props;
		if ((hash === '#settings') && !this.state.popover) {
			this.setState({ popover : true });
		}

		if (hash !== '#settings' && this.state.popover) {
			this.setState({ popover : false });
		}
	}

	handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name, { state : this.state });

		// window.location.href = window.location.href.replace('#settings', '');
		this.props.push(window.location.pathname.replace('#settings', ''));
    this.setState({ popover : false }, ()=> {
			const { itemType } = this.state;
			if (itemType) {
				if (itemType === SettingsMenuItemTypes.LOGOUT) {
					this.props.onLogout(null, Modals.LOGIN);

				} else if (itemType !== SettingsMenuItemTypes.DOCS && itemType !== SettingsMenuItemTypes.INSTALL) {
					this.props.onMenuItem(itemType);
				}
			}
		});
	};

	handleItemClick = (itemType, event=null)=> {
// console.log('%s.handleItemClick()', this.constructor.name, itemType, event);

		event.preventDefault();
		this.setState({ itemType,
			outro : true
		}, ()=> {
			if (itemType === SettingsMenuItemTypes.DOCS) {
				trackOutbound(GITHUB_DOCS);

			} else if (itemType === SettingsMenuItemTypes.INSTALL) {
				trackOutbound(NPM_DE_PLAYGROUND);
			}
		});
	};

	handleShowPopover = ()=> {
// console.log('%s.handleShowPopover()', this.constructor.name);

		this.props.push(`${window.location.pathname}#settings`);
		// window.location.href = `${window.location.href}#settings`;
		this.setState({ outro : false });
	};

	render() {
		console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { profile } = this.props;
		const { avatar } = (profile || { avatar : USER_DEFAULT_AVATAR });
		const { popover, outro } = this.state;

		return (<div className="user-settings" ref={(element)=> { this.wrapper = element; }}>
			<div className="avatar-wrapper user-settings-avatar-wrapper" onClick={this.handleShowPopover}>
				<img className="avatar-wrapper-ico user-settings-avatar-ico" src={avatar} alt="Avatar" />
			</div>

			{(popover) && (<UserSettingsPopover
				position={{ x : this.wrapper.offsetLeft, y : this.wrapper.offsetTop }}
				outro={outro}
				onItemClick={this.handleItemClick}
				onClose={()=> this.setState({ popover : false })}
				onComplete={this.handleComplete}
			/>)}
		</div>);
	}
}


const UserSettingsPopover = (props)=> {
console.log('UserSettingsPopover()', { props });

	const { position, outro } = props;
	const payload = {
		position : {
			x : position.x - 175,
			y : position.y + 10
		}
	};

	return (<BasePopover outro={outro} payload={payload} onOutroComplete={props.onComplete}>
		<div className="user-settings-popover">
			<div className="user-settings-item" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.PROFILE, event)}>Profile</div>
			<div className="user-settings-item"><NavLink to={NPM_DE_PLAYGROUND} target="_blank" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.INSTALL, event)}>Install</NavLink></div>
			<div className="user-settings-item"><NavLink to={GITHUB_DOCS} target="_blank" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.DOCS, event)}>Support</NavLink></div>
			<div className="user-settings-item" onClick={(event)=> props.onItemClick(SettingsMenuItemTypes.LOGOUT, event)}>Logout</div>
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
