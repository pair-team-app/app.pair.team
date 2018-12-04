
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import cookie from 'react-cookies';
import Draggable from 'react-draggable';
import { Column, Row } from 'simple-flexbox';

import BottomNav from '../elements/BottomNav';
import CommentItem from '../iterables/CommentItem';
import Dropdown from '../elements/Dropdown';
import SliceItem from '../iterables/SliceItem';
import SliceToggle from '../elements/SliceToggle';
import Popup from '../elements/Popup';

const dragWrapper = React.createRef();
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
			canvasVisible : true,
			scale         : 1,
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
				title    : 'React CSS',
				selected : false,
				key      : 'languages'
			}, {
				id       : 3,
				title    : 'SVG',
				selected : false,
				key      : 'languages'
			}],
			popup : {
				visible : false,
				content : ''
			}
		};

		this.rerender = 0;
		this.antsOffset = 0;
		this.antsInterval = null;

		cookie.save('upload_id', this.props.match.params.uploadID, { path : '/' });
	}

	componentDidMount() {
		this.refreshData();
		this.antsInterval = setInterval(this.redrawAnts, 75);

		document.addEventListener('keydown', this.handleKeyDown.bind(this));
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
		document.removeEventListener("keydown", this.handleKeyDown.bind(this));
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

						const slices = response.data.artboard.slices.map((item)=> ({
							id       : item.id,
							title    : item.title,
							type     : item.type,
							filename : item.filename,
							meta     : JSON.parse(item.meta),
							added    : item.added
						}));

						this.setState({
							artboard : {
								id        : response.data.artboard.id,
								pageID    : response.data.artboard.page_id,
								title     : response.data.artboard.title,
								filename  : response.data.artboard.filename,
// 								filename  : (response.data.artboard.type === 'slice') ? response.data.artboard.filename : 'https://via.placeholder.com/' + JSON.parse(response.data.artboard.meta).frame.size.width + 'x' + JSON.parse(response.data.artboard.meta).frame.size.height,
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

	handleKeyDown = (event)=> {
		if (event.keyCode === 187) {
			this.handleZoom(1);

		} else if (event.keyCode === 189) {
			this.handleZoom(-1);
		}
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

	handleCommentChange = (event)=> {
		event.persist();
		if (/\r|\n/.exec(event.target.value)) {
			this.submitComment(event);

		} else {
			this.setState({ [event.target.name] : event.target.value })
		}
	};

	submitComment = (event)=> {
		event.preventDefault();

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

	handleDrag = (event)=> {
		//console.log(event.type, event.target);
		if (event.type === 'mousedown') {


		} else if (event.type === 'mousemove') {
// 			this.forceUpdate();

		} else if (event.type === 'mouseup') {
			this.setState({ canvasVisible : true });
		}
	};

	handleMouseDown = ()=> {
		this.setState({ canvasVisible : false });
	};

	handleMouseUp = ()=> {
		this.setState({ canvasVisible : true });
	};

	handleZoom = (direction)=> {
		const { scale } = this.state;

		this.setState({ scale : (direction === 0) ? 1 : Math.min(Math.max(scale + (direction * 0.025), 1), 3) });
	};

	handleSliceRollOver = (ind, slice)=> {
		this.setState({ hoverSlice : slice });
	};

	handleSliceRollOut = (ind, slice)=> {
		this.setState({ hoverSlice : null });
	};

	handleSliceClick = (ind, slice)=> {
		this.setState({ slice : slice });
	};

	handleDownload = ()=> {
		if (cookie.load('user_id') === '0') {
			cookie.save('msg', 'download these parts.', { path : '/' });
			this.props.onPage('login');

		} else {
			const filePath = 'http://cdn.designengine.ai/artboard.php?artboard_id=' + this.state.artboard.id;
			let link = document.createElement('a');
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

		const { scale } = this.state;
		const slice = this.state.slice;
		const context = canvas.current.getContext('2d');
		context.clearRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		context.fillStyle = 'rgba(0, 0, 0, 0.25)';
		context.fillRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		if (slice) {
			const selectedSrcFrame = slice.meta.frame;
// 			const selectedOffset = (heroWrapper.current && heroImage.current) ? {
// 				x : heroImage.current.offsetLeft,//(heroWrapper.current.clientWidth - heroImage.current.clientWidth) * 0.5,
// 				y : heroImage.current.offsetTop//(heroWrapper.current.clientHeight - heroImage.current.clientHeight) * 0.5
// 			} : {
// 				x : 0,
// 				y : 0
// 			};

			const selectedOffset = (dragWrapper.current) ? {
				x : parseInt(dragWrapper.current.style.transform.split('(')[1].slice(0, -1).split(', ')[0].replace('px', ''), 10),
				y : parseInt(dragWrapper.current.style.transform.split('(')[1].slice(0, -1).split(', ')[1].replace('px', ''), 10),
			} : {
				x : 0,
				y : 0
			};

			const selectedFrame = {
				origin : {
					x : selectedOffset.x + Math.round(selectedSrcFrame.origin.x * scale),
					y : selectedOffset.y + Math.round(selectedSrcFrame.origin.y * scale)
				},
				size   : {
					width  : Math.round(selectedSrcFrame.size.width * scale),
					height : Math.round(selectedSrcFrame.size.height * scale)
				}
			};

			context.fillStyle = (slice.type === 'slice') ? 'rgba(255, 127, 0, 0.25)' : (slice.type === 'hotspot') ? 'rgba(0, 255, 0, 0.25)' : (slice.type === 'textfield') ? 'rgba(0, 0, 155, 0.25)' : 'rgba(127, 0, 0, 0.25)';
			context.fillRect(selectedFrame.origin.x, selectedFrame.origin.y, selectedFrame.size.width, selectedFrame.size.height);
			context.fillStyle = '#00ff00';
			context.fillRect(selectedFrame.origin.x, selectedFrame.origin.y - 13, selectedFrame.size.width, 13);
			context.fillRect(selectedFrame.origin.x - 30, selectedFrame.origin.y, 30, selectedFrame.size.height);

			context.font = '10px AndaleMono';
			context.fillStyle = '#ffffff';
			context.textAlign = 'center';
			context.textBaseline = 'bottom';
			context.fillText(selectedSrcFrame.size.width + 'PX', selectedFrame.origin.x + (selectedFrame.size.width * 0.5), selectedFrame.origin.y - 1);

			context.textAlign = 'right';
			context.textBaseline = 'middle';
			context.fillText(selectedSrcFrame.size.height + 'PX', selectedFrame.origin.x - 2, selectedFrame.origin.y + (selectedFrame.size.height * 0.5));

			context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
			context.beginPath();
			context.setLineDash([4, 2]);
			context.lineDashOffset = this.antsOffset;
			context.strokeRect(selectedFrame.origin.x, selectedFrame.origin.y, selectedFrame.size.width, selectedFrame.size.height);
		}

		if (this.state.hoverSlice) {
			let visible = false;
			let self = this;
			Object.keys(this.state.visibleTypes).forEach(function(key) {
// 				console.log('hoverslice', self.state.visibleTypes, self.state.hoverSlice.type, key);
				if (self.state.visibleTypes[key] && self.state.hoverSlice.type === key) {
					visible = true;
				}
			});

			if (this.state.visibleTypes.all) {
				visible = true;
			}

			if (visible) {
				const offset = (heroWrapper.current && heroImage.current) ? {
					x : (heroWrapper.current.clientWidth - heroImage.current.clientWidth) * 0.5,
					y : (heroWrapper.current.clientHeight - heroImage.current.clientHeight) * 0.5
				} : {
					x : 0,
					y : 0
				};

				const srcFrame = this.state.hoverSlice.meta.frame;

				const frame = {
					origin : {
						x : offset.x + Math.round(srcFrame.origin.x * scale),
						y : offset.y + Math.round(srcFrame.origin.y * scale)
					},
					size   : {
						width  : Math.round(srcFrame.size.width * scale),
						height : Math.round(srcFrame.size.height * scale)
					}
				};

				console.log('updateCanvas()', frame);

				context.fillStyle = (this.state.hoverSlice.type === 'slice') ? 'rgba(255, 127, 0, 0.25)' : (this.state.hoverSlice.type === 'hotspot') ? 'rgba(0, 255, 0, 0.25)' : (this.state.hoverSlice.type === 'textfield') ? 'rgba(0, 0, 255, 0.25)' : 'rgba(255, 0, 0, 0.25)';
				context.fillRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
				context.strokeStyle = 'rgba(0, 255, 0, 1.0)';
				context.beginPath();
				context.setLineDash([4, 2]);
				context.lineDashOffset = 0;//-this.antsOffset;
				context.moveTo(0, frame.origin.y);
				context.lineTo(canvas.current.clientWidth, frame.origin.y);
				context.moveTo(0, frame.origin.y + frame.size.height);
				context.lineTo(canvas.current.clientWidth, frame.origin.y + frame.size.height);
				context.moveTo(frame.origin.x, 0);
				context.lineTo(frame.origin.x, canvas.current.clientHeight);
				context.moveTo(frame.origin.x + frame.size.width, 0);
				context.lineTo(frame.origin.x + frame.size.width, canvas.current.clientHeight);
				context.stroke();

				context.setLineDash([1, 0]);
				context.lineDashOffset = 0;
				context.fillStyle = 'rgba(0, 0, 0, 0.0)';
				context.fillRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
				context.strokeStyle = '#00ff00';
				context.beginPath();
				context.moveTo(0, 0);
				context.strokeRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
				// 		  context.lineWidth = 2;
				context.stroke();

				context.fillStyle = '#00ff00';
				context.fillRect(frame.origin.x, frame.origin.y - 13, frame.size.width, 13);
				context.fillRect(frame.origin.x - 30, frame.origin.y, 30, frame.size.height);

				context.font = '10px AndaleMono';
				context.fillStyle = '#ffffff';
				context.textAlign = 'center';
				context.textBaseline = 'bottom';
				context.fillText(srcFrame.size.width + 'PX', frame.origin.x + (frame.size.width * 0.5), frame.origin.y - 1);

				context.textAlign = 'right';
				context.textBaseline = 'middle';
				context.fillText(srcFrame.size.height + 'PX', frame.origin.x - 2, frame.origin.y + (frame.size.height * 0.5));

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

	eventLogger = (e, data) => {
		console.log('Event: ', e);
		console.log('Data: ', data);
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
		const { page, artboard, slice } = this.state;
		const { visibleTypes } = this.state;
		const { scale } = this.state;

		//this.scale = (artboard && heroImage && heroImage.current) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? heroImage.current.clientWidth / artboard.meta.frame.size.width : heroImage.current.clientHeight / artboard.meta.frame.size.height : 1;

		const slicesStyle = (artboard) ? {
			width   : (scale * artboard.meta.frame.size.width) + 'px',
			height  : (scale * artboard.meta.frame.size.height) + 'px'
		} : {
			width   : '100%',
			height  : '100%'
		};


// 		const selectedOffset = (dragWrapper.current) ? {
// 			x : parseInt(dragWrapper.current.style.transform.split('(')[1].slice(0, -1).split(', ')[0].replace('px', ''), 10),
// 			y : parseInt(dragWrapper.current.style.transform.split('(')[1].slice(0, -1).split(', ')[1].replace('px', ''), 10),
// 		} : {
// 			x : 0,
// 			y : 0
// 		};

		let self = this;
		if (this.rerender === 0) {
			this.rerender = 1;
			setTimeout(function() {
				self.forceUpdate();
			}, 1000);
		}

		const commentButtonClass = (this.state.comment.length !== 0) ? 'inspector-page-comment-button' : 'inspector-page-comment-button button-disabled';
// 		const panelFrame = (artboard && !slice) ? artboard.meta.frame : (slice) ? slice.meta.frame : null;

		const panelImageClass = 'inspector-page-panel-image' + ((artboard && !slice) ? ' inspector-page-panel-image-artboard' : ((slice) ? ((slice.meta.frame.size.width > slice.meta.frame.size.height) ? ' inspector-page-panel-image-landscape' : ' inspector-page-panel-image-portrait')  + ' ' + ((slice.type === 'slice') ? 'inspector-page-panel-image-slice' : (slice.type === 'hotspot') ? 'inspector-page-panel-image-hotspot' : (slice.type === 'textfield') ? 'inspector-page-panel-image-textfield' : 'inspector-page-panel-image-background') : ''));
// 		const panelImageClass = 'inspector-page-panel-image' + ((artboard && !slice) ? ' inspector-page-panel-image-artboard' + ((panelFrame.size.width > panelFrame.size.height) ? ' inspector-page-panel-image-landscape' : ' inspector-page-panel-image-portrait') : '');
// 		const panelSliceImage = (slice) ? ((slice.type === 'slice') ? slice.filename + '@' + scaleSize + 'x.png' : ('https://via.placeholder.com/' + (slice.meta.frame.size.width * scaleSize) + 'x' + (slice.meta.frame.size.height * scaleSize))) : null;
		const panelSliceImage = (slice) ? slice.filename + '@3x.png' : null;

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


		const draggablePosition = (heroWrapper.current && artboard) ? {
			x : Math.floor((heroWrapper.current.clientWidth - (scale * artboard.meta.frame.size.width)) * 0.5),
			y : Math.floor((heroWrapper.current.clientHeight - (scale * artboard.meta.frame.size.height)) * 0.5)
		} : {
			x : 0,
			y : 0
		};

		const draggableBounds = (artboard && heroWrapper.current) ? {
			left   : (artboard.meta.frame.size.width * scale) * -0.5,
			top    : (artboard.meta.frame.size.height * scale) * -0.5,
			right  : heroWrapper.current.clientWidth - ((artboard.meta.frame.size.width * scale) * 0.5),
			bottom : heroWrapper.current.clientHeight - ((artboard.meta.frame.size.height * scale) * 0.5)
		} : {
			left   : 0,
			top    : 0,
			right  : 0,
			bottom : 0
		};

		const heroImageStyle = {
			width              : (artboard) ? (scale * artboard.meta.frame.size.width) + 'px' : '0',
			height             : (artboard) ? (scale * artboard.meta.frame.size.height) + 'px' : '0',
			backgroundImage    : (artboard) ? 'url("' + artboard.filename + '")' : 'none',
			backgroundSize     : 'cover',
			backgroundRepeat   : 'no-repeat',
			backgroundPosition : 'center'
		};

		const canvasClass = 'inspector-page-hero-canvas-wrapper' + ((this.state.canvasVisible) ? '' : ' is-hidden');

		const backgroundSlices = (artboard) ? artboard.slices.map((slice, i) => {
			return ((slice.type === 'background') ?
				<SliceItem
					key={i}
					title={slice.title}
					type={slice.type}
					visible={visibleTypes[slice.type]}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={scale}
					onRollOver={()=> this.handleSliceRollOver(i, slice)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={() => this.handleSliceClick(i, slice)} />
			: null);
		}) : [];

		const hotspotSlices = (artboard) ? artboard.slices.map((slice, i) => {
			return ((slice.type === 'hotspot') ?
				<SliceItem
					key={i}
					title={slice.title}
					type={slice.type}
					visible={visibleTypes[slice.type]}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={scale}
					onRollOver={()=> this.handleSliceRollOver(i, slice)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={() => this.handleSliceClick(i, slice)} />
			: null);
		}) : [];

		const textfieldSlices = (artboard) ? artboard.slices.map((slice, i) => {
			return ((slice.type === 'textfield') ?
				<SliceItem
					key={i}
					title={slice.title}
					type={slice.type}
					visible={visibleTypes[slice.type]}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={scale}
					onRollOver={()=> this.handleSliceRollOver(i, slice)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={() => this.handleSliceClick(i, slice)} />
			: null);
		}) : [];

		const sliceSlices = (artboard) ? artboard.slices.map((slice, i) => {
			return ((slice.type === 'slice') ?
				<SliceItem
					key={i}
					title={slice.title}
					type={slice.type}
					visible={visibleTypes[slice.type]}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={scale}
					onRollOver={()=> this.handleSliceRollOver(i, slice)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={() => this.handleSliceClick(i, slice)} />
			: null);
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


		console.log('InspectorPage.render()', scale, draggableBounds);

		return (<div style={{paddingBottom:'30px'}}>
			<div className="page-wrapper inspector-page-wrapper">
				<div className="inspector-page-content">
					{/*<div className="inspector-page-title">{(artboard) ? artboard.title : 'Loading…'}</div>*/}
					<div className="inspector-page-hero-wrapper" ref={heroWrapper}>
						{(artboard) && (<Draggable
							defaultPosition={draggablePosition}
							bounds={draggableBounds}
							onStart={this.handleDrag}
							onDrag={this.handleDrag}
							onStop={this.handleDrag}><div className="inspector-page-drag-wrapper" ref={dragWrapper}>
								<div style={heroImageStyle} ref={heroImage} />
								<div className="inspector-page-hero-slices-wrapper" style={slicesStyle}>
									<div className="inspector-page-background-wrapper">{backgroundSlices}</div>
									<div className="inspector-page-hotspot-wrapper">{hotspotSlices}</div>
									<div className="inspector-page-textfield-wrapper">{textfieldSlices}</div>
									<div className="inspector-page-slice-wrapper">{sliceSlices}</div>
								</div>
							</div>
						</Draggable>)}
						<div className={canvasClass} onMouseDown={()=> this.handleMouseDown()} onMouseUp={()=> this.handleMouseUp()}>
							<canvas width={(heroWrapper.current) ? heroWrapper.current.clientWidth : 0} height="600" ref={canvas}>Your browser does not support the HTML5 canvas tag.</canvas>
						</div>
						<div className="inspector-page-zoom-wrapper">
							<button className={'inspector-page-float-button' + ((scale >= 3) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(1)} style={{marginRight:'20px'}}><img className="inspector-page-float-button-image" src={(scale < 3) ? '/images/zoom-in.svg' : '/images/zoom-in_disabled.svg'} alt="+" /></button>
							<button className={'inspector-page-float-button' + ((scale <= 1) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(-1)} style={{marginRight:'20px'}}><img className="inspector-page-float-button-image" src={(scale > 1) ? '/images/zoom-out.svg' : '/images/zoom-out_disabled.svg'} alt="-" /></button>
							<button className="inspector-page-float-button" onClick={()=> this.handleZoom(0)}><img className="inspector-page-float-button-image" src="/images/layer-off_selected.svg" alt="0" /></button>
						</div>
						<div className="inspector-page-toggle-wrapper">
							<SliceToggle type="hotspot" selected={visibleTypes.hotspot} onClick={()=> this.handleSliceToggle('hotspot')} /><br />
							<SliceToggle type="slice" selected={visibleTypes.slice} onClick={()=> this.handleSliceToggle('slice')} /><br />
							<SliceToggle type="textfield" selected={visibleTypes.textfield} onClick={()=> this.handleSliceToggle('textfield')} /><br />
							<SliceToggle type="background" selected={visibleTypes.background} onClick={()=> this.handleSliceToggle('background')} /><br />
							<SliceToggle type="" selected={(visibleTypes.all)} onClick={()=> this.handleSliceToggle('all')} />
						</div>
					</div>
					<div>
						<button className="inspector-page-download-button" onClick={()=> this.handleDownload()}>Download</button>
						{/*<button className="inspector-page-add-button" onClick={()=> this.handleDownload()}>Add to My Projects</button>*/}
					</div>
					<form onSubmit={this.submitComment}>
						<textarea className="inspector-page-comment-txt" autocomplete="off" type="text" name="comment" placeholder="Enter Comment" value={this.state.comment} onChange={(event)=> this.handleCommentChange(event)} />
						<button type="submit" className={commentButtonClass} onClick={(event)=> this.submitComment(event)}>Comment</button>
					</form>

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
								<img className={panelImageClass} src={panelSliceImage} alt={(slice.title + ' @3x')} />
							)}
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
							{/*<Row><Column flexGrow={1}>System</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard && artboard.system) ? artboard.system.title : ''}</Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Author</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val"><a href={'mailto:' + ((artboard && artboard.system) ? artboard.system.author : '#')} style={{textDecoration:'none'}}>{(artboard && artboard.system) ? artboard.system.author : ''}</a></Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Page</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(page) ? page.title : ''}</Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Artboard</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard) ? artboard.title : ''}</Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Name</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.title : ''} {(slice) ? '(' + slice.type.replace(/(\b\w)/gi, function(m) {return (m.toUpperCase());}) + ')' : ''}</Column></Row>*/}
							<Row><Column flexGrow={1}>Name:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.title : ''}</Column></Row>
							{/*<Row><Column flexGrow={1}>Type</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.type.replace(/(\b\w)/gi, function(m) {return (m.toUpperCase());}) : ''}</Column></Row>*/}
							{/*<Row><Column flexGrow={1}>Date:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? (new Intl.DateTimeFormat('en-US', tsOptions).format(Date.parse(slice.added))) : ''}</Column></Row>*/}
							<Row>
								<Column flexGrow={1} flexBasis={1}>Export Size:</Column>
								<Row flexGrow={1} flexBasis={1} className="inspector-page-panel-info-val">
									<div style={{width:'50%'}}>W: {(slice) ? slice.meta.frame.size.width : 0}px</div>
									<div style={{width:'50%', textAlign:'right'}}>H: {(slice) ? slice.meta.frame.size.height : 0}px</div>
								</Row>
							</Row>
							<Row>
								<Column flexGrow={1} flexBasis={1}>Position:</Column>
								<Row flexGrow={1} flexBasis={1} className="inspector-page-panel-info-val">
									<div style={{width:'50%'}}>X: {(slice) ? slice.meta.frame.origin.x : 0}px</div>
									<div style={{width:'50%', textAlign:'right'}}>Y: {(slice) ? slice.meta.frame.origin.y : 0}px</div>
								</Row>
							</Row>
							{/*<Row><Column flexGrow={1}>Scale</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(scaleSize + 'x')}</Column></Row>*/}
							<Row><Column flexGrow={1}>Rotation</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.meta.rotation : 0}&deg;</Column></Row>
							<Row><Column flexGrow={1}>Opacity</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? (slice.meta.opacity * 100) : 100}%</Column></Row>
							<Row><Column flexGrow={1}>Fill:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.meta.fillColor.toUpperCase() : ''}</Column></Row>
							<Row><Column flexGrow={1}>Border:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{''}</Column></Row>
							{(slice && slice.type === 'textfield') && (<div>
								{/*<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.family) ? slice.meta.font.family : ''}</Column></Row>*/}
								<Row><Column flexGrow={1}>Font:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">San Francisco Text</Column></Row>
								<Row><Column flexGrow={1}>Font size:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.size + 'px')}</Column></Row>
								<Row><Column flexGrow={1}>Font color:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.color) ? slice.meta.font.color.toUpperCase() : ''}</Column></Row>
								<Row><Column flexGrow={1}>Text Alignment:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.lineHeight) ? (slice.meta.font.lineHeight + 'px') : ''}</Column></Row>
								<Row><Column flexGrow={1}>Font Line Height:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.lineHeight) ? (slice.meta.font.lineHeight + 'px') : ''}</Column></Row>
								<Row><Column flexGrow={1}>Font Letter Spacing:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice.meta.font.kerning) ? (slice.meta.font.kerning.toFixed(2) + 'px') : ''}</Column></Row>
								<Row><Column flexGrow={1}>Horizontal Alignment:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{'Left'}</Column></Row>
								<Row><Column flexGrow={1}>Vertical Alignment:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{'Top'}</Column></Row>
							</div>)}
							{(styles) && (<div>
								<Row><Column flexGrow={1}>Stroke:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.stroke) ? (styles.stroke.position.toLowerCase().replace(/(\b\w)/gi, function(m) { return m.toUpperCase(); }) + ' S: ' + styles.stroke.thickness + ' ' + styles.stroke.color) : ''}</Column></Row>
								<Row><Column flexGrow={1}>Shadow:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.shadow) ? ('X: ' + styles.shadow.offset.x + ' Y: ' + styles.shadow.offset.y + ' B: ' + styles.shadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>
								<Row><Column flexGrow={1}>Inner Shadow:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.innerShadow) ? ('X: ' + styles.innerShadow.offset.x + ' Y: ' + styles.innerShadow.offset.y + ' B: ' + styles.innerShadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>
								<Row><Column flexGrow={1}>Blur:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.innerShadow) ? ('X: ' + styles.innerShadow.offset.x + ' Y: ' + styles.innerShadow.offset.y + ' B: ' + styles.innerShadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>
							</div>)}
							{(slice && slice.meta.padding) && (<Row>
								<Column flexGrow={1} flexBasis={1}>Padding:</Column>
								<Row flexGrow={1} flexBasis={1} className="inspector-page-panel-info-val">
									<div style={{width:'50%'}}>{(slice) ? slice.meta.padding.top : 0}px</div>
									<div style={{width:'50%'}}>{(slice) ? slice.meta.padding.left : 0}px</div>
									<div style={{width:'50%', textAlign:'right'}}>{(slice) ? slice.meta.padding.bottom : 0}px</div>
									<div style={{width:'50%', textAlign:'right'}}>{(slice) ? slice.meta.padding.right : 0}px</div>
								</Row>
							</Row>)}
							<Row><Column flexGrow={1}>Inner Padding:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{''}</Column></Row>
							<Row><Column flexGrow={1}>Blend:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? slice.meta.blendMode.toLowerCase().replace(/(\b\w)/gi, function(m) { return m.toUpperCase(); }) : ''}</Column></Row>
							<Row><Column flexGrow={1}>Date:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(slice) ? (new Intl.DateTimeFormat('en-US', tsOptions).format(Date.parse(slice.added))) : ''}</Column></Row>
							<Row><Column flexGrow={1}>Author:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(page) ? page.author : ''}</Column></Row>
						</div>
					</div>
				</div>
				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
			<BottomNav onPage={(url)=> this.props.onPage(url)} onLogout={()=> this.props.onLogout()} />
		</div>);
	}
}

export default InspectorPage;
