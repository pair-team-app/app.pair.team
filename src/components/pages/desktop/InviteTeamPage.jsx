
import React, { Component } from 'react';
import './InviteTeamPage.css';

import axios from 'axios/index';
import cookie from 'react-cookies';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

// import BaseDesktopPage from './BaseDesktopPage';
import { POPUP_TYPE_OK } from '../../elements/Popup';
import Dropdown from '../../forms/elements/Dropdown';
import { buildInspectorURL, isValidEmail, isUserLoggedIn } from '../../../utils/funcs';


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
			loadAmt     : 111
		};
	}

	componentDidMount() {
		console.log('InviteTeamPage.componentDidMount()', this.props, this.state);

		if (!isUserLoggedIn()) {
			cookie.save('msg', 'use this feature.', { path : '/' });
			this.props.onPage('login');
		}

		if (this.props.profile) {
			this.refreshData();
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

		const { uploadID } = this.props;

		let formData = new FormData();
		formData.append('action', 'UPLOAD_NAMES');
		formData.append('user_id', this.props.profile.id);
		formData.append('offset', '0');
		formData.append('length', '-1');
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('UPLOAD_NAMES', response.data);
				const uploads = response.data.uploads.filter((upload)=> (upload.id !== '2' && upload.id !== '3')).map((upload)=> ({
					id       : upload.id,
					title    : upload.title,
					author   : upload.author,
					added    : upload.added,
					selected : (uploadID === upload.id),
					pages    : []
				}));

				uploads.forEach((upload)=> {
					if (upload.id === uploadID) {
						this.setState({
							uploadTitle : upload.title,
							uploadURL   : buildInspectorURL(upload)
						});
					}
				});

				this.setState({ uploads });
			}).catch((error)=> {
		});
	};

	resetThenSet = (ind, key)=> {
		let uploads = [...this.state.uploads];
		uploads.forEach(upload => upload.selected = false);

		let upload = uploads[ind];
		upload.selected = true;
		this.setState({
			uploadID    : upload.id,
			uploadTitle : upload.title,
			uploadURL   : buildInspectorURL(upload),
			uploads     : uploads
		});
	};

	handleURLCopy = ()=> {
		this.props.onPopup({
			type    : POPUP_TYPE_OK,
			content : 'Copied to Clipboard!'
		});
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
			emails += `${email1} `;
		}

		if (isEmail2Valid) {
			emails += `${email2} `;
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
				.then((response)=> {
					console.log('INVITE', response.data);
				}).catch((error)=> {
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
							: (<button onClick={()=> this.props.onPage('<<')}>Go Back</button>)
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
							<button disabled={(email1.length === 0 && email2.length === 0 && email3.length > 0)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Send Invites</button>
						</form>
					</div>)
					: (<h4>Invitations sent.</h4>)}
			</div>
		);
	}
}

export default connect(mapStateToProps)(InviteTeamPage);
