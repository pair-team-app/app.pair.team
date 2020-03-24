
import React from 'react';
import './NavPanelBuild.css';

import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import BaseContentExpander from '../../../../iterables/BaseContentExpander';
import { BUILD_TIMESTAMP } from '../../../../../consts/formats';

function NavPanelBuild(props) {
	// console.log('NavPanelBuild()', props);

	const { build } = props;
	const { id, title, expanded, selected, playgrounds, added } = build;
	const typeGroups = [ ...new Set([ ...playgrounds.map(({ typeGroups })=> (typeGroups)).flat()])];

	// console.log('NavPanelBuild()', { props, typeGroups });

	return (<BaseContentExpander className="nav-panel-build" open={build.expanded}
		title={<div className="nav-panel-build-title-wrapper" onClick={()=> props.onBuildClick(build)} data-id={id} data-expanded={expanded} data-selected={selected}>
			<div className="nav-panel-build-title-arrow-wrapper" data-expanded={expanded}><FontAwesome name="caret-right" /></div>
			{/* <div className="nav-panel-build-title">{title} ({added.format(BUILD_TIMESTAMP)})</div> */}
			<div className="nav-panel-build-title">{title}</div>
		</div>}

		content={<div className="nav-panel-build-item-wrapper">
			{(typeGroups.map((typeGroup, i)=> (<NavPanelTypeTypeGroup 
				key={i} 
				typeGroup={typeGroup} 
				selected={(selected && props.typeGroup && props.typeGroup.id === typeGroup.id)} 
				onClick={()=> props.onTypeGroupClick(typeGroup)} />)))}
		</div>}
	/>);
}



const NavPanelTypeTypeGroup = (props)=> {
	// console.log('NavPanelTypeTypeGroup()', { typeGroup : props.typeGroup, title : props.typeGroup.title });

	const { typeGroup, selected } = props;
	const { title } = typeGroup;
	return (<div className="nav-panel-type-item" onClick={props.onClick} data-id={typeGroup.id} data-selected={selected}>{Strings.truncate(title, 19)}</div>);
};


export default (NavPanelBuild);
