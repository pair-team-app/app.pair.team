
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import cookie from 'react-cookies';

import SliceItem from '../elements/SliceItem';

const heroImage = React.createRef();
class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			system     : cookie.load('system'),
			author     : cookie.load('author'),
			pageID     : 0,
			artboardID : 0,
			slice      : -1,
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

		this.refreshData();
	}

	componentDidUpdate(prevProps) {
		console.log("componentDidUpdate()", prevProps);
		if (this.props.match.params.artboardID !== prevProps.match.params.artboardID) {
			this.refreshData();
			return (null);
		}
	}

	refreshData = ()=> {
		const { pageID, artboardID, sliceID } = this.props.match.params;
		this.setState({
			pageID     : pageID,
			artboardID : artboardID,
			slice      : sliceID
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

	handleSliceClick = (ind, id)=> {
		this.setState({ slice : ind });
	};

	render() {
		const page = (this.state.page) ? this.state.page : null;
		const artboard = (this.state.artboard) ? this.state.artboard : null;
		const slice = (this.state.artboard) ? (this.state.slice > -1) ? this.state.artboard.slices[this.state.slice] : null : null;
		const scale = (artboard && heroImage && heroImage.current) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? heroImage.current.clientWidth / artboard.meta.frame.size.width : heroImage.current.clientHeight / artboard.meta.frame.size.height : 1;

		const heroImageClass = 'inspector-page-hero-image' + ((artboard) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? ' inspector-page-hero-image-landscape' : ' inspector-page-hero-image-portrait' : '');
		const panelImageClass = 'inspector-page-panel-image' + ((slice) ? (slice.meta.frame.size.width > slice.meta.frame.size.height) ? ' inspector-page-panel-image-landscape' : ' inspector-page-panel-image-portrait' : '');
		const slicesStyle = (artboard) ? {
			width  : (scale * artboard.meta.frame.size.width) + 'px',
			height : (scale * artboard.meta.frame.size.height) + 'px'
		} : {
			width  : '100%',
			height : '100%'
		};

		console.log("InspectorPage", "artboard:"+artboard, "heroImage:"+heroImage, "heroImage.current"+heroImage.current);

		const items = (artboard) ? artboard.slices.map((item, i, arr) => {
			return (
				<SliceItem
					key={i}
					title={item.title}
					top={item.meta.frame.origin.y}
					left={item.meta.frame.origin.x}
					width={item.meta.frame.size.width}
					height={item.meta.frame.size.height}
					scale={scale}
					onClick={() => this.handleSliceClick(i, item.id)} />
			);
		}) : [];

		return (
			<div className="inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-hero-wrapper">
						{(artboard) && (<img className={heroImageClass} src={artboard.filename} alt="Hero" ref={heroImage} />)}
						<div className="inspector-page-hero-slice-wrapper" style={slicesStyle}>
							{items}
						</div>
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
						Rotation: {(slice) ? slice.meta.rotation : 0}&deg;<br />
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
