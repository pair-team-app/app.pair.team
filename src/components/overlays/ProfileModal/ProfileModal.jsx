
import React, { Component } from 'react';
import './ProfileModal.css';

import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
// import ConfirmDialog from '../ConfirmDialog';
import { Modals } from '../../../consts/uris';
import { updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import ProfileForm from "../../forms/ProfileForm/ProfileForm";


class ProfileModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro    : false,
			outroURI : null
		};
	}

	handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name, this.state);

		this.setState({ outro : false }, ()=> {
			const { outroURI } = this.state;

			if (outroURI && outroURI.startsWith('/modal')) {
				this.props.onModal(`/${URIs.lastComponent(outroURI)}`);
			}

			this.props.onComplete();
		});
	};

	handleResetPassword = ()=> {
// 		console.log('%s.handleResetPassword()', this.constructor.name);
		this.setState({
			outro    : true,
			outroURI : `/modal${Modals.RECOVER}`
		});
	};

	handleSubmit = ({ id, username, email, password })=> {
		console.log('%s.handleSubmit()', this.constructor.name, { id, username, email, password });

		trackEvent('button', 'update-profile');
		this.props.updateUserProfile({ id, username, email, password });
		this.setState({ outro : true, });
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { profile, team } = this.props;
		const { outro } = this.state;
		return (<BaseOverlay
			tracking={`profile/${URIs.firstComponent()}`}
			outro={outro}
			closeable={true}
			defaultButton={null}
			title={null}
			onComplete={this.handleComplete}>

			<div className="profile-modal">
				<div className="profile-modal-header-wrapper"><h4>Profile</h4></div>
				<div className="profile-modal-content-wrapper">
					<ProfileForm
						profile={profile}
						team={team}
						onSubmit={this.handleSubmit}
					/>
					<div className="form-disclaimer">
						<div onClick={this.handleResetPassword}>Need to reset your password?</div>
					</div>
				</div>
			</div>
		</BaseOverlay>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile,
		team    : state.teams[0]
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProfileModal));
