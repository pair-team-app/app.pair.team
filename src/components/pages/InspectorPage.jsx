
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import CommentItem from '../iterables/CommentItem';
import Dropdown from '../elements/Dropdown';
import SliceItem from '../iterables/SliceItem';
import SliceToggle from '../elements/SliceToggle';
import Popup from '../elements/Popup';

const heroWrapper = React.createRef();
const heroImage = React.createRef();
const canvas = React.createRef();

class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageID        : this.props.match.params.pageID,
			artboardID    : this.props.match.params.artboardID,
			sliceID       : this.props.match.params.sliceID,
			slice         : null,
			hoverSlice    : null,
			scaleSize     : 3,
			page          : null,
			artboard      : null,
			code          : {
				html   : '#block {<br>&nbsp;&nbsp;width: 100%;<br>&nbsp;&nbsp;color: #ffffff;<br>}',
				syntax : '#block {width: 100%; color: #ffffff;}'
			},
			comment       : '',
			visibleTypes  : {
				slice      : false,
				hotspot    : false,
				textfield  : false,
				background : false,
				all        : true
			},
			languages     : [{
				id       : 0,
				title    : 'Add Ons',
				selected : true,
				key      : 'languages'
			}, {
				id       : 1,
				title    : 'CSS/HTML',
				selected : false,
				key      : 'languages'
			}, {
				id       : 2,
				title    : 'Swift',
				selected : false,
				key      : 'languages'
			}, {
				id       : 3,
				title    : 'Java',
				selected : false,
				key      : 'languages'
			}],
			popup : {
				visible : false,
				content : ''
			}
		};

		this.scale = 1;
		this.antsOffset = 0;
		this.antsInterval = null;
	}

	componentDidMount() {
		this.refreshData();
		this.antsInterval = setInterval(this.redrawAnts, 75);
	}

	componentDidUpdate(prevProps) {
// 		console.log('componentDidUpdate()', prevProps, this.props);
		if (this.props.match.params.artboardID !== prevProps.match.params.artboardID) {
			this.refreshData();
			return (null);
		}

		if (canvas.current) {
			this.updateCanvas();
		}
	}

	componentWillUnmount() {
		clearInterval(this.antsInterval);
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
// 				console.log('PAGE', response.data);
				this.setState({ page : response.data.page });

				formData.append('action', 'ARTBOARD');
				formData.append('artboard_id', '' + artboardID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('ARTBOARD', response.data);

						const slices =response.data.artboard.slices.map((item)=> ({
							id       : item.id,
							title    : item.title,
							type     : item.type,
							filename : (item.type === 'slice') ? item.filename : 'https://via.placeholder.com/' + JSON.parse(item.meta).frame.size.width + 'x' + JSON.parse(item.meta).frame.size.height,
							meta     : JSON.parse(item.meta),
							added    : item.added
						}));

						this.setState({
							artboard : {
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
							}
						});
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	handleSliceToggle = (type)=> {
		let visibleTypes = this.state.visibleTypes;
		Object.keys(visibleTypes).forEach(function(key) {
			visibleTypes[key] = false;

		});
		visibleTypes[type] = true;
		this.setState({ visibleTypes : visibleTypes });
	};

	handleCodeCopy = ()=> {
		const popup = {
			visible : true,
			content : 'Copied to Clipboard!'
		};
		this.setState({ popup : popup });
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

	handleVote = (commentID, score)=> {
		let formData = new FormData();
		formData.append('action', 'VOTE_COMMENT');
		formData.append('user_id', cookie.load('user_id'));
		formData.append('comment_id', commentID);
		formData.append('value', score);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('VOTE_COMMENT', response.data);
				this.refreshData();
			}).catch((error) => {
		});
	};

	handleZoom = (direction)=> {
		this.setState({ scaleSize : Math.min(Math.max(this.state.scaleSize + direction, 1), 3) });
	};

	handleSliceRollOver = (ind, slice)=> {
		this.setState({
			hoverSlice : slice,
			slice      : slice
		});
	};

	handleSliceRollOut = (ind, slice)=> {
		this.setState({
			hoverSlice : null,
			slice      : (slice) ? slice : null
		});
	};

	handleSliceClick = (ind, slice)=> {
		this.setState({ slice : slice });
	};

	handleDownload = ()=> {
// 		window.open(this.state.slice.filename + '@3x.png');
// 		window.open('http://cdn.designengine.ai/slice.php?slice_id=' + this.state.slice.id);

		if (this.state.artboard) {
			const filePath = 'http://cdn.designengine.ai/artboard.php?artboard_id=' + this.state.artboard.id;
			var link = document.createElement('a');
			link.href = filePath;
			link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
			link.click();
		}
	};

	resetThenSet = (ind, key) => {
		console.log('resetThenSet()', ind, key);
		let tmp = [...this.state[key]];
		tmp.forEach(item => item.selected = false);
		tmp[ind].selected = true;
		this.setState({ [key] : tmp });
	};

	updateCanvas = ()=> {
// 		console.log('updateCanvas()', heroWrapper, heroImage);
		const context = canvas.current.getContext('2d');
		context.clearRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		if (this.state.hoverSlice) {
			const offset = (heroWrapper.current && heroImage.current) ? {
				x : (heroWrapper.current.clientWidth - heroImage.current.clientWidth) * 0.5,
				y : (heroWrapper.current.clientHeight - heroImage.current.clientHeight) * 0.5
			} : {
				x : 0,
				y : 0
			};

			const srcFrame = (this.state.hoverSlice) ? this.state.hoverSlice.meta.frame : null;

			if (srcFrame) {
				const frame = {
					origin : {
						x : offset.x + Math.round(srcFrame.origin.x * this.scale),
						y : offset.y + Math.round(srcFrame.origin.y * this.scale)
					},
					size   : {
						width  : Math.round(srcFrame.size.width * this.scale),
						height : Math.round(srcFrame.size.height * this.scale)
					}
				};

// 				console.log('updateCanvas()', this.scale, offset, srcFrame.origin, frame.origin);

// 			context.fillRect(Math.round(frame.origin.x * this.scale), 2 + Math.round(frame.origin.y * this.scale), Math.round(frame.size.width * this.scale), Math.round(frame.size.height * this.scale));\

				context.strokeStyle = 'rgba(0, 255, 0, 0.5)';
				context.beginPath();
				context.setLineDash([1, 0]);
				context.lineDashOffset = 0;
				context.moveTo(0, frame.origin.y);
				context.lineTo(canvas.current.clientWidth, frame.origin.y);
				context.moveTo(0, frame.origin.y + frame.size.height);
				context.lineTo(canvas.current.clientWidth, frame.origin.y + frame.size.height);
				context.moveTo(frame.origin.x, 0);
				context.lineTo(frame.origin.x, canvas.current.clientHeight);
				context.moveTo(frame.origin.x + frame.size.width, 0);
				context.lineTo(frame.origin.x + frame.size.width,  canvas.current.clientHeight);
				context.stroke();

				context.fillStyle = 'rgba(0, 0, 0, 0.125)';
				context.fillRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
				context.strokeStyle = 'rgba(128, 0, 128, 1)';
				context.beginPath();
				context.moveTo(0, 0);
				context.setLineDash([4, 2]);
				context.lineDashOffset = this.antsOffset;
				context.strokeRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
// 		  context.lineWidth = 2;
				context.stroke();

				context.font = '8px AndaleMono';
				context.fillStyle = '#808080';
				context.textAlign = 'center';
				context.textBaseline = 'bottom';
				context.fillText(srcFrame.size.width + 'w', frame.origin.x + (frame.size.width * 0.5), frame.origin.y - 1);

				context.textAlign = 'left';
				context.textBaseline = 'middle';
				context.fillText(srcFrame.size.height + 'h', 2 + (frame.origin.x + frame.size.width), frame.origin.y + (frame.size.height * 0.5));

				context.fillStyle = 'rgba(0, 255, 0, 1)';
				context.textAlign = 'right';
				context.textBaseline = 'top';
				context.fillText(srcFrame.origin.x + 'px', frame.origin.x - 2, 1);

				context.textAlign = 'left';
				context.fillText((srcFrame.origin.x + srcFrame.size.width) + 'px', (frame.origin.x + frame.size.width) + 2, 1);

				context.textBaseline = 'bottom';
				context.fillText(srcFrame.origin.y + 'px', 1, frame.origin.y);

				context.textBaseline = 'top';
				context.fillText((srcFrame.origin.y + srcFrame.size.height) + 'px', 1, frame.origin.y + frame.size.height);
			}
		}
	};

	redrawAnts = ()=> {
		if (this.antsOffset++ > 16) {
			this.antsOffset = 0;
		}

		if (canvas.current) {
			this.updateCanvas();
		}
	};

	render() {
		const tsOptions = {
			year   : 'numeric',
			month  : 'numeric',
			day    : 'numeric'
		};

// 		const { page, artboard, slice } = this.state;
		const { artboard, slice } = this.state;
		const { visibleTypes } = this.state;
		const { scaleSize } = this.state;

		this.scale = (artboard && heroImage && heroImage.current) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? heroImage.current.clientWidth / artboard.meta.frame.size.width : heroImage.current.clientHeight / artboard.meta.frame.size.height : 1;

		const heroImageClass = 'inspector-page-hero-image' + ((artboard) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? ' inspector-page-hero-image-landscape' : ' inspector-page-hero-image-portrait' : '');
		const slicesStyle = (artboard) ? {
			width   : (this.scale * artboard.meta.frame.size.width) + 'px',
			height  : (this.scale * artboard.meta.frame.size.height) + 'px'
		} : {
			width   : '100%',
			height  : '100%'
		};

// 		console.log('InspectorPage.render()', this.scale);

		const commentButtonClass = (this.state.comment.length !== 0) ? 'inspector-page-comment-button' : 'inspector-page-comment-button button-disabled';

		const panelFrame = (artboard && !slice) ? artboard.meta.frame : (slice) ? slice.meta.frame : null;

// 		const panelImageClass = 'inspector-page-panel-image' + ((artboard && !slice) ? ' inspector-page-panel-image-artboard' : '');// + ((slice) ? ((slice.meta.frame.size.width > slice.meta.frame.size.height) ? ' inspector-page-panel-image-landscape' : ' inspector-page-panel-image-portrait')  + ' ' + ((slice.type === 'slice') ? 'inspector-page-panel-image-slice' : (slice.type === 'hotspot') ? 'inspector-page-panel-image-hotspot' : (slice.type === 'textfield') ? 'inspector-page-panel-image-textfield' : 'inspector-page-panel-image-background') : '');
		const panelImageClass = 'inspector-page-panel-image' + ((artboard && !slice) ? ' inspector-page-panel-image-artboard' + ((panelFrame.size.width > panelFrame.size.height) ? ' inspector-page-panel-image-landscape' : ' inspector-page-panel-image-portrait') : '');
// 		const panelSliceImage = (slice) ? ((slice.type === 'slice') ? slice.filename + '@' + scaleSize + 'x.png' : ('https://via.placeholder.com/' + (slice.meta.frame.size.width * scaleSize) + 'x' + (slice.meta.frame.size.height * scaleSize))) : null;
		const panelSliceImage = (slice) ? slice.filename + '@' + scaleSize + 'x.png' : null;

		const styles = (slice &&  slice.meta.styles && slice.meta.styles.length > 0) ? {
			stroke : (slice.meta.styles[0].border.length > 0) ? {
				color     : slice.meta.styles[0].border[0].color.toUpperCase(),
				position  : slice.meta.styles[0].border[0].position,
				thickness : slice.meta.styles[0].border[0].thickness + 'px'
			} : null,
			shadow : (slice.meta.styles[0].shadow.length > 0) ? {
				color  : slice.meta.styles[0].shadow[0].color.toUpperCase(),
				offset : {
					x : slice.meta.styles[0].shadow[0].offset.x,
					y : slice.meta.styles[0].shadow[0].offset.y
				},
				spread : slice.meta.styles[0].shadow[0].spread + 'px',
				blur   : slice.meta.styles[0].shadow[0].blur + 'px'
			} : null,
			innerShadow : (slice.meta.styles[0].innerShadow.length > 0) ? {
				color  : slice.meta.styles[0].shadow[0].color.toUpperCase(),
				offset : {
					x : slice.meta.styles[0].shadow[0].offset.x,
					y : slice.meta.styles[0].shadow[0].offset.y
				},
				spread : slice.meta.styles[0].shadow[0].spread + 'px',
				blur   : slice.meta.styles[0].shadow[0].blur + 'px'
			} : null
		} : null;

		const slices = (artboard) ? artboard.slices.map((slice, i) => {
			return (
				<SliceItem
					key={i}
					title={slice.title}
					type={slice.type}
					visible={visibleTypes[slice.type]}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={this.scale}
					onRollOver={()=> this.handleSliceRollOver(i, slice)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={() => this.handleSliceClick(i, slice)} />
			);
		}) : [];

		const comments = (artboard) ? artboard.comments.map((item, i) => {
			return (
				<CommentItem
					key={i}
					id={item.id}
					votes={item.votes}
					author={item.author}
					content={item.content}
					added={item.added}
					onVote={(score)=> this.handleVote(item.id, score)}
				/>);
		}) : [];

		return (
			<div className="page-wrapper inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-title">{(artboard) ? artboard.title : 'Loading…'}</div>
					<div className="inspector-page-hero-wrapper" ref={heroWrapper}>
						{(artboard) && (<img className={heroImageClass} src={artboard.filename} alt="Hero" ref={heroImage} />)}
						<div className="inspector-page-hero-slice-wrapper" style={slicesStyle}>{slices}</div>
						<div className="inspector-page-hero-canvas-wrapper">
							{/*<canvas width={(artboard) ? scale * artboard.meta.frame.size.width : 0} height={(artboard) ? scale * artboard.meta.frame.size.height : 0} ref={canvas}>Your browser does not support the HTML5 canvas tag.</canvas>*/}
							<canvas width={(heroWrapper.current) ? heroWrapper.current.clientWidth : 0} height="600" ref={canvas}>Your browser does not support the HTML5 canvas tag.</canvas>
						</div>
						<div className="inspector-page-toggle-wrapper">
							<SliceToggle type="hotspot" selected={visibleTypes.hotspot} onClick={()=> this.handleSliceToggle('hotspot')} /><br />
							<SliceToggle type="slice" selected={visibleTypes.slice} onClick={()=> this.handleSliceToggle('slice')} /><br />
							<SliceToggle type="textfield" selected={visibleTypes.textfield} onClick={()=> this.handleSliceToggle('textfield')} /><br />
							<SliceToggle type="background" selected={visibleTypes.background} onClick={()=> this.handleSliceToggle('background')} />
							<SliceToggle type="" selected={(visibleTypes.all)} onClick={()=> this.handleSliceToggle('all')} />
						</div>
					</div>
					<div>
						<button className="inspector-page-download-button" onClick={()=> this.handleDownload()}>Download</button>
						{/*<button className="inspector-page-add-button" onClick={()=> this.handleDownload()}>Add to My Projects</button>*/}
					</div>
					<textarea className="inspector-page-comment-txt" name="comment" placeholder="Enter Comment" value={this.state.comment} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />
					<button className={commentButtonClass} onClick={()=> this.submitComment()}>Comment</button>

					{/*<div className="inspector-page-hero-info-wrapper">*/}
						{/*{(artboard) ? artboard.views + ' View' + ((parseInt(artboard.views, 10) !== 1) ? 's' : '') : 'Views'}<br />*/}
						{/*{(artboard) ? artboard.downloads + ' Download' + ((parseInt(artboard.downloads, 10) !== 1) ? 's' : '') : 'Downloads'}<br />*/}
						{/*{(artboard) ? artboard.comments.length + ' Comment' + ((artboard.comments.length !== 1) ? 's' : '') : 'Comments'}*/}
					{/*</div>*/}

					<div className="inspector-page-comment-wrapper">
						{comments}
					</div>
				</div>
				<div className="inspector-page-panel">
					<div className="inspector-page-panel-content-wrapper">
						<div className="inspector-page-panel-display">
							{(artboard && !slice) && (
								<img className={panelImageClass} src={artboard.filename} alt={artboard.title} />
							)}

							{(slice) && (
								<img className={panelImageClass} src={panelSliceImage} alt={(slice.title + ' @' + scaleSize + 'x')} />
							)}
							<div className="inspector-page-panel-zoom-wrapper">
								<button className={'inspector-page-float-button' + ((scaleSize === 3) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(1)} style={{marginRight:'20px'}}><img className="inspector-page-float-button-image" src={(slice && scaleSize < 3) ? '/images/zoom-in.svg' : '/images/zoom-in_disabled.svg'} alt="+" /></button>
								<button className={'inspector-page-float-button' + ((scaleSize === 1) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(-1)}><img className="inspector-page-float-button-image" src={(slice && scaleSize > 1) ? '/images/zoom-out.svg' : '/images/zoom-out_disabled.svg'} alt="-" /></button>
							</div>
						</div>
					</div>
					<div className="inspector-page-panel-content-wrapper">
						<Dropdown
							title="Add Ons"
							list={this.state.languages}
							resetThenSet={this.resetThenSet}
						/>
						<div className="inspector-page-panel-code-wrapper">
							<div className="code-snippet inspector-page-panel-code"><span dangerouslySetInnerHTML={{ __html : this.state.code.html }} /></div>
							<CopyToClipboard onCopy={()=> this.handleCodeCopy()} text={this.state.code.syntax}>
								<button className="inspector-page-float-button inspector-page-copy-code-button"><img className="inspector-page-float-button-image" src="/images/copy-code.svg" alt="Copy" /></button>
							</CopyToClipboard>
						</div>
					</div>
					<div className="inspector-page-panel-content-wrapper" style={{borderBottom:'none'}}>
						<div className="inspector-page-panel-info-wrapper">
							{/*<Row><Column flexGrow={1}>System</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard && artboard.system) ? artboard.system.title : 'N/A'}</Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Author</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val"><a href={'mailto:' + ((artboard && artboard.system) ? artboard.system.author : '#')} style={{textDecoration:'none'}}>{(artboard && artboard.system) ? artboard.system.author : 'N/A'}</a></Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Page</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(page) ? page.title : 'N/A'}</Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Artboard</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard) ? artboard.title : 'N/A'}</Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Name</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.title : 'N/A'} {(slice) ? '(' + slice.type.replace(/(\b\w)/gi, function(m) {return (m.toUpperCase());}) + ')' : ''}</Column></Row>*/}
							<Row><Column flexGrow={1}>Name</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.title : 'N/A'}</Column></Row>
							<Row><Column flexGrow={1}>Type</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.type.replace(/(\b\w)/gi, function(m) {return (m.toUpperCase());}) : 'N/A'}</Column></Row>
							<Row><Column flexGrow={1}>Date</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? (new Intl.DateTimeFormat('en-US', tsOptions).format(Date.parse(slice.added))) : 'N/A'}</Column></Row>
							<Row>
								<Column flexGrow={1} flexBasis={1}>Export Size</Column>
								<Row flexGrow={1} flexBasis={1} className="inspector-page-panel-info-val">
									<div style={{width:'50%'}}>W: {(slice) ? slice.meta.frame.size.width : 0}px</div>
									<div style={{width:'50%', textAlign:'right'}}>H: {(slice) ? slice.meta.frame.size.height : 0}px</div>
								</Row>
							</Row>
							<Row>
								<Column flexGrow={1} flexBasis={1}>Position</Column>
								<Row flexGrow={1} flexBasis={1} className="inspector-page-panel-info-val">
									<div style={{width:'50%'}}>X: {(slice) ? slice.meta.frame.origin.x : 0}px</div>
									<div style={{width:'50%', textAlign:'right'}}>Y: {(slice) ? slice.meta.frame.origin.y : 0}px</div>
								</Row>
							</Row>
							{/*<Row><Column flexGrow={1}>Scale</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(scaleSize + 'x')}</Column></Row>*/}
							<Row><Column flexGrow={1}>Rotation</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.meta.rotation : 0}&deg;</Column></Row>
							<Row><Column flexGrow={1}>Opacity</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? (slice.meta.opacity * 100) : 100}%</Column></Row>
							<Row><Column flexGrow={1}>Color</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.meta.fillColor.toUpperCase() : 'N/A'}</Column></Row>
							{(styles) && (<div>
								<Row><Column flexGrow={1}>Stroke</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.stroke) ? (styles.stroke.position.toLowerCase().replace(/(\b\w)/gi, function(m) { return m.toUpperCase(); }) + ' / Size: ' + styles.stroke.thickness + ' / ' + styles.stroke.color) : 'N/A'}</Column></Row>
								<Row><Column flexGrow={1}>Shadow</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.shadow) ? ('Offset: (' + styles.shadow.offset.x + ', ' + styles.shadow.offset.y + ') / Blur: ' + styles.shadow.blur) : 'N/A'}</Column></Row>
								<Row><Column flexGrow={1}>Inner Shadow</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.innerShadow) ? ('Offset: (' + styles.innerShadow.offset.x + ', ' + styles.innerShadow.offset.y + ') / Blur: ' + styles.innerShadow.blur) : 'N/A'}</Column></Row>
							</div>)}
							{(slice && slice.type === 'textfield') && (<div>
								{/*<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.family) ? slice.meta.font.family : 'N/A'}</Column></Row>*/}
								<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard.system.title.toLowerCase().includes('ios')) ? 'SFProText' : 'Roboto'}</Column></Row>
								<Row><Column flexGrow={1}>Font size</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.size + 'px')}</Column></Row>
								<Row><Column flexGrow={1}>Font color</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.color) ? slice.meta.font.color.toUpperCase() : 'N/A'}</Column></Row>
								<Row><Column flexGrow={1}>Line Height</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.lineHeight) ? (slice.meta.font.lineHeight + 'px') : 'N/A'}</Column></Row>
								<Row><Column flexGrow={1}>Letter Spacing</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.kerning) ? (slice.meta.font.kerning + 'px') : 'N/A'}</Column></Row>
							</div>)}
							<Row><Column flexGrow={1}>Blend</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.meta.blendMode.toLowerCase().replace(/(\b\w)/gi, function(m) { return m.toUpperCase(); }) : 'N/A'}</Column></Row>
						</div>
					</div>
				</div>

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default InspectorPage;
