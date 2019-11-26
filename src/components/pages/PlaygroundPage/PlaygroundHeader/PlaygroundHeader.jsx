
import React, { Component } from 'react';
import './PlaygroundHeader.css';

import { Strings } from 'lang-js-utils';

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

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.shareLink = null;
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state, (this.shareLink) ? { left : this.shareLink.offsetLeft, top : this.shareLink.offsetTop } : null);

		const { playground, projectSlug, componentsSlug, component } = this.props;
		const { popover } = this.state;

		let breadcrumbs = `${projectSlug}`;
		if (componentsSlug) {
			breadcrumbs = `${breadcrumbs} > ${componentsSlug}`;
		}

		if (component) {
			breadcrumbs = `${breadcrumbs} > ${Strings.truncate(component.title, 50)}`;
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
				onClose={()=> this.setState({ popover : false })} />)}
		</div>);
	}
}


export default (PlaygroundHeader);
