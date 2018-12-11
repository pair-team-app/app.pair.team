
import React, { Component } from 'react';
import './InspectorPage.css';
import 'react-tabs/style/react-tabs.css';
import '../elements/react-tabs.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import cookie from 'react-cookies';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Column, Row } from 'simple-flexbox';

// import Dropdown from '../elements/Dropdown';
import SliceItem from '../iterables/SliceItem';
import SliceToggle from '../elements/SliceToggle';
import Popup from '../elements/Popup';

import { randomElement } from '../../utils/lang.js';

const heroWrapper = React.createRef();
const heroImage = React.createRef();
const canvas = React.createRef();

class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			x: 0.5,
			y: 0.5,
			scale: 0.5,
			pageID        : this.props.match.params.pageID,
			artboardID    : this.props.match.params.artboardID,
			sliceID       : this.props.match.params.sliceID,
			slice         : null,
			hoverSlice    : null,
			page          : null,
			artboards     : [],
			hoverOffset   : null,
			offset        : null,
			artboard      : null,
			code          : {
				html   : '',
				syntax : ''
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
				title    : 'LESS',
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

	handlePanAndZoom = (x, y, scale) => {
		this.setState({ x, y, scale });
	};

	handlePanMove = (x, y) => {
		this.setState({ x, y });
	};

	transformPoint({ x, y }) {
		return {
			x: 0.5 + this.state.scale * (x - this.state.x),
			y: 0.5 + this.state.scale * (y - this.state.y)
		};
	}


	componentDidMount() {
		this.refreshData();
		this.antsInterval = setInterval(this.redrawAnts, 75);

		document.addEventListener('keydown', this.handleKeyDown.bind(this));
		document.addEventListener('wheel', this.handleWheel.bind(this));
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

				formData.append('action', 'ARTBOARDS');
				formData.append('upload_id', '');
				formData.append('page_id', '' + pageID);
				formData.append('slices', '1');
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('ARTBOARDS', response.data);

						const artboards = response.data.artboards.map((artboard)=> ({
							id        : artboard.id,
							pageID    : artboard.page_id,
							title     : artboard.title,
							filename  : artboard.filename,
							meta      : JSON.parse(artboard.meta),
							views     : artboard.views,
							downloads : artboard.downloads,
							added     : artboard.added,
							system    : artboard.system,
							slices    : artboard.slices.map((item)=> ({
								id       : item.id,
								title    : item.title,
								type     : item.type,
								filename : item.filename,
								meta     : JSON.parse(item.meta),
								added    : item.added
							})),
							comments  : artboard.comments
						}));

						this.setState({ artboard : randomElement(artboards) });
						this.setState({ artboards : artboards });
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

	handleWheel = (event)=> {
		//console.log(event.type, event.deltaX, event.deltaY, event.target);

		if (event.ctrlKey) {
			event.preventDefault();
			this.setState({ scale : Math.min(Math.max(this.state.scale - (event.deltaY * 0.005), 0.5), 2)});
		}
	};

	handleDrag = (event)=> {
		//console.log(event.type, event.target);
		if (event.type === 'mousedown') {


		} else if (event.type === 'mousemove') {
// 			this.forceUpdate();

		} else if (event.type === 'mouseup') {
// 			this.setState({ canvasVisible : true });
		}
	};

	handleMouseDown = ()=> {
// 		this.setState({ canvasVisible : false });
	};

	handleMouseUp = ()=> {
// 		this.setState({ canvasVisible : true });
	};

	handleZoom = (direction)=> {
		const { scale } = this.state;
		this.setState({ scale : (direction === 0) ? 0.5 : Math.min(Math.max(scale + (direction * 0.02), 0.5), 2) });
		this.updateCanvas();
	};

	handleSliceRollOver = (ind, slice, offset)=> {
		this.setState({
			hoverSlice  : slice,
			hoverOffset : offset
		});
	};

	handleSliceRollOut = (ind, slice)=> {
		this.setState({
			hoverSlice : null
		});
	};

	handleSliceClick = (ind, slice, offset)=> {
		this.setState({
			slice  : slice,
			offset : offset
		});
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

		const { slice } = this.state;
		let html = '';
		let syntax = '';

		if (slice) {
			if (ind === 1 || ind === 2) {
				html += (ind === 2) ? '{' : '.' + slice.title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase() + ' {<br />';
				html += '&nbsp;&nbsp;position: absolute;<br />';
				html += '&nbsp;&nbsp;top: ' + slice.meta.frame.origin.y + 'px;<br />';
				html += '&nbsp;&nbsp;left: ' + slice.meta.frame.origin.x + 'px;<br />';
				html += '&nbsp;&nbsp;width: ' + slice.meta.frame.size.width + 'px;<br />';
				html += '&nbsp;&nbsp;height: ' + slice.meta.frame.size.height + 'px;<br />';
				if (slice.type === 'textfield') {
					html += '&nbsp;&nbsp;font-family: "' + 'San Francisco Text' + '", sans-serif;<br />';
					html += '&nbsp;&nbsp;font-size: ' + slice.meta.font.size + 'px;<br />';
					html += '&nbsp;&nbsp;color: ' + slice.meta.font.color.toUpperCase() + ';<br />';
					html += '&nbsp;&nbsp;letter-spacing: ' + slice.meta.font.kerning + 'px;<br />';
					html += '&nbsp;&nbsp;line-height: ' + slice.meta.font.lineHeight + 'px;<br />';
					html += '&nbsp;&nbsp;text-align: ' + 'left' + ';<br />';

				} else if (slice.type === 'slice') {
					html += '&nbsp;&nbsp;background: url("' + slice.filename.split('/').pop() + '@3x.png");<br />';
				}
				html += '}';

				syntax = html.replace(/&nbsp;/g, '').replace(/<br \/>/g, '\n');

				if (ind === 2) {
					syntax = syntax.replace(/: (.+?);/g, ':\'$1\',').replace(/(-.)/g, function(v){ return (v[1].toUpperCase()); });
					html = syntax;

				}

			}
		}

		this.setState({
			[key] : tmp,
			code  : {
				html   : html,
				syntax : syntax
			}
		});
	};

	updateCanvas = ()=> {
		const { scale, offset } = this.state;
		const slice = this.state.slice;
		const context = canvas.current.getContext('2d');
		context.clearRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

// 		context.fillStyle = 'rgba(0, 0, 0, 0.25)';
// 		context.fillRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		if (slice) {
			const selectedSrcFrame = slice.meta.frame;
			const selectedOffset = {
				x : 100 + offset.x,
				y : 50 + offset.y
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

			//console.log('updateCanvas()', selectedOffset, selectedFrame);

			context.fillStyle = (slice.type === 'slice') ? 'rgba(255, 181, 18, 0.5)' : (slice.type === 'hotspot') ? 'rgba(62, 84, 255, 0.5)' : (slice.type === 'textfield') ? 'rgba(255, 88, 62, 0.5)' : 'rgba(62, 255, 109, 0.5)';
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
				if (self.state.visibleTypes[key] && self.state.hoverSlice.type === key) {
					visible = true;
				}
			});

			if (this.state.visibleTypes.all) {
				visible = true;
			}

			if (visible) {
				const srcFrame = this.state.hoverSlice.meta.frame;

				const frame = {
					origin : {
						x : 100 + this.state.hoverOffset.x + Math.round(srcFrame.origin.x * scale),
						y : 50 + this.state.hoverOffset.y + Math.round(srcFrame.origin.y * scale)
					},
					size   : {
						width  : Math.round(srcFrame.size.width * scale),
						height : Math.round(srcFrame.size.height * scale)
					}
				};

				//console.log('updateCanvas()', srcFrame, offset, frame);

				context.fillStyle = 'rgba(0, 0, 0, 0.5)';
				context.fillStyle = (this.state.hoverSlice.type === 'slice') ? 'rgba(255, 127, 0, 0.25)' : (this.state.hoverSlice.type === 'hotspot') ? 'rgba(0, 255, 0, 0.25)' : (this.state.hoverSlice.type === 'textfield') ? 'rgba(0, 0, 255, 0.25)' : 'rgba(62, 255, 109, 0.25)';
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

		const { page, artboards, artboard, slice } = this.state;
		const { visibleTypes } = this.state;
		const { scale } = this.state;

		let self = this;
		if (this.rerender === 0) {
			this.rerender = 1;
			setTimeout(function() {
				self.forceUpdate();
			}, 1000);
		}

		const wrapperStyle = {
			position        : 'absolute',
			width           : (artboards.length > 0) ? artboards.length * (100 + (artboard.meta.frame.size.width * this.state.scale)) : 0,
			height          : (artboards.length > 0) ? (artboard.meta.frame.size.height * this.state.scale) : 0,
// 			transform       : (artboards.length > 0) ? 'translate(' + ((3 * (50 + (artboard.meta.frame.size.width * this.state.scale))) * -0.5) + 'px, ' + ((artboard.meta.frame.size.height * this.state.scale) * 0.5) + 'px)' : 'translate(0px, 0px)'
			transform       : (artboards.length > 0) ? 'translate(100px, 50px)' : 'translate(0px, 0px)'
		};

		let maxH = 0;
		let offset = {
			x : -500,
			y : -300
		};

		let heroes = [];
		let slices = [];

		for (let i=0; i<artboards.length; i++) {
			const artboard = artboards[i];

			if (artboard.meta.frame.size.height > maxH) {
				maxH = artboard.meta.frame.size.height;
			}

			const heroStyle = {
				position       : 'absolute',
				top            : offset.y + 'px',
				left           : offset.x + 'px',
				width          : (scale * artboard.meta.frame.size.width) + 'px',
				height         : (scale * artboard.meta.frame.size.height) + 'px',
				background     : '#000000 url("' + artboard.filename + '") no-repeat center',
				backgroundSize : 'cover',
				border         : '1px solid #ffffff'
			};

			const sliceWrapperStyle = {
				position : 'absolute',
				top      : offset.y + 'px',
				left     : offset.x + 'px',
				width    : (scale * artboard.meta.frame.size.width) + 'px',
				height   : (scale * artboard.meta.frame.size.height) + 'px'
			};

			const backgroundSlices = artboard.slices.map((slice, i) => {
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
						offsetX={offset.x}
						offsetY={offset.y}
						onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
						onRollOut={()=> this.handleSliceRollOut(i, slice)}
						onClick={(offset) => this.handleSliceClick(i, slice, offset)} />
					: null);
			});

			const hotspotSlices = artboard.slices.map((slice, i) => {
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
						offsetX={offset.x}
						offsetY={offset.y}
						onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
						onRollOut={()=> this.handleSliceRollOut(i, slice)}
						onClick={(offset) => this.handleSliceClick(i, slice, offset)} />
					: null);
			});

			const textfieldSlices = artboard.slices.map((slice, i) => {
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
						offsetX={offset.x}
						offsetY={offset.y}
						onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
						onRollOut={()=> this.handleSliceRollOut(i, slice)}
						onClick={(offset) => this.handleSliceClick(i, slice, offset)} />
					: null);
			});

			const sliceSlices = artboard.slices.map((slice, i) => {
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
						offsetX={offset.x}
						offsetY={offset.y}
						onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
						onRollOut={()=> this.handleSliceRollOut(i, slice)}
						onClick={(offset) => this.handleSliceClick(i, slice, offset)} />
					: null);
			});

			heroes.push(
				<div>
					<div style={heroStyle}>
						<div className="inspector-page-caption">{artboard.title}</div>
					</div>
				</div>
			);

			slices.push(
				<div className="inspector-page-hero-slices-wrapper" style={sliceWrapperStyle}>
					<div className="inspector-page-background-wrapper">{backgroundSlices}</div>
					<div className="inspector-page-hotspot-wrapper">{hotspotSlices}</div>
					<div className="inspector-page-textfield-wrapper">{textfieldSlices}</div>
					<div className="inspector-page-slice-wrapper">{sliceSlices}</div>
				</div>
			);

			offset = {
				x : Math.round((i % 5) * (100 + (artboard.meta.frame.size.width * scale))),
				y : Math.round(Math.floor(i / 5) * (50 + (maxH * scale)))
			};
		}


		const styles = (slice && slice.meta.styles && slice.meta.styles.length > 0) ? {
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

// 		console.log('InspectorPage.render()', scale);

		return (<div style={{paddingBottom:'30px'}}>
			<div className="page-wrapper inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-hero-wrapper" ref={heroWrapper}>
						{(artboards.length > 0) && (
							<div style={wrapperStyle} ref={heroImage}>
								{heroes}
								<div className="inspector-page-hero-canvas-wrapper">
									<canvas width={(heroImage.current) ? heroImage.current.clientWidth : 0} height={(heroWrapper.current) ? heroWrapper.current.clientHeight : 0} ref={canvas}>Your browser does not support the HTML5 canvas tag.</canvas>
								</div>
								{slices}
							</div>
						)}
					</div>
					<div className="inspector-page-zoom-wrapper">
						<button className={'inspector-page-float-button' + ((scale >= 2) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(1)}><img className="inspector-page-float-button-image" src={(scale < 2) ? '/images/zoom-in.svg' : '/images/zoom-in_disabled.svg'} alt="+" /></button><br />
						<button className={'inspector-page-float-button' + ((scale <= 0.5) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(-1)}><img className="inspector-page-float-button-image" src={(scale > 0.5) ? '/images/zoom-out.svg' : '/images/zoom-out_disabled.svg'} alt="-" /></button><br />
						<button className="inspector-page-float-button" onClick={()=> this.handleZoom(0)}><img className="inspector-page-float-button-image" src="/images/layer-off_selected.svg" alt="0" /></button>
					</div>
					<div className="inspector-page-toggle-wrapper">
						<SliceToggle type="hotspot" selected={visibleTypes.hotspot} onClick={()=> this.handleSliceToggle('hotspot')} />
						<SliceToggle type="slice" selected={visibleTypes.slice} onClick={()=> this.handleSliceToggle('slice')} />
						<SliceToggle type="textfield" selected={visibleTypes.textfield} onClick={()=> this.handleSliceToggle('textfield')} />
						<SliceToggle type="background" selected={visibleTypes.background} onClick={()=> this.handleSliceToggle('background')} />
						<SliceToggle type="" selected={(visibleTypes.all)} onClick={()=> this.handleSliceToggle('all')} />
					</div>
					<div className="inspector-page-button-wrapper"><Row>
						<Column flex={1}><button className="inspector-page-button adjacent-button" onClick={()=> this.handleDownload()}>Download Parts</button></Column>
						<Column flex={1}><button className="inspector-page-button adjacent-button" onClick={()=> this.handleDownload()}>Clone Project</button></Column>
						<Column flex={1}><button className="inspector-page-button adjacent-button" onClick={()=> this.handleDownload()}>Invite Team</button></Column>
						<Column flex={1}><button className="inspector-page-button" onClick={()=> this.handleDownload()}>Comment</button></Column>
					</Row></div>
				</div>
				<div className="inspector-page-panel">
					<div className="inspector-page-panel-content-wrapper">
						<Tabs>
							<TabList>
								<Tab>Title 1</Tab>
								<Tab>Title 2</Tab>
								<Tab>Title 3</Tab>
								<Tab>Title 4</Tab>
								<Tab>Title 5</Tab>
								<Tab>Title 6</Tab>
							</TabList>

							<TabPanel>Any content 1</TabPanel>
							<TabPanel>Any content 2</TabPanel>
							<TabPanel>Any content 3</TabPanel>
							<TabPanel>Any content 4</TabPanel>
							<TabPanel>Any content 5</TabPanel>
							<TabPanel>Any content 6</TabPanel>
						</Tabs>
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
		</div>);
	}
}

export default InspectorPage;
