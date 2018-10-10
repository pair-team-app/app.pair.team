
import React, { Component } from 'react';
import './HomePage.css';

import { Column, Row } from 'simple-flexbox';

import PartItem from './../elements/PartItem';
import parts from './../../json/parts.json';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			parts : []
		};
	}

	componentDidMount() {
		this.setState({ parts : parts });
	}

	handleToggle = (id, isSelected)=> {
		console.log('handleToggle()', id, isSelected);

		let obj = {};
		this.state.parts.forEach(function(item, i) {
			if (item.id === id) {
				obj = item;
				obj.selected = isSelected;
			}
		});

		this.props.onPartSelected(obj);
	};

	handleSelect = (id)=> {
		console.log('handleSelect()', id);

		let obj = {};
		this.state.parts.forEach(function(item, i) {
			if (item.id === id) {
				obj = item;
			}
		});

		this.props.onPartClicked(obj);
	};

	render() {
		const items = this.state.parts.map((item, i, arr) => {
			return (
				<Column key={i}>
					<PartItem
						title={item.title}
						image={item.image}
						onClick={()=> this.handleSelect(item.id)}
						onSelect={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		items.shift();

		return (
			<div className="home-page-wrapper">
				{(this.state.parts.length > 0) && (
					<div className="home-page-project">
						<img className="home-page-image" src={this.state.parts[0].image} alt={this.state.parts[0].title} />
						<div className="home-page-title">{this.state.parts[0].title}</div>
					</div>
				)}

				<Row horizontal="space-between" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
			</div>
		);
	}
}

export default HomePage;
