
import React, { Component } from 'react';
import './CreateTeamForm.css';

import DummyForm from '../../../forms/DummyForm';


class CreateTeamForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title       : '',
      description : '',
      rules       : [''],
      invites     : [''],
      changed     : false,
      validated   : false
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
    console.log('%s.handleInviteChange()', this.constructor.name, { event, ind });
    this.setState({ invites : this.state.invites.map((invite, i)=> ((i === ind) ? event.target.value : invite)) });
  };

  handleInviteRemove = (event, i)=> {
    console.log('%s.handleInviteRemove()', this.constructor.name, { event, i });

    let { invites } = this.state;
    invites.splice(i, 1);
    this.setState({ invites });
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
    this.props.onSubmit({ title, description,
      rules   : rules.filter((rule)=> (rule.length > 0)),
      invites : invites.filter((invite)=> (invite.length > 0))
    });
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    // const { title, description, rules, invites, validated } = this.state;
    const { title, description, rules, invites } = this.state;

    return (<div className="create-team-form">
      <form onSubmit={this.handleSubmit}>
        <DummyForm />
        <input type="text" placeholder="Enter Team Name" value={title} onChange={this.handleTitleChange} autoComplete="new-password" />
        <input type="text" placeholder="Enter Team Description" value={description} onChange={this.handleDescriptionChange} autoComplete="new-password" />
        <div className="rules-wrapper">
          {(rules.slice(0, -1).map((rule, i)=> (
            <div key={i} className="input-wrapper">
              <CreateTeamFormMinusAcc onClick={(event)=> this.handleRuleRemove(event, i)} />
              <input type="text" placeholder="Enter a rule" value={rule} onChange={(event)=> this.handleRuleChange(event, i)} autoComplete="new-password" />
            </div>
          )))}
          <div className="input-wrapper">
            <input type="text" placeholder="Add Team Rule" value={[...rules].pop()} onChange={(event)=> this.handleRuleChange(event, rules.length - 1)} autoComplete="new-password" />
            <CreateTeamFormPlusAcc onClick={this.handleRuleAppend} />
          </div>
        </div>
        <div className="invites-wrapper">
          {(invites.slice(0, -1).map((invite, i)=> (
            <div key={i} className="input-wrapper">
              <CreateTeamFormMinusAcc onClick={(event)=> this.handleInviteRemove(event, i)} />
              <input type="text" name={`invite-${i}`} placeholder="Enter a email address" value={invite} onChange={(event)=> this.handleInviteChange(event, i)} autoComplete="new-password" />
            </div>
          )))}
          <div className="input-wrapper">
            <input type="text" placeholder="Add Email Address" value={[...invites].pop()} onChange={(event)=> this.handleInviteChange(event, invites.length - 1)} autoComplete="new-password" />
            <CreateTeamFormPlusAcc onClick={this.handleInviteAppend} />
          </div>
        </div>
				<div className="button-wrapper button-wrapper-row">
				  <button type="submit" disabled={(title.length === 0)} onClick={this.handleSubmit}>Submit</button>
          <button type="button" className="cancel-button" onClick={this.props.onCancel}>Cancel</button>
        </div>
			</form>
    </div>);
  }
}

const CreateTeamFormPlusAcc = (props)=> {
  return (<div className="create-team-form-acc" onClick={props.onClick}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="white" stroke="#999999" strokeWidth="2"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7Z" fill="#909090"/>
    </svg>
  </div>);
};

const CreateTeamFormMinusAcc = (props)=> {
  return (<div className="create-team-form-acc" onClick={props.onClick}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="white" stroke="#999999" strokeWidth="2"/>
      <path d="M7 13V11H17V13H7Z" fill="#909090"/>
    </svg>
  </div>);
};

export default (CreateTeamForm);
