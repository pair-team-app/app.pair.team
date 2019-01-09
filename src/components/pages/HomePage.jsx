
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import { connect } from 'react-redux';

import ArtboardGridHeader from '../elements/ArtboardGridHeader';
import ArtboardGrid from '../elements/ArtboardGrid';
import { appendUploadArtboards } from '../../redux/actions';
import {isExplorePage, isProjectPage} from "../../utils/funcs";


const mapStateToProps = (state, ownProps)=> {
	return ({
		artboards  : state.uploadArtboards,
		navigation : state.navigation
	});
};

function mapDispatchToProps(dispatch) {
	return ({
		appendUploadArtboards : (artboards)=> dispatch(appendUploadArtboards(artboards))
	});
}


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action     : '',
			upload     : null,
			fetching   : false,
			loadOffset : 0,
			loadAmt    : 24
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

		if ((isProjectPage() || isExplorePage()) && (prevProps.match && prevProps.match.params.uploadID !== this.props.match.params.uploadID)) {
			this.setState({
				upload     : null,
				artboards  : [],
				loadOffset : 0,
				loadAmt    : 24
			});

// 			setTimeout(this.handleLoadNext, 125);
			this.handleLoadNext();
		}
	}

	handleLoadNext = ()=> {
		console.log('HomePage.handleLoadNext()', this.props.artboards);

		const { uploadID } = this.props.match.params;
		const { loadOffset, loadAmt } = this.state;

		this.setState({ fetching : true });

		let formData = new FormData();
		formData.append('action', 'UPLOAD');
		formData.append('upload_id', uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD', response.data);
				const { upload } = response.data;


				formData.append('action', 'ARTBOARDS');
				formData.append('upload_id', uploadID);
				formData.append('page_id', '0');
				formData.append('offset', loadOffset);
				formData.append('length', loadAmt);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('ARTBOARDS', response.data);

						const artboards = response.data.artboards.map((artboard) => ({
							id        : artboard.id,
							pageID    : artboard.page_id,
							uploadID  : artboard.upload_id,
							system    : artboard.system,
							title     : artboard.title,
							pageTitle : artboard.page_title,
							type      : artboard.type,
							filename  : artboard.filename,
							creator   : artboard.creator,
							meta      : JSON.parse(artboard.meta),
							added     : artboard.added,
							selected  : false
						}));

						this.setState({
							upload     : upload,
							fetching   : false,
							loadOffset : loadOffset + artboards.length
						});

						this.props.appendUploadArtboards(artboards);
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

		const { uploadID } = this.props.navigation;
		const artboards = [...this.props.artboards].filter((artboard)=> (artboard.uploadID === uploadID));
		const { upload, fetching, loadOffset } = this.state;

		const title = (upload) ? (upload.title + ' (' + (upload.total.artboards) + ')') : (fetching) ? 'Loading…' : null;
		return (
			<div className="page-wrapper home-page-wrapper">
				<ArtboardGridHeader
					onItemClick={this.props.onPage}
					onPage={this.props.onPage}
					onFile={(file)=> this.handleFile(file)}
					onPopup={(payload)=> this.props.onPopup(payload)}
				/>

				<ArtboardGrid
					title={title}
					total={(upload) ? upload.total.artboards : -1}
					artboards={artboards}
					loadOffset={loadOffset}
					fetching={fetching}
					onClick={(artboard)=> this.props.onArtboardClicked(artboard)}
					onLoadNext={this.handleLoadNext} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
