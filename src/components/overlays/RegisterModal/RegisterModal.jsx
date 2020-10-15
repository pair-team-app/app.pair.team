
import React, { Component } from 'react';
import './RegisterModal.css';

import { goBack } from 'connected-react-router';
import cookie from 'react-cookies';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import { POPUP_TYPE_ERROR } from '../PopupNotification';
import RegisterForm from '../../forms/RegisterForm';
import PageNavLink from '../../iterables/PageNavLink';

import { Modals, TERMS_PAGE } from '../../../consts/uris';
import { modifyInvite, updateUserProfile } from '../../../redux/actions';
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
		// console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

		const { invite, profile } = this.props;

		if (!prevProps.profile && profile) {
			this.setState({ outro : true });
		}

		if (invite && (cookie.load('user_id') << 0) !== 0) {
			cookie.remove('user_id');
		}
	}

	handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name, { props : this.props, state : this.state });

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

	handleModal = (event, uri)=> {
    console.log('%s.handleModal()', this.constructor.name, { event, uri });

		this.setState({
			outro    : true,
			outroURI : uri
		});
	};

	handleRegistered = (profile)=> {
// console.log('%s.handleRegistered()', this.constructor.name, profile);

		trackEvent('user', 'sign-up');
		this.setState({ outro : true }, ()=> {
      setTimeout(()=> {
        this.props.updateUserProfile({ profile });
      }, 333);
    });
	};

	render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { invite } = this.props;
		const { outro } = this.state;

		return (<BaseOverlay
			tracking={Modals.REGISTER}
			outro={outro}
			closeable={false}
			filled={true}
			title="Sign Up"
			onComplete={this.handleComplete}>

			<div className="register-modal">
				{(invite) && (<div className="title-wrapper">{invite.team_title}</div>)}
        <div className="link-wrapper">
          <span>Already have an account? <PageNavLink to={Modals.LOGIN} onClick={this.handleModal}>Login</PageNavLink></span>
        </div>
				<div className="form-wrapper">
					<RegisterForm
						invite={invite}
						onCancel={this.props.goBack}
						onRegistered={this.handleRegistered} />
				</div>

				<div className="footer-wrapper form-disclaimer">
					<PageNavLink to={TERMS_PAGE} target="_blank">Terms of Service</PageNavLink>
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
		invite  : state.teams.invite,
		profile : state.user.profile
	});
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterModal);
