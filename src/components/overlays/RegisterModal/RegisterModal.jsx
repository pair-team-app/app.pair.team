
import React, { Component } from 'react';
import './RegisterModal.css';

import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import RegisterForm from '../../forms/RegisterForm';
import { POPUP_TYPE_ERROR } from '../PopupNotification';
import { Modals } from '../../../consts/uris';
import { fetchInvite, modifyInvite, updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';

class RegisterModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro    : false,
			email    : null,
			upload   : null,
			outroURI : null
		};
	}

	componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const { inviteID } = this.props;
		if (inviteID) {
			this.props.fetchInvite({ inviteID });
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

		const { profile, invite } = this.props;

		if (!prevProps.profile && profile) {
			this.setState({ outro : true });
		}

		if (!prevProps.invite && invite) {
		}
	}

	handleComplete = ()=> {
// console.log('%s.handleComplete()', this.constructor.name);

		const { outroURI } = this.state;
		this.setState({ outro : false }, ()=> {
			this.props.onComplete();

			if (outroURI) {
				if (outroURI.startsWith('/modal')) {
					this.props.onModal(`/${URIs.lastComponent(outroURI)}`);
				}
			}
		});
	};

	handleError = (error)=> {
// console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			type    : POPUP_TYPE_ERROR,
			content : error.code
		});
	};

	handleModal = (uri)=> {
// console.log('%s.handleModal()', this.constructor.name, uri);

		this.setState({
			outro    : true,
			outroURI : `/modal${uri}`
		});
	};

	handleRegistered = (profile)=> {
// console.log('%s.handleRegistered()', this.constructor.name, profile);

		trackEvent('user', 'sign-up');
		this.props.onRegistered(profile);
	};

	render() {
// console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { invite } = this.props;
		const { outro } = this.state;

		return (<BaseOverlay
			tracking={Modals.REGISTER}
			outro={outro}
			closeable={false}
			filled={true}
			onComplete={this.handleComplete}>

			<div className="register-modal">
				{(invite) && (<div className="title-wrapper">{invite.team_title}</div>)}
				<div className="form-wrapper">
					<RegisterForm
						inviteID={(invite) ? invite.id : null}
						email={(invite) ? invite.email : null}
						onCancel={(event)=> { event.preventDefault(); this.handleComplete(); }}
						onRegistered={this.handleRegistered} />
				</div>

				<div className="footer-wrapper form-disclaimer">
					<div onClick={()=> this.handleModal(Modals.LOGIN)}>Already have an account? Login</div>
				</div>
			</div>
		</BaseOverlay>);
	}
}


const mapDispatchToProps = (dispatch)=> {
	return ({
		fetchInvite       : (payload)=> dispatch(fetchInvite(payload)),
		modifyInvite      : (payload)=> dispatch(modifyInvite(payload)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});

};

const mapStateToProps = (state, ownProps)=> {
	return ({
		invite  : state.teams.invite,
		profile : state.user.profile
	});
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RegisterModal));
