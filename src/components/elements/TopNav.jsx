
import React, { Component } from 'react';
import './TopNav.css';

import axios from 'axios';
import cookie from 'react-cookies';
import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';

import Dropdown from '../elements/Dropdown';
import DropdownMultiple from '../elements/DropdownMultiple';

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
		this.refreshData();
	}

	refreshData = ()=> {
		let formData = new FormData();
		formData.append('action', 'UPLOADS');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOADS', response.data);
				let uploads = [];
				response.data.uploads.forEach(upload => {
					uploads.push({
						id       : upload.id,
						title    : upload.title,
						added    : upload.added,
						selected : (upload.id === cookie.load('upload_id')),
						key      : 'uploads'
					});
				});
				this.setState({ uploads : uploads });

				formData.append('action', 'COLORS');
				formData.append('upload_id', cookie.load('upload_id'));
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('COLORS', response.data);
						let colors = [];
						response.data.uploads.forEach(color => {
							colors.push({
								id       : color.id,
								title    : color.title,
								hex      : color.hex,
								gradient : color.gradient,
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
								response.data.uploads.forEach(device => {
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

	toggleSelected = (id, key) => {
		console.log('toggleSelected()', id, key);
		let tmp = [...this.state[key]];
		tmp[id-1].selected = !tmp[id-1].selected;
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
// 		this.handleDropdownUpdate(key, tmp[id-1].title);
	};

	render() {
		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column" style={{width:'388px'}}><Row>
					<Column flexGrow={1} horizontal="start" vertical="center">
						<a href="/"><img src="/images/logo.svg" className="nav-logo" alt="Design Engine" /></a>
					</Column>
					{(typeof cookie.load('user_id') !== 'undefined') && (
						<Column flexGrow={1} horizontal="end" vertical="center">
							<button onClick={()=> this.props.onUpload()}><FontAwesome name="plus" className="top-nav-upload-plus" /></button>
						</Column>
					)}
				</Row></div>

				<div className="top-nav-column">
					{(typeof cookie.load('upload_id') !== 'undefined') && (
						<div><Dropdown
							title="Select design system"
							list={this.state.uploads}
							resetThenSet={this.resetThenSet}
						/>
							<DropdownMultiple
								titleHelper="Color"
								title="Select color(s)"
								list={this.state.colors}
								toggleItem={this.toggleSelected}
							/>
							<Dropdown
								title="Select device"
								list={this.state.devices}
								resetThenSet={this.resetThenSet}
							/></div>
					)}
				</div>

				<div className="top-nav-column" style={{textAlign:'right'}}>
					{(this.props.parts.length > 0) && (
						<button onClick={()=> this.props.onDownload()}>Download Parts ({this.props.parts.length})</button>
					)}
				</div>
			</div>
		);
	}
}

export default TopNav;
