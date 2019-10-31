
import React, { Component } from 'react';
import './PlaygroundHeader.css';

import SharePopover from '../../../overlays/SharePopover';
import HeaderProfile from './HeaderProfile';


class PlaygroundHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			share : false,
		};
	}

	render() {
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

// 		const { projectSlug, componentsSlug, componentID, commentID } = this.props;
		const { playground, params } = this.props;
		const { projectSlug, componentsSlug } = params;
		const { share } = this.state;

		return (<div className="playground-header">
			<div className="playground-header-col">{projectSlug} > {componentsSlug}</div>
			<div className="playground-header-col playground-header-col-right">
				<span onClick={()=> this.setState({ share : !this.state.share })}>Share</span>
				<HeaderProfile />
			</div>

			{(share) && (<SharePopover
				playground={playground}
				pos={{x:820, y:27}}
				onClose={()=> this.setState({ share : false })} />)}
		</div>);
	}
}


export default (PlaygroundHeader);
