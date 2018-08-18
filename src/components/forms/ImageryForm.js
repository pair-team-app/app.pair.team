
import React, { Component } from 'react';
import './ImageryForm.css';

import axios from 'axios';
import Dropzone from 'react-dropzone';
import Masonry from 'react-masonry-component';

import { Column, Row } from 'simple-flexbox';

import ImageryItem from '../ImageryItem';


class ImageryForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form : {
				imagery : []
			},
			imagery : [],
			isValidated : false
		};

		this.selectedImagery = [];
	}

	componentDidMount() {
		let formData = new FormData();
		formData.append('action', 'TEMPLATE_IMAGERY');
		formData.append('template_id', this.props.templateID);
		axios.post('http://api.designengine.ai/templates.php', formData)
			.then((response) => {
				console.log("TEMPLATE_IMAGERY", JSON.stringify(response.data));

				let imagery = [];
				response.data.imagery.forEach(image => {
					imagery.push(image);
				});
				this.setState({ imagery : imagery });

			}).catch((error) => {
		});
	}

	dzComponent() {
		let dzStyle = {
			marginTop : '85px',
			fontSize : '14px',
			color : '#ffffff',
			textAlign : 'center'
		};

		return (
			<Dropzone key={-1} disabled={false} onDrop={this.onDrop.bind(this)} className="dropzone">
				<div style={dzStyle}>Drop images here…</div>
			</Dropzone>
		);
	}

	onDrop(dzFiles) {
		console.log("onDrop()");

		let files = {};
		dzFiles.forEach(file => {
			files[file.name] = {};
			console.log("UPLOADING… "+file.name);

			let formData = new FormData();
			formData.append('file', file);

			const config = {
				headers : {
					'content-type' : 'multipart/form-data'
				}
			};

			axios.post('http://cdn.designengine.ai/upload.php', formData, config)
				.then((response) => {
					console.log("UPLOAD", JSON.stringify(response.data));
				}).catch((error) => {
			});
		});
	}

	handleToggle(id, isSelected) {
		let imagery = this.state.imagery;
		let self = this;

		if (isSelected) {
			imagery.forEach(function(item, i) {
				if (item.id === id) {

					let isFound = false;
					self.selectedImagery.forEach(function(itm, j) {
						if (itm.id === id) {
							isFound = true;
						}
					});

					if (!isFound) {
						self.selectedImagery.push(item);
					}
				}
			});

		} else {
			this.selectedImagery.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedImagery.splice(i, 1);
				}
			});
		}

		this.setState({ isValidated : (this.selectedImagery.length > 0) })
	}

	handleClick() {
		if (this.state.isValidated) {
			let form = this.state.form;
			form.imagery = this.selectedImagery;
			this.setState({ form : form });
			this.props.onNext(form);
		}
	}

	render() {
		let imagery = this.state.imagery.map((item, i, arr) => {
			return (
				<ImageryItem key={i} title={item.title} url={item.url} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
			);
		});

		//imagery.splice(1, 0, this.dzComponent());

		const btnClass = (this.state.isValidated) ? 'action-button step-button' : 'action-button step-button disabled-button';

		return (
			<div style={{width:'100%'}}>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Step 6</div>
						<div className="step-text">What type of photos or illustrations do you like?</div>
					</Column>
				</Row>
				<button className="action-button step-button" onClick={()=> this.props.onBack()}>Back</button>
				<button className={btnClass} onClick={()=> this.handleClick()}>Next Step</button>
				<Masonry className="images-item-wrapper" style={{width:'100%'}}>
					{imagery}
				</Masonry>
			</div>
		);
	}
}

export default ImageryForm;
