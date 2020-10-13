
import React, { Component } from 'react';
import './LoginModal.css';

import { goBack } from 'connected-react-router';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import { POPUP_TYPE_ERROR } from '../PopupNotification';
import LoginForm from '../../forms/LoginForm';
import PageNavLink from '../../iterables/PageNavLink';
import { Modals } from '../../../consts/uris';
import { modifyInvite, updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';


class LoginModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro    : false,
			email    : null,
			outroURI : null
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

		const { profile } = this.props;
		if (!prevProps.profile && profile) {
			this.setState({ outro : true });
		}
	}

	handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name, { outroURI : this.state.outroURI });

		const { outroURI } = this.state;
		this.setState({ outro : false }, ()=> {
			this.props.onComplete();

			if (outroURI) {
				this.props.onModal(outroURI, true, false);
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

	handleLoggedIn = (profile)=> {
// console.log('%s.handleLoggedIn()', this.constructor.name, profile, this.props);

		trackEvent('user', 'login');
    this.setState({ outro : true }, ()=> {
      setTimeout(()=> {
        this.props.updateUserProfile({ profile });
      }, 333);
    });
	};

	handleModal = (event, uri)=> {
		console.log('%s.handleModal()', this.constructor.name, { event, uri });
		this.setState({
			outro    : true,
			outroURI : uri
		});
	};


	render() {
		// console.log('%s.render()', this.constructor.name, {props : this.props, state : this.state });

		const { invite } = this.props;
		const { outro } = this.state;

		return (<BaseOverlay
			tracking={Modals.LOGIN}
			outro={outro}
			filled={true}
			closeable={false}
			title="Login"
			delay={125}
			onComplete={this.handleComplete}>

			<div className="login-modal">
        <div className="link-wrapper">
          <span>Don't have an account? <PageNavLink to={Modals.REGISTER} onClick={this.handleModal}>Sign Up</PageNavLink> or <PageNavLink to={Modals.RECOVER} onClick={this.handleModal}>Forgot Password</PageNavLink></span>
				</div>

				<div className="form-wrapper">
					<LoginForm
						invite={invite}
						onCancel={this.props.goBack}
						onLoggedIn={this.handleLoggedIn} />
				</div>
				<div className="footer-wrapper form-disclaimer">
					<PageNavLink to="https://pair.team/terms" target="_blank">Terms of Service</PageNavLink>
				</div>
			</div>
		</BaseOverlay>);
	}
}


const mapDispatchToProps = (dispatch)=> {
	return ({
		modifyInvite      : (payload)=> dispatch(modifyInvite(payload)),
    updateUserProfile : (payload)=> dispatch(updateUserProfile(payload)),
    goBack            : (payload)=> dispatch(goBack(payload))
	});

};

const mapStateToProps = (state, ownProps)=> {
	return ({
		invite : state.teams.invite
	});
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
