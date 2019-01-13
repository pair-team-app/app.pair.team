
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
// import CopyToClipboard from 'react-copy-to-clipboard';
import cookie from 'react-cookies';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import ContentModal from '../elements/ContentModal';
import { setRedirectURL } from '../../redux/actions';
import { MINUS_KEY, PLUS_KEY } from '../../consts/key-codes';
import { TIMESTAMP_OPTS } from '../../consts/formats';
import { capitalizeText, isUserLoggedIn, sendToSlack } from '../../utils/funcs.js';
import { toCSS, toReactCSS } from '../../utils/langs.js';
import enabledZoomInButton from '../../images/buttons/btn-zoom-in_enabled.svg';
import disabledZoomInButton from '../../images/buttons/btn-zoom-in_disabled.svg';
import enabledZoomOutButton from '../../images/buttons/btn-zoom-out_enabled.svg';
import disabledZoomOutButton from '../../images/buttons/btn-zoom-out_disabled.svg';
import enabledZooResetButton from '../../images/buttons/btn-zoom-reset_enabled.svg';
import disabledZoomResetButton from '../../images/buttons/btn-zoom-reset_disabled.svg';


const artboardsWrapper = React.createRef();
const canvasWrapper = React.createRef();
const canvas = React.createRef();

const zoomNotches = [
	0.03,
	0.06,
	0.13,
	0.25,
	0.50,
	1.00,
	1.75,
	3.00
];


const sliceContainsSlice = (baseSlice, testSlice)=> {
	const baseRect = {
		top    : baseSlice.meta.frame.origin.y,
		left   : baseSlice.meta.frame.origin.x,
		bottom : baseSlice.meta.frame.origin.y + baseSlice.meta.frame.size.height,
		right  : baseSlice.meta.frame.origin.x + baseSlice.meta.frame.size.width
	};

	const testRect = {
		top    : testSlice.meta.frame.origin.y,
		left   : testSlice.meta.frame.origin.x,
		bottom : testSlice.meta.frame.origin.y + testSlice.meta.frame.size.height,
		right  : testSlice.meta.frame.origin.x + testSlice.meta.frame.size.width
	};

// 	console.log('InspectorPage.sliceContainsSlice()', baseRect, testRect);

// 	return (baseRect.top < testRect.top && baseRect.left < testRect.left && baseRect.right > testRect.right && baseRect.bottom > testRect.bottom && Math.max(baseRect.left, testRect.left) < Math.min(baseRect.right, testRect.right) && Math.max(baseRect.top, testRect.top) < Math.min(baseRect.bottom, testRect.bottom));
	return (baseRect.top <= testRect.top && baseRect.left <= testRect.left && baseRect.right >= testRect.right && baseRect.bottom >= testRect.bottom);
};



const mapStateToProps = (state, ownProps)=> {
	return ({
		navigation  : state.navigation,
		profile     : state.userProfile,
		redirectURL : state.redirectURL
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		setRedirectURL : (url)=> dispatch(setRedirectURL(url))
	});
};


const SliceItem = (props)=> {
// 	console.log('InspectorPage.SliceItem()', props);

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
		<div data-slice-id={props.id} className={className + ((props.filled) ? '-filled' : '')} style={style} onMouseEnter={()=> props.onRollOver(props.offset)} onMouseLeave={()=> props.onRollOut()} onClick={()=> props.onClick(props.offset)} />
	);
};

