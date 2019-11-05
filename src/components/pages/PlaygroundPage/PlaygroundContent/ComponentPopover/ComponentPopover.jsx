
import React, { Component } from 'react';
import './ComponentPopover.css';

import { ContextMenu, MenuItem } from 'react-contextmenu';


class ComponentPopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	handleAddComment = (event)=> {
		console.log('%s.render()', this.constructor.name, event);
		event.preventDefault();
	};

	handleMenuItemClick = (event, data)=> {
		console.log('%s.render()', event, data);

		event.preventDefault();
		this.props.onClick(event, data);
	};


	render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { menuID } = this.props;

		return (<ContextMenu id={menuID} className="component-popover">
			{/*<div className="component-popover">*/}
			<div className="component-popover-content-wrapper">
				<div className="component-popover-menu-item-wrapper">
					<ComponentPopoverMenuItem type="inspect" title="Inspect" acc={null} onClick={this.handleMenuItemClick} />
					<ComponentPopoverMenuItem type="comments" title="View Comments" acc={<ComponentPopoverMenuAcc amt={2} />} onClick={this.handleMenuItemClick} />
				</div>
				<form>
					<textarea placeholder="Add Comment">
					</textarea>
					<MenuItem data={{ type : 'type:submit' }} onClick={(event)=> this.handleAddComment(event)}>
						<button>Add Comment</button>
					</MenuItem>
				</form>
			</div>
			{/*</div>*/}
		</ContextMenu>);
	}


}


const ComponentPopoverMenuItem = (props)=> {
	console.log('ComponentPopoverMenuItem()', props);

	const { type, title, acc } = props;
	return (<MenuItem data={{ type }} onClick={(event, data)=> props.onClick(event, data)} attributes={{ className : 'component-popover-menu-item' }}>
		<div>{title}</div>
		<div className="component-popover-menu-item-spacer" />
		<div>{acc}</div>
	</MenuItem>);
};

const ComponentPopoverMenuAcc = (props)=> {
	console.log('ComponentPopoverMenuAcc()', props);

	const { amt } = props;
	return (<div className="component-popover-menu-acc">{amt}</div>);
};


export default (ComponentPopover);
