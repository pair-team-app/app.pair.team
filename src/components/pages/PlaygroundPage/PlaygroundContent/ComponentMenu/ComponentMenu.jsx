
import React, { Component } from 'react';
import './ComponentMenu.css';

import { ContextMenu, MenuItem } from 'react-contextmenu';

class ComponentMenu extends Component {
	constructor(props) {
		super(props);

		this.state = {
			intro    : false,
			outro    : false,
			position : {
				x : 0,
				y : 0
			},
			component : null,
			comment   : ''
		};

		this.textAreaRef = React.createRef();
	}


	handleAddComment = (event, data)=> {
		console.log('%s.handleAddComment()', this.constructor.name, event, data.target, this.state.position, this.state.comment);
		event.preventDefault();

		const { left, top } = data.target.getBoundingClientRect();
		const { position, component, comment } = this.state;
		this.props.onAddComment({ component,
			content  : comment,
			position : {
				x : ((position.x - left) - 1) << 0,
				y : ((position.y - top) + 4) << 0,
			}
		});
	};

	handleMenuItemClick = (event, data, target)=> {
		console.log('%s.handleMenuItemClick()', this.constructor.name, { event, data, target });

		event.preventDefault();
		const { component } = this.state;
		this.props.onClick({ component,
			type : data.type,
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
// 		console.log('%s.handleShowMenu()', this.constructor.name, this.props, event.detail);

		event.preventDefault();
		event.stopPropagation();

		const { component } = event.detail.data;
		this.setState({ component,
			intro    : true,
			outro    : false,
			position : {
				x : event.detail.position.x - 9,
				y : event.detail.position.y - 12,
			},
			comment  : ''
		}, ()=> {
			if (this.textAreaRef) {
				this.textAreaRef.value = this.state.comment;
			}

			this.props.onShow({ component });
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { menuID } = this.props;
		const { component } = this.state;
		const { intro, outro, comment } = this.state;

		return (<ContextMenu id={menuID} className="component-menu-wrapper" onShow={this.handleShowMenu} onHide={this.handleHideMenu} preventHideOnResize={true} preventHideOnScroll={true}>
			{/*<BasePopover intro={intro} outro={outro} payload={payload} onOutroComplete={this.props.onClose}>*/}
			<div className={`component-popover${(intro) ? ' component-menu-intro' : (outro) ? ' component-menu-outro' : ''}`}>
				<div className="component-menu-content-wrapper">
					<div className="component-menu-item-wrapper">
						<ComponentMenuItem type="inspect" title="Inspect" acc={null} onClick={this.handleMenuItemClick} />
						<ComponentMenuItem type="share" title="Share" acc={null} onClick={this.handleMenuItemClick} />
						<ComponentMenuItem type="comments" title={`${window.location.href.includes('/comments') ? 'Hide' : 'View'} Comments`} acc={<ComponentMenuItemAcc amt={(component) ? Math.max(0, component.comments.length - 1) : 0} />} onClick={this.handleMenuItemClick} />
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
			{/*</BasePopover>*/}
		</ContextMenu>);
	}
}


const ComponentMenuItem = (props)=> {
// 	console.log('ComponentMenuItem()', props);

	const { type, title, acc } = props;
	return (<MenuItem data={{ type }} onClick={props.onClick} attributes={{ className : 'component-menu-item' }}>
		<div>{title}</div>
		<div className="component-menu-item-spacer" />
		<div>{acc}</div>
	</MenuItem>);
};

const ComponentMenuItemAcc = (props)=> {
// 	console.log('ComponentMenuItemAcc()', props);

	const { amt } = props;
	return (<div className="component-menu-item-acc">{amt}</div>);
};


export default (ComponentMenu);
