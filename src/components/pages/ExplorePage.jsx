
import React, { Component } from 'react';
import './ExplorePage.css';

import axios from 'axios/index';
import createjs from 'preload-js';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import HomeExpo from '../elements/HomeExpo';
import ExploreArtboardGrid from '../elements/ExploreArtboardGrid';
import { appendExploreArtboards } from '../../redux/actions';
import { isUserLoggedIn } from '../../utils/funcs';


const mapStateToProps = (state, ownProps)=> {
	return ({ artboards : state.exploreArtboards });
};

function mapDispatchToProps(dispatch) {
	return ({
		appendExploreArtboards : (artboards)=> dispatch(appendExploreArtboards(artboards))
	});
}


function LoggedInHeader(props) {
	return (<div>
		<h3>Create a new design project</h3>
		<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
		<div className="explore-page-button-wrapper">
			<button onClick={()=> props.onPage('new')}>New Project</button>
		</div>
	</div>);
}

function LoggedOutHeader(props) {
	return (<div>
		<h3>Signup or login</h3>
		<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
		<div className="explore-page-button-wrapper">
			<button className="adjacent-button" onClick={()=> props.onPage('register')}>Sign up with Email</button>
			<button onClick={()=> props.onPage('login')}>Login</button>
		</div>
	</div>);
}

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
// 		this.queue.on('fileload', this.handleFileLoaded);
		this.handleLoadNext();
	}

	handleLoadNext = ()=> {
// 		console.log('ExplorePage.handleLoadNext()');

		const { loadOffset, loadAmt } = this.state;

		this.setState({ fetching : true });
		let formData = new FormData();
		formData.append('action', 'EXPLORE');
		formData.append('offset', loadOffset);
		formData.append('length', loadAmt);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('EXPLORE', response.data);

				const artboards = response.data.artboards.map((artboard) => {
// 					this.queue.loadFile({
// 						id  : artboard.id,
// 						src : artboard.filename.replace('@3x', '@0.25x')
// 					});

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

				this.props.appendExploreArtboards(artboards);

				this.setState({
					fetching   : false,
					loadOffset : loadOffset + artboards.length
				});
			}).catch((error) => {
		});
	};

// 	handleFileLoaded = (event)=> {
// 		let artboards = [...this.state.artboards];
// 		artboards.forEach((artboard)=> {
// 			if (artboard.id === event.item.id) {
// 				artboard.filename = event.item.src.replace('@0.25x.png', '');
// 			}
// 		});
//
// 		this.setState({ artboards });
// 	};

	render() {
		console.log('ExplorePage.render()', this.state);

		const { fetching } = this.state;
		const btnClass = (fetching) ? 'fat-button button-disabled' : 'fat-button';
		const btnCaption = (fetching) ? 'Loading…' : 'More';

		return (
			<div className="page-wrapper explore-page-wrapper">
				<HomeExpo onClick={(url)=> this.props.onPage(url)} />

				{(isUserLoggedIn()) ? (<LoggedInHeader onPage={(url)=> this.props.onPage(url)} />) : (<LoggedOutHeader onPage={(url)=> this.props.onPage(url)} />)}

				<Row><h3>{(this.state.fetching ? 'Loading…' : 'Recent')}</h3></Row>
				<ExploreArtboardGrid onClick={(artboard)=> this.props.onArtboardClicked(artboard)} />
				<Row horizontal="center"><button className={btnClass} onClick={()=> (!this.state.fetching) ? this.handleLoadNext() : null}>{btnCaption}</button></Row>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ExplorePage);
