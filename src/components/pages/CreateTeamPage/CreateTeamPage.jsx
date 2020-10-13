
import React, { Component } from 'react';
import './CreateTeamPage.css';

import { Strings } from 'lang-js-utils';
import { goBack } from 'connected-react-router';
import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';

import BasePage from '../BasePage';
// import CreateTeamForm from './CreateTeamForm';
import DummyForm from '../../forms/DummyForm';
import { MinusFormAccessory, PlusFormAccessory } from '../../forms/FormAccessories/FormAccessories';
import { makeTeam } from '../../../redux/actions';



class CreateTeamPage extends Component {
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

    const { title, description } = this.state;
    const rules = this.state.rules.filter((rule)=> (rule.length > 0));
    const invites = this.state.invites.filter((invite)=> (invite.length > 0));

    // const invitesValid = invites.map((invite)=> (Strings.isEmail(invite) || invite.length === 0));
    const invitesValid = (invites.length === 0) ? [] : invites.map((invite)=> (Strings.isEmail(invite)));
    if (invitesValid.filter((valid)=> (valid)).length === invites.length) {


        // if ((invites.map((invite)=> (invite.length === 0) ? '' : invite).reduce((acc, val)=> ((!val) ? acc : `${acc}${val}`), '').length > 0) && invitesValid.filter((valid)=> (valid)).length === invites.length) {
        // if ((invites.map((invite)=> (invite.length === 0) ? '' : invite).reduce((acc, val)=> ((!val) ? acc : `${acc}${val}`), '').length > 0) && invitesValid.filter((valid)=> (valid)).length === invites.length) {
        this.props.makeTeam({ title, description, rules, invites });
        this.setState({
          rules        : [''],
          invites      : [''],
          invitesValid : [true]
        });

    } else {
      this.setState({ validations : new Array(invites.length).fill(true) });
    }
  };

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile } = this.props;
    return (<BasePage { ...this.props } className="create-team-page">
      {(profile) && (<CreateTeamForm { ...this.state}
        onTitleChange={this.handleTitleChange}
        onDescriptionChange={this.handleDescriptionChange}
        onRuleChange={this.handleRuleChange}
        onRuleAppend={this.handleRuleAppend}
        onRuleRemove={this.handleRuleRemove}
        onInviteAppend={this.handleInviteAppend}
        onInviteChange={this.handleInviteChange}
        onInviteFocus={this.handleInviteFocus}
        onInviteRemove={this.handleInviteRemove}
        onSubmit={this.handleSubmit}
        onCancel={this.props.goBack}
      />)}
    </BasePage>);
  }
}


const CreateTeamForm = (props)=> {
  console.log('CreateTeamForm()', { props });

  const { title, description, rules, invites, invitesValid, validations } = props;
  return (<div className="create-team-form">
    <form>
      <DummyForm />
      <input type="text" placeholder="Enter Name" value={title} onChange={props.onTitleChange} autoComplete="new-password" />
      <input type="text" placeholder="Enter Description" value={description} onChange={props.onDescriptionChange} autoComplete="new-password" />
      <div className="rules-wrapper">
        {(rules.slice(0, -1).map((rule, i)=> (
          <div key={i} className="input-acc-wrapper">
            <input type="text" placeholder="Enter a rule" value={rule} onChange={(event)=> props.onRuleChange(event, i)} autoComplete="new-password" />
            <MinusFormAccessory onClick={(event)=> props.onRuleRemove(event, i)} />
          </div>
        )))}
        <div className="input-acc-wrapper">
          <input type="text" placeholder="Add Rule" value={[...rules].pop()} onChange={(event)=> props.onRuleChange(event, rules.length - 1)} autoComplete="new-password" />
          <PlusFormAccessory onClick={props.onRuleAppend} />
        </div>
      </div>
      <div className="invites-wrapper">
        {(invites.slice(0, -1).map((invite, i)=> (
          <div key={i} className="input-acc-wrapper">
            <input type={(validations[i]) ? 'email' : 'text'} name={`invite-${i}`} placeholder="Enter a email address" value={invite} onFocus={(event)=> props.onInviteFocus(event, i)} onChange={(event)=> props.onInviteChange(event, i)} autoComplete="new-password" />
            <MinusFormAccessory onClick={(event)=> props.onInviteRemove(event, i)} />
          </div>
        )))}
        <div className="input-acc-wrapper">
          <input type={([...validations].pop()) ? 'email' : 'text'} placeholder="Add Email Address" value={[...invites].pop()} onFocus={(event)=> props.onInviteFocus(event, invites.length - 1)} onChange={(event)=> props.onInviteChange(event, invites.length - 1)} autoComplete="new-password" />
          <PlusFormAccessory onClick={props.onInviteAppend} />
        </div>
      </div>
      <div className="button-wrapper button-wrapper-row">
        <button type="submit" disabled={(title.length === 0 || (invites.reduce((prev, curr)=> (`${prev}${curr}`), '').length > 0 && invitesValid.length === invitesValid.filter((valid)=> (!valid)).length))} onClick={props.onSubmit}>Submit</button>
        <button type="button" className="cancel-button" onClick={props.onCancel}>Cancel</button>
      </div>
    </form>
  </div>);
};


const mapDispatchToProps = (dispatch)=> {
  return ({
    makeTeam : (payload)=> dispatch(makeTeam(payload)),
    goBack   : (payload)=> dispatch(goBack(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    profile : state.user.profile,
    teams   : state.user.teams
  });
};

// export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateTeamPage));
export default connect(mapStateToProps, mapDispatchToProps)(CreateTeamPage);
