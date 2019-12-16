
import React from 'react';
import './NavPanelTypeGroup.css';

import { Strings } from 'lang-js-utils';
import BaseContentExpander from '../../../../iterables/BaseContentExpander';


function NavPanelTypeGroup(props) {
// 	console.log('NavPanelTypeGroup()', props);

	const { typeGroup } = props;
	return (<BaseContentExpander
		className="nav-panel-type-group"
		open={typeGroup.expanded}
		title={<div className="nav-panel-type-group-title" onClick={()=> props.onTypeGroupClick(typeGroup)} data-selected={typeGroup.selected}>{typeGroup.title} ({typeGroup.items.length})</div>}
		content={<div className="nav-panel-type-group-item-wrapper">
			{(typeGroup.items.map((item, i)=> (<NavPanelTypeItem key={i} item={item} onClick={()=> props.onTypeItemClick(typeGroup, item)} />)))}
		</div>}
	/>);
}


const NavPanelTypeItem = (props)=> {
// 	console.log('NavPanelTypeItem()', props);
	const { item } = props;
	return (<div className="nav-panel-type-item" onClick={props.onClick} data-selected={item.selected}>{Strings.truncate(item.title, 19)}</div>);
};


export default (NavPanelTypeGroup);
