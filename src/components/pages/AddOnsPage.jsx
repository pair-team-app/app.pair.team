
import React, { Component } from 'react';
import './AddOnsPage.css';

import { Column, Row } from 'simple-flexbox';

import AddonItem from '../iterables/AddOnItem';
import addOns from '../../json/add-ons.json';

class AddOnsPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const items = addOns.map((item, i)=> {
			return (
				<Column key={i}>
					<AddonItem title={item.title} image={item.image} />
				</Column>
			);
		});

		return (
			<div className="page-wrapper add-ons-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>Developer Add Ons</h1></Row>
					<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along.</div>
					<Row horizontal="center">
						<button className="adjacent-button" onClick={()=> this.props.onPage('api')}>API</button>
						<button className="adjacent-button" onClick={()=> window.open('https://www.github.com/de-ai')}>Github</button>
						<button className="adjacent-button" onClick={()=> window.open('https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA')}>Slack</button>
						<button onClick={()=> window.open('https://spectrum.chat/designengine')}>Spectrum</button>
					</Row>
				</div>
				<h4>Add Ons</h4>
				<Row horizontal="space-between" className="add-ons-plugins-wrapper" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
			</div>
		);
	}
}

export default AddOnsPage;
