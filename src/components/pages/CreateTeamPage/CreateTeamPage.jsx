
import React from 'react';
import './CreateTeamPage.css';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BasePage from '../BasePage';
import CreateTeamForm from '../../forms/CreateTeamForm';
import { makeTeam } from '../../../redux/actions';

function CreateTeamPage(props) {
  console.log('CreateTeamPage()', { props });


  const handleCancel = (event)=> {
    console.log('CreateTeamPage().handleCancel()', { event });
    props.history.goBack();
  };

  const { profile } = props;
  return (<BasePage { ...props } className="create-team-page">
		{(profile) && (<CreateTeamForm onSubmit={props.makeTeam} onCancel={handleCancel} />)}
	</BasePage>);
}


const mapDispatchToProps = (dispatch)=> {
  return ({
    makeTeam : (payload)=> dispatch(makeTeam(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    profile : state.user.profile
  });
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateTeamPage));
