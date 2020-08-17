
import React, { Component } from 'react';
import './CreateTeamForm.css';

import { Strings } from 'lang-js-utils';
import DummyForm from '../../../forms/DummyForm';
import { MinusFormAccessory, PlusFormAccessory } from '../../../forms/FormAccessories/FormAccessories';

class CreateTeamForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title        : '',
      description  : '',
      rules        : [''],
      invites      : [''],
      invitesValid : [true],
      validations  : [false]
    };
  }
  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  handleTitleChange = (event)=> {
    // console.log('%s.handleTitleChange()', this.constructor.name, { event });
    this.setState({ title : event.target.value });
  };

  handleDescriptionChange = (event)=> {
    // console.log('%s.handleDescriptionChange()', this.constructor.name, { event });
    this.setState({ description : event.target.value });
  };

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

  handleRuleAppend = ()=> {
    console.log('%s.handleRuleAppend()', this.constructor.name);

    const { rules } = this.state;
    this.setState({ rules : [ ...rules, '']});
  };

  handleRuleChange = (event, ind)=> {
    // console.log('%s.handleRuleChange()', this.constructor.name, { event, ind });
    this.setState({ rules : this.state.rules.map((rule, i)=> ((i === ind) ? event.target.value : rule)) });
  };

  handleRuleRemove = (event, i)=> {
    console.log('%s.handleRuleRemove()', this.constructor.name, { event, i });

    let { rules } = this.state;
    rules.splice(i, 1);
    this.setState({ rules });
  };

  handleSubmit = (event)=> {
    console.log('%s.handleSubmit()', this.constructor.name, { event });
    event.preventDefault();

    const { title, description, rules, invites } = this.state;

    const invitesValid = invites.map((invite)=> (Strings.isEmail(invite)));
    this.setState({ invitesValid });

    if (invitesValid.filter((valid)=> (valid)).length === invites.length) {
      this.props.onSubmit({ title, description,
        rules   : rules.filter((rule)=> (rule.length > 0)),
        invites : invites.filter((invite)=> (invite.length > 0))
      });

    } else {
      this.setState({ validations : new Array(invites.length).fill(true) })
    }
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { title, description, rules, invites, invitesValid, validations } = this.state;
    return (<div className="create-team-form">
      <form onSubmit={this.handleSubmit}>
        <DummyForm />
        <input type="text" placeholder="Enter Team Name" value={title} onChange={this.handleTitleChange} autoComplete="new-password" />
        <input type="text" placeholder="Enter Team Description" value={description} onChange={this.handleDescriptionChange} autoComplete="new-password" />
        <div className="rules-wrapper">
          {(rules.slice(0, -1).map((rule, i)=> (
            <div key={i} className="input-acc-wrapper">
              <input type="text" placeholder="Enter a rule" value={rule} onChange={(event)=> this.handleRuleChange(event, i)} autoComplete="new-password" />
              <MinusFormAccessory onClick={(event)=> this.handleRuleRemove(event, i)} />
            </div>
          )))}
          <div className="input-acc-wrapper">
            <input type="text" placeholder="Add Team Rule" value={[...rules].pop()} onChange={(event)=> this.handleRuleChange(event, rules.length - 1)} autoComplete="new-password" />
            <PlusFormAccessory onClick={this.handleRuleAppend} />
          </div>
        </div>
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
				  <button type="submit" disabled={(title.length === 0 || (invites.reduce((prev, curr)=> (`${prev}${curr}`), '').length > 0 && invitesValid.length === invitesValid.filter((valid)=> (!valid)).length))} onClick={this.handleSubmit}>Submit</button>
          <button type="button" className="cancel-button" onClick={this.props.onCancel}>Cancel</button>
        </div>
			</form>
    </div>);
  }
}


export default (CreateTeamForm);
