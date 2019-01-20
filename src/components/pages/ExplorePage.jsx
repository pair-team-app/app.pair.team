
import React, { Component } from 'react';
import './ExplorePage.css';

import axios from 'axios/index';
import createjs from 'preload-js';
import { connect } from 'react-redux';

import ArtboardGrid from '../elements/ArtboardGrid';
import { addFileUpload, appendExploreArtboards } from '../../redux/actions';
import { isExplorePage, isProjectPage } from '../../utils/funcs';


const mapStateToProps = (state, ownProps)=> {
	return ({
		artboards  : state.exploreArtboards,
		navigation : state.navigation,
		profile    : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		addFileUpload          : (file)=> dispatch(addFileUpload(file)),
		appendExploreArtboards : (artboards)=> dispatch(appendExploreArtboards(artboards))
	});
};


class ExplorePage extends Component {
	constructor(props) {
		console.log('ExplorePage.constructor()', props);

		super(props);

		this.state = {
			loadOffset : props.artboards.length,
			loadAmt    : 24,
			fetching   : false
		};

		this.queue = new createjs.LoadQueue(false);
	}

	componentDidMount() {
		console.log('ExplorePage.componentDidMount()');
		if (!this.props.artboards || this.props.artboards.length === 0) {
			this.handleLoadNext();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('ExplorePage.componentDidUpdate()', prevProps, this.props);

		if ((isProjectPage() || isExplorePage()) && (prevProps.match && prevProps.match.params.uploadID !== this.props.match.params.uploadID)) {
			this.setState({
				upload     : null,
				artboards  : [],
				loadOffset : 0,
				loadAmt    : 24
			});

			setTimeout(this.handleLoadNext, 125);
		}
	}


	handleLoadNext = ()=> {
		console.log('ExplorePage.handleLoadNext()', this.props.artboards);

		const { loadOffset, loadAmt } = this.state;

		this.setState({ fetching : true });
		let formData = new FormData();
		formData.append('action', 'EXPLORE');
		formData.append('user_id', (this.props.profile) ? this.props.profile.id : 0);
		formData.append('upload_id', (this.props.navigation) ? this.props.navigation.uploadID : 0);
		formData.append('offset', loadOffset);
		formData.append('length', loadAmt);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('EXPLORE', response.data);

				const artboards = response.data.artboards.map((artboard) => {
					return ({
						id        : artboard.id,
						pageID    : artboard.page_id,
						uploadID  : artboard.upload_id,
						title     : artboard.title,
						pageTitle : artboard.page_title,
						system    : artboard.system,
						type      : artboard.type,
						filename  : artboard.filename,
						meta      : JSON.parse(artboard.meta),
						added     : artboard.added,
						selected  : false
					});
				});

				this.setState({
					fetching   : false,
					loadOffset : loadOffset + artboards.length
				});
				this.props.appendExploreArtboards(artboards);

			}).catch((error) => {
		});
	};

	handleFile = (file)=> {
		console.log('ExplorePage.handleUploadComplete()', file);
		this.props.addFileUpload(file);
		this.props.onPage('new');
	};


	render() {
		console.log('ExplorePage.render()', this.props, this.state);

		const { uploadID } = this.props.navigation;
		const artboards = [...this.props.artboards].filter((artboard)=> (uploadID === 0 || artboard.uploadID === uploadID));
		const { fetching, loadOffset } = this.state;

		const title = (artboards) ? (fetching) ? 'Loading…' : `Recent (${artboards.length})` : null;

		return (
			<div className="page-wrapper explore-page-wrapper">
				<ArtboardGrid
					title={title}
					artboards={artboards}
					loadOffset={loadOffset}
					fetching={fetching}
					onPage={this.props.onPage}
					onFile={this.handleFile}
					onItemClick={this.props.onPage}
					onClick={this.props.onArtboardClicked}
					onPopup={this.props.onPopup}
					onLoadNext={this.handleLoadNext} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ExplorePage);
