
import React, { Component } from 'react';
import './PlaygroundHeader.css';

import SharePopover from '../../../overlays/SharePopover';
import HeaderProfile from './HeaderProfile';

const shareWrapper = React.createRef();

class PlaygroundHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			share : false,
		};

		this.wrapper = null;
	}

	render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state, (shareWrapper.current) ? { left : shareWrapper.current.offsetLeft, top : shareWrapper.current.offsetTop } : null);

// 		const { projectSlug, componentsSlug, componentID, commentID } = this.props;
		const { playground, params } = this.props;
		const { projectSlug, componentsSlug } = params;
		const { share } = this.state;

		return (<div className="playground-header">
			<div className="playground-header-col">{projectSlug} > {componentsSlug}</div>
			<div className="playground-header-col playground-header-col-right">
				<div className="playground-header-link" onClick={()=> this.setState({ share : !this.state.share })} ref={shareWrapper}>Share</div>
				<HeaderProfile onLogout={this.props.onLogout} />
			</div>

			{(share) && (<SharePopover
				playground={playground}
				position={{ x : shareWrapper.current.offsetLeft, y : shareWrapper.current.offsetTop }}
				onClose={()=> this.setState({ share : false })} />)}
		</div>);
	}
}


export default (PlaygroundHeader);
