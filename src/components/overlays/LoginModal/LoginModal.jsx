
import React, { Component } from 'react';
import './LoginModal.css';

import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import LoginForm from '../../forms/LoginForm';
import { POPUP_TYPE_ERROR } from '../PopupNotification';
import { Modals } from '../../../consts/uris';
import { updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import pairLogo from '../../../assets/images/logos/logo-pairurl-310.png';


class LoginModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro    : false,
			email    : null,
			upload   : null,
			outroURI : null
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { profile } = this.props;
		if (!prevProps.profile && profile) {
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
// 		console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			type    : POPUP_TYPE_ERROR,
			content : error.code
		});
	};

	handleLoggedIn = (profile)=> {
// 		console.log('%s.handleLoggedIn()', this.constructor.name, profile, this.props);

		trackEvent('user', 'login');
    this.setState({ outro : true }, ()=> {
      setTimeout(()=> {
        this.props.onLoggedIn(profile);
      }, 333);
    });
	};

	handleModal = (uri)=> {
// 		console.log('%s.handleModal()', this.constructor.name, uri);
		this.setState({
			outro    : true,
			outroURI : `/modal${uri}`
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={Modals.LOGIN}
				outro={outro}
				filled={true}
				closeable={false}
				delay={125}
				onComplete={this.handleComplete}>

				<div className="login-modal">
					<div className="header-wrapper">
						<img className="header-logo" src={pairLogo} alt="Logo" />
					</div>

					<div className="form-wrapper">
						<LoginForm
							inviteID={null}
							email={null}
							onCancel={(event)=> { event.preventDefault(); this.handleComplete(); }}
							onLoggedIn={this.handleLoggedIn} />
					</div>

					<div className="footer-wrapper form-disclaimer">
						{/*<div onClick={()=> this.handleModal(Modals.RECOVER)}>Forgot Password</div>*/}
						<div onClick={()=> this.handleModal(Modals.REGISTER)}>Don't have an account? Sign Up</div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginModal));
