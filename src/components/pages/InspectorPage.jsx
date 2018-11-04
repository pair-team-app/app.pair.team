
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

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
			scaleSize     : 3,
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
								filename : (item.type === 'slice') ? item.filename : 'https://via.placeholder.com/' + meta.frame.size.width + 'x' + meta.frame.size.height,
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
							system    : response.data.artboard.system,
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
		if (this.state.comment.length > 0) {
			let formData = new FormData();
			formData.append('action', 'ADD_COMMENT');
			formData.append('user_id', cookie.load('user_id'));
			formData.append('artboard_id', '' + this.state.artboardID);
			formData.append('content', this.state.comment);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('ADD_COMMENT', response.data);
					this.setState({ comment : '' });
					this.refreshData();
				}).catch((error) => {
			});
		}
	};

	handleSizeChange = (scaleSize)=> {
		this.setState({ scaleSize : scaleSize });
	};

	handleSliceClick = (ind, id)=> {
		this.setState({ slice : ind });
	};

	render() {
		const tsOptions = {
			year   : 'numeric',
			month  : 'numeric',
			day    : 'numeric',
			hour   : 'numeric',
			minute : 'numeric'
		};

		const page = (this.state.page) ? this.state.page : null;
		const artboard = (this.state.artboard) ? this.state.artboard : null;
		const slice = (this.state.artboard) ? (this.state.slice > -1) ? this.state.artboard.slices[this.state.slice] : null : null;
		const scale = Math.min(3, (artboard && heroImage && heroImage.current) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? heroImage.current.clientWidth / artboard.meta.frame.size.width : heroImage.current.clientHeight / artboard.meta.frame.size.height : 1);

		const heroImageClass = 'inspector-page-hero-image' + ((artboard) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? ' inspector-page-hero-image-landscape' : ' inspector-page-hero-image-portrait' : '');
		const panelImageClass = 'inspector-page-panel-image' + ((slice) ? ((slice.meta.frame.size.width > slice.meta.frame.size.height) ? ' inspector-page-panel-image-landscape' : ' inspector-page-panel-image-portrait')  + ' ' + ((slice.type === 'slice') ? 'inspector-page-panel-image-slice' : (slice.type === 'hotspot') ? 'inspector-page-panel-image-hotspot' : (slice.type === 'textfield') ? 'inspector-page-panel-image-textfield' : 'inspector-page-panel-image-background') : '');
		const slicesStyle = (artboard) ? {
			width   : (scale * artboard.meta.frame.size.width) + 'px',
			height  : (scale * artboard.meta.frame.size.height) + 'px',
			display : (this.state.slicesVisible) ? 'block' : 'none'
		} : {
			width   : '100%',
			height  : '100%'
		};

		const commentButtonClass = (this.state.comment.length !== 0) ? 'inspector-page-comment-button' : 'inspector-page-comment-button inspector-page-comment-button-disabled';

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

		console.log('slice', slice);

		return (
			<div className="inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-hero-wrapper">
						{(artboard) && (<img className={heroImageClass} src={artboard.filename} alt="Hero" ref={heroImage} />)}
						<div className="inspector-page-hero-slice-wrapper" style={slicesStyle}>
							{slices}
						</div>
						<div className="inspector-page-hero-title-wrapper"><Row>
							<Column flexGrow={1} horizontal="start">{(artboard) ? artboard.title : 'N/A'}</Column>
							<Column flexGrow={1} horizontal="end"><SliceToggle onClick={(isSelected)=> this.handleSliceToggle(isSelected)} /></Column>
						</Row></div>
					</div>
					<textarea className="inspector-page-comment-txt" name="comment" placeholder="" value={this.state.comment} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />
					<button className={commentButtonClass} onClick={()=> this.submitComment()}>Submit</button>

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
							<img className={panelImageClass} src={((slice.type === 'slice') ? slice.filename + '@' + this.state.scaleSize + 'x.png' : ('https://via.placeholder.com/' + (slice.meta.frame.size.width * this.state.scaleSize) + 'x' + (slice.meta.frame.size.height * this.state.scaleSize)))} alt={(slice.title + ' - @' + this.state.scaleSize + 'x')} />
						)}
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<div>
							<button className={'inspector-page-size-button' + ((this.state.scaleSize === 1) ? ' inspector-page-size-button-selected' : '')} onClick={()=> this.handleSizeChange(1)}>1x</button>
							<button className={'inspector-page-size-button inspector-page-size-button-middle' + ((this.state.scaleSize === 2) ? ' inspector-page-size-button-selected' : '')} onClick={()=> this.handleSizeChange(2)}>2x</button>
							<button className={'inspector-page-size-button' + ((this.state.scaleSize === 3) ? ' inspector-page-size-button-selected' : '')} onClick={()=> this.handleSizeChange(3)}>3x</button>
						</div>
						<div><button className="inspector-page-download-button">Download</button></div>
					</div>
					<div className="inspector-page-panel-info-wrapper">
						<Row><Column flexGrow={1}>System</Column><Column flexGrow={1} horizontal="end">{(artboard && artboard.system) ? artboard.system.title : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Author</Column><Column flexGrow={1} horizontal="end"><a href={'mailto:' + ((artboard && artboard.system) ? artboard.system.author : '#')} style={{textDecoration:'none'}}>{(artboard && artboard.system) ? artboard.system.author : 'N/A'}</a></Column></Row>
						<Row><Column flexGrow={1}>Page</Column><Column flexGrow={1} horizontal="end">{(page) ? page.title : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Artboard</Column><Column flexGrow={1} horizontal="end">{(artboard) ? artboard.title : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Name</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.title : 'N/A'} {(slice) ? '(' + slice.type.replace(/(\b\w)/gi, function(m) {return (m.toUpperCase());}) + ')' : ''}</Column></Row>
						<Row><Column flexGrow={1}>Added</Column><Column flexGrow={1} horizontal="end">{(slice) ? (new Intl.DateTimeFormat('en-US', tsOptions).format(Date.parse(slice.added))).replace(',', '').toLowerCase().replace(/ (.{2})$/g, '$1') : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Position</Column><Column flexGrow={1} horizontal="end">({(slice) ? slice.meta.frame.origin.x : '0'}, {(slice) ? slice.meta.frame.origin.y : 0})</Column></Row>
						<Row><Column flexGrow={1}>Size</Column><Column flexGrow={1} horizontal="end">{(slice) ? (slice.meta.frame.size.width * this.state.scaleSize) : 0} &times; {(slice) ? (slice.meta.frame.size.height * this.state.scaleSize) : 0}</Column></Row>
					</div>
					<div className="inspector-page-panel-code-wrapper">
						<div className="inspector-page-panel-code"><span dangerouslySetInnerHTML={{ __html : this.state.code }} /></div>
						<div className="inspector-page-panel-button-wrapper"><div>
							<button className="inspector-page-code-button">CSS</button>
							<button className="inspector-page-code-button inspector-page-code-button-middle">Swift</button>
							<button className="inspector-page-code-button">Java</button>
						</div></div>
						<button className="inspector-page-copy-code-button">Copy</button>
					</div>
					<div className="inspector-page-panel-info-wrapper">
						<Row><Column flexGrow={1}>Scale</Column><Column flexGrow={1} horizontal="end">{(this.state.scaleSize + 'x')}</Column></Row>
						<Row><Column flexGrow={1}>Rotation</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.meta.rotation : 0}&deg;</Column></Row>
						<Row><Column flexGrow={1}>Opacity</Column><Column flexGrow={1} horizontal="end">{(slice) ? (slice.meta.opacity * 100) : 100}%</Column></Row>
						<Row><Column flexGrow={1}>Color</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.meta.fillColor.toUpperCase() : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end">{(slice && slice.meta.font.family) ? slice.meta.font.family : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Font Size</Column><Column flexGrow={1} horizontal="end">{(slice && slice.meta.font.size) ? slice.meta.font.size : 'N/A'}</Column></Row>
						{/*<Row><Column flexGrow={1}>Font Color: {(slice && slice.meta.font.color) ? slice.meta.font.color.toUpperCase() : 'N/A'}</Column></Row>*/}
						<Row><Column flexGrow={1}>Font Color</Column><Column flexGrow={1} horizontal="end">N/A</Column></Row>
						<Row><Column flexGrow={1}>Blend Mode</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.meta.blendMode.toLowerCase().replace(/(\b\w)/gi, function(m) { return m.toUpperCase(); }) : 'N/A'}</Column></Row>
					</div>
				</div>
			</div>
		);
	}
}

export default InspectorPage;
