
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import PartItem from './../elements/PartItem';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			artboards : []
		};
	}

	componentDidMount() {
		if (typeof cookie.load('upload_id') !== 'undefined') {
			let formData = new FormData();
			formData.append('action', 'ARTBOARDS');
			formData.append('upload_id', cookie.load('upload_id'));
			formData.append('page_id', '' + this.props.pageID);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log('ARTBOARDS', response.data);

					let artboards = [];
					response.data.artboards.forEach(function(item, i) {
						artboards.push({
							id       : item.id,
							pageID   : item.page_id,
							title    : item.title,
							filename : item.filename,
							meta     : JSON.parse(item.meta),
							added    : item.added,
							selected : false
						});
					});

					this.setState({ artboards : artboards });
				}).catch((error) => {
			});
		}
	}

	handleToggle = (id, isSelected)=> {
		console.log('handleToggle()', id, isSelected);

		let obj = {};
		this.state.artboards.forEach(function(item, i) {
			if (item.id === id) {
				obj = item;
				obj.selected = isSelected;
			}
		});

		this.props.onArtboardSelected(obj);
	};

	handleSelect = (id)=> {
		console.log('handleSelect()', id);

		let obj = {};
		this.state.artboards.forEach(function(item, i) {
			if (item.id === id) {
				obj = item;
			}
		});

		this.props.onArtboardClicked(obj);
	};

	render() {
		const artboards = this.state.artboards;


		const items = artboards.map((item, i, arr) => {
			if (this.props.pageID === 0 || this.props.pageID === item.pageID) {
				return (
					<Column key={i}>
						<PartItem
							title={item.title}
							image={item.filename}
							size={(item.meta.frame.size.width > item.meta.frame.size.height) ? 'landscape' : 'portrait'}
							onClick={() => this.handleSelect(item.id)}
							onSelect={(isSelected) => this.handleToggle(item.id, isSelected)} />
					</Column>
				);

			} else {
				return (null);
			}

		});

		items.shift();

		const artboard = (artboards.length > 0) ? artboards[0] : null;
		const imageClass = (artboard) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? 'home-page-image home-page-image-landscape' : 'home-page-image home-page-image-portrait' : 'home-page-image';

		return (
			<div className="home-page-wrapper">
				{(artboard) && (
					<div className="home-page-project">
						<img className={imageClass} src={artboard.filename} alt={artboards.title} />
						<div className="home-page-title">{artboard.title}</div>
					</div>
				)}

				{this.props.section}

				<Row horizontal="space-between" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
			</div>
		);
	}
}

export default HomePage;
