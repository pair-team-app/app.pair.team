
import React, { Component } from 'react';
import './DetailsStep.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';

import ColorsForm from '../forms/ColorsForm';
import CornersForm from '../forms/CornersForm';
import ImageryForm from '../forms/ImageryForm';
import NextButton from './../elements/NextButton';
import TextForm from '../forms/TextForm';


class DetailsStep extends Component {
	constructor(props) {
		super(props);

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

	handleTextChange(form) {
		this.setState({
			form : form,
			isValidated : (this.validator(form) === 0x11111)
		});

		//this.setState({ [event.target.name] : event.target.value });
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
// 		const buttonClass = (this.state.isValidated) ? 'action-button full-button' : 'action-button full-button disabled-button';

		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Edit your Design System</div>
						<div className="step-text">The following Design Systems examples have been generated from Design Engine.</div>
					</Column>
				</Row>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="start">
						<TextForm onChange={(form)=> this.handleTextChange(form)} />
						<ColorsForm templateID={this.props.templateID} onToggle={(obj)=> this.handleColorToggle(obj)} />
						<CornersForm onToggle={(id)=> this.handleCornerToggle(id)} />
						<ImageryForm templateID={this.props.templateID} onToggle={(obj)=> this.handleImageryToggle(obj)} onDrop={(files)=> this.onDrop(files)} />
					</Column>
				</Row>
				<NextButton isEnabled={this.state.isValidated} onClick={()=> this.handleClick()} />
			</div>
		);
	}
}

export default DetailsStep;
