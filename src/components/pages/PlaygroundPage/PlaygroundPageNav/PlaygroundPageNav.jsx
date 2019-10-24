
import React, { Component } from 'react';
import './PlaygroundPageNav.css';


class PlaygroundPageNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}


	render() {
		console.log(this.constructor.name, '.render()', this.props, this.state);

		return (<div className="playground-page-nav">
			<PlaygroundPageNavHeader />
			<div className="playground-page-nav-link-wrapper">
				<div className="playground-page-nav-link">Pages</div>
				<div className="playground-page-nav-link">Links</div>
				<div className="playground-page-nav-link">Images</div>
			</div>
		</div>);
	}
}


const PlaygroundPageNavHeader = (props)=> {
	return (<div className="playground-page-nav-header">
		<img className="playground-page-nav-header-logo" src="" alt="" />
		<div className="playground-page-nav-header-title">Team</div>
	</div>);
};

export default (PlaygroundPageNav);