const SpecsList = (props)=> {
// 		console.log('InspectorPage.SpecsList()', props);

	const sliceStyles = (props.slice && props.slice.meta.styles && props.slice.meta.styles.length > 0) ? props.slice.meta.styles.pop() : null;
	const stroke = (sliceStyles && sliceStyles.border.length > 0) ? sliceStyles.border.pop() : null;
	const shadow = (sliceStyles && sliceStyles.shadow.length > 0) ? sliceStyles.shadow.pop() : null;
	const innerShadow = (sliceStyles && sliceStyles.innerShadow.length > 0) ? sliceStyles.innerShadow.pop() : null;

	const styles = (sliceStyles) ? {
		stroke : (stroke) ? {
			color     : stroke.color.toUpperCase(),
			position  : stroke.position,
			thickness : stroke.thickness + 'px'
		} : null,
		shadow : (shadow) ? {
			color  : shadow.color.toUpperCase(),
			offset : {
				x : shadow.offset.x,
				y : shadow.offset.y
			},
			spread : shadow.spread + 'px',
			blur   : shadow.blur + 'px'
		} : null,
		innerShadow : (innerShadow) ? {
			color  : innerShadow.color.toUpperCase(),
			offset : {
				x : innerShadow.offset.x,
				y : innerShadow.offset.y
			},
			spread : innerShadow.spread + 'px',
			blur   : innerShadow.blur + 'px'
		} : null
	} : null;

	return (
		<div className="inspector-page-panel-info-wrapper">
			{/*<Row><Column flexGrow={1}>System</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard && artboard.system) ? artboard.system.title : ''}</Column></Row>*/}
			{/*<Row><Column flexGrow={1}>Author</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val"><a href={'mailto:' + ((artboard && artboard.system) ? artboard.system.author : '#')} style={{ textDecoration : 'none' }}>{(artboard && artboard.system) ? artboard.system.author : ''}</a></Column></Row>*/}
			{/*<Row><Column flexGrow={1}>Artboard</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(artboard) ? artboard.title : ''}</Column></Row>*/}
			<Row><Column flexGrow={1}>Name</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice) ? props.slice.title : ''}</Column></Row>
			<Row><Column flexGrow={1}>Type</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice) ? capitalizeText(props.slice.type, true) : ''}</Column></Row>
			{/*<Row><Column flexGrow={1}>Date:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice) ? (new Intl.DateTimeFormat('en-US', TIMESTAMP_OPTS).format(Date.parse(props.slice.added))) : ''}</Column></Row>*/}
			<Row><Column flexGrow={1}>Export Size</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">W: {(props.slice) ? props.slice.meta.frame.size.width : 0}px H: {(props.slice) ? props.slice.meta.frame.size.height : 0}px</Column></Row>
			<Row><Column flexGrow={1}>Position</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">X: {(props.slice) ? props.slice.meta.frame.origin.x : 0}px Y: {(props.slice) ? props.slice.meta.frame.origin.y : 0}px</Column></Row>
			<Row><Column flexGrow={1}>Rotation</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice) ? props.slice.meta.rotation : 0}&deg;</Column></Row>
			<Row><Column flexGrow={1}>Opacity</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice) ? (props.slice.meta.opacity * 100) : 100}%</Column></Row>
			<Row><Column flexGrow={1}>Fills</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice) ? (props.slice.type === 'textfield' && props.slice.meta.font.color) ? props.slice.meta.font.color.toUpperCase() : props.slice.meta.fillColor.toUpperCase() : ''}</Column></Row>
			<Row><Column flexGrow={1}>Borders</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{''}</Column></Row>
			{(props.slice && props.slice.type === 'textfield') && (<div>
				{/*<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice.meta.font.family) ? props.slice.meta.font.family : ''}</Column></Row>*/}
				<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice.meta.font.family) ? props.slice.meta.font.family : ''}</Column></Row>
				<Row><Column flexGrow={1}>Font Size</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice.meta.font.size + 'px')}</Column></Row>
				<Row><Column flexGrow={1}>Font Color</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice.meta.font.color) ? props.slice.meta.font.color.toUpperCase() : ''}</Column></Row>
				{/*<Row><Column flexGrow={1}>Text Alignment:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice.meta.font.alignment) ? capitalizeText(props.slice.meta.font.alignment) : 'Left'}</Column></Row>*/}
				<Row><Column flexGrow={1}>Line Spacing</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice.meta.font.lineHeight) ? (props.slice.meta.font.lineHeight + 'px') : ''}</Column></Row>
				<Row><Column flexGrow={1}>Char Spacing</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice.meta.font.kerning) ? (props.slice.meta.font.kerning.toFixed(2) + 'px') : ''}</Column></Row>
				{/*<Row><Column flexGrow={1}>Horizontal Alignment</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice.meta.font.alignment) ? capitalizeText(props.slice.meta.font.alignment) : 'Left'}</Column></Row>*/}
				{/*<Row><Column flexGrow={1}>Vertical Alignment</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{'Top'}</Column></Row>*/}
			</div>)}
			{(styles) && (<div>
				{/*<Row><Column flexGrow={1}>Stroke:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.stroke) ? (capitalizeText(styles.stroke.position, true) + ' S: ' + styles.stroke.thickness + ' ' + styles.stroke.color) : ''}</Column></Row>*/}
				{/*<Row><Column flexGrow={1}>Shadow:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.shadow) ? ('X: ' + styles.shadow.offset.x + ' Y: ' + styles.shadow.offset.y + ' B: ' + styles.shadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>*/}
				{/*<Row><Column flexGrow={1}>Inner Shadow:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.innerShadow) ? ('X: ' + styles.innerShadow.offset.x + ' Y: ' + styles.innerShadow.offset.y + ' B: ' + styles.innerShadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>*/}
				{/*<Row><Column flexGrow={1}>Blur:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(styles.innerShadow) ? ('X: ' + styles.innerShadow.offset.x + ' Y: ' + styles.innerShadow.offset.y + ' B: ' + styles.innerShadow.blur + ' S: ' + styles.shadow.spread) : ''}</Column></Row>*/}
			</div>)}
			{(props.slice && props.slice.meta.padding) && (<Row>
				<Column flexGrow={1}>Padding</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{props.slice.meta.padding.top}px {props.slice.meta.padding.left}px {props.slice.meta.padding.bottom}px {props.slice.meta.padding.right}px</Column>
			</Row>)}
			{/*<Row><Column flexGrow={1}>Inner Padding:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{''}</Column></Row>*/}
			{/*<Row><Column flexGrow={1}>Blend:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice) ? capitalizeText(props.slice.meta.blendMode, true) : ''}</Column></Row>*/}
			<Row><Column flexGrow={1}>Date</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.slice) ? (new Intl.DateTimeFormat('en-US', TIMESTAMP_OPTS).format(Date.parse(props.slice.added))) : ''}</Column></Row>
			<Row><Column flexGrow={1}>Author</Column><Column flexGrow={1} horizontal="end" className="inspector-page-panel-info-val">{(props.upload) ? props.upload.creator.username : ''}</Column></Row>
		</div>
	);
};


