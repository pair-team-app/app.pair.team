
import React, { Component } from 'react';
import './PlaygroundHeader.css';

import HeaderProfile from './HeaderProfile';


class PlaygroundHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

// 		const { projectSlug, componentsSlug, componentID, commentID } = this.props;
		const { projectSlug, componentsSlug } = this.props.params;
		return (<div className="playground-header">
			<div className="playground-header-col">{projectSlug} > {componentsSlug}</div>
			<div className="playground-header-col playground-header-col-right">
				Share
				<HeaderProfile />
			</div>
		</div>);
	}
}


export default (PlaygroundHeader);
