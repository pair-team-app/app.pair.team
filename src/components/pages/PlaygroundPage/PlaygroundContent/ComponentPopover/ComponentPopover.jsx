
import React, { Component } from 'react';
import './ComponentPopover.css';

import { ContextMenu, MenuItem } from 'react-contextmenu';


class ComponentPopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
			comment : ''
		};

		this.textAreaRef = React.createRef();
	}


	handleAddComment = (event)=> {
		console.log('%s.handleAddComment()', this.constructor.name, event, this.state.comment);
		event.preventDefault();
		this.props.onAddComment(null);
	};

	handleMenuItemClick = (event, data)=> {
		console.log('%s.handleMenuItemClick()', this.constructor.name, event, data);

		event.preventDefault();
		this.props.onClick(data);
	};

	onShowMenu = (event)=> {
		console.log('%s.onShowMenu()', this.constructor.name, event);
		this.setState({ comment : '' }, ()=> {
			if (this.textAreaRef) {
				this.textAreaRef.value = this.state.comment;
			}
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { menuID } = this.props;
		const { comment } = this.state;

		return (<ContextMenu id={menuID} className="component-popover" onShow={this.onShowMenu}>
			<div className="component-popover-content-wrapper">
				<div className="component-popover-menu-item-wrapper">
					<ComponentPopoverMenuItem type="inspect" title="Inspect" acc={null} onClick={this.handleMenuItemClick} />
					<ComponentPopoverMenuItem type="share" title="Share" acc={null} onClick={this.handleMenuItemClick} />
					<ComponentPopoverMenuItem type="comments" title="View Comments" acc={<ComponentPopoverMenuAcc amt={2} />} onClick={this.handleMenuItemClick} />
				</div>
				<form>
					<textarea placeholder="Add Comment" onChange={(event)=> this.setState({ comment : event.target.value })} ref={(element)=> this.textAreaRef = element}>
					</textarea>
					<MenuItem data={{ type : 'type:submit' }} onClick={(event)=> this.handleAddComment(event)}>
						<button disabled={comment.length === 0}>Add Comment</button>
					</MenuItem>
				</form>
			</div>
		</ContextMenu>);
	}


}


const ComponentPopoverMenuItem = (props)=> {
// 	console.log('ComponentPopoverMenuItem()', props);

	const { type, title, acc } = props;
	return (<MenuItem data={{ type }} onClick={props.onClick} attributes={{ className : 'component-popover-menu-item' }}>
		<div>{title}</div>
		<div className="component-popover-menu-item-spacer" />
		<div>{acc}</div>
	</MenuItem>);
};

const ComponentPopoverMenuAcc = (props)=> {
// 	console.log('ComponentPopoverMenuAcc()', props);

	const { amt } = props;
	return (<div className="component-popover-menu-acc">{amt}</div>);
};


export default (ComponentPopover);
