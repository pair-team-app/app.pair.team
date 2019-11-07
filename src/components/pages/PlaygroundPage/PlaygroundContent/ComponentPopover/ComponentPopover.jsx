
import React, { Component } from 'react';
import './ComponentPopover.css';

import { ContextMenu, MenuItem } from 'react-contextmenu';


class ComponentPopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
			intro    : false,
			outro    : false,
			position : null,
			comment  : ''
		};

		this.textAreaRef = React.createRef();
	}


	handleAddComment = (event, data)=> {
		console.log('%s.handleAddComment()', this.constructor.name, event, data.target.parentNode, this.state.position, this.state.comment);
		event.preventDefault();

		const { left, top } = data.target.parentNode.getBoundingClientRect();
		const { position, comment } = this.state;

		this.props.onAddComment({
			content  : comment,
			itemID   : data.target.parentNode.getAttribute('data-id') << 0,
			position : {
				x : (position.x - left) << 0,
				y : (position.y - top) << 0,
			}
		});
	};

	handleMenuItemClick = (event, data)=> {
// 		console.log('%s.handleMenuItemClick()', this.constructor.name, event, data);

		event.preventDefault();
		this.props.onClick({
			type   : data.type,
			itemID : data.target.parentNode.getAttribute('data-id') << 0
		});
	};

	handleHideMenu = (event)=> {
// 		console.log('%s.handleHideMenu()', this.constructor.name, event);

		this.setState({
			intro : false,
			outro : true
		});
	};

	handleShowMenu = (event)=> {
// 		console.log('%s.handleShowMenu()', this.constructor.name, event.detail.position);

		this.setState({
			intro    : true,
			outro    : false,
			position : event.detail.position,
			comment  : ''
		}, ()=> {
			if (this.textAreaRef) {
				this.textAreaRef.value = this.state.comment;
			}
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { menuID } = this.props;
		const { intro, outro, comment } = this.state;
		return (<ContextMenu id={menuID} className="component-popover-menu-wrapper" onShow={this.handleShowMenu} onHide={this.handleHideMenu} preventHideOnResize={true} preventHideOnScroll={true}>
			<div className={`component-popover${(intro) ? ' component-popover-intro' : (outro) ? ' component-popover-outro' : ''}`}>
				<div className="component-popover-content-wrapper">
					<div className="component-popover-menu-item-wrapper">
						<ComponentPopoverMenuItem type="inspect" title="Inspect" acc={null} onClick={this.handleMenuItemClick} />
						<ComponentPopoverMenuItem type="share" title="Share" acc={null} onClick={this.handleMenuItemClick} />
						<ComponentPopoverMenuItem type="comments" title="View Comments" acc={<ComponentPopoverMenuAcc amt={2} />} onClick={this.handleMenuItemClick} />
					</div>
					<form>
						<textarea placeholder="Add Comment" onChange={(event)=> this.setState({ comment : event.target.value })} ref={(element)=> this.textAreaRef = element}>
						</textarea>
						<MenuItem data={{ type : 'submit' }} onClick={this.handleAddComment}>
							<button disabled={comment.length === 0}>Add Comment</button>
						</MenuItem>
					</form>
				</div>
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
