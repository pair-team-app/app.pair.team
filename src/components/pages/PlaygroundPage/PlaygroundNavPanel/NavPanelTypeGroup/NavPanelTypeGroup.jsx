
import React, { Component } from 'react';
import './NavPanelTypeGroup.css';

import Collapse from '@kunukn/react-collapse';


class NavPanelTypeGroup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			expanded : false
		};
	}

	handleToggleExpand = (event)=> {
// 		console.log('%s.handleToggleExpand()', this.constructor.name, this.state.expanded);

		const { expanded } = this.state;
		this.setState({ expanded : !expanded });
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { typeGroup } = this.props;
		const { expanded } = this.state;

		return (<div className="nav-panel-type-group">
			<div className="nav-panel-type-group-title" onClick={this.handleToggleExpand}>{typeGroup.title} ({typeGroup.items.length})</div>
			<Collapse
				isOpen={expanded}
				className={`nav-panel-type-group-expander${(expanded) ? ' nav-panel-type-group-expander-open' : ''}`}
				transition={`height ${(expanded) ? '333ms cubic-bezier(0.2, 0.9, 0.1, 1.0)' : '250ms cubic-bezier(0.5, 0.9, 0.1, 1.0)'}`}
				aria-hidden={!expanded}
				render={(state)=> (<div className="nav-panel-type-group-item-wrapper">
					{(typeGroup.items.map((item, i)=> (<NavPanelTypeItem key={i} item={item} />)))}
				</div>)}>
			</Collapse>
		</div>);
	}
}


const NavPanelTypeItem = (props)=> {
// 	console.log('NavPanelTypeItem()', props);
	const { item } = props;
	return (<div className="nav-panel-type-item">{item.title}</div>);
};


export default (NavPanelTypeGroup);
