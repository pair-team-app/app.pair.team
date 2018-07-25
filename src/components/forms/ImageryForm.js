
import React, { Component } from 'react';
import './ImageryForm.css';

import axios from 'axios';
import Dropzone from 'react-dropzone';
import Masonry from 'react-masonry-component';

import ImageryItem from '../ImageryItem';


class ImageryForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			imagery : []
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

		console.log(JSON.stringify(this.selectedImagery));
		this.props.onToggle(this.selectedImagery);
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

	onDrop(files) {
		console.log("onDrop()");
		this.props.onDrop(files);
	}

	render() {
		let imagery = this.state.imagery.map((item, i, arr) => {
			return (
				<ImageryItem key={i} title={item.title} url={item.url} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
			);
		});

		imagery.splice(1, 0, this.dzComponent());

		return (
			<div style={{width:'100%', textAlign:'left'}}>
				<div className="input-title">Images</div>
				<div className="step-text" style={{marginBottom:'10px'}}>Select up to six images for your design system.</div>
				<Masonry className="images-item-wrapper">
					{imagery}
				</Masonry>
			</div>
		);
	}
}

export default ImageryForm;
