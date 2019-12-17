
import React, { Component } from 'react';
import './PlaygroundHeader.css';

import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';

import SharePopover from '../SharePopover';
import UserSettings from './UserSettings';

class PlaygroundHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
		};

		this.shareLink = React.createRef();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

 		const { popover } = this.props;
 		if (popover && !prevProps.popover && !this.state.popover) {
 			this.setState({ popover });
	  }
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.shareLink = null;
	}


	handlePopoverClose = ()=> {
//		console.log('%s.handlePopoverClose()', this.constructor.name);

		this.props.onSharePopoverClose();
		this.setState({ popover : false })
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state, (this.shareLink) ? { left : this.shareLink.offsetLeft, top : this.shareLink.offsetTop } : null);

		const { playground, typeGroup, component } = this.props;
		const { popover } = this.state;

		let breadcrumbs = `${Strings.slugifyURI(playground.title)}`;
		if (typeGroup) {
			breadcrumbs = `${breadcrumbs} > ${typeGroup.key}`;
		}

		if (component) {
			breadcrumbs = `${breadcrumbs} > ${Strings.truncate(component.title, 100)}`;
		}

		return (<div className="playground-header">
			<div className="playground-header-col">{breadcrumbs}</div>
			<div className="playground-header-col playground-header-col-right">
				<div className="playground-header-link" onClick={()=> this.setState({ popover : !this.state.popover })} ref={(element)=> { this.shareLink = element; }}>Share</div>
				<UserSettings onMenuItem={this.props.onSettingsItem} onLogout={this.props.onLogout} />
			</div>

			{(popover) && (<SharePopover
				playground={playground}
				position={{ x : this.shareLink.offsetLeft, y : this.shareLink.offsetTop }}
				onPopup={this.props.onPopup}
				onClose={this.handlePopoverClose} />)}
		</div>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		playground     : state.playground,
		typeGroup      : state.typeGroup,
		component      : state.component
	});
};


export default connect(mapStateToProps)(PlaygroundHeader);
