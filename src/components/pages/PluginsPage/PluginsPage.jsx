
import React, { Component } from 'react';
import './PluginsPage.css';

import BasePage from '../BasePage';
import PageHeader from '../../sections/PageHeader';
import { trackEvent } from '../../../utils/tracking';
import { Browsers } from '../../../utils/lang';


class PluginsPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.twitterWindow = null;
	}

	componentDidMount() {
		console.log('PluginsPage.componentDidMount()', this.props, this.state);
		//this.props.match.params.userID
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('PluginsPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}

	handleSketch = ()=> {
		console.log('PluginsPage.handleSketch()');
		Browsers.makeDownload('http://cdn.designengine.ai/plugins/sketch/designengine.zip');
	};

	handleAdobe = ()=> {
		console.log('PluginsPage.handleAdobe()');
		Browsers.makeDownload('http://cdn.designengine.ai/plugins/adobe-xd/designengine.zip');
	};

	render() {
// 		console.log('PluginsPage.render()', this.props, this.state);

		return (
			<BasePage className="plugin-page-wrapper">
				<PageHeader title="Download our Plugins">
					<div className="plugins-page-button-wrapper"><button className="long-button" onClick={this.handleAdobe}>Adobe XD Plugin</button></div>
					<button className="long-button" onClick={this.handleSketch}>Sketch Plugin</button>
				</PageHeader>
			</BasePage>
		);
	}
}

export default PluginsPage;
