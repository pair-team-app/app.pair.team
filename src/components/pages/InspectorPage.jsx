
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';


class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageID     : 0,
			artboardID : 0,
			sliceID    : 0,
			page       : null,
			artboard   : null
		};
	}

	componentDidMount() {
		//this.refreshData();
	}

	refreshData = ()=> {
		const { pageID, artboardID } = this.props.match.params;
		this.setState({
			pageID     : pageID,
			artboardID : artboardID
		});

		let formData = new FormData();
		formData.append('action', 'PAGE');
		formData.append('page_id', '' + pageID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('PAGE', response.data);
				this.setState({ page : response.data.page });

				formData.append('action', 'ARTBOARD');
				formData.append('artboard_id', '' + artboardID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('ARTBOARD', response.data);

						let slices = [];
						response.data.artboard.slices.forEach(function(item, i) {
							slices.push({
								id       : item.id,
								title    : item.title,
								filename : item.filename + '@1x.png',
								meta     : JSON.parse(item.meta),
								added    : item.added
							});
						});

						const artboard = {
							id        : response.data.artboard.id,
							pageID    : response.data.artboard.page_id,
							title     : response.data.artboard.title,
							filename  : response.data.artboard.filename,
							meta      : JSON.parse(response.data.artboard.meta),
							added     : response.data.artboard.added,
							slices    : slices
						};

						this.setState({ artboard : artboard });
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	render() {
		console.log('InspectorPage.render()');
		const { artboardID } = this.props.match.params;
		if (this.state.artboardID !== artboardID) {
			this.refreshData();
			return (null);
		}

		const page = (this.state.page) ? this.state.page : null;
		const artboard = (this.state.artboard) ? this.state.artboard : null;
		const slice = (this.state.artboard) ? (this.state.artboard.slices.length > 0) ? this.state.artboard.slices[0] : null : null;

		const heroImageClass = 'inspector-page-hero-image' + ((artboard) ? (artboard.meta.frame.width > artboard.meta.frame.height) ? ' inspector-page-hero-image-landscape' : ' inspector-page-hero-image-portrait' : '');
		const panelImageClass = 'inspector-page-panel-image' + ((slice) ? (slice.meta.frame.width > slice.meta.frame.height) ? ' inspector-page-panel-image-landscape' : ' inspector-page-panel-image-portrait' : '');

		return (
			<div className="inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-hero-wrapper">
						{(artboard) && (<img className={heroImageClass} src={artboard.filename} alt="Hero" />)}
						<div className="inspector-page-hero-title">
							{(artboard) ? artboard.title : ''}
						</div>
					</div>
					<div className="inspector-page-hero-info-wrapper">
						0 Views<br />
						0 Downloads
					</div>
				</div>
				<div className="inspector-page-panel">
					<div className="inspector-page-panel-display">
						{(slice) && (
							<img className={panelImageClass} src={slice.filename} alt={slice.title} />
						)}
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<div>
							<button className="inspector-page-size-button">1x</button>
							<button className="inspector-page-size-button inspector-page-size-button-middle">2x</button>
							<button className="inspector-page-size-button">3x</button>
						</div>
						<div>
							<button className="inspector-page-select-button">Select Part ()</button>
							<button className="inspector-page-download-button">Download All ()</button>
						</div>
					</div>
					<div className="inspector-page-panel-info-wrapper">
						System: N/A<br />
						Author: N/A<br />
						Page: {(page) ? page.title : 'N/A'}<br />
						Artboard: {(artboard) ? artboard.title : 'N/A'}<br />
						Slice: {(slice) ? slice.title : ''}<br />
						Position: ({(slice) ? slice.meta.frame.origin.x : '0'}, {(slice) ? slice.meta.frame.origin.y : 0})<br />
						Size: {(slice) ? slice.meta.frame.size.width : 0} &times; {(slice) ? slice.meta.frame.size.height : 0}<br />
						Rotation: {(slice) ? slice.meta.rotation : 0}<br />
						Opacity: {(slice) ? slice.meta.opacity : '100%'}<br />
						Color: {(slice) ? slice.meta.fillColor : 'N/A'}<br />
						Font: {(slice) ? slice.meta.font.family : 'N/A'}<br />
						Font Size: {(slice) ? slice.meta.font.size : 'N/A'}<br />
						Font Color: {(slice) ? slice.meta.font.color : 'N/A'}<br />
						Blend Mode: {(slice) ? slice.meta.blendMode.toLowerCase().replace(/(\b\w)/gi, function(m) { return m.toUpperCase(); }) : 'N/A'}<br />
					</div>
				</div>
			</div>
		);
	}
}

export default InspectorPage;
