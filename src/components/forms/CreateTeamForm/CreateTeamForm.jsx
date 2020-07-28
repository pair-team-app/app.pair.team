
import React, { Component } from 'react';
import './CreateTeamForm.css';

import TextareaAutosize from 'react-autosize-textarea';


class CreateTeamForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title       : 'invite team',
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

  /* handleFilePond = ()=> {
    console.log('%s.()', this.constructor.name, {  });
  }; */

  handleCancel = (event)=> {
    console.log('%s.handleCancel()', this.constructor.name, { event });
    this.props.onCancel();
  };

  handleTitleChange = (event)=> {
    // console.log('%s.handleTitleChange()', this.constructor.name, { event });
    this.setState({ title : event.target.value });
  };

  handleDescriptionChange = (event)=> {
    // console.log('%s.handleDescriptionChange()', this.constructor.name, { event });
    this.setState({ description : event.target.value });
  };

  handleInvitesChange = (event)=> {
    // console.log('%s.handleInvitesChange()', this.constructor.name, { event });
    this.setState({ invites : event.target.value.split(' ') });
  };

  handleRulesChange = (event)=> {
    // console.log('%s.handleRulesChange()', this.constructor.name, { event });
    this.setState({ rules : event.target.value.split('\n') });
  };

  handleSubmit = (event)=> {
    console.log('%s.handleSubmit()', this.constructor.name, { event });
    event.preventDefault();

    const { title, description, rules, invites } = this.state;
    this.props.onSubmit({ title, description, rules, invites : (invites.join(' ').length === 0) ? [] : invites });
  };


  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, team } = this.props;
    const { title, description, rules, invites, changed, validated } = this.state;

    return (<div className="create-team-form">
      <form onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Enter Team Name" value={title} onChange={this.handleTitleChange} autoComplete="new-password" />
        <input type="text" placeholder="Enter Team Description" value={description} onChange={this.handleDescriptionChange} autoComplete="new-password" />
        <TextareaAutosize className="rules-txt" placeholder="Team rules (one per line)" value={rules.join('\n')} onChange={this.handleRulesChange} />
        <TextareaAutosize className="invites-txt" placeholder="Invite (space separated emails)" value={invites.join(' ')} onChange={this.handleInvitesChange} />
				{/* <button disabled={(emails.filter((email)=> (email.length === 0)).length === emails.length || emailsValid.filter((valid)=> (!valid)).length === emailsValid.length)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Invite Team</button> */}
				<button type="button" className="quiet-button" onClick={this.handleCancel}>Cancel</button>
				<button type="submit" disabled={(title.length === 0)} onClick={(event)=> this.handleSubmit(event)}>Create Pair</button>
			</form>
    </div>);
  }
}

export default (CreateTeamForm);
