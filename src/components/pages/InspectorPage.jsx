
import React, { Component } from 'react';
import './InspectorPage.css';
import 'react-tabs/style/react-tabs.css';
import '../elements/react-tabs.css';

import axios from 'axios';
// import CopyToClipboard from 'react-copy-to-clipboard';
import cookie from 'react-cookies';
import Dropzone from 'react-dropzone';
import { Column, Row } from 'simple-flexbox';

import Popup from '../elements/Popup';

import { capitalizeText } from '../../utils/funcs.js';
import { toCSS, toReactCSS } from '../../utils/langs.js';
import FontAwesome from "react-fontawesome";

// import { ArtboardVO } from '../../model/vo.js';

const artboardsWrapper = React.createRef();
const canvasWrapper = React.createRef();
const canvas = React.createRef();


function CommentItem(props) {
	const options = {
		year   : 'numeric',
		month  : 'numeric',
		day    : 'numeric',
		hour   : 'numeric',
		minute : 'numeric'
	};

	const userID = cookie.load('user_id');
	let isUpVoted = false;
	let isDnVoted = false;
	let score = 1;
	props.votes.forEach(function(item, i) {
		if (item.user_id === userID) {
			isUpVoted = (parseInt(item.value, 10) === 1);
			isDnVoted = (parseInt(item.value, 10) === -1);
		}

		score += parseInt(item.value, 10);
	});

	const arrowUpClass = (isUpVoted) ? 'comment-item-arrow comment-item-arrow-voted' : 'comment-item-arrow';
	const arrowDnClass = (isDnVoted) ? 'comment-item-arrow comment-item-arrow-voted' : 'comment-item-arrow';

	return (
		<div className="comment-item">
			<img className="comment-item-avatar" src="/images/default-avatar.png" alt={props.author} />
			<div className="comment-item-vote-wrapper">
				<FontAwesome name="arrow-up" className={arrowUpClass} onClick={()=> props.onVote(1)} /><br />
				<div className="comment-item-score">{score}</div>
				<FontAwesome name="arrow-down" className={arrowDnClass} onClick={()=> props.onVote(-1)} /><br />
			</div>
			<div className="comment-item-content-wrapper">
				<div className="comment-item-date">{(new Intl.DateTimeFormat('en-US', options).format(Date.parse(props.added))).replace(',', '').replace(/ (.{2})$/g, '$1').toLowerCase()}</div>
				<div className="comment-item-text">{props.content}</div>
			</div>
		</div>
	);
}

function SliceItem(props) {
	const className = (props.type === 'slice') ? 'slice-item slice-item-slice' : (props.type === 'hotspot') ? 'slice-item slice-item-hotspot' : (props.type === 'textfield') ? 'slice-item slice-item-textfield' : 'slice-item slice-item-background';
	const style = {
		top     : props.top + 'px',
		left    : props.left + 'px',
		width   : props.width + 'px',
		height  : props.height + 'px',
		zoom    : props.scale,
// 			transform : 'scale(' + props.scale + ')'
		display : (props.visible) ? 'block' : 'none'
	};

	return (
		<div data-id={props.id} className={className + ((props.filled) ? '-filled' : '')} style={style} onMouseEnter={()=> props.onRollOver({ x : props.offsetX, y : props.offsetY })} onMouseLeave={()=> props.onRollOut()} onClick={()=> props.onClick({ x : props.offsetX, y : props.offsetY })}>
		</div>
	);
}

function SliceToggle(props) {
	const icon = (props.type === 'slice') ? '/images/layer-slice' : (props.type === 'hotspot') ? '/images/layer-hotspot' : (props.type === 'textfield') ? '/images/layer-textfield' : (props.type === 'group') ? '/images/layer-background' : '/images/layer-off';

	return (
		<div className="slice-toggle" onClick={()=> props.onClick()}>
			<button className="inspector-page-float-button"><img className="inspector-page-float-button-image" src={(props.selected) ? icon + '_selected.svg' : icon + '.svg'} alt="Toggle" /></button>
		</div>
	);
}


