
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

	handleURL = (url)=> {
		window.open(url);
	};

	render() {
		const items = addOns.map((item, i)=> {
			return (
				<Column key={i}>
					<AddonItem title={item.title} image={item.image} url={item.url} onClick={(url=> this.handleURL(url))} />
				</Column>
			);
		});

		return (
			<div className="page-wrapper add-ons-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>Developer Add Ons</h1></Row>
					<div className="page-header-text">Design Engine Add Ons are community driven application Add Ons theat render code and components from Design Engine project JSON format.</div>
					<Row horizontal="center">
						<button className="adjacent-button" onClick={()=> this.props.onPage('api')}>API</button>
						<button className="adjacent-button" onClick={()=> window.open('https://www.github.com/de-ai')}>Github</button>
						<button className="adjacent-button" onClick={()=> window.open('https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA')}>Slack</button>
						<button onClick={()=> window.open('https://spectrum.chat/designengine')}>Spectrum</button>
					</Row>
				</div>
				<h3>Add Ons</h3>
				<Row horizontal="space-between" className="add-ons-plugins-wrapper" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
				<div className="updated-timestamp">Last Updated: 10-13-2018</div>
			</div>
		);
	}
}

export default AddOnsPage;
