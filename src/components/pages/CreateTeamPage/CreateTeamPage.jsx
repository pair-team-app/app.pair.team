
import React from 'react';
import './CreateTeamPage.css';

import BasePage from '../BasePage';
import CreateTeamForm from '../../forms/CreateTeamForm';

function CreateTeamPage(props) {
  console.log('CreateTeamPage()', { props });

  const handleSubmit=()=> {
    console.log('CreateTeamPage.handleSubmit()', { props });
  };

	return (<BasePage { ...props } className="create-team-page">
		<CreateTeamForm onSubmit={handleSubmit} />
	</BasePage>);
}


export default (CreateTeamPage);
