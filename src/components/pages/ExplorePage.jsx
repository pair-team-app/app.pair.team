
import React, { Component } from 'react';
import './ExplorePage.css';

import axios from "axios/index";
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import BottomNav from '../elements/BottomNav';
import ActivityItem from '../iterables/ActivityItem';
import ArtboardItem from '../iterables/ArtboardItem';
import Popup from '../elements/Popup';

class ExplorePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			artboards : [],
			popup     : {
				visible : false,
				content : ''
			}
		};
	}

	componentDidMount() {
		let formData = new FormData();
		formData.append('action', 'EXPLORE');
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

				this.setState({ artboards : artboards });
			}).catch((error) => {
		});
	}

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

		return (
			<div className="page-wrapper explore-page-wrapper">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						{(cookie.load('user_id') === '0') && (<div className="page-header">
							<Row horizontal="center"><h1>Design for Engineers</h1></Row>
							<div className="page-header-text">Design Engine is a design platform built for engineers. From open source projects to enterprise apps, you can inspect designs, download parts, copy code, and build interfaces faster.</div>
							<Row horizontal="center">
								<button className="adjacent-button" onClick={()=> this.props.onPage('register')}>Sign Up with Email</button>
								<button onClick={()=> this.props.onPage('login')}>Sign In</button>
							</Row>
						</div>)}
					</Column>
				</Row>

				<Row><h4>Explore</h4></Row>
				<Row horizontal="space-between" className="explore-page-artboards-wrapper" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
				<BottomNav onPage={(url)=> this.props.onPage(url)} onLogout={()=> this.props.onLogout()} />

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default ExplorePage;
