
import React, { Component } from 'react';
import './PlaygroundHeader.css';

import SharePopover from '../SharePopover';
import HeaderProfile from './HeaderProfile';

class PlaygroundHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
		};

		this.shareLink = React.createRef();
	}

	componentWillUnmount() {
		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.wrapper = null;
	}

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state, (this.shareLink) ? { left : this.shareLink.offsetLeft, top : this.shareLink.offsetTop } : null);

// 		const { projectSlug, componentsSlug, componentID, commentID } = this.props;
		const { playground, params } = this.props;
		const { projectSlug, componentsSlug } = params;
		const { popover } = this.state;

		return (<div className="playground-header">
			<div className="playground-header-col">{projectSlug} > {componentsSlug}</div>
			<div className="playground-header-col playground-header-col-right">
				<div className="playground-header-link" onClick={()=> this.setState({ popover : !this.state.popover })} ref={(element)=> { this.shareLink = element; }}>Share</div>
				<HeaderProfile onLogout={this.props.onLogout} />
			</div>

			{(popover) && (<SharePopover
				playground={playground}
				position={{ x : this.shareLink.offsetLeft, y : this.shareLink.offsetTop }}
				onClose={()=> this.setState({ popover : false })} />)}
		</div>);
	}
}


export default (PlaygroundHeader);
