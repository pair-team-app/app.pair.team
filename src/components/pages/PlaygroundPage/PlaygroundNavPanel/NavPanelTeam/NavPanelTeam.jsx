
import React from 'react';
import './NavPanelTeam.css';

// import { BUILD_TIMESTAMP } from '../../../../../consts/formats';

function NavPanelTeam(props) {
	// console.log('NavPanelTeam()', props);

	const { team } = props;
	const { id, title, selected } = team;

	return (<div className="title" onClick={()=> props.onClick(team)} data-id={id} data-selected={selected}>{title}</div>);
}

export default (NavPanelTeam);
