
import React from 'react';
import './NavPanelProject.css';

import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import BaseContentExpander from '../../../../iterables/BaseContentExpander';
import { BUILD_TIMESTAMP } from '../../../../../consts/formats';

function NavPanelProject(props) {
// 	console.log('NavPanelProject()', props);

	const { project } = props;
	return (<BaseContentExpander
		className="nav-panel-project"
		open={project.selected}
		// title={<div className="nav-panel-project-title" onClick={()=> props.onProjectClick(project)} data-selected={project.selected}>{project.title} ({project.added.format(BUILD_TIMESTAMP)})</div>}
		title={<div className="nav-panel-project-title" onClick={()=> props.onProjectClick(project)} data-selected={project.selected}><FontAwesome name="caret-right" className="project-tree-item-arrow" />{project.title}</div>}
		content={<div className="nav-panel-project-item-wrapper">
			{/* {(typeGroup.items.map((item, i)=> (<NavPanelTypeItem key={i} typeName={typeGroup.title} item={item} onClick={()=> props.onTypeItemClick(typeGroup, item)} />)))} */}
		</div>}
	/>);
}


const NavPanelTypeItem = (props)=> {
// 	console.log('NavPanelTypeItem()', props);
	const { item, typeName } = props;
	const { tagName, selected } = item;
	const title = (item.title === tagName) ? `${tagName.toUpperCase()} ${Strings.capitalize(typeName)}` : item.title;
	return (<div className="nav-panel-type-item" onClick={props.onClick} data-selected={selected}>{Strings.truncate(title, 19)}</div>);
};


export default (NavPanelProject);
