
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
// import CopyToClipboard from 'react-copy-to-clipboard';
import { Column, Row } from 'simple-flexbox';

import HomeExpo from '../elements/HomeExpo';
import ArtboardItem from '../iterables/ArtboardItem';
import Popup from '../elements/Popup';

import { isUserLoggedIn } from '../../utils/funcs';

class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action     : '',
			uploadID   : 0,
			title      : 'Loading…',
			artboards  : [],
			fetching   : false,
			loadOffset : 0,
			loadAmt    : 24,
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

		if (this.props.uploadID !== -1 && this.props.uploadID !== prevProps.uploadID) {
			this.setState({
				artboards  : [],
				loadOffset : 0,
				loadAmt    : 24
			});

			setTimeout(this.handleLoadNext, 125);
		}
	}

	handleLoadNext = ()=> {
		console.log('handleLoadNext()', this.state.artboards);

		const { uploadID, pageID } = this.props;
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
				const uploadTitle = response.data.upload.title;

				formData.append('action', 'PAGE');
				formData.append('page_id', pageID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('PAGE', response.data);
						const pageTitle = response.data.page.title;

						formData.append('action', 'ARTBOARDS');
						formData.append('upload_id', uploadID);
						formData.append('page_id', pageID);
						formData.append('slices', '0');
						formData.append('offset', loadOffset);
						formData.append('length', loadAmt);
						axios.post('https://api.designengine.ai/system.php', formData)
							.then((response) => {
								console.log('ARTBOARDS', response.data);

								const artboards = response.data.artboards.map((item) => ({
									id        : item.id,
									pageID    : item.page_id,
									uploadID  : item.upload_id,
									system    : item.system,
									title     : item.title,
									pageTitle : item.page_title,
									type      : item.type,
									filename  : item.filename,
									meta      : JSON.parse(item.meta),
									added     : item.added,
									selected  : false
								}));

								const prevArtboards = this.state.artboards;
								this.setState({
									artboards  : prevArtboards.concat(artboards),
									fetching   : false,
									title      : ((this.props.pageID === 0) ? uploadTitle : pageTitle) + ' (' + (prevArtboards.length + artboards.length) + ')',
									loadOffset : loadOffset + loadAmt
								});
							}).catch((error) => {
						});
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};


	render() {
		const { title, artboards, fetching, loadOffset } = this.state;

		const items = artboards.map((artboard) => {
			if (this.props.pageID <= 0 || this.props.pageID === artboard.pageID) {
				return (
					<Column key={artboard.id}>
						<ArtboardItem
							title={artboard.title}
							image={artboard.filename}
							avatar={artboard.system.avatar}
							onClick={() => this.props.onArtboardClicked(artboard)} />
					</Column>
				);

			} else {
				return (null);
			}
		});

		const btnClass = (fetching || artboards.length !== loadOffset) ? 'fat-button is-hidden' : 'fat-button';

		return (
			<div className="page-wrapper home-page-wrapper">
				<HomeExpo onClick={(url)=> this.props.onPage(url)} />
				{(items.length > 0) && (<div>
					<Row><h3>{title}</h3></Row>
					<Row horizontal="space-between" className="home-page-artboards-wrapper" style={{flexWrap:'wrap'}}>
						{items}
					</Row>
					<Row horizontal="center"><button className={btnClass} onClick={()=> this.handleLoadNext()}>More</button></Row>
				</div>)}

				{(!isUserLoggedIn()) ? (<div>
					<Row><h3>Sign up or Login</h3></Row>
					<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
					<div style={{marginTop:'20px'}}>
						<button className="adjacent-button" onClick={()=> this.props.onPage('register')}>Sign up with Email</button>
						<button onClick={()=> this.props.onPage('login')}>Login</button>
					</div>

				</div>) : (parseInt(this.props.uploadID, 10) === 0) && (<div>
					<Row><h3>Create a new design project</h3></Row>
					<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
					<div style={{marginTop:'20px'}}>
						<button onClick={()=> this.props.onPage('new')}>New Project</button>
					</div>
				</div>)}

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default HomePage;
