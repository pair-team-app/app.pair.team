
import React, { Component } from 'react';
import './ComponentMenu.css';

import { ContextMenu, MenuItem } from 'react-contextmenu';
import { ENTER_KEY } from '../../../../../consts/key-codes';


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


  componentDidMount() {
//     console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
//     console.log('%s.componentWillUnmount()', this.constructor.name);
		document.removeEventListener('keydown', this.handleKeyDown);
  }


	handleAddComment = (event, data)=> {
// 		console.log('%s.handleAddComment()', this.constructor.name, event, { bounds : (data || event).target.getBoundingClientRect() }, this.state.position, this.state.comment);
		event.preventDefault();

		const { position, component, comment } = this.state;
		this.props.onAddComment({
      component, position,
      content : comment
    });
	};

	handleMenuItemClick = (event, data, target)=> {
// 		console.log('%s.handleMenuItemClick()', this.constructor.name, { event, data, target });

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

  handleKeyDown = (event)=> {
//     console.log('%s.handleKeyDown()', this.constructor.name, event, event.keyCode);

    const { comment } = this.state;
    if (event.keyCode === ENTER_KEY && comment.length > 0) {
      this.handleAddComment(event);
    }
  };

	handleShowMenu = (event)=> {
		console.log('%s.handleShowMenu()', this.constructor.name, this.props, event.detail, event.detail.target.getBoundingClientRect())

		event.preventDefault();
		event.stopPropagation();

		const { component } = event.detail.data;
		this.setState({ component,
			intro    : true,
			outro    : false,
			position : {
				x : ((event.detail.position.x - event.detail.target.getBoundingClientRect().x) - 10) << 0,
				y : ((event.detail.position.y - event.detail.target.getBoundingClientRect().y) - 8) << 0,
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
						{/*<ComponentMenuItem type="inspect" title="Inspect" acc={null} onClick={this.handleMenuItemClick} />*/}
						{/*<ComponentMenuItem type="share" title="Share" acc={null} onClick={this.handleMenuItemClick} />*/}
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


// ComponentMenuItem.height = 46px
