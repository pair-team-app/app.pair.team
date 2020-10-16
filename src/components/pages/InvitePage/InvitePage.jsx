
import React, { Component } from 'react';
import './InvitePage.css';

import { goBack } from 'connected-react-router';
import { connect } from 'react-redux';

import BasePage from '../BasePage';
import InviteForm from '../../forms/InviteForm';
import { POPUP_TYPE_OK } from '../../overlays/PopupNotification';

import { makeTeamInvites } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';



class InvitePage extends Component {
	constructor(props) {
		super(props);

		this.state = {};
  }
  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  handleCancel = ()=> {
    console.log('%s.handleCancel()', this.constructor.name);
    trackEvent('button', 'invite-cancel');
    this.props.goBack();
  };

  handleSubmit = ({ invites })=> {
    console.log('%s.handleSubmit()', this.constructor.name, { invites });

    this.props.makeTeamInvites({ invites });
    this.props.onPopup({
      type    : POPUP_TYPE_OK,
      content : 'Invites sent.'
    });
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile } = this.props;
    return (<BasePage { ...this.props } className="invite-page">
      {(profile) && (<div>
        <InviteForm
          onCancel={this.handleCancel}
          onSubmit={this.handleSubmit}
        />
        <div className="footer"></div>
      </div>)}
    </BasePage>);
  }
}



const mapDispatchToProps = (dispatch)=> {
  return ({
    makeTeamInvites : (payload)=> dispatch(makeTeamInvites(payload)),
    goBack          : (payload)=> dispatch(goBack(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    profile : state.user.profile,
    teams   : state.user.teams
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(InvitePage);
