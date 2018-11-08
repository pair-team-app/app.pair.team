
import React, { Component } from 'react';
import './TopNav.css';

import axios from 'axios';
import cookie from 'react-cookies';
import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';

class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			uploads  : [],
			devices  : [],
			colors   : []
		};
	}

	componentDidMount() {
		//this.refreshData();
	}

	refreshData = ()=> {
		let formData = new FormData();
		formData.append('action', 'UPLOAD_DOCS');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_DOCS', response.data);
				let uploads = [];
				response.data.uploads.forEach((upload) => {
					uploads.push({
						id       : upload.id,
						title    : upload.title,
						added    : upload.added,
						selected : (upload.id === cookie.load('upload_id')),
						key      : 'uploads'
					});
				});

				uploads.push({
					id       : -1,
					title    : 'Upload',
					added    : '0000-00-00 00:00:00',
					selected : false,
					key      : 'uploads'
				});

				this.setState({ uploads : uploads });

				formData.append('action', 'COLORS');
				formData.append('artboard_id', this.props.artboardID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('COLORS', response.data);
						let colors = [];
						response.data.colors.forEach((color) => {
							colors.push({
								id       : color.id,
								title    : color.title,
								selected : false,
								key      : 'colors'
							});
						});
						this.setState({ colors : colors });

						formData.append('action', 'DEVICES');
						formData.append('upload_id', cookie.load('upload_id'));
						axios.post('https://api.designengine.ai/system.php', formData)
							.then((response) => {
								console.log('DEVICES', response.data);
								let devices = [];
								response.data.devices.forEach((device) => {
									devices.push({
										id       : device.id,
										title    : device.title,
										selected : false,
										key      : 'devices'
									});
								});
								this.setState({ devices : devices });
							}).catch((error) => {
						});
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	toggleSelected = (id, ind, key) => {
		console.log('toggleSelected()', 'id='+id, 'ind='+ind, 'key='+key);
		let tmp = [...this.state[key]];
		tmp[ind].selected = !tmp[ind].selected;
		this.setState({ [key] : tmp });
// 		this.handleDropdownUpdate(key, tmp[id-1].title);
	};

	resetThenSet = (ind, key) => {
		console.log('resetThenSet()', ind, key);
		let tmp = [...this.state[key]];
		tmp.forEach(item => item.selected = false);
		tmp[ind].selected = true;
		this.ddTitle = tmp[ind].title;
		this.setState({ [key] : tmp });

		if (key === 'uploads') {
			if (tmp[ind].id !== -1) {
				cookie.save('upload_id', tmp[ind].id);
				window.location = '/';

			} else {
				this.props.onUpload();
			}
		}
	};

	render() {
		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row>
					<Column flexGrow={1} horizontal="start" vertical="center">
						<img onClick={()=> this.props.onHome()} src="/images/logo.svg" className="nav-logo" alt="Design Engine" />
					</Column>
				</Row></div>

				<div className="top-nav-column top-nav-column-middle">
				</div>

				<div className="top-nav-column top-nav-column-right">
					{(cookie.load('user_id') !== '0') && (
						<Column flexGrow={1} horizontal="end" vertical="center">
							<button className="top-nav-upload-button" onClick={()=> this.props.onUpload()}><FontAwesome name="plus" className="top-nav-upload-plus" /> New</button>
						</Column>
					)}
				</div>
			</div>
		);
	}
}

export default TopNav;
