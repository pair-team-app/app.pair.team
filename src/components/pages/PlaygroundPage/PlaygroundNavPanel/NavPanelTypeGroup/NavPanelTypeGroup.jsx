
import React from 'react';
import './NavPanelTypeGroup.css';

import Collapse from '@kunukn/react-collapse';
import { Strings } from 'lang-js-utils';


function NavPanelTypeGroup(props) {
// 	console.log('NavPanelTypeGroup()', props);

	const { typeGroup } = props;
	return (<div className="nav-panel-type-group">
		<div className="nav-panel-type-group-title" onClick={()=> props.onTypeGroupClick(typeGroup)} data-selected={typeGroup.selected}>{typeGroup.title} ({typeGroup.items.length})</div>
		<Collapse
			isOpen={typeGroup.expanded}
			className={`nav-panel-type-group-expander${(typeGroup.expanded) ? ' nav-panel-type-group-expander-open' : ''}`}
			transition={`height ${(typeGroup.expanded) ? '333ms cubic-bezier(0.2, 0.9, 0.1, 1.0)' : '250ms cubic-bezier(0.5, 0.9, 0.1, 1.0)'}`}
			aria-hidden={!typeGroup.expanded}
			render={(state)=> (<div className="nav-panel-type-group-item-wrapper">
				{(typeGroup.items.map((item, i)=> (<NavPanelTypeItem key={i} item={item} onClick={()=> props.onTypeItemClick(typeGroup, item)} />)))}
			</div>)}
		/>
	</div>);
}


const NavPanelTypeItem = (props)=> {
// 	console.log('NavPanelTypeItem()', props);
	const { item } = props;
	return (<div className="nav-panel-type-item" onClick={props.onClick} data-selected={item.selected}>{Strings.truncate(item.title, 19)}</div>);
};


export default (NavPanelTypeGroup);
