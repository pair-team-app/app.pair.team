
import React, { Component } from 'react';
import './DevelopersPage.css';

import { Column, Row } from 'simple-flexbox';

import AddonItem from '../iterables/AddonItem';
import addons from '../../json/addons.json';

class DevelopersPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const items = addons.map((item, i, arr)=> {
			return (
				<Column key={i}>
					<AddonItem title={item.title} image={item.image} />
				</Column>
			);
		});

		return (
			<div className="developers-page-wrapper">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="page-header">
							<Row horizontal="center"><div className="page-header-text">Developer Community</div></Row>
							<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
							<Row horizontal="center"><button className="page-button" onClick={()=> window.open('https://www.youtube.com')}>Watch Video</button><button onClick={()=> window.location.href = '/mission'}>Mission</button></Row>
						</div>
						<Row horizontal="space-between" className="developers-plugins-wrapper" style={{flexWrap:'wrap'}}>
							{items}
						</Row>
					</Column>
				</Row>
			</div>
		);
	}
}

export default DevelopersPage;
