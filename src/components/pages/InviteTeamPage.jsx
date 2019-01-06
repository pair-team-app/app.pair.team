
import React, { Component } from 'react';
import './InviteTeamPage.css';

import axios from 'axios/index';
import { connect } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Row } from 'simple-flexbox';

import Dropdown from '../elements/Dropdown';
import Popup from '../elements/Popup';

import { isValidEmail, isUserLoggedIn, urlSlugTitle } from '../../utils/funcs';
import cookie from "react-cookies";


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


class InviteTeamPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			uploadID    : this.props.uploadID,
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
			loadOffset  : 0,
			loadAmt     : 111,
			popup : {
				visible : false,
				content : ''
			}
		};
	}

	componentDidMount() {
		console.log('InviteTeamPage.componentDidMount()', this.props, this.state);

		if (!isUserLoggedIn()) {
			cookie.save('msg', 'use this feature.', { path : '/' });
			this.props.onPage('login');
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('InviteTeamPage.componentDidUpdate()', prevProps, this.props, this.state);
		if (this.props.profile !== prevProps.profile || prevProps.uploadID !== this.props.uploadID) {
			this.refreshData();
		}
	}

	refreshData = ()=> {
		console.log('InviteTeamPage.refreshData()');

		const { pageID, artboardID } = this.props;
		const { uploadID, uploadTitle, loadOffset, loadAmt } = this.state;

		let formData = new FormData();
		formData.append('action', 'UPLOAD_NAMES');
		formData.append('user_id', this.props.profile.id);
		formData.append('offset', loadOffset);
		formData.append('length', loadAmt);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_NAMES', response.data);
				const uploads = response.data.uploads.filter((upload)=> (upload.id !== '2' && upload.id !== '3')).map((upload)=> ({
					id       : upload.id,
					title    : upload.title,
					author   : upload.author,
					added    : upload.added,
					selected : (uploadID === upload.id),
					pages    : upload.pages.map((page) => ({
						id          : page.id,
						title       : page.title,
						description : page.description,
						added       : page.added,
						selected    : (pageID === page.id),
						artboards   : page.artboards.map((artboard) => ({
							id       : artboard.id,
							pageID   : artboard.page_id,
							title    : artboard.title,
							filename : artboard.filename,
							meta     : JSON.parse(artboard.meta),
							added    : artboard.added,
							selected : (artboardID === artboard.id)
						}))
					}))
				}));

				if (uploadID !== 0) {
					uploads.forEach((upload)=> {
						if (upload.id === uploadID) {
							this.setState({
								uploadTitle : upload.title,
								uploadURL   : window.location.origin + '/proj/' + uploadID + '/' + urlSlugTitle(upload.title)
							});
						}
					});
				}

				this.setState({ uploads });
			}).catch((error) => {
		});
	};

	resetThenSet = (ind, key) => {
		let uploads = [...this.state.uploads];
		uploads.forEach(upload => upload.selected = false);

		let upload = uploads[ind];
		upload.selected = true;
		this.setState({
			uploadID    : upload.id,
			uploadTitle : upload.title,
			uploadURL   : window.location.origin + '/proj/' + upload.id + '/' + urlSlugTitle(upload.title),
			uploads     : uploads
		});
	};

	handleURLCopy = ()=> {
		const popup = {
			visible : true,
			content : 'Copied to Clipboard!'
		};
		this.setState({ popup });
	};

	handleSubmit = (event)=> {
		event.preventDefault();

		const { email1, email2, email3 } = this.state;
		const isEmail1Valid = isValidEmail(email1);
		const isEmail2Valid = isValidEmail(email2);
		const isEmail3Valid = isValidEmail(email3);

		this.setState({
			action      : 'INVITE',
			email1Valid : isEmail1Valid,
			email2Valid : isEmail2Valid,
			email3Valid : isEmail3Valid
		});

		let emails = '';
		if (isEmail1Valid) {
			emails += email1 + " ";
		}

		if (isEmail2Valid) {
			emails += email2 + " ";
		}

		if (isEmail3Valid) {
			emails += email3;
		}

		if (isEmail1Valid || isEmail2Valid || isEmail3Valid) {
			let formData = new FormData();
			formData.append('action', 'INVITE');
			formData.append('user_id', this.props.profile.id);
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
		console.log('InviteTeamPage.render()', this.props, this.state);

		const { action, sentInvites, uploadURL, uploadTitle } = this.state;
		const { email1, email2, email3 } = this.state;
		const { email1Valid, email2Valid, email3Valid } = this.state;

		const email1Class = (action === '') ? 'input-wrapper' : (action === 'INVITE' && !email1Valid && email1.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email2Class = (action === '') ? 'input-wrapper' : (action === 'INVITE' && !email2Valid && email2.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email3Class = (action === '') ? 'input-wrapper' : (action === 'INVITE' && !email3Valid && email3.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const inviteButtonClass = (email1.length > 0 || email2.length > 0 || email3.length > 0) ? '' : 'button-disabled';

		return (
			<div className="page-wrapper invite-team-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>Invite Team Members</h1></Row>
					<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along.</div>
					<Row horizontal="center">
						{(!sentInvites)
							? (<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={uploadURL}>
									<button>Copy Project Link</button>
								</CopyToClipboard>)
							: (<button onClick={()=> this.props.onPage('//')}>Go Back</button>)
						}
					</Row>
				</div>
				{(!this.state.sentInvites)
					? (<div style={{ width : '100%' }}>
						<Dropdown
							title={uploadTitle}
							list={this.state.uploads}
							resetThenSet={this.resetThenSet}
						/>
						<form onSubmit={this.handleSubmit}>
							<div className={email1Class}><input type="text" name="email1" placeholder="Enter Email Address" value={email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							<div className={email2Class}><input type="text" name="email2" placeholder="Enter Email Address" value={email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							<div className={email3Class}><input type="text" name="email3" placeholder="Enter Email Address" value={email3} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							<button type="submit" className={inviteButtonClass} onClick={(event) => this.handleSubmit(event)}>Send Invites</button>
						</form>
					</div>)
					: (<h3>Invitations sent.</h3>)}

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default connect(mapStateToProps)(InviteTeamPage);