class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			section      : window.location.pathname.substr(1).split('/').shift(),
			slice        : null,
			hoverSlice   : null,
			upload       : null,
			tabs         : [],
			uploading    : false,
			shownStarted : false,
			restricted   : false,
			percent      : 0,
			selectedTab  : 0,
			tooltip      : '',
			hoverOffset  : null,
			scale        : 0.25,
			scrollOffset : {
				x : 0,
				y : 0
			},
			offset       : null,
			scrolling    : false,
			code         : {
				html   : '',
				syntax : ''
			},
			comment      : ''
		};

		this.processingInterval = null;
		this.initialScaled = false;
		this.jumpedOffset = false;
		this.lastScroll = 0;
		this.scrollInterval = null;
		this.antsOffset = 0;
		this.antsInterval = null;
		this.size = {
			width  : 0,
			height : 0
		};
	}

	componentDidMount() {
		console.log('InspectorPage.componentDidMount()', this.props, this.state);

		if (this.props.redirectURL) {
			this.props.setRedirectURL(null);
		}

		const { navigation } = this.props;
		if (navigation && (navigation.uploadID !== 0)) {
			this.refreshData();
		}

		document.addEventListener('keydown', this.handleKeyDown.bind(this));
		document.addEventListener('wheel', this.handleWheelStart.bind(this));
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		console.log('InspectorPage.shouldComponentUpdate()', this.props, nextProps, this.state, nextState, nextContext);

		const { upload, restricted } = nextState;
		if (!restricted && upload && upload.private === '1' && (!nextProps.profile || (nextProps.profile && upload.creator.user_id !== nextProps.profile.id))) {
			this.props.setRedirectURL(window.location.pathname);
			this.setState({
				restricted : true,
				tooltip    : ''
			});
		}

		return (true);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('InspectorPage.componentDidUpdate()', prevProps, this.props, this.state);

		if (this.props.navigation !== prevProps.navigation && this.props.navigation && this.props.navigation.uploadID !== 0) {
			this.refreshData();
		}

		if (this.props.processing && this.processingInterval === null) {
			this.setState({ tooltip : 'Processing…' });
			this.processingInterval = setInterval(this.onProcessingUpdate, 2500);
		}

		if (!this.props.processing && this.processingInterval) {
			clearInterval(this.processingInterval);
			this.processingInterval = null;
			this.refreshData();
		}

		if (canvasWrapper.current) {
			const scale = Math.min(canvasWrapper.current.clientWidth / (this.size.width - canvasWrapper.current.clientWidth), canvasWrapper.current.clientHeight / (this.size.height - canvasWrapper.current.clientHeight));
			if (this.state.scale !== scale && !this.initialScaled) {
				this.initialScaled = true;
				//this.setState({ scale });

// 				if (artboardsWrapper.current) {
// 					this.state.artboards.forEach((artboard, i)=> {
// 						if (artboard.id === this.props.match.params.artboardID && (artboardsWrapper.current.scrollTop !== artboard.offset.y || artboardsWrapper.current.scrollLeft !== artboard.offset.x)) {
// 							console.log('InspectorPage.componentDidUpdate()', artboardsWrapper.current.scrollTop, artboardsWrapper.current.scrollLeft, artboard.grid, artboard.offset);
// 							//artboardsWrapper.current.scrollTop = (artboard.grid.row * 50) + (artboard.offset.y * scale);
// 							//artboardsWrapper.current.scrollLeft = (artboard.grid.col * 50) + (artboard.offset.x * scale);
// 						}
// 					});
// 				}
			}

// 			if (this.props.match.params.artboardID !== prevProps.match.params.artboardID) {
// 				if (artboardsWrapper.current) {
// 					this.state.artboards.forEach((artboard, i)=> {
// 						if (artboard.id === this.props.match.params.artboardID && (artboardsWrapper.current.scrollTop !== artboard.offset.y || artboardsWrapper.current.scrollLeft !== artboard.offset.x)) {
// 							console.log('InspectorPage.componentDidUpdate()', artboardsWrapper.current.scrollTop, artboardsWrapper.current.scrollLeft, artboard.grid, artboard.offset);
// 							//artboardsWrapper.current.scrollTop = (artboard.grid.row * 50) + (artboard.offset.y * this.state.scale);
// 							//artboardsWrapper.current.scrollLeft = (artboard.grid.col * 50) + (artboard.offset.x * this.state.scale);
// 						}
// 					});
// 				}
// 			}
		}

// 		if (canvas.current && this.antsInterval) {
// 			this.onUpdateCanvas();
// 		}
	}

	componentWillUnmount() {
		clearInterval(this.processingInterval);
		clearInterval(this.antsInterval);
		clearInterval(this.scrollInterval);

		this.processingInterval = null;
		this.antsInterval = null;
		this.scrollInterval = null;

		document.removeEventListener('keydown', this.handleKeyDown.bind(this));
		document.removeEventListener('wheel', this.handleWheelStart.bind(this));
	}


	refreshData = ()=> {
		console.log('InspectorPage.refreshData()', this.props);

		const { processing } = this.props;
		const { uploadID } = this.props.navigation;
		const { section, scale } = this.state;

		this.setState({ tooltip : (processing) ? 'Processing…' : 'Loading…' });

		let maxH = 0;
		let offset = {
			x : 0,
			y : 0
		};

		let formData = new FormData();
		formData.append('action', 'UPLOAD');
		formData.append('upload_id', uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('UPLOAD', response.data);
				const { upload } = response.data;

				let pages = [];
				upload.pages.forEach((page)=> {
					let artboards = [];
					page.artboards.forEach((artboard, i, arr)=> {
						if (Math.floor(i % 5) === 0 && i !== 0) {
							this.size.height += maxH + 50;
							offset.x = 0;
							offset.y += 50 + maxH;
							maxH = 0;
						}

						maxH = Math.round(Math.max(maxH, JSON.parse(artboard.meta).frame.size.height * scale));

						artboards.push({
							id        : artboard.id,
							pageID    : artboard.page_id,
							title     : artboard.title,
							filename  : (artboard.filename.includes('@3x')) ? artboard.filename : artboard.filename + '@3x.png',
							meta      : JSON.parse(artboard.meta),
							views     : artboard.views,
							downloads : artboard.downloads,
							added     : artboard.added,
							system    : artboard.system,
							grid      : {
								col : i % 5,
								row : Math.floor(i / 5)
							},
							offset    : {
								x : offset.x,
								y : offset.y
							},
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


						if (i < arr.length - 1) {
							offset.x += Math.round(50 + (JSON.parse(artboard.meta).frame.size.width * scale)) - (0);
						}

						this.size.width = Math.max(this.size.width, offset.x);
					});

					page.artboards = artboards;
					pages.push(page);
				});

				upload.pages = pages;

				if (section === 'inspect') {
					formData.append('action', 'FILES');
					formData.append('upload_id', '' + uploadID);
					axios.post('https://api.designengine.ai/system.php', formData)
						.then((response) => {
							console.log('FILES', response.data);

							const tabs = response.data.files.map((file) => ({
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
									id       : -1,
									title    : 'React CSS',
									filename : 'React CSS',
									contents : null,
									added    : null
								}, {
									id       : -2,
									title    : 'Swift',
									filename : 'Swift',
									contents : null,
									added    : null
								}, {
									id       : -3,
									title    : 'Android',
									filename : 'Android',
									contents : null,
									added    : null
								}
							]);

							this.setState({
								upload  : upload,
								tabs    : tabs,
								tooltip : (processing) ? 'Processing…' : ''
							});
						}).catch((error) => {
					});

				} else if (section === 'parts') {
					const tabs = [
						{
							id       : 0,
							title    : 'Slices',
							filename : 'Slices',
							contents : null,
							added    : null
						}, {
							id       : -1,
							title    : 'Symbols',
							filename : 'Symbols',
							contents : null,
							added    : null
						}
					];

					this.setState({
						upload  : upload,
						tabs    : tabs,
						tooltip : (processing) ? 'Processing…' : ''
					});

				} else if (section === 'colors') {
					const tabs = [
						{
							id       : 0,
							title    : 'Primary',
							filename : 'Primary',
							contents : null,
							added    : null
						}, {
							id       : -1,
							title    : 'Secondary',
							filename : 'Secondary',
							contents : null,
							added    : null
						}, {
							id       : -2,
							title    : 'Tertiary',
							filename : 'Tertiary',
							contents : null,
							added    : null
						}
					];

					this.setState({
						upload  : upload,
						tabs    : tabs,
						tooltip : (processing) ? 'Processing…' : ''
					});

				} else if (section === 'typography') {
					const tabs = [
						{
							id       : 0,
							title    : 'Headlines',
							filename : 'Headlines',
							contents : null,
							added    : null
						}, {
							id       : -1,
							title    : 'Subheadlines',
							filename : 'Subheadlines',
							contents : null,
							added    : null
						}, {
							id       : -2,
							title    : 'Body',
							filename : 'Body',
							contents : null,
							added    : null
						}
					];

					this.setState({
						upload  : upload,
						tabs    : tabs,
						tooltip : (processing) ? 'Processing…' : ''
					});
				}

			}).catch((error) => {
		});
	};

	handleArtboardRollOut = (event)=> {
// 		console.log('InspectorPage.handleArtboardRollOut()', event.target);
//
// 		const artboardID = event.target.getAttribute('data-artboard-id');
// 		let { upload } = this.state;
//
// 		const pages = [...upload.pages];
// 		pages.forEach((page)=> {
// 			page.artboards.filter((artboard)=> (artboard.id === artboardID)).forEach((artboard) => {
// 				artboard.slices.forEach((item)=> {
// 					item.filled = false;
// 				});
// 			});
// 		});
//
// 		upload.pages = pages;
// 		this.setState({ upload });
	};

	handleArtboardRollOver = (event)=> {
// 		console.log('InspectorPage.handleArtboardRollOver()', event.target);
		const artboardID = event.target.getAttribute('data-artboard-id');

		if (!this.antsInterval) {
			this.antsInterval = setInterval(this.onUpdateAnts, 100);
		}

		let formData = new FormData();
		formData.append('action', 'SLICES');
		formData.append('artboard_id', artboardID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
// 					console.log('SLICES', response.data);

				let { upload } = this.state;
				let pages = [...upload.pages];
				pages.forEach((page) => {
					page.artboards.filter((artboard) => (artboard.id === artboardID && artboard.slices.length === 0)).forEach((artboard) => {
						artboard.slices = response.data.slices.map((item) => ({
							id         : item.id,
							artboardID : item.artboard_id,
							title      : item.title,
							type       : item.type,
							filename   : item.filename,
							meta       : JSON.parse(item.meta),
							added      : item.added,
							filled     : false
						}));
					});
				});

				upload.pages = pages;
				this.setState({ upload });
			}).catch((error) => {
		});
	};

	handleCodeCopy = ()=> {
		this.props.onPopup({
			type    : 'INFO',
			content : 'Copied to Clipboard!'
		});
	};

	handleCommentChange = (event)=> {
		event.persist();
		if (/[\r\n]/.exec(event.target.value)) {
			this.onSubmitComment(event);

		} else {
			this.setState({ [event.target.name] : event.target.value })
		}
	};

	handleDownload = ()=> {
		if (!isUserLoggedIn()) {
			cookie.save('msg', 'use this feature.', { path : '/' });
			this.props.onPage('login');

		} else {
			const filePath = 'http://cdn.designengine.ai/arboard.php?artboard_id=' + this.props.navigation.artboardID;
			let link = document.createElement('a');
			link.href = filePath;
			link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
			link.click();
		}
	};

	handleDrag = (event)=> {
		//console.log('InspectorPage.handleDrag()', event.type, event.target);
		if (event.type === 'mousedown') {
		} else if (event.type === 'mousemove') {
		} else if (event.type === 'mouseup') {
		}
	};

	handleKeyDown = (event)=> {
		if (event.keyCode === PLUS_KEY) {
			this.handleZoom(1);

		} else if (event.keyCode === MINUS_KEY) {
			this.handleZoom(-1);
		}
	};

	handleSliceClick = (ind, slice, offset)=> {
		let { section, tabs } = this.state;

		const css = toCSS(slice);
		const reactCSS = toReactCSS(slice);

		if (section === 'inspect') {
			tabs[tabs.length - 1].contents = reactCSS.html;
			tabs[tabs.length - 2].contents = css.html;
		}

		this.setState({
			tabs       : tabs,
			hoverSlice : null,
			slice      : slice,
			offset     : offset
		});
	};

	handleSliceRollOut = (ind, slice)=> {
		let { upload, section, tabs } = this.state;
		const pages = [...upload.pages];
		pages.forEach((page)=> {
			page.artboards.filter((artboard)=> (artboard.id === slice.artboardID)).forEach((artboard) => {
				artboard.slices.filter((item)=> (item.filled)).forEach((item)=> {
					item.filled = false;
				});
			});
		});

		upload.pages = pages;
		this.setState({ upload });

		if (this.state.slice) {
			const css = toCSS(this.state.slice);
			const reactCSS = toReactCSS(this.state.slice);

			if (section === 'inspect') {
				tabs[tabs.length - 3].contents = reactCSS.html;
				tabs[tabs.length - 4].contents = css.html;
			}
		}

		this.setState({
			tabs       : tabs,
			hoverSlice : null
		});
	};

	handleSliceRollOver = (ind, slice, offset)=> {
		let { upload, section, tabs } = this.state;

		const pages = [...upload.pages];
		pages.forEach((page)=> {
			page.artboards.filter((artboard)=> (artboard.id === slice.artboardID)).forEach((artboard) => {
				artboard.slices.filter((item)=> (item.id !== slice.id)).forEach((item)=> {
					item.filled = sliceContainsSlice(slice, item);
				});
			});
		});

		upload.pages = pages;
		this.setState({ upload });

		const css = toCSS(slice);
		const reactCSS = toReactCSS(slice);

		if (section === 'inspect') {
			tabs[tabs.length - 3].contents = reactCSS.html;
			tabs[tabs.length - 4].contents = css.html;
		}

		this.setState({
			tabs        : tabs,
			hoverSlice  : slice,
			hoverOffset : offset
		});
	};

	handleTab = (ind)=> {
		console.log('InspectorPage.handleTab()', ind);
		this.setState({ selectedTab : ind });
	};

	handleVote = (commentID, score)=> {
		let formData = new FormData();
		formData.append('action', 'VOTE_COMMENT');
		formData.append('user_id', this.props.profile.id);
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
// 		console.log('InspectorPage.handleWheelStart()', event.type, event.deltaX, event.deltaY, event.target);
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
			this.setState({
				scale   : Math.min(Math.max(this.state.scale - (event.deltaY * 0.0025), 0.03), 3).toFixed(2),
				tooltip : Math.floor(Math.min(Math.max(this.state.scale - (event.deltaY * 0.0025), 0.03), 3).toFixed(2) * 100) + '%'
			});

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

	handleZoom = (direction)=> {
		const { upload, scale } = this.state;

		if (direction === 0) {
			this.setState({
				scale   : zoomNotches[5],
				tooltip : Math.floor(zoomNotches[5] * 100) + '%'
			});

		} else {
			let ind = -1;
			zoomNotches.forEach((amt, i)=> {
				if (scale === amt) {
					ind = i;
				}
			});

			if (ind === -1) {
				let diff = 3;
				zoomNotches.forEach((amt, i)=> {
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


				const artboards = upload.pages.map((page)=> {
					return (page.artboards);
				}).flat();

				for (let i=0; i<artboards.length; i++) {
					const artboard = artboards[i];

					if (Math.floor(i % 5) === 0) {
						offset.x = 0;
						offset.y += maxH + 50;
						maxH = 0;
					}

					maxH = Math.max(maxH, artboard.meta.frame.size.height * scale);
// 					if (artboard.meta.frame.size.height * scale > maxH) {
// 						maxH = artboard.meta.frame.size.height * scale;
// 					}

					artboard.slices.forEach((slice) => {
						if (slice.id === this.state.slice.id) {
							console.log('zoom', this.state.offset, offset);
							this.setState({ offset });
						}
					});

					offset.x += Math.round(50 + (artboard.meta.frame.size.width * scale));
				}
			}

			this.setState({
				scale   : zoomNotches[Math.min(Math.max(0, ind + direction), zoomNotches.length - 1)],
				tooltip : Math.floor(zoomNotches[Math.min(Math.max(0, ind + direction), zoomNotches.length - 1)] * 100) + '%'
			});
		}

		setTimeout(()=> {
			this.setState({ tooltip : '' });
		}, 1000);
	};

	onDrop = (files)=> {
		console.log('InspectorPage.onDrop()', files);
		const { id, email } = this.props.profile;

		if (files.length > 0 && files[0].name.split('.').pop() === 'zip') {
			const file = files.pop();
			if (file.size < 100 * (1024 * 1024)) {
				this.setState({ uploading : true });
				const config = {
					headers             : { 'content-type' : 'multipart/form-data' },
					onDownloadProgress  : (progressEvent)=> {
// 							console.log('HomeExpo.onDownloadProgress()', progressEvent);
					},
					onUploadProgress    : (progressEvent)=> {
// 							console.log('HomeExpo.onUploadProgress()', progressEvent);

						const { loaded, total } = progressEvent;
						const percent = Math.round((loaded * 100) / total);
						this.setState({
							percent : percent,
							tooltip : percent + '%'
						});

						if (progressEvent.loaded >= progressEvent.total) {
							this.setState({
								uploading : false,
								tooltip   : ''
							});

							let formData = new FormData();
							formData.append('action', 'FILES');
							formData.append('upload_id', '' + this.props.navigation.uploadID);
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

									this.setState({ files });
								}).catch((error) => {
							});
						}
					}
				};

				let formData = new FormData();
				formData.append('file', file);
				axios.post('http://cdn.designengine.ai/files/upload.php?user_id=' + id + '&upload_id=' + this.props.navigation.uploadID, formData, config)
					.then((response) => {
						console.log("UPLOAD", response.data);
					}).catch((error) => {
					sendToSlack('*' + email + '* upload failed for file _' + file.name + '_');
				});

			} else {
				this.props.onPopup({
					type     : 'ERROR',
					content  : 'File size must be under 100MB.',
					duration : 500
				});
			}

		} else {
			this.props.onPopup({
				type     : "ERROR",
				content  : 'Only zip archives are support at this time.',
				duration : 1500
			});
		}
	};

	onSubmitComment = (event)=> {
		event.preventDefault();

		if (this.state.comment.length > 0) {
			let formData = new FormData();
			formData.append('action', 'ADD_COMMENT');
			formData.append('user_id', this.props.profile.id);
			formData.append('artboard_id', '' + this.props.navigation.artboardID);
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

	onProcessingUpdate = ()=> {
		const { upload, shownStarted } = this.state;

		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', upload.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_STATUS', response.data);
				const processingState = parseInt(response.data.status.state, 10);

				if (processingState === 1) {
					if (!shownStarted) {
						this.setState({ shownStarted : true });
						this.props.onPopup({
							type     : 'INFO',
							content  : 'Processing has started'
						});
					}

				} else if (processingState === 2) {
					this.refreshData();

				} else if (processingState === 3) {
					this.props.onProcessing(false);
					clearInterval(this.processingInterval);
					this.processingInterval = null;
					this.refreshData();

				} else if (processingState === 4) {
					// processing error
				}
			}).catch((error) => {
		});
	};


	onUpdateCanvas = ()=> {
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
			context.lineDashOffset = 0;
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
	};

	onUpdateAnts = ()=> {
		if (canvas.current) {
			this.antsOffset = (++this.antsOffset % 16);
			this.onUpdateCanvas();
		}
	};


	render() {
		const { upload, slice, hoverSlice, tabs, scale, selectedTab } = this.state;
		const { scrollOffset, scrolling } = this.state;
		const { tooltip, restricted } = this.state;

		const artboards = (upload) ? upload.pages.map((page)=> {
			return (page.artboards);
		}).flat() : [];

		const activeSlice = (hoverSlice) ? hoverSlice : slice;

		const progressStyle = { width : this.state.percent + '%' };
		const artboardsStyle = {
			position        : 'absolute',
// 			width           : (artboards.length > 0) ? Math.floor(artboards.length * (50 + (artboards[0].meta.frame.size.width * scale)) * 0.75) : 0,
			width           : this.size.width,
// 			height          : (artboards.length > 0) ? Math.floor(artboards.length * (50 + (artboards[0].meta.frame.size.height * scale)) * 0.75) : 0,
			height          : this.size.height,
// 			transform       : (artboards.length > 0) ? 'translate(' + ((3 * (50 + (artboard.meta.frame.size.width * scale))) * -0.5) + 'px, ' + ((artboard.meta.frame.size.height * this.state.scale) * 0.5) + 'px)' : 'translate(0px, 0px)'
			transform       : (artboards.length > 0) ? 'translate(100px, 20px)' : 'translate(0px, 0px)'
		};

		const canvasStyle = {
			top     : (scrollOffset.y) + 'px',
			left    : (-100 + scrollOffset.x) + 'px',
			display : (scrolling) ? 'none' : 'block'
		};

		let maxH = 0;
		let offset = {
			x : 0,
			y : 0
		};

		let artboardImages = [];
		let slices = [];

		artboards.forEach((artboard, i)=> {
			if (Math.floor(i % 5) === 0 && i > 0) {
				offset.x = 0;
				offset.y += maxH + 50;
				maxH = 0;
			}

			maxH = Math.round(Math.max(maxH, artboard.meta.frame.size.height * scale));

			const artboardStyle = {
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

			const backgroundSlices = artboard.slices.filter((slice)=> (slice.type === 'group')).map((slice, i) => {
				return (<SliceItem
					key={i}
					id={slice.id}
					title={slice.title}
					type={slice.type}
					filled={slice.filled}
					visible={(!scrolling)}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={scale}
					offset={{ x : offset.x, y : offset.y }}
					onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={(offset) => this.handleSliceClick(i, slice, offset)} />);
			});

			const hotspotSlices = artboard.slices.filter((slice)=> (slice.type === 'hotspot')).map((slice, i) => {
				return (<SliceItem
					key={i}
					id={slice.id}
					title={slice.title}
					type={slice.type}
					filled={slice.filled}
					visible={(!scrolling)}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={scale}
					offset={{ x : offset.x, y : offset.y }}
					onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={(offset) => this.handleSliceClick(i, slice, offset)} />);
			});

			const textfieldSlices = artboard.slices.filter((slice)=> (slice.type === 'textfield')).map((slice, i) => {
				return (<SliceItem
					key={i}
					id={slice.id}
					title={slice.title}
					type={slice.type}
					filled={slice.filled}
					visible={(!scrolling)}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={scale}
					offset={{ x : offset.x, y : offset.y }}
					onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={(offset) => this.handleSliceClick(i, slice, offset)} />);
			});

			const sliceSlices = artboard.slices.filter((slice)=> (slice.type === 'slice')).map((slice, i) => {
				return (<SliceItem
					key={i}
					id={slice.id}
					title={slice.title}
					type={slice.type}
					filled={slice.filled}
					visible={(!scrolling)}
					top={slice.meta.frame.origin.y}
					left={slice.meta.frame.origin.x}
					width={slice.meta.frame.size.width}
					height={slice.meta.frame.size.height}
					scale={scale}
					offset={{ x : offset.x, y : offset.y }}
					onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
					onRollOut={()=> this.handleSliceRollOut(i, slice)}
					onClick={(offset) => this.handleSliceClick(i, slice, offset)} />);
			});

			artboardImages.push(
				<div key={i} style={artboardStyle}>
					<div className="inspector-page-caption">{artboard.title}</div>
				</div>
			);

			slices.push(
				<div key={i} data-artboard-id={artboard.id} className="inspector-page-slices-wrapper" style={sliceWrapperStyle} onMouseOver={this.handleArtboardRollOver} onMouseOut={this.handleArtboardRollOut}>
					<div data-artboard-id={artboard.id} className="inspector-page-background-slice-wrapper">{backgroundSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-hotspot-slice-wrapper">{hotspotSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-textfield-slice-wrapper">{textfieldSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-slice-slice-wrapper">{sliceSlices}</div>
				</div>
			);

			offset.x += Math.round(50 + (artboard.meta.frame.size.width * scale));
		});

		artboardImages = (!restricted) ? artboardImages : [];
		slices = (!restricted) ? slices : [];


// 		console.log('InspectorPage.render()', this.props, this.state);
// 		console.log('InspectorPage.render()', (artboardsWrapper.current) ? artboardsWrapper.current.scrollTop : 0, (artboardsWrapper.current) ? artboardsWrapper.current.scrollLeft : 0, scale);
// 		console.log('InspectorPage:', window.performance.memory);


		return (<div>
			{(this.state.uploading) && (<div className="upload-progress-bar-wrapper">
				<div className="upload-progress-bar" style={progressStyle} />
			</div>)}
			<div className="page-wrapper inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-artboards-wrapper" ref={artboardsWrapper}>
						{(artboards.length > 0) && (<div style={artboardsStyle}>
							{artboardImages}
							<div className="inspector-page-canvas-wrapper" style={canvasStyle} ref={canvasWrapper}>
								<canvas width={(artboardsWrapper.current) ? artboardsWrapper.current.clientWidth : 0} height={(artboardsWrapper.current) ? artboardsWrapper.current.clientHeight : 0} ref={canvas}>Your browser does not support the HTML5 canvas tag.</canvas>
							</div>
							{slices}
						</div>)}
					</div>
					{(artboards.length > 0) && (<div className="inspector-page-zoom-wrapper">
						<button className={'inspector-page-float-button' + ((scale >= Math.max(...zoomNotches)) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(1)}><img className="inspector-page-float-button-image" src={(scale < 3) ? enabledZoomInButton : disabledZoomInButton} alt="+" /></button><br />
						<button className={'inspector-page-float-button' + ((scale <= Math.min(...zoomNotches)) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(-1)}><img className="inspector-page-float-button-image" src={(scale > 0.03) ? enabledZoomOutButton : disabledZoomOutButton} alt="-" /></button><br />
						<button className={'inspector-page-float-button' + ((scale === 1.0) ? ' button-disabled' : '')} onClick={()=> this.handleZoom(0)}><img className="inspector-page-float-button-image" src={(scale !== 1.0) ? enabledZooResetButton : disabledZoomResetButton} alt="0" /></button>
					</div>)}
				</div>
				<div className="inspector-page-panel">
					<div className="inspector-page-panel-content-wrapper">
						<div style={{ overflowX : 'auto' }}>
							<ul className="inspector-page-panel-tab-wrapper">
								{(tabs.map((tab, i) => {
									return (<li key={i} className={'inspector-page-panel-tab' + ((selectedTab === i) ? ' inspector-page-panel-tab-selected' : '')} onClick={()=> this.handleTab(i)}>{tab.title}</li>);
								}))}
							</ul>
						</div>
						<div className="inspector-page-panel-tab-content-wrapper">
							{(tabs.map((tab, i) => {
								return ((i === selectedTab) ? <div key={i} className="inspector-page-panel-tab-content"><span dangerouslySetInnerHTML={{ __html : (tab.contents) ? String(JSON.parse(tab.contents)).replace(/ /g, '&nbsp;').replace(/\n/g, '<br />') : '' }} /></div> : null);
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
								<SpecsList upload={upload} slice={activeSlice} />
							</div>
						</div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<button className="inspector-page-panel-button adjacent-button">Copy</button>
						<button className="inspector-page-panel-button">Download</button>
					</div>
				</div>
			</div>

			{(tooltip !== '') && (<div className="inspector-page-tooltip">{tooltip}</div>)}
			{(restricted) && (<ContentModal content="You must be signed in as the project's creator to view!" onComplete={()=> this.props.onPage('register')} />)}

		</div>);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InspectorPage);
