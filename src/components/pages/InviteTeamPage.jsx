
import React, { Component } from 'react';
import './InviteTeamPage.css';

import CopyToClipboard from 'react-copy-to-clipboard';
import { Row } from 'simple-flexbox';
import cookie from "react-cookies";
import axios from "axios/index";

import BottomNav from '../elements/BottomNav';
import Dropdown from '../elements/Dropdown';
import Popup from '../elements/Popup';

class InviteTeamPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			uploadID    : (typeof cookie.load('upload_id') !== 'undefined') ? cookie.load('upload_id') : this.props.uploadID,
			uploadTitle : 'Select Project',
			uploadURL   : '…',
			uploads     : [],
			action      : '',
			email1      : '',
			email2      : '',
			email3      : '',
			email1Valid : false,
			email2Valid : false,
			email3Valid : false,
			sentInvites : false,
			popup : {
				visible : false,
				content : ''
			}
		};
	}

	componentDidMount() {
		let formData = new FormData();
		formData.append('action', 'UPLOAD_NAMES');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_NAMES', response.data);
				const uploads = response.data.uploads.map((upload)=> ({
					id       : upload.id,
					title    : upload.title,
					author   : upload.author,
					added    : upload.added,
					selected : (this.state.uploadID === upload.id),
					pages    : upload.pages.map((page) => ({
						id          : page.id,
						title       : page.title,
						description : page.description,
						added       : page.added,
						selected    : (this.props.pageID === page.id),
						artboards   : page.artboards.map((artboard)=> ({
							id       : artboard.id,
							pageID   : artboard.page_id,
							title    : artboard.title,
							filename : artboard.filename,
							meta     : JSON.parse(artboard.meta),
							added    : artboard.added,
							selected : (this.props.artboardID === artboard.id)
						}))
					}))
				}));

				if (this.state.uploadID !== 0) {
					let self = this;
					let uploadID = 0;
					let uploadTitle = 'Select Project';
					let uploadURL = '';
					uploads.forEach(function(upload) {
						if (upload.id === self.state.uploadID) {
							uploadID = upload.id;
							uploadTitle = upload.title;
							uploadURL = 'https://earlyaccess.designengine.ai/proj/' + self.state.uploadID + '/' + upload.title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase();
						}
					});

					this.setState({
						uploadID    : uploadID,
						uploadTitle : uploadTitle,
						uploadURL   : uploadURL,
						uploads     : uploads
					});

				} else {
					this.setState({
						uploadID    : (uploads.length > 0) ? uploads[0].id : this.state.uploadID,
						uploadTitle : (uploads.length > 0) ? uploads[0].title : this.state.uploadTitle,
						uploadURL   : (uploads.length > 0) ? 'https://earlyaccess.designengine.ai/proj/' + uploads[0].id + '/' + uploads[0].title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase() : this.state.uploadURL,
						uploads     : uploads
					});
				}
			}).catch((error) => {
		});
	}

	resetThenSet = (ind, key) => {
		let uploads = [...this.state.uploads];
		uploads.forEach(upload => upload.selected = false);
		uploads[ind].selected = true;
		this.setState({
			uploadURL   : 'https://earlyaccess.designengine.ai/proj/' + uploads[0].id + '/' + uploads[ind].title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase(),
			uploads     : uploads
		});
	};

	handleURLCopy = ()=> {
		const popup = {
			visible : true,
			content : 'Copied to Clipboard!'
		};
		this.setState({ popup : popup });
	};

	handleSubmit = (event)=> {
		event.preventDefault();

		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		const isEmail1Valid = re.test(String(this.state.email1).toLowerCase());
		const isEmail2Valid = re.test(String(this.state.email2).toLowerCase());
		const isEmail3Valid = re.test(String(this.state.email3).toLowerCase());

		this.setState({
			action      : 'INVITE',
			email1Valid : isEmail1Valid,
			email2Valid : isEmail2Valid,
			email3Valid : isEmail3Valid
		});

		let emails = '';
		if (isEmail1Valid) {
			emails += this.state.email1 + " ";
		}

		if (isEmail2Valid) {
			emails += this.state.email2 + " ";
		}

		if (isEmail3Valid) {
			emails += this.state.email3;
		}

		if (isEmail1Valid || isEmail2Valid || isEmail3Valid) {
			let formData = new FormData();
			formData.append('action', 'INVITE');
			formData.append('user_id', cookie.load('user_id'));
			formData.append('upload_id', this.state.uploadID);
			formData.append('emails', emails);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('INVITE', response.data);
				}).catch((error) => {
			});

			this.setState({ sentInvites : true });
		}
	};

	render() {
		const { email1, email2, email3 } = this.state;
		const { email1Valid, email2Valid, email3Valid } = this.state;

		const email1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !email1Valid && email1.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !email2Valid && email2.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email3Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !email3Valid && email3.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const inviteButtonClass = (email1.length > 0 || email2.length > 0 || email3.length > 0) ? '' : 'button-disabled';

		return (
			<div className="page-wrapper invite-team-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>Invite Team Members</h1></Row>
					<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along.</div>
					<Row horizontal="center">
						{(!this.state.sentInvites)
							? (<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.uploadURL}>
									<button>Copy Project Link</button>
								</CopyToClipboard>)
							: (<button onClick={()=> this.props.onPage('//')}>Go Back</button>)
						}
					</Row>
				</div>
				{(!this.state.sentInvites)
					? (<div style={{width:'100%'}}>
						<Dropdown
							title={this.state.uploadTitle}
							list={this.state.uploads}
							resetThenSet={this.resetThenSet}
						/>
						<form onSubmit={this.handleSubmit}>
							<div className={email1Class}><input type="text" name="email1" placeholder="Enter Email Address" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							<div className={email2Class}><input type="text" name="email2" placeholder="Enter Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							<div className={email3Class}><input type="text" name="email3" placeholder="Enter Email Address" value={this.state.email3} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							<button type="submit" className={inviteButtonClass} onClick={(event) => this.handleSubmit(event)}>Send Invites</button>
						</form>
					</div>)
					: (<h4>Invitations sent.</h4>)}
				<BottomNav onPage={(url)=> this.props.onPage(url)} onLogout={()=> this.props.onLogout()} />

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default InviteTeamPage;
