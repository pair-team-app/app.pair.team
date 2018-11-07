
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			artboards : []
		};
	}

	componentDidMount() {
		this.refreshData();
	}

	componentDidUpdate(prevProps) {
		if (this.props.uploadID !== prevProps.uploadID && this.props.pageID !== prevProps.pageID) {
			this.refreshData();
			return (null);
		}
	}

	refreshData = ()=> {
		let formData = new FormData();
		formData.append('action', 'ARTBOARDS');
		formData.append('upload_id', this.props.uploadID);
		formData.append('page_id', this.props.pageID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('ARTBOARDS', response.data);

				const artboards = response.data.artboards.map((item) => ({
					id       : item.id,
					pageID   : item.page_id,
					title    : item.title,
					type     : item.type,
					filename : item.filename,
					meta     : JSON.parse(item.meta),
					added    : item.added,
					selected : false
				}));
				this.setState({ artboards : artboards });
			}).catch((error) => {
		});
	};

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
			if (item.type !== 'hero' && (this.props.pageID <= 0 || this.props.pageID === item.pageID)) {
				return (
					<Column key={i}>
						<ArtboardItem
							title={item.title}
							image={item.filename}
							size="landscape"//{(item.meta.frame.size.width > item.meta.frame.size.height || item.meta.frame.size.width === item.meta.frame.size.height) ? 'landscape' : 'portrait'}
							onClick={() => this.handleSelect(item.id)}
							onSelect={(isSelected) => this.handleToggle(item.id, isSelected)} />
					</Column>
				);

			} else {
				return (null);
			}
		});

		let artboard = null;
		if (this.props.pageID !== -1) {
			artboards.forEach(function (item, i) {
				if (artboard === null && item.type === 'hero') {
					artboard = item;
				}
			});
		}

		const imageClass = (artboard) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? 'home-page-image home-page-image-landscape' : 'home-page-image home-page-image-portrait' : 'home-page-image';

		return (
			<div className="home-page-wrapper">
				{(artboard) && (
					<div className="home-page-project" onClick={() => this.handleSelect(artboard.id)}>
						<img className={imageClass} src={artboard.filename} alt={artboards.title} />
						<div className="home-page-title">{artboard.title}</div>
					</div>
				)}

				<Row horizontal="space-around" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
			</div>
		);
	}
}

export default HomePage;