class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			x: 0.5,
			y: 0.5,
			scale: 1.0,
			uploadID      : this.props.match.params.uploadID,
			pageID        : this.props.match.params.pageID,
			artboardID    : this.props.match.params.artboardID,
			sliceID       : this.props.match.params.sliceID,
			slice         : null,
			hoverSlice    : null,
			page          : null,
			artboards     : [],
			files         : [],
			uploading     : false,
			percent       : 0,
			selectedTab   : 0,
			tooltip       : 'Loading…',
			hoverOffset   : null,
			scrollOffset  : {
				x : 0,
				y : 0
			},
			offset        : null,
			scrolling     : false,
			code          : {
				html   : '',
				syntax : ''
			},
			comment       : '',
			visibleTypes  : {
				slice      : false,
				hotspot    : false,
				textfield  : false,
				group      : false,
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

		this.jumpedOffset = false;
		this.offsets = [];
		this.lastScroll = 0;
		this.scrollInterval = null;
		this.rerender = 0;
		this.antsOffset = 0;
		this.antsInterval = null;
		this.size = {
			x : 0,
			y : 0
		};

		this.zoomNotches = [
			0.03,
			0.06,
			0.13,
			0.25,
			0.50,
			1.00,
			1.75,
			3.00
		];

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
// 		console.log('componentDidMount()');

		this.refreshData();
		this.antsInterval = setInterval(this.redrawAnts, 100);

		document.addEventListener('keydown', this.handleKeyDown.bind(this));
		document.addEventListener('wheel', this.handleWheelStart.bind(this));
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

// 		if (artboardsWrapper.current && !this.jumpedOffset) {
// 			this.state.artboards.forEach((artboard, i)=> {
// 				if (artboard.id === this.props.match.params.artboardID && artboardsWrapper.current.scrollTop !== artboard.offset.y && artboardsWrapper.current.scrollLeft !== artboard.offset.x) {
// 					this.jumpedOffset = true;
// 					artboardsWrapper.current.scrollTop = artboard.offset.y;
// 					artboardsWrapper.current.scrollLeft = artboard.offset.x;
// 				}
// 			});
// 		}

		if (canvasWrapper.current) {
			const scale = canvasWrapper.current.clientWidth / (canvasWrapper.current.clientWidth + (this.size.x + 700));// Math.min(canvasWrapper.current.clientWidth / (canvasWrapper.current.clientWidth + this.size.x), canvasWrapper.current.clientHeight / (canvasWrapper.current.clientHeight + this.size.y));
			if (this.state.scale !== scale && !this.jumpedOffset) {
				this.jumpedOffset = true;
				this.setState({ scale : scale });
			}
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
			slice      : sliceID,
			tooltip    : 'Loading…'
		});

		let formData = new FormData();
		formData.append('action', 'PAGE');
		formData.append('page_id', '' + pageID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
// 				console.log('PAGE', response.data);
				const page = response.data.page;

				formData.append('action', 'ARTBOARDS');
				formData.append('upload_id', '');
				formData.append('page_id', '' + pageID);
				formData.append('slices', '0');
				formData.append('offset', '0');
				formData.append('length', '-1');
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('ARTBOARDS', response.data);

						let maxH = 0;
						let offset = {
							x : 0,
							y : 0
						};
						const { scale } = this.state;

						let artboards = [];
						response.data.artboards.forEach((artboard, i)=> {
							if (Math.floor(i % 5) === 0 && i !== 0) {
								this.size.x = 0;
								this.size.y += maxH + 50;
								offset.x = 0;
								offset.y += maxH + 50;
								maxH = 0;
							}

							if (JSON.parse(artboard.meta).frame.size.height * scale > maxH) {
								maxH = JSON.parse(artboard.meta).frame.size.height * scale;
							}

							this.offsets.push(offset);
							console.log('artboard', artboard, i, offset, this.offsets[i]);

// 							const vo = new ArtboardVO(artboard);
// 							console.log('vo', vo);

							artboards.push({
								id        : artboard.id,
								pageID    : artboard.page_id,
								title     : artboard.title,
								filename  : artboard.filename,
								meta      : JSON.parse(artboard.meta),
								views     : artboard.views,
								downloads : artboard.downloads,
								added     : artboard.added,
								system    : artboard.system,
								offset    : offset,
								slices    : artboard.slices.map((item) => ({
									id       : item.id,
									title    : item.title,
									type     : item.type,
									filename : item.filename,
									meta     : JSON.parse(item.meta),
									added    : item.added
								})),
								comments  : artboard.comments
							});

							this.size.x += Math.round(50 + (JSON.parse(artboard.meta).frame.size.width * scale)) - ((canvasWrapper.current) ? canvasWrapper.current.clientWidth : 0);
							if (i < response.data.artboards.length - 1) {
								offset.x += Math.round(50 + (JSON.parse(artboard.meta).frame.size.width * scale)) - ((canvasWrapper.current) ? canvasWrapper.current.clientWidth : 0);
							}
						});

						console.log('offsets', offset, this.offsets);

						formData.append('action', 'FILES');
						formData.append('upload_id', '' + this.state.uploadID);
						axios.post('https://api.designengine.ai/system.php', formData)
							.then((response)=> {
								console.log('FILES', response.data);

								const files = response.data.files.map((file) => ({
									id       : file.id,
									title    : file.title,
									filename : file.filename,
									contents : file.contents,
									added    : file.added
								})).concat([
									{
										id       : 0,
										title    : 'CSS',
										filename : 'CSS',
										contents : null,
										added    : null
									}, {
										id       : 0,
										title    : 'React CSS',
										filename : 'React CSS',
										contents : null,
										added    : null
									}
								]);

								this.setState({
									files     : files,
									page      : page,
									artboards : artboards,
									tooltip   : ''
								});
							}).catch((error) => {
						});
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	onDrop(files) {
		console.log('onDrop()', files);
		if (files.length > 0 && files[0].name.split('.').pop() === 'zip') {

			let self = this;
			const config = {
				headers : {
					'content-type' : 'multipart/form-data'
				}, onUploadProgress : function (progressEvent) {
					const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					self.setState({
						percent : percent,
						tooltip : percent + '%'
					});
				}
			};

			this.setState({ uploading : true });

			files.forEach(file => {
				let formData = new FormData();
				formData.append('file', file);

				axios.post('http://cdn.designengine.ai/files/upload.php?user_id=' + cookie.load('user_id') + '&upload_id=' + this.state.uploadID, formData, config)
					.then((response) => {
						console.log("UPLOAD", response.data);

						let formData = new FormData();
						formData.append('action', 'FILES');
						formData.append('upload_id', '' + this.state.uploadID);
						axios.post('https://api.designengine.ai/system.php', formData)
							.then((response)=> {
								console.log('FILES', response.data);

								const files = response.data.files.map((file) => ({
									id       : file.id,
									title    : file.title,
									filename : file.filename,
									contents : file.contents,
									added    : file.added
								}));

								this.setState({
									files     : files,
									uploading : false,
									tooltip   : ''
								});
							}).catch((error) => {
						});

					}).catch((error) => {
				});
			});

		} else {
			const popup = {
				visible : true,
				content : 'error::Only zip archives are support at this time.'
			};
			this.setState({ popup : popup });
		}
	}

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

	handleTab = (ind)=> {
		console.log('handleTab');
		this.setState({ selectedTab : ind });
	};

	handleCodeCopy = ()=> {
		const popup = {
			visible : true,
			content : 'Copied to Clipboard!'
		};
		this.setState({ popup : popup });
	};

	handleContribute = ()=> {

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

	handleWheelStart = (event)=> {
// 		console.log(event.type, event.deltaX, event.deltaY, event.target);
		//console.log('wheel', artboardsWrapper.current.clientWidth, artboardsWrapper.current.clientHeight, artboardsWrapper.current.scrollTop, artboardsWrapper.current.scrollLeft);

// 		event.preventDefault();

		this.lastScroll = (new Date()).getUTCSeconds();
		clearTimeout(this.scrollInterval);
		this.scrollInterval = setTimeout(this.handleWheelStop, 50);


		if (!this.state.scrolling) {
			this.setState({ scrolling : true });
		}

		if (event.ctrlKey) {
			event.preventDefault();
			this.setState({ scale : Math.min(Math.max(this.state.scale - (event.deltaY * 0.0025), 0.03), 3).toFixed(2) });

		} else {
			if (artboardsWrapper.current) {
// 				artboardsWrapper.current.scrollTop += event.deltaY;
// 				artboardsWrapper.current.scrollLeft += event.deltaX;

				this.setState({
					scrollOffset : {
						x : artboardsWrapper.current.scrollLeft,
						y : artboardsWrapper.current.scrollTop
					}
				});
			}
		}
	};

	handleWheelStop = ()=> {
		clearTimeout(this.scrollInterval);
		this.setState({ scrolling : false });
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

	handleArtboardOver = (event)=> {
// 		console.log('handleArtboardOver()', event.target);
		const artboardID = event.target.getAttribute('data-id');

		let formData = new FormData();
		formData.append('action', 'SLICES');
		formData.append('artboard_id', event.target.getAttribute('data-id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
// 				console.log('SLICES', response.data);

				let artboards = this.state.artboards;
				artboards.forEach((artboard)=> {
					if (artboard.id === artboardID && artboard.slices.length === 0) {
						artboard.slices = response.data.slices.map((item) => ({
							id       : item.id,
							title    : item.title,
							type     : item.type,
							filename : item.filename,
							meta     : JSON.parse(item.meta),
							added    : item.added
						}));
					}
				});

				this.setState({ artboards : artboards });
			}).catch((error) => {
		});
	};

	handleArtboardOut = (event)=> {
// 		console.log('handleArtboardOut()', event.target);
// 		const artboardID = event.target.getAttribute('data-id');
//
// 		let artboards = this.state.artboards;
// 		artboards.forEach((artboard)=> {
// 			if (artboard.id === artboardID) {
// 				artboard.slices = [];
// 			}
// 		});
//
// 		this.setState({ artboards : artboards });
	};

	handleZoom = (direction)=> {
		const { scale } = this.state;

		if (direction === 0) {
			this.setState({ scale : this.zoomNotches[5] });

		} else {
			let ind = -1;
			this.zoomNotches.forEach((amt, i)=> {
				if (scale === amt) {
					ind = i;
				}
			});

			if (ind === -1) {
				let diff = 3;
				this.zoomNotches.forEach((amt, i)=> {
					if (Math.abs(amt - scale) < diff) {
						diff = Math.abs(amt - scale);
						ind = i;
					}
				});
			}

			if (this.state.slice) {
				let maxH = 0;
				let offset = {
					x : 0,
					y : 0
				};

				for (let i=0; i<this.state.artboards.length; i++) {
					const artboard = this.state.artboards[i];

					if (Math.floor(i % 5) === 0) {
						offset.x = 0;
						offset.y += maxH + 50;
						maxH = 0;
					}

					if (artboard.meta.frame.size.height * scale > maxH) {
						maxH = artboard.meta.frame.size.height * scale;
					}

					artboard.slices.forEach((slice) => {
						if (slice.id === this.state.slice.id) {
							console.log('zoom', this.state.offset, offset);
							this.setState({ offset : offset });
						}
					});

					offset.x += Math.round(50 + (artboard.meta.frame.size.width * scale));
				}
			}

			this.setState({ scale : this.zoomNotches[Math.min(Math.max(0, ind + direction), this.zoomNotches.length - 1)] });
		}
	};

	handleSliceRollOver = (ind, slice, offset)=> {
		let files = this.state.files;

		const css = toCSS(slice);
		const reactCSS = toReactCSS(slice);

		files[files.length - 1].contents = reactCSS.html;
		files[files.length - 2].contents = css.html;

		this.setState({
			files       : files,
			hoverSlice  : slice,
			hoverOffset : offset
		});
	};

	handleSliceRollOut = (ind, slice)=> {
		let files = this.state.files;

		if (this.state.slice) {
			const css = toCSS(this.state.slice);
			const reactCSS = toReactCSS(this.state.slice);

			files[files.length - 1].contents = reactCSS.html;
			files[files.length - 2].contents = css.html;
		}

		this.setState({
			files      : files,
			hoverSlice : null
		});
	};

	handleSliceClick = (ind, slice, offset)=> {
		let files = this.state.files;

		const css = toCSS(slice);
		const reactCSS = toReactCSS(slice);

		files[files.length - 1].contents = reactCSS.html;
		files[files.length - 2].contents = css.html;

		this.setState({
			files      : files,
			hoverSlice : null,
			slice      : slice,
			offset     : offset
		});
	};

	handleDownload = ()=> {
		if (cookie.load('user_id') === '0') {
			cookie.save('msg', 'use this feature.', { path : '/' });
			this.props.onPage('login');

		} else {
			const filePath = 'http://cdn.designengine.ai/artboard.php?artboard_id=' + this.state.artboard.id;
			let link = document.createElement('a');
			link.href = filePath;
			link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
			link.click();
		}
	};


	updateCanvas = ()=> {
		const { scale, offset, scrollOffset } = this.state;
		const slice = this.state.slice;
		const context = canvas.current.getContext('2d');
		context.clearRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);


// 		context.fillStyle = 'rgba(0, 0, 0, 0.25)';
// 		context.fillRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		if (slice) {
			const selectedSrcFrame = slice.meta.frame;
			const selectedOffset = {
				x : 100 + offset.x - scrollOffset.x,
				y : 0 + offset.y - scrollOffset.y
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

// 			console.log('SELECTED', scale, selectedOffset, selectedFrame.origin);

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

				const hoverOffset = {
					x : 100 + this.state.hoverOffset.x - scrollOffset.x,
					y : 0 + this.state.hoverOffset.y - scrollOffset.y
				};

				const frame = {
					origin : {
						x : hoverOffset.x + Math.round(srcFrame.origin.x * scale),
						y : hoverOffset.y + Math.round(srcFrame.origin.y * scale)
					},
					size   : {
						width  : Math.round(srcFrame.size.width * scale),
						height : Math.round(srcFrame.size.height * scale)
					}
				};

// 				console.log('HOVER:', hoverOffset, frame.origin);

				context.fillStyle = 'rgba(0, 0, 0, 0.5)';
				context.fillStyle = (this.state.hoverSlice.type === 'slice') ? 'rgba(255, 181, 18, 0.5)' : (this.state.hoverSlice.type === 'hotspot') ? 'rgba(62, 84, 255, 0.5)' : (this.state.hoverSlice.type === 'textfield') ? 'rgba(255, 88, 62, 0.5)' : 'rgba(62, 255, 109, 0.5)';
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

		const { page, artboards, slice, hoverSlice, files } = this.state;
		const { visibleTypes } = this.state;
		const { scale } = this.state;

		const activeSlice = (hoverSlice) ? hoverSlice : slice;

		let self = this;
		if (this.rerender === 0) {
			this.rerender = 1;
			setTimeout(function() {
				self.forceUpdate();
			}, 1000);
		}

		const progressStyle = { width : this.state.percent + '%' };

		const wrapperStyle = {
			position        : 'absolute',
			width           : (artboards.length > 0) ? Math.floor(artboards.length * (50 + (artboards[0].meta.frame.size.width * this.state.scale)) * 0.75) : 0,
			height          : (artboards.length > 0) ? Math.floor(artboards.length * (50 + (artboards[0].meta.frame.size.height * this.state.scale)) * 0.75) : 0,
// 			transform       : (artboards.length > 0) ? 'translate(' + ((3 * (50 + (artboard.meta.frame.size.width * this.state.scale))) * -0.5) + 'px, ' + ((artboard.meta.frame.size.height * this.state.scale) * 0.5) + 'px)' : 'translate(0px, 0px)'
			transform       : (artboards.length > 0) ? 'translate(100px, 20px)' : 'translate(0px, 0px)'
		};

		const canvasStyle = {
			top     : (this.state.scrollOffset.y) + 'px',
			left    : (-100 + this.state.scrollOffset.x) + 'px',
			display : (this.state.scrolling) ? 'none' : 'block'
		};

		let maxH = 0;
		let offset = {
			x : 0,
			y : 0
		};

		let heroes = [];
		let slices = [];


// 		for (let i=0; i<((artboards.length > 0) ? Math.min(artboards.length, 10) : 0); i++) {
		for (let i=0; i<artboards.length; i++) {
			const artboard = artboards[i];

			if (Math.floor(i % 5) === 0 && i > 0) {
				offset.x = 0;
				offset.y += maxH + 50;
				maxH = 0;
			}

			if (artboard.meta.frame.size.height * scale > maxH) {
				maxH = artboard.meta.frame.size.height * scale;
			}

			const heroStyle = {
				position       : 'absolute',
				top            : Math.floor(offset.y) + 'px',
				left           : Math.floor(offset.x) + 'px',
				width          : Math.floor(scale * artboard.meta.frame.size.width) + 'px',
				height         : Math.floor(scale * artboard.meta.frame.size.height) + 'px',
				background     : '#111111 url("' + artboard.filename + '") no-repeat center',
// 				backgroundSize : 'cover',
// 				backgroundSize : '100% auto',
				backgroundSize : Math.floor(scale * artboard.meta.frame.size.width) + 'px ' + Math.floor(scale * artboard.meta.frame.size.height) + 'px',
				border         : '2px dotted #00ff00'
			};

			const sliceWrapperStyle = {
				position : 'absolute',
				top      : Math.floor(offset.y) + 'px',
				left     : Math.floor(offset.x) + 'px',
				width    : (scale * artboard.meta.frame.size.width) + 'px',
				height   : (scale * artboard.meta.frame.size.height) + 'px'
			};

			const backgroundSlices = artboard.slices.map((slice, i) => {
				return ((slice.type === 'group') ?
					<SliceItem
						key={i}
						id={slice.id}
						title={slice.title}
						type={slice.type}
						filled={visibleTypes[slice.type]}
						visible={(!this.state.scrolling)}
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
						id={slice.id}
						title={slice.title}
						type={slice.type}
						filled={visibleTypes[slice.type]}
						visible={(!this.state.scrolling)}
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
						id={slice.id}
						title={slice.title}
						type={slice.type}
						filled={visibleTypes[slice.type]}
						visible={(!this.state.scrolling)}
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
						id={slice.id}
						title={slice.title}
						type={slice.type}
						filled={visibleTypes[slice.type]}
						visible={(!this.state.scrolling)}
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
				<div key={i}>
					<div style={heroStyle}>
						<div className="inspector-page-caption">{artboard.title}</div>
					</div>
				</div>
			);

			slices.push(
				<div key={i} className="inspector-page-hero-slices-wrapper" style={sliceWrapperStyle} onMouseOver={this.handleArtboardOver} onMouseOut={this.handleArtboardOut}>
					<div data-id={artboard.id} className="inspector-page-background-wrapper">{backgroundSlices}</div>
					<div className="inspector-page-hotspot-wrapper">{hotspotSlices}</div>
					<div className="inspector-page-textfield-wrapper">{textfieldSlices}</div>
					<div className="inspector-page-slice-wrapper">{sliceSlices}</div>
				</div>
			);

			offset.x += Math.round(50 + (artboard.meta.frame.size.width * scale));
		}


		const styles = (activeSlice && activeSlice.meta.styles && activeSlice.meta.styles.length > 0) ? {
			stroke : (activeSlice.meta.styles[0].border.length > 0) ? {
				color     : activeSlice.meta.styles[0].border[0].color.toUpperCase(),
				position  : activeSlice.meta.styles[0].border[0].position,
				thickness : activeSlice.meta.styles[0].border[0].thickness + 'px'
			} : null,
			shadow : (activeSlice.meta.styles[0].shadow.length > 0) ? {
				color  : activeSlice.meta.styles[0].shadow[0].color.toUpperCase(),
				offset : {
					x : activeSlice.meta.styles[0].shadow[0].offset.x,
					y : activeSlice.meta.styles[0].shadow[0].offset.y
				},
				spread : activeSlice.meta.styles[0].shadow[0].spread + 'px',
				blur   : activeSlice.meta.styles[0].shadow[0].blur + 'px'
			} : null,
			innerShadow : (activeSlice.meta.styles[0].innerShadow.length > 0) ? {
				color  : activeSlice.meta.styles[0].shadow[0].color.toUpperCase(),
				offset : {
					x : activeSlice.meta.styles[0].shadow[0].offset.x,
					y : activeSlice.meta.styles[0].shadow[0].offset.y
				},
				spread : activeSlice.meta.styles[0].shadow[0].spread + 'px',
				blur   : activeSlice.meta.styles[0].shadow[0].blur + 'px'
			} : null
		} : null;

// 		console.log('InspectorPage.render()', scale);
// 		console.log(window.performance.memory);

		return (<div>
			{(this.state.uploading) && (<div className="inspector-page-upload-progress-wrapper">
				<div className="inspector-page-upload-progress" style={progressStyle} />
			</div>)}
			<div className="page-wrapper inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-hero-wrapper" ref={artboardsWrapper}>
						{(artboards.length > 0) && (
							<div style={wrapperStyle}>
								{heroes}
								<div className="inspector-page-hero-canvas-wrapper" style={canvasStyle} ref={canvasWrapper}>
									<canvas width={(artboardsWrapper.current) ? artboardsWrapper.current.clientWidth : 0} height={(artboardsWrapper.current) ? artboardsWrapper.current.clientHeight : 0} ref={canvas}>Your browser does not support the HTML5 canvas tag.</canvas>
								</div>
								{slices}
							</div>
						)}
					</div>
					<div className="inspector-page-zoom-wrapper">
						<button className={'inspector-page-float-button' + ((scale >= 3) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(1)}><img className="inspector-page-float-button-image" src={(scale < 3) ? '/images/zoom-in.svg' : '/images/zoom-in_disabled.svg'} alt="+" /></button><br />
						<button className={'inspector-page-float-button' + ((scale <= 0.03) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(-1)}><img className="inspector-page-float-button-image" src={(scale > 0.03) ? '/images/zoom-out.svg' : '/images/zoom-out_disabled.svg'} alt="-" /></button><br />
						<button className={'inspector-page-float-button' + ((scale === 1.0) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(0)}><img className="inspector-page-float-button-image" src={(scale !== 1.0) ? '/images/zoom-reset.svg' : '/images/zoom-reset_disabled.svg'} alt="0" /></button>
					</div>
					<div className="inspector-page-toggle-wrapper">
						<SliceToggle type="hotspot" selected={visibleTypes.hotspot} onClick={()=> this.handleSliceToggle('hotspot')} />
						<SliceToggle type="slice" selected={visibleTypes.slice} onClick={()=> this.handleSliceToggle('slice')} />
						<SliceToggle type="textfield" selected={visibleTypes.textfield} onClick={()=> this.handleSliceToggle('textfield')} />
						<SliceToggle type="group" selected={visibleTypes.group} onClick={()=> this.handleSliceToggle('group')} />
						<SliceToggle type="" selected={(visibleTypes.all)} onClick={()=> this.handleSliceToggle('all')} />
					</div>
				</div>
				<div className="inspector-page-panel">
					<div className="inspector-page-panel-content-wrapper">
						<div style={{overflowX:'auto'}}>
							<ul className="inspector-page-panel-tab-wrapper">
								{(files.map((file, i) => {
									return (<li key={i} className={'inspector-page-panel-tab' + ((this.state.selectedTab === i) ? ' inspector-page-panel-tab-selected' : '')} onClick={()=> this.handleTab(i)}>{file.title}</li>);
								}))}
							</ul>
						</div>
						<div className="inspector-page-panel-tab-content-wrapper">
							{(files.map((file, i) => {
								return ((i === this.state.selectedTab) ? <div key={i} className="inspector-page-panel-tab-content"><span dangerouslySetInnerHTML={{ __html : (file.contents) ? String(JSON.parse(file.contents)).replace(/ /g, '&nbsp;').replace(/\n/g, '<br />') : '' }} /></div> : null);
							}))}
						</div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<button className="inspector-page-panel-button adjacent-button">Copy</button>
						<Dropzone className="inspector-page-dz-wrapper" onDrop={this.onDrop.bind(this)}>
							<button className="inspector-page-panel-button">Contribute</button>
						</Dropzone>
					</div>
					<div className="inspector-page-panel-content-wrapper">
						<ul className="inspector-page-panel-tab-wrapper">
							<li className={'inspector-page-panel-tab inspector-page-panel-tab-selected'}>Specs</li>
							<li className={'inspector-page-panel-tab'}>Parts</li>
						</ul>
						<div className="inspector-page-panel-tab-content-wrapper">
							<div className="inspector-page-panel-tab-content">
								<div className="inspector-page-panel-info-wrapper">
									{/*<Row><Column flexGrow={1}>System</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard && artboard.system) ? artboard.system.title : ''}</Column></Row>*/}
									{/*<Row><Column flexGrow={1}>Author</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val"><a href={'mailto:' + ((artboard && artboard.system) ? artboard.system.author : '#')} style={{textDecoration:'none'}}>{(artboard && artboard.system) ? artboard.system.author : ''}</a></Column></Row>*/}
									{/*<Row><Column flexGrow={1}>Page</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(page) ? page.title : ''}</Column></Row>*/}
									{/*<Row><Column flexGrow={1}>Artboard</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard) ? artboard.title : ''}</Column></Row>*/}
									<Row><Column flexGrow={1}>Name:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice) ? activeSlice.title : ''}</Column></Row>
									{/*<Row><Column flexGrow={1}>Type</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice) ? capitalizeText(activeSlice.type, true) : ''}</Column></Row>*/}
									{/*<Row><Column flexGrow={1}>Date:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice) ? (new Intl.DateTimeFormat('en-US', tsOptions).format(Date.parse(activeSlice.added))) : ''}</Column></Row>*/}
									<Row>
										<Column flexGrow={1}>Export Size:</Column>
										<Row flexGrow={1} className="inspector-page-panel-info-val">
											<div style={{width:'50%'}}>W: {(activeSlice) ? activeSlice.meta.frame.size.width : 0}px</div>
											<div style={{width:'50%', textAlign:'right'}}>H: {(activeSlice) ? activeSlice.meta.frame.size.height : 0}px</div>
										</Row>
									</Row>
									<Row>
										<Column flexGrow={1}>Position:</Column>
										<Row flexGrow={1} className="inspector-page-panel-info-val">
											<div style={{width:'50%'}}>X: {(activeSlice) ? activeSlice.meta.frame.origin.x : 0}px</div>
											<div style={{width:'50%', textAlign:'right'}}>Y: {(activeSlice) ? activeSlice.meta.frame.origin.y : 0}px</div>
										</Row>
									</Row>
									{/*<Row><Column flexGrow={1}>Scale</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(scaleSize + 'x')}</Column></Row>*/}
									<Row><Column flexGrow={1}>Rotation</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice) ? activeSlice.meta.rotation : 0}&deg;</Column></Row>
									<Row><Column flexGrow={1}>Opacity</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice) ? (activeSlice.meta.opacity * 100) : 100}%</Column></Row>
									<Row><Column flexGrow={1}>Fill:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice) ? (activeSlice.type === 'textfield' && activeSlice.meta.font.color) ? activeSlice.meta.font.color.toUpperCase() : activeSlice.meta.fillColor.toUpperCase() : ''}</Column></Row>
									<Row><Column flexGrow={1}>Border:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{''}</Column></Row>
									{(activeSlice && activeSlice.type === 'textfield') && (<div>
										{/*<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice.meta.font.family) ? activeSlice.meta.font.family : ''}</Column></Row>*/}
										<Row><Column flexGrow={1}>Font:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice.meta.font.family) ? activeSlice.meta.font.family : ''}</Column></Row>
										<Row><Column flexGrow={1}>Font size:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice.meta.font.size + 'px')}</Column></Row>
										<Row><Column flexGrow={1}>Font color:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice.meta.font.color) ? activeSlice.meta.font.color.toUpperCase() : ''}</Column></Row>
										<Row><Column flexGrow={1}>Text Alignment:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice.meta.font.alignment) ? capitalizeText(activeSlice.meta.font.alignment) : 'Left'}</Column></Row>
										<Row><Column flexGrow={1}>Font Line Height:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice.meta.font.lineHeight) ? (activeSlice.meta.font.lineHeight + 'px') : ''}</Column></Row>
										<Row><Column flexGrow={1}>Font Letter Spacing:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice.meta.font.kerning) ? (activeSlice.meta.font.kerning.toFixed(2) + 'px') : ''}</Column></Row>
										<Row><Column flexGrow={1}>Horizontal Alignment:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice.meta.font.alignment) ? capitalizeText(activeSlice.meta.font.alignment) : 'Left'}</Column></Row>
										<Row><Column flexGrow={1}>Vertical Alignment:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{'Top'}</Column></Row>
									</div>)}
									{(styles) && (<div>
										<Row><Column flexGrow={1}>Stroke:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.stroke) ? (capitalizeText(styles.stroke.position, true) + ' S: ' + styles.stroke.thickness + ' ' + styles.stroke.color) : ''}</Column></Row>
										<Row><Column flexGrow={1}>Shadow:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.shadow) ? ('X: ' + styles.shadow.offset.x + ' Y: ' + styles.shadow.offset.y + ' B: ' + styles.shadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>
										<Row><Column flexGrow={1}>Inner Shadow:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.innerShadow) ? ('X: ' + styles.innerShadow.offset.x + ' Y: ' + styles.innerShadow.offset.y + ' B: ' + styles.innerShadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>
										<Row><Column flexGrow={1}>Blur:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.innerShadow) ? ('X: ' + styles.innerShadow.offset.x + ' Y: ' + styles.innerShadow.offset.y + ' B: ' + styles.innerShadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>
									</div>)}
									{(activeSlice && activeSlice.meta.padding) && (<Row>
										<Column flexGrow={1}>Padding:</Column>
										<Row flexGrow={1} className="inspector-page-panel-info-val">
											<div style={{width:'50%'}}>{(activeSlice) ? activeSlice.meta.padding.top : 0}px</div>
											<div style={{width:'50%'}}>{(activeSlice) ? activeSlice.meta.padding.left : 0}px</div>
											<div style={{width:'50%', textAlign:'right'}}>{(activeSlice) ? activeSlice.meta.padding.bottom : 0}px</div>
											<div style={{width:'50%', textAlign:'right'}}>{(activeSlice) ? activeSlice.meta.padding.right : 0}px</div>
										</Row>
									</Row>)}
									<Row><Column flexGrow={1}>Inner Padding:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{''}</Column></Row>
									<Row><Column flexGrow={1}>Blend:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice) ? capitalizeText(activeSlice.meta.blendMode, true) : ''}</Column></Row>
									<Row><Column flexGrow={1}>Date:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(activeSlice) ? (new Intl.DateTimeFormat('en-US', tsOptions).format(Date.parse(activeSlice.added))) : ''}</Column></Row>
									<Row><Column flexGrow={1}>Author:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(page) ? page.author : ''}</Column></Row>
								</div>
							</div>
						</div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<button className="inspector-page-panel-button adjacent-button">Copy</button>
						<button className="inspector-page-panel-button">Download</button>
					</div>
				</div>

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>

			{(this.state.tooltip !== '') && (<div className="inspector-page-tooltip">
				{this.state.tooltip}
			</div>)}
		</div>);
	}
}

export default InspectorPage;
