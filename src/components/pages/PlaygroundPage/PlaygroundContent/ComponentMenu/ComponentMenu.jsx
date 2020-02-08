
import React, { Component } from 'react';
import './ComponentMenu.css';

import { ContextMenu, MenuItem } from 'react-contextmenu';
// import { connect } from 'react-redux';

import { COMPONENT_MENU_ITEM_COMMENTS, COMPONENT_MENU_ITEM_COPY } from './index';
import { ENTER_KEY } from '../../../../../consts/key-codes';
import { USER_DEFAULT_AVATAR } from '../../../../../consts/uris';


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

		const { position, component, comment : content } = this.state;
		const { x , y } = position;
		this.props.onAddComment({ component, content,
			position : { x,
        y : y + 30,
      }
    });
	};

  handleHideMenu = (event)=> {
    console.log('%s.handleHideMenu()', this.constructor.name, event);
    event.preventDefault();
    event.stopPropagation()

    this.setState({
      intro : false,
      outro : true
    });
  };

  handleMenuItemClick = (event, data, target)=> {
// 		console.log('%s.handleMenuItemClick()', this.constructor.name, { event, data, target });

		event.preventDefault();
		const { type : menuItem } = data;
		this.props.onClick({ menuItem });
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
		const { intro, outro, component, comment } = this.state;
// 		const { avatar, username, email } = this.props.profile;

		return (<ContextMenu id={menuID} className="component-menu-wrapper" onShow={this.handleShowMenu} onHide={this.handleHideMenu} preventHideOnContextMenu={true} preventHideOnResize={true} preventHideOnScroll={true}>
			{/*<BasePopover intro={intro} outro={outro} payload={payload} onOutroComplete={this.props.onClose}>*/}
			<div className={`component-popover${(intro) ? ' component-menu-intro' : (outro) ? ' component-menu-outro' : ''}`}>
				<div className="component-menu-content-wrapper">
					<div className="component-menu-item-wrapper">
            <ComponentMenuItem type={COMPONENT_MENU_ITEM_COMMENTS} title={`${window.location.href.includes('/comments') ? 'Hide' : 'View'} Comments`} acc={<ComponentMenuItemAcc amt={(component) ? Math.max(0, component.comments.length - 1) : 0} />} onClick={this.handleMenuItemClick} />
            {/*<CopyToClipboard text={window.location.href} onCopy={this.handleClipboardCopy}>*/}
							<ComponentMenuItem type={COMPONENT_MENU_ITEM_COPY} title="Copy URL" acc={null} onClick={this.handleMenuItemClick} />
						{/*</CopyToClipboard>*/}
					</div>
          <div className="playground-comment-add-popover">
            <div className="header-wrapper">
              <div className="avatar-wrapper">
                <img className="avatar-wrapper-ico" src={USER_DEFAULT_AVATAR} alt={''} />
              </div>
            </div>
						<textarea placeholder="Enter Comment" onChange={(event)=> this.setState({ comment : event.target.value })} ref={(element)=> this.textAreaRef = element}>
						</textarea>
						<div className="button-wrapper">
							<div><button className="quiet-button" onClick={this.handleHideMenu}>Cancel</button></div>
              <MenuItem data={{ type : 'submit' }} onClick={this.handleAddComment}>
								<button disabled={comment.length === 0} onClick={this.handleAddSubmit}>Submit</button>
							</MenuItem>
						</div>
          </div>
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


// const mapStateToProps = (state, ownProps)=> {
//   return ({
//     profile : state.userProfile
//   });
// };

//<img src={(avatar || USER_DEFAULT_AVATAR)} alt={(email || username)} />//



// export default connect(mapStateToProps)(ComponentMenu);
export default (ComponentMenu);


// ComponentMenuItem.height = 46px
