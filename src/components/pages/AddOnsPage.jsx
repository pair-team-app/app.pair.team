
import React, { Component } from 'react';
import './AddOnsPage.css';

import { Column, Row } from 'simple-flexbox';

import { GITHUB_REPO, SLACK_INVITE } from '../../consts/uris';
import addOns from '../../assets/json/add-ons.json';


function AddOnItem(props) {
	return (
		<div className="add-on-item" onClick={()=> props.onClick(props.url)}>
			<img className="add-on-item-image" src={props.image} alt={props.title} />
			<div className="add-on-item-overlay" />
			<div className="add-on-item-title-wrapper">
				<div className="add-on-item-title">{props.title}</div>
			</div>
		</div>
	);
}

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
					<AddOnItem title={item.title} image={item.image} url={item.url} onClick={(url=> this.handleURL(url))} />
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
						<button className="adjacent-button" onClick={()=> window.open(GITHUB_REPO)}>Github</button>
						<button className="adjacent-button" onClick={()=> window.open(SLACK_INVITE)}>Slack</button>
						<button onClick={()=> window.open('https://spectrum.chat/designengine')}>Spectrum</button>
					</Row>
				</div>
				<h3>Add Ons</h3>
				<Row horizontal="space-between" className="add-ons-plugins-wrapper" style={{ flexWrap : 'wrap' }}>
					{items}
				</Row>
				<div className="updated-timestamp">Last Updated: 10-13-2018</div>
			</div>
		);
	}
}

export default AddOnsPage;
