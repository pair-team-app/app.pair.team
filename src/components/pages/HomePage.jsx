
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
// import CopyToClipboard from 'react-copy-to-clipboard';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import HomeExpo from '../elements/HomeExpo';
import ArtboardItem from '../iterables/ArtboardItem';
import Popup from '../elements/Popup';

class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action            : '',
			uploadID          : 0,
			uploadTitle       : 'Loading Project…',
			uploadDescription : '',
			uploadTotal       : 0,
			pageTitle         : 'Loading…',
			uploadURL         : '…',
			artboards         : [],
			loadOffset        : 0,
			loadAmt           : 10,
			popup : {
				visible : false,
				content : ''
			}
		};
	}

	componentDidMount() {
		console.log('HomePage().componentDidMount()', this.props);
		if (this.props.uploadID !== 0) {
			this.refreshData();
		}
	}

	componentDidUpdate(prevProps) {
// 		console.log('HomePage.componentDidUpdate()', this.props, prevProps);
		if (this.props.uploadID !== -1 && this.props.uploadID !== prevProps.uploadID) {
			this.refreshData();
			return (null);
		}
	}

	refreshData = ()=> {
		this.setState({
			pageTitle : 'Loading…',
			uploadURL : (this.props.pageID === 0) ? '…' : this.state.uploadURL,
			artboards : []
		});

		let formData = new FormData();
		formData.append('action', 'UPLOAD_NAMES');
		formData.append('user_id', cookie.load('user_id'));
		formData.append('offset', this.state.loadOffset);
		formData.append('length', this.state.loadAmt);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_NAMES', response.data);
				let self = this;
				let uploadID = 0;
				let title = '';
				let description = '';
				let total = 0;
				let uploadURL = '';
				response.data.uploads.forEach(function(upload, i) {
					if (upload.id === self.props.uploadID) {
						uploadID = upload.id;
						title = upload.title;
						description = upload.description;
						total = upload.total;
						uploadURL = 'https://earlyaccess.designengine.ai/proj/' + self.props.uploadID + '/' + upload.title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase();
					}
				});

				formData.append('action', 'PAGE');
				formData.append('page_id', this.props.pageID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('PAGE', response.data);
						this.setState({ pageTitle : (this.props.pageID === 0) ? title : response.data.page.title });

						formData.append('action', 'ARTBOARDS');
						formData.append('upload_id', this.props.uploadID);
						formData.append('page_id', (this.props.pageID === 0) ? '-1' : this.props.pageID);
						formData.append('slices', '0');
						axios.post('https://api.designengine.ai/system.php', formData)
							.then((response) => {
								console.log('ARTBOARDS', response.data);

								const artboards = response.data.artboards.map((item) => ({
									id       : item.id,
									pageID   : item.page_id,
									uploadID : item.upload_id,
									title    : item.title,
									type     : item.type,
									filename : item.filename,
									meta     : JSON.parse(item.meta),
									added    : item.added,
									selected : false
								}));

								this.setState({
									uploadID          : uploadID,
									uploadTitle       : title,
									uploadDescription : description,
									uploadTotal       : total,
									uploadURL         : uploadURL,
									artboards         : artboards,
									pageTitle         : this.state.pageTitle + ' (' + (artboards.length) + ')',
									loadOffset        : this.state.loadOffset + this.state.loadAmt
								});
							}).catch((error) => {
						});
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	handleHomeExpoItem = (ind)=> {
		if (ind === 0) {
			this.props.onPage('artboard/1/1/1/notifications');

		} else if (ind === 1) {
			this.props.onPage('register');

		} else if (ind === 2) {
			this.props.onPage('artboard/36/153/1186/home');
		}
	};

	handleDownload = ()=> {
		let link = document.createElement('a');
		const filePath = 'http://cdn.designengine.ai/document.php?upload_id=' + this.state.uploadID;
		link.href = filePath;
		link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
		link.click();
	};

	handleURLCopy = ()=> {
		const popup = {
			visible : true,
			content : 'Copied to Clipboard!'
		};
		this.setState({ popup : popup });
	};


	render() {
		const artboards = this.state.artboards;
		const items = artboards.map((artboard) => {
			if (artboard.type !== 'hero' && (this.props.pageID <= 0 || this.props.pageID === artboard.pageID)) {
				return (
					<Column key={artboard.id}>
						<ArtboardItem
							title={artboard.title}
							image={artboard.filename}
							size="landscape"//{(artboard.meta.frame.size.width > artboard.meta.frame.size.height || artboard.meta.frame.size.width === artboard.meta.frame.size.height) ? 'landscape' : 'portrait'}
							onClick={() => this.props.onArtboardClicked(artboard)} />
					</Column>
				);

			} else {
				return (null);
			}
		});


		return (
			<div className="page-wrapper home-page-wrapper">
				<HomeExpo onClick={(ind)=> this.handleHomeExpoItem(ind)} />

				{(parseInt(this.props.uploadID, 10) !== 0) && (<div>
					<Row><h3>{this.state.pageTitle}</h3></Row>
					<Row horizontal="space-between" className="home-page-artboards-wrapper" style={{flexWrap:'wrap'}}>
						{items}
					</Row>
				</div>)}

				{(cookie.load('user_id') === '0') ? (<div>
					<Row><h3>Sign up or Login</h3></Row>
					<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
					<div style={{marginTop:'20px'}}>
						<button className="adjacent-button" onClick={()=> this.props.onPage('register')}>Sign up with Email</button>
						<button onClick={()=> this.props.onPage('login')}>Login</button>
					</div>
				</div>) : (parseInt(this.props.uploadID, 10) === 0) && (<div>
					<Row><h3>Create a new design project</h3></Row>
					<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
					<div style={{marginTop:'20px'}}>
						<button onClick={()=> this.props.onPage('new')}>New Project</button>
					</div>
				</div>)}

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default HomePage;
