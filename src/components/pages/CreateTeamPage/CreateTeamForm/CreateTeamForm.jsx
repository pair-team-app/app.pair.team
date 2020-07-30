
import React, { Component } from 'react';
import './CreateTeamForm.css';

import TextareaAutosize from 'react-autosize-textarea';


class CreateTeamForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title       : '',
      description : '',
      rules       : [],
      invites     : [],
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

  handleInvitesChange = (event, ind)=> {
    // console.log('%s.handleInvitesChange()', this.constructor.name, { event, ind });
    this.setState({ invites : this.state.invites.map((invite, i)=> ((i === ind) ? event.target.value : invite)) });
  };

  handleRuleAppend = ()=> {
    console.log('%s.handleRuleAppend()', this.constructor.name);

    const { rules } = this.state;
    this.setState({ rules : [ ...rules, '']});
  };

  handleRulesChange = (event, ind)=> {
    // console.log('%s.handleRulesChange()', this.constructor.name, { event, ind });
    this.setState({ rules : this.state.rules.map((rule, i)=> ((i === ind) ? event.target.value : rule)) });
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
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, team } = this.props;
    const { title, description, rules, invites, changed, validated } = this.state;

    return (<div className="create-team-form">
      <form onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Enter Team Name" value={title} onChange={this.handleTitleChange} autoComplete="new-password" />
        <input type="text" placeholder="Enter Team Description" value={description} onChange={this.handleDescriptionChange} autoComplete="new-password" />
        <div className="rules-wrapper">
          {(rules.map((rule, i)=> (<input key={i} type="text" placeholder="Enter a rule" value={rule} onChange={(event)=> this.handleRulesChange(event, i)} />)))}
          <div className="add-rule">
            <span>Add a team rule</span>
            <button className="quiet-button" onClick={this.handleRuleAppend}>+</button>
          </div>
        </div>
        <div className="invites-wrapper">
          {(invites.map((invite, i)=> (<input key={i} type="text" placeholder="Enter a email address" value={invite} onChange={(event)=> this.handleInvitesChange(event, i)} />)))}
          <div className="add-invite">
            <span>Add a email to invite</span>
            <button className="quiet-button" onClick={this.handleInviteAppend}>+</button>
          </div>
        </div>
				<div className="button-wrapper-col button-wrapper">
          <button type="button" className="quiet-button" onClick={this.props.onCancel}>Cancel</button>
				  <button type="submit" disabled={(title.length === 0)} onClick={this.handleSubmit}>Create Pair</button>
        </div>
			</form>
    </div>);
  }
}

export default (CreateTeamForm);
