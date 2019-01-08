
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import HomeExpo from '../elements/HomeExpo';
import ArtboardItem from '../iterables/ArtboardItem';
import GridHeader from '../elements/GridHeader';
import { addFileUpload } from '../../redux/actions';


function mapDispatchToProps(dispatch) {
	return ({
		addFileUpload : (file)=> dispatch(addFileUpload(file))
	});
}


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action        : '',
			upload        : null,
			artboards     : [],
			pendingUpdate : false,
			fetching      : false,
			loadOffset    : 0,
			loadAmt       : 1
		};
	}

	componentDidMount() {
		console.log('HomePage().componentDidMount()', this.props);

		if (this.props.match) {
			this.handleLoadNext();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('HomePage.componentDidUpdate()', prevProps, this.props);

		if (!this.state.pendingUpdate && ((!prevProps.match && this.props.match) || (prevProps.match && this.props.match && prevProps.match.params.uploadID !== this.props.match.params.uploadID))) {
			this.setState({ pendingUpdate : true });
		}

		if (this.props.location && this.props.location.pathname.includes('/views') && this.state.pendingUpdate) {
			this.setState({
				upload        : null,
				artboards     : [],
				loadOffset    : 0,
				loadAmt       : 24,
				pendingUpdate : false
			});

			setTimeout(this.handleLoadNext, 125);
		}
	}

	handleLoadNext = ()=> {
		console.log('HomePage.handleLoadNext()', this.state.artboards);

		const { uploadID } = this.props.match.params;
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
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.log(error.response.data);
				console.log(error.response.status);
				console.log(error.response.headers);
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				console.log(error.request);
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log('Error', error.message);
			}
			console.log(error.config);
		});
	};

	handleFile = (file)=> {
		console.log('HomePage.handleUploadComplete()', file);
		this.props.addFileUpload(file);
		this.props.onPage('new');
	};


	render() {
		console.log('HomePage.render()', this.props, this.state);

		const { upload, artboards, fetching } = this.state;
		const title = (fetching) ? 'Loading…' : (upload) ? upload.title + ' (' + (upload.total.artboards) + ')' : '';

		const btnClass = (!upload || fetching) ? 'fat-button button-disabled' : (upload && artboards) ? (artboards.length === upload.total.artboards) ? 'fat-button is-hidden' : 'fat-button' : 'fat-button';
		const btnCaption = (!upload || fetching) ? 'Loading…' : 'More';

		return (
			<div className="page-wrapper home-page-wrapper">
				<HomeExpo
					onFile={(file)=> this.handleFile(file)}
					onItemClick={(url)=> this.props.onPage(url)}
					onPopup={(payload)=> this.props.onPopup(payload)}
				/>

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
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(HomePage);
