
import React, { Component } from 'react';
import './UploadHeader.css';

import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';

import { POPUP_TYPE_ERROR } from './Popup';
import { updateDeeplink } from '../../redux/actions';
import { sendToSlack } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';

const dropZone = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		updateDeeplink : (navIDs)=> dispatch(updateDeeplink(navIDs))
	});
};


class UploadHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dialog  : false,
			profile : {
				id       : 0,
				username : ''
			}
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('UploadHeader.componentDidUpdate()', prevProps, this.props, prevState, this.state, snapshot);

		const { dialog } = this.props;
		if (dialog !== this.state.dialog) {
			this.setState({ dialog });
		}

		if (this.state.dialog) {
			if (dropZone.current && dropZone.current.fileInputEl) {
				dropZone.current.fileInputEl.click();
			}
		}
	}


	handleCancel = (event)=> {
		console.log('UploadHeader.handleCancel()', event);

		event.preventDefault();
		trackEvent('button', 'cancel-upload');
		this.props.onCancel();
	};

	handleDemo = (event)=> {
// 		console.log('UploadHeader.handleDemo()', event);

		event.preventDefault();
		trackEvent('button', 'demo');

		window.location.replace('http://demo.designengine.ai/');
	};

	handleFileDialogCancel = ()=> {
// 		console.log('UploadHeader.handleFileDialogCancel()');
		this.setState({ dialog : false });
	};

	handleFileDrop = (files)=> {
// 		console.log('UploadHeader.handleFileDrop()', files);

		const { id, email } = (this.props.profile) ? this.props.profile : this.state.profile;
		if (files.length > 0) {
			const file = files.pop();

			if (file.name.split('.').pop() === 'sketch') {
				if (file.size < 100 * (1024 * 1024)) {
					this.props.onFile(file);

				} else {
					sendToSlack(`*[${id}]* *${email}* uploaded oversized file "_${file.name}_" (${Math.round(file.size * (1 / (1024 * 1024)))}MB)`);
					this.props.onPopup({
						type     : POPUP_TYPE_ERROR,
						content  : 'File size must be under 100MB.',
						duration : 750
					});
				}

			} else {
				sendToSlack(`*[${id}]* *${email}* uploaded incompatible file "_${file.name}_"`);
				this.props.onPopup({
					type     : POPUP_TYPE_ERROR,
					content  : (file.name.split('.').pop() === 'xd') ? 'Adobe XD Support Coming Soon!' : 'Only Sketch files are support at this time.',
					duration : 1500
				});
			}
		}
	};


	render() {
// 		console.log('UploadHeader.render()', this.props, this.state);

		const { title, subtitle, uploading } = this.props;

		return (<div className="upload-header-wrapper">
			<Dropzone className="upload-header-dz" multiple={false} disablePreview={true} onDrop={this.handleFileDrop.bind(this)} onFileDialogCancel={this.handleFileDialogCancel} ref={dropZone}>
				<h2>{title}</h2>
				<div className="upload-header-subtitle">{subtitle}</div>
				{(uploading)
					? (<div className="upload-header-button-wrapper">
							<button onClick={(event)=> this.handleCancel(event)}>Cancel</button>
						</div>)
					: (<div className="upload-header-button-wrapper">
							<button className="adjacent-button" onClick={()=> trackEvent('button', 'upload')}>Upload</button>
							<button onClick={(event)=> this.handleDemo(event)}>Try Demo</button>
					</div>)
				}
			</Dropzone>
		</div>);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadHeader);
