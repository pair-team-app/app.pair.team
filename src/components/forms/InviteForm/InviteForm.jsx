
import React, { Component } from 'react';
import './InviteForm.css'

import axios from 'axios';
import { Strings } from 'lang-js-utils';

import DummyForm from '../../forms/DummyForm';
import { MinusFormAccessory, PlusFormAccessory } from '../../forms/FormAccessories/FormAccessories';
import { trackEvent } from '../../../utils/tracking';


class InviteForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			invites      : [''],
      invitesValid : [true],
			validations  : [false]
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
	}

	handleInviteAppend = ()=> {
    console.log('%s.handleInviteAppend()', this.constructor.name);

    const { invites } = this.state;
    this.setState({ invites : [ ...invites, '']});
  };
  handleInviteChange = (event, ind)=> {
    // console.log('%s.handleInviteChange()', this.constructor.name, { event, ind });
    this.setState({ invites : this.state.invites.map((invite, i)=> ((i === ind) ? event.target.value : invite)) });
  };
  handleInviteFocus = (event, ind)=> {
    console.log('%s.handleInviteFocus()', this.constructor.name, { event, ind });

    const { invitesValid, validations } = this.state;
		this.setState({
			invitesValid : invitesValid.map((valid, ii)=> ((ii === ind) ? true : valid)),
			validations  : validations.map((valid, ii)=> ((ii === ind) ? false : valid ))
    });
  };
  handleInviteRemove = (event, i)=> {
    console.log('%s.handleInviteRemove()', this.constructor.name, { event, i });

    let { invites, invitesValid, validations } = this.state;
    invites.splice(i, 1);
    invitesValid.splice(i, 1);
    validations.splice(i, 1);
    this.setState({ invites, invitesValid, validations });
  };

	handleSubmit = (event)=> {
		console.log('%s.handleSubmit()', this.constructor.name, event.target, this.state);
		event.preventDefault();

		trackEvent('button', 'team-invite');

		const invites = this.state.invites.filter((invite)=> (invite.length > 0));
		const invitesValid = (invites.length === 0) ? [] : invites.map((invite)=> (Strings.isEmail(invite)));

    if (invitesValid.filter((valid)=> (valid)).length === invites.length) {
			this.props.onSubmitted({ invites });
			this.setState({
				invites      : [''],
				invitesValid : [true]
			});

		} else {
			this.setState({ validations : new Array(invites.length).fill(true) });
		}
	};


	render() {
		console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { invites, invitesValid, validations } = this.state;

		return (<div className="invite-form">
			<form onSubmit={this.handleSubmit}>
				<DummyForm />
				<div className="invites-wrapper">
					{(invites.slice(0, -1).map((invite, i)=> (
						<div key={i} className="input-acc-wrapper">
							<input type={(validations[i]) ? 'email' : 'text'} name={`invite-${i}`} placeholder="Enter a email address" value={invite} onFocus={(event)=> this.handleInviteFocus(event, i)} onChange={(event)=> this.handleInviteChange(event, i)} autoComplete="new-password" />
							<MinusFormAccessory onClick={(event)=> this.handleInviteRemove(event, i)} />
						</div>
					)))}
					<div className="input-acc-wrapper">
						<input type={([...validations].pop()) ? 'email' : 'text'} placeholder="Add Email Address" value={[...invites].pop()} onFocus={(event)=> this.handleInviteFocus(event, invites.length - 1)} onChange={(event)=> this.handleInviteChange(event, invites.length - 1)} autoComplete="new-password" />
						<PlusFormAccessory onClick={this.handleInviteAppend} />
					</div>
				</div>
				<div className="button-wrapper button-wrapper-row">
					<button type="submit" disabled={(invites.reduce((prev, curr)=> (`${prev}${curr}`), '').length > 0 && invitesValid.length === invitesValid.filter((valid)=> (!valid)).length)} onClick={this.handleSubmit}>Submit</button>
					<button type="button" className="cancel-button" onClick={this.handleCancel}>Cancel</button>
				</div>
			</form>
		</div>);
	}
}

export default InviteForm;
