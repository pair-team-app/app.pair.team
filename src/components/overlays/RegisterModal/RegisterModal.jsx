
import React, { Component } from 'react';
import './RegisterModal.css';

import axios from 'axios';
import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import RegisterForm from '../../forms/RegisterForm';
import { POPUP_TYPE_ERROR } from '../PopupNotification';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { updateUserProfile } from '../../../redux/actions';
import { buildInspectorPath } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';
import pairLogo from '../../../assets/images/logos/logo-pairurl-310.png';

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

		if (this.props.invite) {
			axios.post(API_ENDPT_URL, {
				action  : 'INVITE_LOOKUP',
				payload : { invite_id : this.props.invite.id }
			}).then((response) => {
				console.log('INVITE_LOOKUP', response.data);
				const { invite } = response.data;
				if (invite.id === this.props.invite.id) {
					const { email } = invite;
					trackEvent('user', 'invite');
					this.setState({ email });
				}

			}).catch((error)=> {
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { profile } = this.props;
		if (!prevProps.profile && profile) {
			this.setState({ outro : true });
		}
	}

	handleComplete = ()=> {
// 		console.log('%s.handleComplete()', this.constructor.name);

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
		console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			type    : POPUP_TYPE_ERROR,
			content : error.code
		});
	};

	handleModal = (uri)=> {
		console.log('%s.handleModal()', this.constructor.name, uri);

		this.setState({
			outro    : true,
			outroURI : `/modal${uri}`
		});
	};

	handleRegistered = (profile)=> {
// 		console.log('%s.handleRegistered()', this.constructor.name, profile);

		trackEvent('user', 'sign-up');
		this.props.onRegistered(profile);
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { outro } = this.state;
		return (<BaseOverlay
			tracking={Modals.REGISTER}
			outro={outro}
			closeable={false}
			onComplete={this.handleComplete}>

			<div className="register-modal">
				<div className="register-modal-header-wrapper">
					<img className="register-modal-header-logo" src={pairLogo} alt="Logo" />
					<h4>Create an account to view Pair URLs</h4>
				</div>

				<div className="register-modal-content-wrapper">
					<RegisterForm
						title={null}
						inviteID={null}
						email={null}
						onCancel={(event)=> { event.preventDefault(); this.handleComplete(); }}
						onRegistered={this.handleRegistered} />
				</div>

				<div className="register-modal-footer-wrapper form-disclaimer">
					{/*<div>Not a member of this Pair yet?</div>*/}
					<div onClick={()=> this.handleModal(Modals.LOGIN)}>Already have an account?</div>
				</div>
			</div>
		</BaseOverlay>);
	}
}


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});

};

const mapStateToProps = (state, ownProps)=> {
	return ({
		invite  : state.invite,
		profile : state.userProfile,
	});
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RegisterModal));
