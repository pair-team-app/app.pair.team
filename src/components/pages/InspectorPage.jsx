
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import cookie from 'react-cookies';

import CommentItem from '../iterables/CommentItem';
import SliceItem from '../iterables/SliceItem';
import SliceToggle from '../elements/SliceToggle';

const heroImage = React.createRef();
class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			system        : cookie.load('system'),
			author        : cookie.load('author'),
			pageID        : 0,
			artboardID    : 0,
			slice         : -1,
			page          : null,
			artboard      : null,
			code          : '#block {<br>&nbsp;&nbsp;width: 100%;<br>&nbsp;&nbsp;color: #ffffff;<br>}',
			comment       : '',
			slicesVisible : true
		};
	}

	componentDidMount() {
// 		let formData = new FormData();
// 		formData.append('action', 'ADD_VIEW');
// 		formData.append('artboard_id', '' + this.props.match.params.artboardID);
// 		axios.post('https://api.designengine.ai/system.php', formData)
// 			.then((response) => {
// 				console.log('ADD_VIEW', response.data);
// 			}).catch((error) => {
// 		});

		this.refreshData();
	}

	componentDidUpdate(prevProps) {
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
							const meta = JSON.parse(item.meta);
							slices.push({
								id       : item.id,
								title    : item.title,
								type     : item.type,
								filename : (item.type === 'slice') ? item.filename + '@1x.png' : 'https://via.placeholder.com/' + meta.frame.size.width + 'x'+ meta.frame.size.height,
								meta     : meta,
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
							slices    : slices,
							comments  : response.data.artboard.comments
						};

						this.setState({ artboard : artboard });
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	handleSliceToggle = (isSelected)=> {
		console.log('handleSliceToggle()', isSelected);
		this.setState({
			slice         : -1,
			slicesVisible : isSelected
		});
	};

	submitComment = ()=> {
		let formData = new FormData();
		formData.append('action', 'ADD_COMMENT');
		formData.append('user_id', cookie.load('user_id'));
		formData.append('artboard_id', '' + this.state.artboardID);
		formData.append('content', this.state.comment);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('ADD_COMMENT', response.data);
				this.setState({ comment : '' });
				this.refreshData();
			}).catch((error) => {
		});
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
			width   : (scale * artboard.meta.frame.size.width) + 'px',
			height  : (scale * artboard.meta.frame.size.height) + 'px',
			display : (this.state.slicesVisible) ? 'block' : 'none'
		} : {
			width   : '100%',
			height  : '100%',
		};

// 		console.log("InspectorPage", "artboard:"+artboard, "heroImage:"+heroImage, "heroImage.current"+heroImage.current);

		const slices = (artboard) ? artboard.slices.map((item, i, arr) => {
			return (
				<SliceItem
					key={i}
					title={item.title}
					type={item.type}
					top={item.meta.frame.origin.y}
					left={item.meta.frame.origin.x}
					width={item.meta.frame.size.width}
					height={item.meta.frame.size.height}
					scale={scale}
					onClick={() => this.handleSliceClick(i, item.id)} />
			);
		}) : [];

		const comments = (artboard) ? artboard.comments.map((item, i, arr) => {
			return (
				<CommentItem
					key={i}
					author={item.author}
					content={item.content}
					added={item.added}
				/>);
		}) : [];

		return (
			<div className="inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-hero-wrapper">
						{(artboard) && (<img className={heroImageClass} src={artboard.filename} alt="Hero" ref={heroImage} />)}
						<div className="inspector-page-hero-slice-wrapper" style={slicesStyle}>
							{slices}
						</div>
						<div className="inspector-page-hero-switch">
							<SliceToggle onClick={(isSelected)=> this.handleSliceToggle(isSelected)} />
						</div>
					</div>
					<textarea className="inspector-page-comment-txt" name="comment" placeholder="Enter Comment Here" value={this.state.comment} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />
					<button className="inspector-page-comment-button" onClick={()=> this.submitComment()}>Submit</button>

					<div className="inspector-page-hero-info-wrapper">
						{(artboard) ? artboard.views + ' View' + ((parseInt(artboard.views, 10) !== 1) ? 's' : '') : 'Views'}<br />
						{(artboard) ? artboard.downloads + ' Download' + ((parseInt(artboard.downloads, 10) !== 1) ? 's' : '') : 'Downloads'}<br />
						{(artboard) ? artboard.comments.length + ' Comment' + ((artboard.comments.length !== 1) ? 's' : '') : 'Comments'}
					</div>
					<div className="inspector-page-comment-wrapper">
						{comments}
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
						Name: {(slice) ? slice.title : 'N/A'} {(slice) ? '(' + slice.type.replace(/(\b\w)/gi, function(m) {return (m.toUpperCase());}) + ')' : ''}<br />
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
