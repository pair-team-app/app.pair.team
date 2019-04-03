
import React, { Component } from 'react';
import './LoginModal.css';

import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import LoginForm from '../../forms/LoginForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR } from '../PopupNotification';
import { updateUserProfile } from '../../../redux/actions';
import { URLs } from './../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';


class LoginModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			redirectURI : (props.redirectURI || ''),
// 			inviteID : props.match.params.inviteID,
			email    : null,
			upload   : null
		};
	}

	componentDidMount() {
		console.log('LoginModal.componentDidMount()');
// 		this.setState({ redirectURI : this.props.redirectURI})
	}

	handleComplete = ()=> {
		console.log('LoginModal.handleComplete()');

		this.setState({ outro : false }, ()=> {
			const { redirectURI } = this.state;
			this.props.onPage(redirectURI);

			setTimeout(()=> {
				this.props.onComplete();
			}, 333);
		});
	};

	handleError = (error)=> {
		console.log('LoginModal.handleError()', error);

		this.props.onPopup({
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_ERROR,
			content  : error.code
		});
	};

	handleLoggedIn = (profile)=> {
		console.log('LoginModal.handleLoggedIn()', profile, this.props);

		trackEvent('user', 'login');
		this.props.updateUserProfile(profile);

		this.setState({ outro : true });
	};

	handlePage = (url)=> {
		console.log('LoginModal.handlePage()', url);

		this.setState({
			outro       : true,
			redirectURI : url
		});
	};


	render() {
		console.log('LoginModal.render()', this.props, this.state);

		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={`login/${URLs.firstComponent()}`}
				outro={outro}
				unblurred={true}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="login-modal-wrapper">
					<div className="login-modal-header">
						<h4 className="full-width">Login</h4>
					</div>

					<div className="login-modal-content-wrapper">
						<LoginForm
							title={null}
							inviteID={null}
							email={null}
							onLoggedIn={this.handleLoggedIn}
							onPage={this.handlePage} />
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
		invite      : state.invite,
		redirectURI : state.redirectURI
	});
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
