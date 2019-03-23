
import React, { Component } from 'react';
import './InviteTeamForm.css';

import axios from 'axios';
import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';

import { API_ENDPT_URL } from '../../consts/uris';
import { Strings } from '../../utils/lang';
import { trackEvent } from '../../utils/tracking';


const MAX_FIELDS = 4;


const InviteTeamField = (props)=> {
	const txtName = `email${props.ind + 1}`;
	const addClass = (props.ind === props.arr.length - 1 && props.ind < MAX_FIELDS) ? 'invite-team-form-add-link' : 'invite-team-form-add-link invite-team-form-add-link-hidden';

	return (<Row vertical="center">
		<div className={(props.invite.valid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error'}>
			<input type="text" name={txtName} placeholder="Enter Email Address" value={props.invite.email} onFocus={props.onFocus} onChange={props.onChange} />
		</div>
		<span className={addClass} onClick={()=> props.onAddField()}>More</span>
	</Row>);
};


class InviteTeamForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			submitting : false,
			invites    : [{
				email    : '',
				valid    : true,
				txtClass : 'input-wrapper'
			}]
		};
	}

	componentDidMount() {
// 		console.log('InviteTeamForm.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('InviteTeamForm.componentDidUpdate()', prevProps, this.props, this.state);
	}

	componentWillUnmount() {
// 		console.log('InviteTeamForm.componentWillUnmount()');
	}

	handleChange = (event)=> {
// 		console.log('InviteTeamForm.handleChange()', event.target);

		let { invites } = this.state;
		invites.filter((invite, i)=> (i === parseInt(event.target.name.substr(-1), 10) - 1)).forEach((invite, i)=> {
			invite.email = event.target.value;
			invite.valid = (invite.email.length > 0);
		});

		this.setState({ invites });
	};

	handleFocus = (event)=> {
// 		console.log('InviteTeamForm.handleFocus()', event.target);

		let { invites } = this.state;
		invites.filter((invite, i)=> (i === parseInt(event.target.name.substr(-1), 10) - 1 && !invite.valid)).forEach((invite, i)=> {
			invite.email = '';
		});

		this.setState({ invites });
	};

	handleAddEmailField = ()=> {
// 		console.log('InviteTeamForm.handleAddEmailField()', this.state);

		trackEvent('button', 'more-email');
		let { invites } = this.state;
		invites.push({
			email    : '',
			valid    : true,
			txtClass : 'input-wrapper'
		});

		this.setState({ invites });
	};

	handleSubmit = ()=> {
// 		console.log('InviteTeamForm.handleSubmit()', this.state);

		const { profile, upload } = this.props;
		const { invites } = this.state;

		let emails = '';
		invites.forEach((invite)=> {
			invite.valid = Strings.isEmail(invite.email);
			if (!invite.valid && invite.email.length > 0) {
				invite.email = 'Invalid Email Address';
				invite.valid = false;

			} else {
				emails += `${invite.email} `;
			}
		});

		const reducer = invites.map((invite)=> ((invite.email.length > 0 && invite.valid) ? 1 : 0)).reduce((acc, val)=> acc + val);
		if (reducer === invites.length) {
			trackEvent('button', 'invite-submit');
			this.setState({ submitting : true });

			let formData = new FormData();
			formData.append('action', 'INVITE');
			formData.append('user_id', profile.id);
			formData.append('upload_id', upload.id);
			formData.append('emails', emails.slice(0, -1));
			axios.post(API_ENDPT_URL, formData)
				.then((response)=> {
					console.log('INVITE', response.data);
					this.setState({
						submitting : false,
						invites     : [{
							email    : '',
							valid    : true,
							txtClass : 'input-wrapper'
						}]
					});
					this.props.onSubmitted({
						write : response.data.invites_write,
						sent : response.data.invites_sent
					});
				}).catch((error)=> {
			});

		} else {
			this.setState({ invites });
		}
	};

	render() {
// 		console.log('InviteTeamForm.render()', this.props, this.state);

		const { title } = this.props;
		const { invites, submitting } = this.state;
		const submitValid = (invites.map((invite)=> ((invite.email.length > 0 && invite.valid) ? 1 : 0)).reduce((acc, val)=> acc + val) === invites.length);

		return (<div className="invite-team-form-wrapper">
			{(title && title.length > 0) && (<h4>{title}</h4>)}
			{(submitting) && (<div className="invite-team-form-submitting-overlay">
				<FontAwesome className="invite-team-form-spinner" name="spinner" size="3x" pulse fixedWidth />
			</div>)}
			<div className="invite-team-form-form-wrapper">
				<div style={{ width : '80%' }}><Column>
					{invites.map((invite, i, arr)=> {
						return (<InviteTeamField
							key={i}
							arr={arr}
							ind={i}
							invite={invite}
							onAddField={this.handleAddEmailField}
							onChange={this.handleChange}
							onFocus={this.handleFocus}
						/>);
					})}
				</Column></div>
				<button disabled={(!submitValid || submitting)} className="long-button" onClick={()=> ((submitValid) ? this.handleSubmit() : null)}>Invite</button>
			</div>
		</div>);
	}
}


export default InviteTeamForm;
