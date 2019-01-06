
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
// import CopyToClipboard from 'react-copy-to-clipboard';
import { Column, Row } from 'simple-flexbox';

import HomeExpo from '../elements/HomeExpo';
import ArtboardItem from '../iterables/ArtboardItem';
import GridHeader from '../elements/GridHeader';
import Popup from '../elements/Popup';

//import { isHomePage } from '../../utils/funcs';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action     : '',
			upload     : null,
			artboards  : [],
			fetching   : false,
			loadOffset : 0,
			loadAmt    : 1,
			popup : {
				visible : false,
				content : ''
			}
		};
	}

	componentDidMount() {
		console.log('HomePage().componentDidMount()', this.props);
		if (this.props.uploadID !== 0) {
			this.handleLoadNext();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('HomePage.componentDidUpdate()', this.props, prevProps);

		if (this.props.uploadID === 0 && this.state.upload) {
			this.setState({
				artboards : [],
				upload    : null
			});
		}

		if (this.props.uploadID !== prevProps.uploadID && this.props.uploadID !== 0) {
			this.setState({
				artboards  : [],
				loadOffset : 0,
				loadAmt    : 24
			});

			setTimeout(this.handleLoadNext, 125);
		}
	}

	handleLoadNext = ()=> {
		console.log('HomePage.handleLoadNext()', this.state.artboards);

		const { uploadID } = this.props;
		const { loadOffset, loadAmt } = this.state;

		this.setState({
			fetching : true,
			title    : 'Loading…'
		});

		let formData = new FormData();
		formData.append('action', 'UPLOAD');
		formData.append('upload_id', uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD', response.data);
				const { upload } = response.data;

				formData.append('action', 'PAGES');
				formData.append('upload_id', uploadID);
				formData.append('offset', loadOffset);
				formData.append('limit', loadAmt);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('PAGES', response.data);

						let artboards = [];
						response.data.pages.forEach((page) => {
							artboards = artboards.concat(page.artboards.map((artboard) => ({
								id        : artboard.id,
								pageID    : artboard.page_id,
								uploadID  : artboard.upload_id,
								system    : artboard.system,
								title     : artboard.title,
								pageTitle : artboard.page_title,
								type      : artboard.type,
								filename  : artboard.filename,
								meta      : JSON.parse(artboard.meta),
								added     : artboard.added,
								selected  : false
							})));
						});

						const prevArtboards = this.state.artboards;
						this.setState({
							upload     : upload,
							artboards  : prevArtboards.concat(artboards),
							fetching   : false,
							loadOffset : loadOffset + loadAmt
						});
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};


	render() {
		console.log('HomePage.render()', this.props, this.state);

		const { upload, artboards, fetching } = this.state;
		const title = (fetching) ? 'Loading…' : (upload) ? upload.title + ' (' + (upload.total.artboards) + ')' : '';

		const btnClass = (!upload || fetching) ? 'fat-button button-disabled' : (upload && artboards) ? (artboards.length === upload.total.artboards) ? 'fat-button is-hidden' : 'fat-button' : 'fat-button';
		const btnCaption = (!upload || fetching) ? 'Loading…' : 'More';

		return (
			<div className="page-wrapper home-page-wrapper">
				{/*{(isHomePage()) && (<GridHeader onPage={(url)=> this.props.onPage(url)} />)}*/}
				<HomeExpo onClick={(url)=> this.props.onPage(url)} />
				<GridHeader onPage={(url)=> this.props.onPage(url)} />

				<Row><h3>{title}</h3></Row>
				{(artboards.length > 0) && (<div>
					<Row horizontal="space-around" className="home-page-artboards-wrapper" style={{ flexWrap : 'wrap' }}>
						{artboards.map((artboard) => {
							return (
								<Column key={artboard.id}>
									<ArtboardItem
										title={artboard.title}
										image={artboard.filename}
										avatar={artboard.system.avatar}
										onClick={() => this.props.onArtboardClicked(artboard)} />
								</Column>
							);
						})}
					</Row>
					<Row horizontal="center"><button className={btnClass} onClick={()=> this.handleLoadNext()}>{btnCaption}</button></Row>
				</div>)}

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default HomePage;
