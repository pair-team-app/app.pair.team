
import React from 'react';
import './NavPanelProject.css';

import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import BaseContentExpander from '../../../../iterables/BaseContentExpander';
import { BUILD_TIMESTAMP } from '../../../../../consts/formats';

function NavPanelProject(props) {
	console.log('NavPanelProject()', props);

	const { project, buildID } = props;
	return (<BaseContentExpander
		className="nav-panel-project"
		open={project.expanded}
		// title={<div className="nav-panel-project-title" onClick={()=> props.onProjectClick(project)} data-selected={project.selected}>{project.title} ({project.added.format(BUILD_TIMESTAMP)})</div>}
		title={<div className="nav-panel-project-title-wrapper" onClick={()=> props.onProjectClick(project)} data-id={project.id} data-expanded={project.expanded} data-selected={project.selected}>
			<div className="nav-panel-project-title-arrow-wrapper" data-expanded={project.expanded}><FontAwesome name="caret-right" className="project-tree-item-arrow" /></div>
			<div className="nav-panel-project-title">{project.title}</div>
		</div>}


		content={<div className="nav-panel-project-item-wrapper">
			{(project.typeGroups.map((typeGroup, i)=> (<NavPanelTypeTypeGroup 
				key={i} 
				typeGroup={typeGroup} 
				selected={(project.buildID === buildID && props.typeGroup && props.typeGroup.id === typeGroup.id)} 
				onClick={()=> props.onTypeGroupClick(typeGroup)} />)))}
		</div>}
	/>);
}



const NavPanelTypeTypeGroup = (props)=> {
	console.log('NavPanelTypeTypeGroup()', { typeGroup : props.typeGroup, title : props.typeGroup.title });

	const { typeGroup, selected } = props;
	const { title } = typeGroup;
	return (<div className="nav-panel-type-item" onClick={props.onClick} data-id={typeGroup.id} data-selected={selected}>{Strings.truncate(title, 19)}</div>);
};


export default (NavPanelProject);
