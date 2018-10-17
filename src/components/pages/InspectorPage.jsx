
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import cookie from 'react-cookies';

class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			system     : cookie.load('system'),
			author     : cookie.load('author'),
			pageID     : 0,
			artboardID : 0,
			sliceID    : 0,
			page       : null,
			artboard   : null,
			code       : '#block {<br>&nbsp;&nbsp;width: 100%;<br>&nbsp;&nbsp;color: #ffffff;<br>}',
			comment    : ''
		};
	}

	componentDidMount() {
		let formData = new FormData();
		formData.append('action', 'ADD_VIEW');
		formData.append('artboard_id', '' + this.props.match.params.artboardID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('ADD_VIEW', response.data);
			}).catch((error) => {
		});


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
							views     : response.data.artboard.views,
							downloads : response.data.artboard.downloads,
							added     : response.data.artboard.added,
							slices    : slices
						};

						this.setState({ artboard : artboard });
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	submitComment = ()=> {
		this.setState({ comment : '' })
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
					<div className="inspector-page-comment-wrapper">
						<textarea className="inspector-page-comment-txt" name="comment" placeholder="Enter Comment Here" value={this.state.comment} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })}>
						</textarea>
						<button className="inspector-page-comment-button" onClick={()=> this.submitComment()}>Submit Comment</button>
					</div>
					<div className="inspector-page-hero-info-wrapper">
						{(artboard) ? artboard.views + ' View' + ((parseInt(artboard.views, 10) !== 1) ? 's' : '') : 'Views'}<br />
						{(artboard) ? artboard.downloads + ' Download' + ((parseInt(artboard.downloads, 10) !== 1) ? 's' : '') : 'Downloads'}
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
							<button className="inspector-page-download-button">Download Parts</button>
						</div>
					</div>
					<div className="inspector-page-panel-info-wrapper">
						System: {this.state.system}<br />
						Author: <a href={'mailto:' + this.state.author}>{this.state.author}</a><br />
						Page: {(page) ? page.title : 'N/A'}<br />
						Artboard: {(artboard) ? artboard.title : 'N/A'}<br />
						Slice: {(slice) ? slice.title : 'N/A'}<br />
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
					<div className="inspector-page-panel-code-wrapper">
						<div className="inspector-page-panel-code"><span dangerouslySetInnerHTML={{ __html : this.state.code }} /></div>
						<div className="inspector-page-panel-button-wrapper">
							<div>
								<button className="inspector-page-code-button">CSS</button>
								<button className="inspector-page-code-button inspector-page-code-button-middle">Swift</button>
								<button className="inspector-page-code-button">Java</button>
							</div>
						</div>
						<button className="inspector-page-copy-code-button">Copy Code</button>
					</div>
				</div>
			</div>
		);
	}
}

export default InspectorPage;
