
import React, { Component } from 'react';
import './DetailsStep.css';

import axios from 'axios';
import Dropzone from 'react-dropzone';
import Masonry from 'react-masonry-component';
import { Column, Row } from 'simple-flexbox';

import ColorSwatch from './ColorSwatch'
import CornerType from './CornerType'
import ImageryItem from './ImageryItem'
import InputField from './InputField'


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
			isValidated : false,
			colors      : [],
			corners     : [{
				id    : 1,
				isSelected : false,
				title : 'Corner 1',
				url   : 'https://img.freepik.com/free-icon/rounded-corners-interface-square-symbol_318-70718.jpg?size=338&ext=jpg'
			}, {
				id    : 2,
				isSelected : false,
				title : 'Corner 2',
				url   : 'https://img.freepik.com/free-icon/rounded-corners-interface-square-symbol_318-70718.jpg?size=338&ext=jpg'
			}, {
				id    : 3,
				isSelected : false,
				title : 'Corner 3',
				url   : 'https://img.freepik.com/free-icon/rounded-corners-interface-square-symbol_318-70718.jpg?size=338&ext=jpg'
			}, {
				id    : 4,
				isSelected : false,
				title : 'Corner 4',
				url   : 'https://img.freepik.com/free-icon/rounded-corners-interface-square-symbol_318-70718.jpg?size=338&ext=jpg'
			}, {
				id    : 5,
				isSelected : false,
				title : 'Corner 5',
				url   : 'https://img.freepik.com/free-icon/rounded-corners-interface-square-symbol_318-70718.jpg?size=338&ext=jpg'
			}, {
				id    : 6,
				isSelected : false,
				title : 'Corner 6',
				url   : 'https://img.freepik.com/free-icon/rounded-corners-interface-square-symbol_318-70718.jpg?size=338&ext=jpg'
			}],
			imagery     : []
		};

		this.selectedColors = [];
		this.selectedImagery = [];
		this.handleTextChange = this.handleTextChange.bind(this);
	}

	componentDidMount() {
		let formData = new FormData();
		formData.append('action', 'TEMPLATE_COLORS');
		formData.append('template_id', this.props.templateID);
		axios.post('http://api.designengine.ai/templates.php', formData)
			.then((response) => {
				console.log("TEMPLATE_COLORS", JSON.stringify(response.data));

				let colors = [];
				response.data.colors.forEach(color => {
					colors.push(color);
				});
				this.setState({ colors : colors });

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

			}).catch((error) => {
		});
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

	handleColorToggle(id, isSelected) {
		console.log("handleColorToggle("+id+", "+isSelected+")");

		let colors = this.state.colors;
		let self = this;

		if (isSelected) {
			colors.forEach(function(item, i) {
				if (item.id === id) {

					let isFound = false;
					self.selectedColors.forEach(function(itm, j) {
						if (itm.id === id) {
							isFound = true;
						}
					});

					if (!isFound) {
						self.selectedColors.push(item);
					}
				}
			});

		} else {
			this.selectedColors.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedColors.splice(i, 1);
				}
			});
		}

		console.log(JSON.stringify(this.selectedColors));
	}

	handleCornerToggle(id) {
		console.log("handleCornerToggle("+id+")");

		let corners = this.state.corners;
		corners.forEach(function(item, i) {
			item.isSelected = (id === item.id);
			corners.splice(i, 1, item);
		});

		let form = this.state.form;
		form.cornerType = id;
		this.setState({
			form    : form,
			corners : corners
		});

		console.log(JSON.stringify(corners));
	}

	handleImageToggle(id, isSelected) {
		console.log("handleImageToggle("+id+", "+isSelected+")");

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

		console.log(JSON.stringify(this.selectedImagery));
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

	dzComponent() {
		let dzStyle = {
			marginTop : '85px',
			fontSize : '14px',
			color : '#ffffff'
		};

		return (
			<Dropzone key={-1} disabled={false} onDrop={this.onDrop.bind(this)} className="dropzone">
				<div style={dzStyle}>Drop images here…</div>
			</Dropzone>
		);
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
		let colors = this.state.colors.map((item, i, arr) => {
			return (
				<Column key={i}>
					<ColorSwatch title={item.title} swatch={item.hex} onClick={(isSelected)=> this.handleColorToggle(item.id, isSelected)} />
				</Column>
			);
		});

		let corners = this.state.corners.map((item, i, arr) => {
			return (
				<Column key={i}>
					<CornerType title={item.title} url={item.url} isSelected={item.isSelected} onClick={()=> this.handleCornerToggle(item.id)} />
				</Column>
			);
		});

		let imagery = this.state.imagery.map((item, i, arr) => {
			return (
				<ImageryItem key={i} title={item.title} url={item.url} onClick={(isSelected)=> this.handleImageToggle(item.id, isSelected)} />
			);
		});

		imagery.splice(1, 0, this.dzComponent());

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

						<div className="input-title">Colors</div>
						<div className="step-text" style={{marginBottom:'10px'}}>Select up to three colors for your design system.</div>
						<div className="color-item-wrapper">
							<Row horizontal="start" style={{flexWrap:'wrap'}}>
								{colors}
							</Row>
						</div>

						<div className="input-title">Corners</div>
						<div className="step-text" style={{marginBottom:'10px'}}>Select a corner style for your design system.</div>
						<div className="corner-item-wrapper">
							<Row horizontal="center" style={{flexWrap:'wrap'}}>
								{corners}
							</Row>
						</div>

						<div className="input-title">Images</div>
						<div className="step-text" style={{marginBottom:'10px'}}>Select up to six images for your design system.</div>

						<Masonry className="images-item-wrapper">
							{imagery}
						</Masonry>
					</Column>
				</Row>
			</div>
		);
	}
}

export default DetailsStep;
