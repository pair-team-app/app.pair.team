
import React, { Component } from 'react';
import './ConfigUploadModal.css';

// import axios from 'axios';
// import qs from 'qs';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
// import { API_ENDPT_URL } from './../../../consts/uris';
import { setRedirectURI, updateUserProfile } from '../../../redux/actions';
import { URLs } from './../../../utils/lang';
// import { trackEvent } from './../../../utils/tracking';


class ConfigUploadModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step       : 0,
			outro      : false,
			submitting : false
		};
	}

	componentDidMount() {
// 		console.log('ConfigUploadModal.componentDidMount()', this.props, this.state);
	}

	handleCancel = (event)=> {
		event.preventDefault();
		this.setState({ outro : true });
	};

	handleComplete = (submitted)=> {
// 		console.log('ConfigUploadModal.handleComplete()', submitted);

		this.setState({ outro : false }, ()=> {
			if (submitted) {
				this.props.onSubmitted();

			} else {
				this.props.onComplete();
			}
		});
	};


	render() {
		console.log('ConfigUploadModal.render()', this.props, this.state);

		const { step, outro } = this.state;
		const title = (step === 0) ? 'Upload a configuration file' : 'Step 2';

		return (
			<BaseOverlay
				tracking={`config-upload/${URLs.firstComponent()}`}
				delay={0}
				outro={outro}
				unblurred={true}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="config-upload-modal-wrapper">
					<div className="config-upload-modal-header">
						<h4 className="full-width">{title}</h4>
					</div>
					<div className="config-upload-modal-content-wrapper">
					</div>
				</div>
			</BaseOverlay>);
	}
}

const mapDispatchToProps = (dispatch)=> {
	return ({
		setRedirectURI    : (url)=> dispatch(setRedirectURI(url)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});

};

const mapStateToProps = (state, ownProps)=> {
	return ({
		redirectURI : state.redirectURI
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(ConfigUploadModal);
