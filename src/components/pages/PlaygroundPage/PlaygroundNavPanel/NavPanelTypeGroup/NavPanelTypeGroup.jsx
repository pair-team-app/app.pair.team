
import React from 'react';
import './NavPanelTypeGroup.css';

import { Strings } from 'lang-js-utils';
import BaseContentExpander from '../../../../iterables/BaseContentExpander';


function NavPanelTypeGroup(props) {
// 	console.log('NavPanelTypeGroup()', props);

	const { typeGroup } = props;
	return (<BaseContentExpander
		className="nav-panel-type-group"
		open={typeGroup.selected}
		title={<div className="nav-panel-type-group-title" onClick={()=> props.onTypeGroupClick(typeGroup)} data-selected={typeGroup.selected}>{Strings.capitalize(typeGroup.key)} ({typeGroup.items.length})</div>}
		content={<div className="nav-panel-type-group-item-wrapper">
			{(typeGroup.items.map((item, i)=> (<NavPanelTypeItem key={i} typeName={typeGroup.title} item={item} onClick={()=> props.onTypeItemClick(typeGroup)} />)))}
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


export default (NavPanelTypeGroup);
