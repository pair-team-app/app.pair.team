
import React, { Component } from 'react';
import './DetailsStep.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';

import ColorsForm from '../forms/ColorsForm';
import CornersForm from '../forms/CornersForm';
import ImageryForm from '../forms/ImageryForm';
import InputField from '../InputField';



class DetailsStep extends Component {
	constructor(props) {
		super(props);

// 		this.state = {
// 			email : '',
// 			company : '',
// 			description : '',
// 			product : '',
// 			info : '',
// 			headline : '',
// 			subheadline : '',
// 			isValidated : false
// 		};
		this.state = {
			form : {
				email        : 'matt@modd.live',
				title        : 'aaa',
				headline     : 'bbb',
				subheadline  : 'ccc',
				mainHeadline : 'ddd',
				colors       : '',
				cornerType   : 1,
				imagery      : ''
			},
			isValidated : false
		};

		this.selectedColors = [];
		this.selectedImagery = [];
		this.handleTextChange = this.handleTextChange.bind(this);
	}

	componentDidMount() {
	}

	validator(form) {
		let validated = 0x00000;

		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(String(form.email).toLowerCase())) {
			validated |= 0x00001;
		}

		if (form.title.length > 0) {
			validated |= 0x00010;
		}

		if (form.headline.length > 0) {
			validated |= 0x00100;
		}

		if (form.subheadline.length > 0) {
			validated |= 0x01000;
		}

		if (form.mainHeadline.length > 0) {
			validated |= 0x10000;
		}

		return (validated);
	}

	handleTextChange(event) {
		let form = this.state.form;

		//this.setState({ [event.target.name] : event.target.value });
		if (event.target.name === 'txt-email') {
			form.email =  event.target.value;

		} else if (event.target.name === 'txt-title') {
			if (this.state.form.title.length <= 40) {
				form.title = event.target.value;
			}

		} else if (event.target.name === 'txt-headline') {
			if (this.state.form.headline.length <= 250) {
				form.headline = event.target.value;
			}

		} else if (event.target.name === 'txt-subheadline') {
			if (this.state.form.subheadline.length <= 80) {
				form.subheadline = event.target.value;
			}

		} else if (event.target.name === 'txt-main-headline') {
			if (this.state.form.mainHeadline.length <= 250) {
				form.mainHeadline = event.target.value;
			}
		}

		this.setState({
			form : form,
			isValidated : (this.validator(form) === 0x11111)
		});
	}

	handleColorToggle(obj) {
		console.log("handleColorToggle("+JSON.stringify(obj)+")");
		this.selectedColors = obj;
	}

	handleCornerToggle(id) {
		console.log("handleCornerToggle("+id+")");

		let form = this.state.form;
		form.cornerType = id;
		this.setState({ form : form });
	}

	handleImageryToggle(obj) {
		console.log("handleImageryToggle(" + JSON.stringify(obj) + ")");
		this.selectedImagery = obj;
	}

	handleClick() {
		let form = this.state.form;
		if (this.validator(form) === 0x11111) {
			let colors = [];
			this.selectedColors.forEach(color => {
				colors.push(color.id);
			});

			let imagery = [];
			this.selectedImagery.forEach(image => {
				imagery.push(image.id);
			});

			form.colors = colors.join();
			form.imagery = imagery.join();
			this.props.onClick(form);
		}
	}

	onDrop(dzFiles) {
		console.log("onDrop()");
// 		this.props.onDrop(dzFiles);

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

	render() {
		let buttonClass = (this.state.isValidated) ? 'action-button full-button' : 'action-button full-button disabled-button';
		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Adjust your design system</div>
						<div className="step-text">Add details to your project for Design Engine to generating your files.</div>
						<button className={buttonClass} onClick={()=> this.handleClick()}>Next</button>
						<div className="step-text">By clicking &ldquo;Next&rdquo; I agree to Design Engine’s Terms of Service.</div>
					</Column>
				</Row>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="start">
						<div className="input-title">Title</div>
						<InputField
							type="text"
							name="txt-title"
							placeholder="Enter a title for your design system"
							value={this.state.form.title}
							onChange={(event)=> this.handleTextChange(event)} />

						<div className="input-title">Email</div>
						<InputField
							type="email"
							name="txt-email"
							placeholder="Enter an email address"
							value={this.state.form.email}
							onChange={(event)=> this.handleTextChange(event)} />

						<div className="input-title">Headlines</div>
						<div className="step-text" style={{marginBottom:'10px'}}>Enter your products Headline, Sub Headline, and Main Headline.</div>
						<div><input className="textfield-input" type="text" name="txt-headline" placeholder="Headline" value={this.state.form.headline} onChange={this.handleTextChange} style={{fontSize:'22px', borderBottom:'none'}} /></div>
						<div><input className="textfield-input" type="text" name="txt-subheadline" placeholder="Subheadline" value={this.state.form.subheadline} onChange={this.handleTextChange} style={{fontSize:'30px', borderBottom:'none'}} /></div>
						<div><input className="textfield-input" type="text" name="txt-main-headline" placeholder="Main Headline" value={this.state.form.mainHeadline} onChange={this.handleTextChange} style={{fontSize:'48px', borderBottom:'none'}} /></div>

						<ColorsForm templateID={this.props.templateID} onToggle={(obj)=> this.handleColorToggle(obj)} />
						<CornersForm onToggle={(id)=> this.handleCornerToggle(id)} />
						<ImageryForm templateID={this.props.templateID} onToggle={(obj)=> this.handleImageryToggle(obj)} onDrop={(files)=> this.onDrop(files)} />
					</Column>
				</Row>
			</div>
		);
	}
}

export default DetailsStep;
