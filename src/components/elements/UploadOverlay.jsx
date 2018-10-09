
import React, { Component } from 'react';
import './Overlay.css';

import axios from 'axios';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import { Row, Column } from 'simple-flexbox';

import InputField from './InputField';

class UploadOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			files: [],
			percent : 0,
			email1 : '',
			email2 : '',
			email3 : ''
		};
	}

	onDragEnter() {
	}

	onDragLeave() {
	}

	onDrop(files) {
		console.log('onDrop()', files);
		this.setState({ files });

		let self= this;
		files.forEach(file => {
			let formData = new FormData();
			formData.append('file', file);

			const config = {
				headers: {
					'content-type': 'multipart/form-data'
				}, onUploadProgress: function(progressEvent) {
					const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					self.setState({ percent : percent });

					if (percent >= 100) {
						self.onUploadComplete();
					}
				}
			};

			axios.post('http://cdn.designengine.ai/upload.php?dir=%2Fsketch', formData, config)
				.then((response)=>{
					console.log("UPLOAD", JSON.stringify(response.data));
				}).catch((error) => {
			});
		});
	}

	onUploadComplete() {
		this.setState({ files : [] });
		let self = this;
		setTimeout(function(){
			self.props.onClick('cancel');
		}, 1000);
	}


	render() {
		const { files } = this.state;
		const title = (this.state.files.length > 0) ? 'Your file “' + files[0].name + '” is now uploading (' + this.state.percent + '%) to Design Engine' : 'Drag & Drop anywhere to begin Uploading.';
		return (
			<Dropzone
				disableClick
				style={{position: "relative"}}
				onDrop={this.onDrop.bind(this)}
				onDragEnter={this.onDragEnter.bind(this)}
				onDragLeave={this.onDragLeave.bind(this)}>
				<div className="overlay-wrapper">
					<div className="overlay-container">
						<div className="overlay-logo-wrapper"><img src="/images/logo.svg" className="overlay-logo" alt="Design Engine" /></div>
						<div className="overlay-title">{title}</div>
						<div className="overlay-content">
							<div className="input-title">Invite team members</div>
							<InputField
								type="email"
								name="email1"
								placeholder="Engineer Email"
								value={this.state.email1}
								onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />

							<InputField
								type="email"
								name="email2"
								placeholder="Engineer Email"
								value={this.state.email2}
								onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />

							<InputField
								type="email"
								name="email3"
								placeholder="Engineer Email"
								value={this.state.email3}
								onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />
						</div>
						<div className="overlay-button-wrapper">
							<button className="overlay-button overlay-button-confirm" onClick={()=> this.props.onClick('invite')}><Row>
								<Column flexGrow={1} horizontal="start" vertical="center">Send Invites Now</Column>
								<Column flexGrow={1} horizontal="end" vertical="center"><FontAwesome name="caret-right" className="overlay-button-confirm-arrow" /></Column>
							</Row></button>
							<button className="overlay-button overlay-button-cancel" onClick={()=> this.props.onClick('cancel')}>Cancel</button>
						</div>
					</div>
				</div>
			</Dropzone>
		);
	}
}

export default UploadOverlay;
