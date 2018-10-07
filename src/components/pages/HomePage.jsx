
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { Column, Row } from 'simple-flexbox';

import PartItem from './../elements/PartItem';

import parts from './../../json/parts.json';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			parts : [
				{
					id    : 1,
					title : '',
					image : ''
				}, {
					id    : 2,
					title : '',
					image : ''
				}, {
					id    : 3,
					title : '',
					image : ''
				}, {
					id    : 4,
					title : '',
					image : ''
				}, {
					id    : 5,
					title : '',
					image : ''
				}, {
					id    : 6,
					title : '',
					image : ''
				}, {
					id    : 7,
					title : '',
					image : ''
				}, {
					id    : 8,
					title : '',
					image : ''
				}, {
					id    : 9,
					title : '',
					image : ''
				}, {
					id    : 10,
					title : '',
					image : ''
				}, {
					id    : 11,
					title : '',
					image : ''
				}, {
					id    : 12,
					title : '',
					image : ''
				}, {
					id    : 13,
					title : '',
					image : ''
				}, {
					id    : 14,
					title : '',
					image : ''
				}, {
					id    : 15,
					title : '',
					image : ''
				}, {
					id    : 16,
					title : '',
					image : ''
				}, {
					id    : 17,
					title : '',
					image : ''
				}, {
					id    : 18,
					title : '',
					image : ''
				}, {
					id    : 19,
					title : '',
					image : ''
				}, {
					id    : 20,
					title : '',
					image : ''
				}, {
					id    : 21,
					title : '',
					image : ''
				}, {
					id    : 22,
					title : '',
					image : ''
				}, {
					id    : 23,
					title : '',
					image : ''
				}, {
					id    : 24,
					title : '',
					image : ''
				}, {
					id    : 25,
					title : '',
					image : ''
				}, {
					id    : 26,
					title : '',
					image : ''
				}, {
					id    : 27,
					title : '',
					image : ''
				}
			]
		};
	}

	componentDidMount() {
		this.setState({ parts : parts });
	}

	handleToggle = (id, isSelected)=> {

	};

	render() {
		const items = this.state.parts.map((item, i, arr) => {
			return (
				<Column key={i}>
					<PartItem
						title={item.title + 'Item ' + i}
						img={item.image}
						onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		items.pop();

		return (
			<div className="home-page-wrapper debug-border">
				<div className="home-page-project">
					<img className="home-page-image" src="" alt={this.state.parts[0].title} />
					<div className="home-page-title">{this.state.parts[0].title}</div>
				</div>
				<Row horizontal="space-between" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
			</div>
		);
	}
}

export default HomePage;
