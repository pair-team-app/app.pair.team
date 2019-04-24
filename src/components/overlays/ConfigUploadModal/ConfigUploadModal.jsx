
import React, { Component } from 'react';
import './ConfigUploadModal.css';

import axios from 'axios';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import BaseOverlay from '../BaseOverlay';
import { LINTER_UPLOAD_URL } from './../../../consts/uris';
import { setRedirectURI, updateUserProfile } from '../../../redux/actions';
import { URIs } from './../../../utils/lang';
import { trackEvent } from './../../../utils/tracking';
import allIntegrations from './../../../assets/json/integrations';
import { POPUP_TYPE_ERROR } from '../PopupNotification';


const ConfigIntegrationsList = (props)=> {
// 	console.log('ConfigUploadModal.ConfigIntegrationsList()', props);

	const { integrations } = props;
	return (<div className="config-integrations-list">
		{integrations.map((integration, i)=> (
			<ConfigIntegrationsListItem
				key={i}
				title={integration.title}
				image={integration.filename}
				uploaded={integration.uploaded}
				onDrop={(files)=> props.onFileDrop(integration, files)}
			/>
		))}
	</div>);
};

const ConfigIntegrationsListItem = (props)=> {
// 	console.log('ConfigUploadModal.ConfigIntegrationsListItem()', props);

	const { title, image, uploaded } = props;
	return (<div className={`config-integrations-list-item${(uploaded) ? ' config-integrations-list-item-uploaded' : ''}`}><Row vertical="center" className="full-width">
		<Column horizontal="start" vertical="center" flexGrow={1}>
			<div className="config-integrations-list-item-image-wrapper">
				<img className="config-integrations-list-item-image" src={image} alt={title} />
				<div className="config-integrations-list-item-icon"><FontAwesome name="check-circle" /></div>
			</div>
		</Column>
		<Column horizontal="end" vertical="center" flexGrow={1}>
			<Dropzone
				className="config-integrations-list-item-dz"
				multiple={false}
				disablePreview={true}
				onDrop={props.onDrop}>
				<button className="config-integrations-list-item-button">{title}</button>
			</Dropzone>
		</Column>
	</Row></div>);
};


class ConfigUploadModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step         : 0,
			integrations : [],
			outro        : false,
			submitting   : false
		};
	}

	componentDidMount() {
// 		console.log('ConfigUploadModal.componentDidMount()', this.props, this.state);

		const { profile } = this.props;
		const integrations = allIntegrations.filter((integration)=> (integration.type === 'dev' && profile.integrations.includes(integration.id))).map((integration)=> (Object.assign({}, integration, {
			selected : true,
			uploaded : false
		})));

		this.setState({ integrations });
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

	handleFileDrop = (integration, files)=> {
		console.log('ConfigUploadModal.handleFileDrop()', integration, files);

		trackEvent('button', 'config');
		if (files.length > 0) {
			const file = files.pop();

			if (file.name.match(new RegExp('^.*[a-z]+int.*(rc|json|ya?ml).*$', 'i'))) {
				const config = {
					headers : {
						'Content-Type' : 'multipart/form-data',
						'Accept'       : 'application/json'
					},
					onDownloadProgress : (progressEvent)=> {/* …\(^_^)/… */},
					onUploadProgress   : (progressEvent)=> {
						if (progressEvent.loaded >= progressEvent.total) {
							integration.uploaded = true;
							const integrations = this.state.integrations.map((item)=> ((item.id === integration.id) ? integration : item));
							this.setState({ integrations });
						}
					}
				};

				let formData = new FormData();
				formData.append('file', file);
				axios.post(`${LINTER_UPLOAD_URL}?dir=/configs`, formData, config)
					.then((response)=> {
						console.log('LINTER upload.php', response.data);
					}).catch((error)=> {
				});

			} else {
// 				sendToSlack(`*[\`${id}\`]* *${email}* uploaded incompatible file "_${file.name}_"`);
				this.props.onPopup({
					type     : POPUP_TYPE_ERROR,
					content  : 'Not a valid linter ruleset file, must be json or rc type.',
					duration : 2500
				});
			}
		}
	};

	handleSkip = ()=> {
		//console.log('ConfigUploadModal.handleSkip()');

		trackEvent('button', 'skip');
		this.setState({ outro : true });
	};


	handleSubmit = ()=> {
// 		console.log('ConfigUploadModal.handleSubmit()');
		trackEvent('button', 'submit');
		this.setState({ outro : true });
	};


	render() {
// 		console.log('ConfigUploadModal.render()', this.props, this.state);

		const { team } = this.props;
		const { step, outro, integrations } = this.state;
		const title = (step === 0) ? 'Upload a JSON Configuration File' : 'Step 2';

		return (
			<BaseOverlay
				tracking={`config-upload/${URIs.firstComponent()}`}
				delay={0}
				outro={outro}
				unblurred={true}
				closeable={(!team)}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="config-upload-modal-wrapper">
					<div className="config-upload-modal-header">
						<h4 className="full-width">{title}</h4>
					</div>
					<div className="config-upload-modal-content-wrapper">
						<ConfigIntegrationsList
							integrations={integrations}
							onFileDrop={this.handleFileDrop}
						/>
						<button className="adjacent-button" onClick={this.handleSkip}>Skip</button>
						<button disabled={(integrations.reduce((acc, val)=> (acc += (val.uploaded << 0)), 0) === 0)} onClick={this.handleSubmit}>Finalize</button>
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
		team        : state.team,
		profile     : state.userProfile,
		redirectURI : state.redirectURI
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(ConfigUploadModal);
