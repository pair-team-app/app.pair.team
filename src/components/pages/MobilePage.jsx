
import React, { Component } from 'react';
import './MobilePage.css';

import { Column } from 'simple-flexbox';

import deLogo from '../../assets/images/logos/logo-designengine.svg';

class MobilePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (<div className="page-wrapper mobile-page-wrapper"><Column horizontal="center">
			<h1 className="full-width">A desktop is required to View</h1>
			<h3 className="full-width">A desktop browser is required to view.</h3>

			<div className="mobile-page-footer">
				<img className="mobile-page-footer-logo" src={deLogo} onClick={()=> this.props.onPage('')} alt="Design Engine" />
			</div>
			</Column></div>);
	}
}

export default MobilePage;
