
import React, { Component } from 'react';
import './ExplorePage.css';

import axios from "axios/index";
import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';
import Popup from '../elements/Popup';

import { binaryClassName } from '../../utils/funcs';

class ExplorePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			artboards  : [],
			loadOffset : 0,
			loadAmt    : 24,
			fecthing   : false,
			popup      : {
				visible : false,
				content : ''
			}
		};
	}

	componentDidMount() {
		this.handleLoadNext();
	}

	handleLoadNext= ()=> {
		const prevArtboards = this.state.artboards;

		this.setState({ fecthing : true });

		let formData = new FormData();
		formData.append('action', 'EXPLORE');
		formData.append('offset', this.state.loadOffset);
		formData.append('length', this.state.loadAmt);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('EXPLORE', response.data);

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

				this.setState({
					artboards  : prevArtboards.concat(artboards),
					loadOffset : this.state.loadOffset + this.state.loadAmt
				});
			}).catch((error) => {
		});
	};

	render() {
		const artboards = this.state.artboards;
		const items = artboards.map((artboard) => {
			return (
				<Column key={artboard.id}>
					<ArtboardItem
						title={artboard.title}
						image={artboard.filename}
						size="landscape"//{(artboard.meta.frame.size.width > artboard.meta.frame.size.height || artboard.meta.frame.size.width === artboard.meta.frame.size.height) ? 'landscape' : 'portrait'}
						onClick={() => this.props.onArtboardClicked(artboard)} />
				</Column>
			);
		});

		const condi = function(len, val) { return (len > val); };
		const btnClass = binaryClassName(condi(artboards.length, 0), '', ' is-hidden', 'fat-button');

		return (
			<div className="page-wrapper explore-page-wrapper">
				<Row><h3>Recent</h3></Row>
				<Row horizontal="space-between" className="explore-page-artboards-wrapper" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
				<Row horizontal="center"><button className={btnClass} onClick={()=> this.handleLoadNext()}>More</button></Row>
				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default ExplorePage;
