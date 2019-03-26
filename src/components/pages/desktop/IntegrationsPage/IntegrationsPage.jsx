
import React, { Component } from 'react';
import './IntegrationsPage.css';

import BaseDesktopPage from '../BaseDesktopPage';

class IntegrationsPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<BaseDesktopPage className="integrations-page-wrapper">
				<h4>CD / CI Integrations</h4>
				<div className="integrations-page-grid-wrapper">

				</div>
			</BaseDesktopPage>
		);
	}
}

export default IntegrationsPage;
