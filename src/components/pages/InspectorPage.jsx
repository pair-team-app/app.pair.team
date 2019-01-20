
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import FontAwesome from 'react-fontawesome';
import Moment from 'react-moment';
import 'moment-timezone';
import panAndZoomHoc from 'react-pan-and-zoom-hoc';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import ContentModal from '../elements/ContentModal';
import InviteTeamForm from '../forms/InviteTeamForm';
import { setRedirectURL } from '../../redux/actions';
import { MINUS_KEY, PLUS_KEY } from '../../consts/key-codes';
import { MOMENT_TIMESTAMP } from '../../consts/formats';
import { buildInspectorURL, capitalizeText, frameToRect, makeDownload, rectContainsRect, sendToSlack } from '../../utils/funcs.js';
import { toCSS, toReactCSS, toSpecs, toSwift } from '../../utils/langs.js';
import enabledZoomInButton from '../../assets/images/buttons/btn-zoom-in_enabled.svg';
import disabledZoomInButton from '../../assets/images/buttons/btn-zoom-in_disabled.svg';
import enabledZoomOutButton from '../../assets/images/buttons/btn-zoom-out_enabled.svg';
import disabledZoomOutButton from '../../assets/images/buttons/btn-zoom-out_disabled.svg';
import enabledZooResetButton from '../../assets/images/buttons/btn-zoom-reset_enabled.svg';
import disabledZoomResetButton from '../../assets/images/buttons/btn-zoom-reset_disabled.svg';


const InteractiveDiv = panAndZoomHoc('div');

const artboardsWrapper = React.createRef();
const canvasWrapper = React.createRef();
const canvas = React.createRef();

const ZOOM_FACTOR = 1.0875;
const ZOOM_NOTCHES = [
	0.03,
	0.06,
	0.13,
	0.25,
	0.50,
	1.00,
	1.75,
	3.00
];


const buildSlicePreviews = (upload, slice)=> {
	let slices = [];
	const pages = [...upload.pages];
	pages.forEach((page)=> {
		page.artboards.filter((artboard)=> (artboard.id === slice.artboardID)).forEach((item) => {
			item.slices.filter((itm)=> (itm.id !== slice.id)).forEach((itm)=> {
				if (rectContainsRect(frameToRect(slice.meta.frame), frameToRect(itm.meta.frame))) {
					slices.push(itm);
				}
			});
		});
	});

	return (slices);
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


const InviteTeamModal = (props)=> {
// 	console.log('InspectorPage.InviteTeamModal()', props);

	const { profile, upload, sentInvites } = props;

	return (<ContentModal type="PERCENT" closeable={true} title="Invite Team" onComplete={props.onComplete}>
		<div className="inspector-page-invite-modal-wrapper">
			{upload.title} ({upload.filename.split('/').pop()})< br/>
			{upload.description}< br/>
			<a href={buildInspectorURL(upload)} target="_blank" rel="noopener noreferrer">{buildInspectorURL(upload)}</a>< br/>
			<CopyToClipboard onCopy={()=> props.onCopyURL()} text={buildInspectorURL(upload)}>
				<button className="inspector-page-modal-button">Copy URL</button>
			</CopyToClipboard>
		</div>

		{(!sentInvites) && (<InviteTeamForm
			profile={profile}
			upload={upload}
			onSubmitted={props.onInviteTeamFormSubmitted}
		/>)}
	</ContentModal>);
};

const PartItem = (props)=> {
// 	console.log('InspectorPage.SlicePreviewItem()', props);

	const { id, filename, title, size } = props;

	return (<div data-slice-id={id} className="part-item"><Row vertical="center">
		<img src={`${filename}@3x.png`} className="part-item-image" width={size.width * 0.25} height={size.height * 0.25} alt={title} />
		<div className="part-item-title">{title}</div>
		<button className="tiny-button part-item-button" onClick={()=> props.onClick()}><FontAwesome name="download" /></button>
	</Row></div>);
};

const PartsList = (props)=> {
// 	console.log('InspectorPage.PartsList()', props);

	const { contents } = props;
	return (<div className="parts-list-wrapper">
		{contents.filter((slice)=> (slice.type === 'group')).map((slice, i)=> {
			return (
				<PartItem
					key={i}
					id={slice.id}
					filename={slice.filename}
					title={slice.title}
					size={slice.meta.frame.size}
					onClick={()=> props.onPartItem(slice.id)}
				/>
			);
		})}
	</div>);
};

const SliceRolloverItem = (props)=> {
// 	console.log('InspectorPage.SliceRolloverItem()', props);

	const className = (props.type === 'slice') ? 'slice-rollover-item slice-rollover-item-slice' : (props.type === 'hotspot') ? 'slice-rollover-item slice-rollover-item-hotspot' : (props.type === 'textfield') ? 'slice-rollover-item slice-rollover-item-textfield' : 'slice-rollover-item slice-rollover-item-group';
	const style = {
		top     : `${props.top}px`,
		left    : `${props.left}px`,
		width   : `${props.width}px`,
		height  : `${props.height}px`,
		zoom    : props.scale,
		display : (props.visible) ? 'block' : 'none'
	};

	return (
		<div data-slice-id={props.id} className={`${className}${(props.filled) ? '-filled' : ''}`} style={style} onMouseEnter={()=> props.onRollOver(props.offset)} onMouseLeave={()=> props.onRollOut()} onClick={()=> props.onClick(props.offset)} />
	);
};

function SpecsList(props) {
// 		console.log('InspectorPage.SpecsList()', props);

	const sliceStyles = (props.slice && props.slice.meta.styles && props.slice.meta.styles.length > 0) ? props.slice.meta.styles.pop() : null;
	const stroke = (sliceStyles && sliceStyles.border.length > 0) ? sliceStyles.border.pop() : null;
	const shadow = (sliceStyles && sliceStyles.shadow.length > 0) ? sliceStyles.shadow.pop() : null;
	const innerShadow = (sliceStyles && sliceStyles.innerShadow.length > 0) ? sliceStyles.innerShadow.pop() : null;

	const styles = (sliceStyles) ? {
		stroke : (stroke) ? {
			color     : stroke.color.toUpperCase(),
			position  : stroke.position,
			thickness : `${stroke.thickness}px`
		} : null,
		shadow : (shadow) ? {
			color  : shadow.color.toUpperCase(),
			offset : {
				x : shadow.offset.x,
				y : shadow.offset.y
			},
			spread : `${shadow.spread}px`,
			blur   : `${shadow.blur}px`
		} : null,
		innerShadow : (innerShadow) ? {
			color  : innerShadow.color.toUpperCase(),
			offset : {
				x : innerShadow.offset.x,
				y : innerShadow.offset.y
			},
			spread : `${innerShadow.spread}px`,
			blur   : `${innerShadow.blur}px`
		} : null
	} : null;

	return (
		<div className="inspector-page-specs-list-wrapper">
			<Row><Column flexGrow={1}>Name</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice) ? props.slice.title : ''}</Column></Row>
			<Row><Column flexGrow={1}>Type</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice) ? capitalizeText(props.slice.type, true) : ''}</Column></Row>
			<Row><Column flexGrow={1}>Export Size</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">W: {(props.slice) ? props.slice.meta.frame.size.width : 0}px H: {(props.slice) ? props.slice.meta.frame.size.height : 0}px</Column></Row>
			<Row><Column flexGrow={1}>Position</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">X: {(props.slice) ? props.slice.meta.frame.origin.x : 0}px Y: {(props.slice) ? props.slice.meta.frame.origin.y : 0}px</Column></Row>
			<Row><Column flexGrow={1}>Rotation</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice) ? props.slice.meta.rotation : 0}&deg;</Column></Row>
			<Row><Column flexGrow={1}>Opacity</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice) ? (props.slice.meta.opacity * 100) : 100}%</Column></Row>
			<Row><Column flexGrow={1}>Fills</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice) ? (props.slice.type === 'textfield' && props.slice.meta.font.color) ? props.slice.meta.font.color.toUpperCase() : props.slice.meta.fillColor.toUpperCase() : ''}</Column></Row>
			<Row><Column flexGrow={1}>Borders</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{''}</Column></Row>
			{(props.slice && props.slice.type === 'textfield') && (<>
				<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice.meta.font.family) ? props.slice.meta.font.family : ''} {(props.slice.meta.font.name) ? props.slice.meta.font.name : ''}</Column></Row>
				<Row><Column flexGrow={1}>Font Size</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{`${props.slice.meta.font.size}px`}</Column></Row>
				<Row><Column flexGrow={1}>Font Color</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice.meta.font.color) ? props.slice.meta.font.color.toUpperCase() : ''}</Column></Row>
				{/*<Row><Column flexGrow={1}>Text Alignment:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice.meta.font.alignment) ? capitalizeText(props.slice.meta.font.alignment) : 'Left'}</Column></Row>*/}
				<Row><Column flexGrow={1}>Line Spacing</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice.meta.font.lineHeight) ? `${props.slice.meta.font.lineHeight}px` : ''}</Column></Row>
				<Row><Column flexGrow={1}>Char Spacing</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice.meta.font.kerning) ? `${props.slice.meta.font.kerning.toFixed(2)}px` : '0'}</Column></Row>
			</>)}
			{/*{(styles) && (<>*/}
				{/*<Row><Column flexGrow={1}>Stroke:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(styles.stroke) ? `${capitalizeText(styles.stroke.position, true)} S: ${styles.stroke.thickness} ${styles.stroke.color}` : ''}</Column></Row>*/}
				{/*<Row><Column flexGrow={1}>Shadow:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(styles.shadow) ? `X: ${styles.shadow.offset.x} Y: ${styles.shadow.offset.y} B: ${styles.shadow.blur} S: ${styles.shadow.spread}` : ''}</Column></Row>*/}
				{/*<Row><Column flexGrow={1}>Inner Shadow:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(styles.innerShadow) ? `X: ${styles.innerShadow.offset.x} Y: ${styles.innerShadow.offset.y} B: ${styles.innerShadow.blur} S: ${styles.shadow.spread}` : ''}</Column></Row>*/}
				{/*<Row><Column flexGrow={1}>Blur:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(styles.innerShadow) ? `X: ${styles.innerShadow.offset.x} Y: ${styles.innerShadow.offset.y} B: ${styles.innerShadow.blur} S: ${styles.shadow.spread}` : ''}</Column></Row>*/}
			{/*</>)}*/}
			{(props.slice && props.slice.meta.padding) && (<Row>
				<Column flexGrow={1}>Padding</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{props.slice.meta.padding.top}px {props.slice.meta.padding.left}px {props.slice.meta.padding.bottom}px {props.slice.meta.padding.right}px</Column>
			</Row>)}
			{/*<Row><Column flexGrow={1}>Blend:</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice) ? capitalizeText(props.slice.meta.blendMode, true) : ''}</Column></Row>*/}
			{/*<Row><Column flexGrow={1}>Date</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice) ? (new Intl.DateTimeFormat('en-US', TIMESTAMP_OPTS).format(Date.parse(`${props.slice.added} GMT+0000`))) : ''}</Column></Row>*/}
			<Row><Column flexGrow={1}>Date</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.slice) ? (<Moment format={MOMENT_TIMESTAMP}>{`${props.slice.added.replace(' ', 'T')}Z`}</Moment>) : ''}</Column></Row>
			<Row><Column flexGrow={1}>Author</Column><Column flexGrow={1} horizontal="end" className="inspector-page-specs-list-val">{(props.upload) ? props.upload.creator.username : ''}</Column></Row>
		</div>
	);
}


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
			shownInvite  : true,
			sentInvites  : false,
			restricted   : false,
			percent      : 0,
			selectedTab  : 0,
			tooltip      : '',
			hoverOffset  : null,
			viewport     : {
				width  : 0,
				height : 0
			},
			x            : 0.5,
			y            : 0.5,
			scale        : 0.5,
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
			this.onRefreshUpload();
		}

		document.addEventListener('keydown', this.handleKeyDown.bind(this));
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
// 		console.log('InspectorPage.shouldComponentUpdate()', this.props, nextProps, this.state, nextState, nextContext);

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
// 		console.log('InspectorPage.componentDidUpdate()', prevProps, this.props, this.state);

		const { navigation, processing } = this.props;
		const { upload, viewport, scale } = this.state;

		if (navigation && navigation !== prevProps.navigation && navigation.uploadID !== 0) {
			this.onRefreshUpload();
		}

		if (upload && processing && this.processingInterval === null) {
			this.processingInterval = setInterval(this.onProcessingUpdate, 2500);
		}

		if (!processing && this.processingInterval) {
			clearInterval(this.processingInterval);
			this.processingInterval = null;
			this.onRefreshUpload();
		}

		if (artboardsWrapper.current && (viewport.width !== artboardsWrapper.current.clientWidth || viewport.height !== artboardsWrapper.current.clientHeight)) {
			const p1 = this.transformPoint({ x : 0.5, y : 0.5 });
			this.setState({
				viewport     : {
					width  : artboardsWrapper.current.clientWidth,
					height : artboardsWrapper.current.clientHeight
				},
				scrollOffset : {
					x : -Math.round((p1.x * artboardsWrapper.current.clientWidth) + ((artboardsWrapper.current.clientWidth * -0.5) * scale)),
					y : -Math.round((p1.y * artboardsWrapper.current.clientHeight) + ((artboardsWrapper.current.clientHeight * -0.5) * scale))
				}
			});
		}
	}

	componentWillUnmount() {
		console.log('InspectorPage.componentWillUnmount()', this.state);

		clearInterval(this.processingInterval);
		clearInterval(this.antsInterval);
		clearInterval(this.scrollInterval);

		this.processingInterval = null;
		this.antsInterval = null;
		this.scrollInterval = null;

		document.removeEventListener('keydown', this.handleKeyDown.bind(this));
	}

	handleArtboardRollOut = (event)=> {
// 		console.log('InspectorPage.handleArtboardRollOut()', event.target);
	};

	handleArtboardRollOver = (event)=> {
// 		console.log('InspectorPage.handleArtboardRollOver()', event.target);
		const artboardID = event.target.getAttribute('data-artboard-id');

		if (!this.antsInterval) {
			this.antsInterval = setInterval(this.onUpdateAnts, 75);
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

	handleCopyCode = ()=> {
		console.log('InspectorPage.handleCopyCode()');

		this.props.onPopup({
			type    : 'INFO',
			content : 'Copied to Clipboard!'
		});
	};

	handleCopyURL = ()=> {
		console.log('InspectorPage.handleCopyURL()');

		this.props.onPopup({
			type    : 'INFO',
			content : 'Copied to Clipboard!'
		});
	};

	handleCommentChange = (event)=> {
// 		console.log('InspectorPage.handleCommentChange()', event);

		event.persist();
		if (/[\r\n]/.exec(event.target.value)) {
			this.onSubmitComment(event);

		} else {
			this.setState({ [event.target.name] : event.target.value })
		}
	};

	handleDownload = ()=> {
// 		console.log('InspectorPage.handleDownload()');

		const { upload, slice } = this.state;
		const sliceIDs = buildSlicePreviews(upload, slice).map((slice)=> (slice.id)).join(',');
		makeDownload(`http://cdn.designengine.ai/slices.php?title=${slice.title}&slice_ids=${sliceIDs}`);
	};

	handleInviteTeamFormSubmitted = (result)=> {
		console.log('InspectorPage.handleInviteTeamFormSubmitted()', result);
		this.setState({ sentInvites : true });
	};

	handleKeyDown = (event)=> {
// 		console.log('InspectorPage.handleKeyDown()', event);

		if (event.keyCode === PLUS_KEY) {
			this.handleZoom(1);

		} else if (event.keyCode === MINUS_KEY) {
			this.handleZoom(-1);
		}
	};

	handlePanAndZoom = (x, y, scale)=> {
// 		console.log('InspectorPage.handlePanAndZoom()', x, y, scale);

		const { viewport } = this.state;
		const p1 = this.transformPoint({ x : 0.5, y : 0.5 });

		this.setState({
			x            : x,
			y            : y,
			scale        : Math.min(Math.max(scale, ZOOM_NOTCHES[0]), ZOOM_NOTCHES.slice(-1)[0]),
			scrollOffset : {
				x : -Math.round((p1.x * viewport.width) + ((viewport.width * -0.5) * scale)),
				y : -Math.round((p1.y * viewport.height) + ((viewport.height * -0.5) * scale))
			},
			tooltip      : `${Math.round(Math.min(Math.max(scale, ZOOM_NOTCHES[0]), ZOOM_NOTCHES.slice(-1)[0]) * 100)}%`
		});

		setTimeout(()=> {
			this.setState({ tooltip : '' });
		}, 1000);
	};

	handlePanEnd = (event)=> {
// 		console.log('InspectorPage.handlePanEnd()', event);
		this.setState({ scrolling : false });
	};

	handlePanMove = (x, y)=> {
// 		console.log('InspectorPage.handlePanMove()', x, y);

		const { scale, viewport } = this.state;
		const p1 = this.transformPoint({ x : 0.5, y : 0.5 });
		const scrollOffset = {
			x : -Math.round((p1.x * viewport.width) + ((viewport.width * -0.5) * scale)),
			y : -Math.round((p1.y * viewport.height) + ((viewport.height * -0.5) * scale))
		};

		const scrolling = true;
		this.setState({ x, y, scrollOffset, scrolling });
	};

	handlePanStart = (event)=> {
// 		console.log('InspectorPage.handlePanStart()', event);
	};

	handlePartItem = (sliceID)=> {
// 		console.log('InspectorPage.handlePartItem()', sliceID);
		makeDownload(`http://cdn.designengine.ai/slice.php?slice_id=${sliceID}`);
	};

	handleSliceClick = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceClick()', ind, slice, offset);

		const { upload, section } = this.state;
		let { tabs } = this.state;
		let artboard = null;

		const pages = [...upload.pages];
		pages.forEach((page)=> {
			page.artboards.filter((artboard)=> (artboard.id === slice.artboardID)).forEach((item) => {
				artboard = item;
			});
		});

		const css = toCSS(slice);
		const reactCSS = toReactCSS(slice);
		const swift = toSwift(slice, artboard);

		if (section === 'inspect') {
			tabs[0].contents = css.html;
			tabs[0].syntax = css.syntax;
			tabs[1].contents = reactCSS.html;
			tabs[1].syntax = reactCSS.syntax;
			tabs[2].contents = swift.html;
			tabs[2].syntax = swift.syntax;

		} else if (section === 'parts') {
			tabs[0].contents = buildSlicePreviews(upload, slice);
		}

		this.setState({
			tabs       : tabs,
			hoverSlice : null,
			slice      : slice,
			offset     : offset
		});
	};

	handleSliceRollOut = (ind, slice)=> {
// 		console.log('InspectorPage.handleSliceRollOut()', ind, slice);

		const { upload, section } = this.state;
		let { tabs } = this.state;
		let artboard = null;

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
			const pages = [...upload.pages];
			pages.forEach((page)=> {
				page.artboards.filter((artboard)=> (artboard.id === this.state.slice.artboardID)).forEach((item) => {
					artboard = item;
					item.slices.filter((itm)=> (itm.id !== this.state.slice.id)).forEach((itm)=> {
						itm.filled = rectContainsRect(frameToRect(this.state.slice.meta.frame), frameToRect(itm.meta.frame));
					});
				});
			});

			const css = toCSS(this.state.slice);
			const reactCSS = toReactCSS(this.state.slice);
			const swift = toSwift(this.state.slice, artboard);

			if (section === 'inspect') {
				tabs[0].contents = css.html;
				tabs[0].syntax = css.syntax;
				tabs[1].contents = reactCSS.html;
				tabs[1].syntax = reactCSS.syntax;
				tabs[2].contents = swift.html;
				tabs[2].syntax = swift.syntax;

			} else if (section === 'parts') {
				tabs[0].contents = buildSlicePreviews(upload, this.state.slice);
			}
		}

		this.setState({
			tabs       : tabs,
			hoverSlice : null
		});
	};

	handleSliceRollOver = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceRollOver()', ind, slice, offset);


		const { upload, section } = this.state;
		let { tabs } = this.state;
		let artboard = null;

		const pages = [...upload.pages];
		pages.forEach((page)=> {
			page.artboards.filter((artboard)=> (artboard.id === slice.artboardID)).forEach((item) => {
				artboard = item;
				item.slices.filter((itm)=> (itm.id !== slice.id)).forEach((itm)=> {
					itm.filled = rectContainsRect(frameToRect(slice.meta.frame), frameToRect(itm.meta.frame));
				});
			});
		});

		upload.pages = pages;
		this.setState({ upload });

		const css = toCSS(slice);
		const reactCSS = toReactCSS(slice);
		const swift = toSwift(slice, artboard);

		if (section === 'inspect') {
			tabs[0].contents = css.html;
			tabs[0].syntax = css.syntax;
			tabs[1].contents = reactCSS.html;
			tabs[1].syntax = reactCSS.syntax;
			tabs[2].contents = swift.html;
			tabs[2].syntax = swift.syntax;

		} else if (section === 'parts') {
			tabs[0].contents = buildSlicePreviews(upload, slice);
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
// 		console.log('InspectorPage.handleVote()', commentID, score);

		let formData = new FormData();
		formData.append('action', 'VOTE_COMMENT');
		formData.append('user_id', this.props.profile.id);
		formData.append('comment_id', commentID);
		formData.append('value', score);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('VOTE_COMMENT', response.data);
				this.onRefreshUpload();
			}).catch((error) => {
		});
	};

	handleZoom = (direction)=> {
		console.log('InspectorPage.handleZoom()', direction);

		const { x, y, scale } = this.state;

		if (direction === 0) {
			this.handlePanAndZoom(x + 0.01, y + 0.01, ZOOM_NOTCHES[5]);

		} else {
			let ind = -1;
			ZOOM_NOTCHES.forEach((amt, i)=> {
				if (scale === amt) {
					ind = i;
				}
			});

			if (ind === -1) {
				let diff = 3;
				ZOOM_NOTCHES.forEach((amt, i)=> {
					if (Math.abs(amt - scale) < diff) {
						diff = Math.abs(amt - scale);
						ind = i;
					}
				});
			}

			this.handlePanAndZoom(x + 0.01, y + 0.01, ZOOM_NOTCHES[Math.min(Math.max(0, ind + direction), ZOOM_NOTCHES.length - 1)]);
		}
	};

	onDrop = (files)=> {
		console.log('InspectorPage.onDrop()', files);
		const { id, email } = this.props.profile;

		if (files.length > 0 && files[0].name.split('.').pop() === 'zip') {
			const file = files.pop();
			if (file.size < 100 * (1024 * 1024)) {
				this.setState({ uploading : true });
				const config = {
					headers            : { 'content-type' : 'multipart/form-data' },
					onDownloadProgress : (progressEvent)=> {},
					onUploadProgress   : (progressEvent)=> {
// 							console.log('InspectorPage.onUploadProgress()', progressEvent);

						const { loaded, total } = progressEvent;
						const percent = Math.round((loaded * 100) / total);
						this.setState({
							percent : percent,
							tooltip : `${percent}%`
						});

						if (progressEvent.loaded >= progressEvent.total) {
							this.setState({
								uploading : false,
								tooltip   : ''
							});

							let formData = new FormData();
							formData.append('action', 'FILES');
							formData.append('upload_id', `${this.props.navigation.uploadID}`);
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
				axios.post(`http://cdn.designengine.ai/files/upload.php?user_id=${id}&upload_id=${this.props.navigation.uploadID}`, formData, config)
					.then((response) => {
						console.log("UPLOAD", response.data);
					}).catch((error) => {
					sendToSlack(`*${email}* failed uploading file _${file.name}_`);
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
			formData.append('artboard_id', `${this.props.navigation.artboardID}`);
			formData.append('content', this.state.comment);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('ADD_COMMENT', response.data);
					this.setState({ comment : '' });
					this.onRefreshUpload();
				}).catch((error) => {
			});
		}
	};

	onProcessingUpdate = ()=> {
		const { upload } = this.state;

		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', upload.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_STATUS', response.data);
				const processingState = parseInt(response.data.status.state, 10);

				if (processingState === 1) {
				} else if (processingState === 2) {
					this.onRefreshUpload();

				} else if (processingState === 3) {
					this.props.onProcessing(false);
					clearInterval(this.processingInterval);
					this.processingInterval = null;
					this.onRefreshUpload();

				} else if (processingState === 4) {
					// processing error
				}
			}).catch((error) => {
		});
	};

	onRefreshUpload = ()=> {
		console.log('InspectorPage.onRefreshUpload()', this.props);

		const { uploadID } = this.props.navigation;
		const { section, scale } = this.state;

		this.setState({ tooltip : 'Loading…' });

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
							filename  : (artboard.filename.includes('@3x')) ? artboard.filename : `${artboard.filename}@3x.png`,
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
					formData.append('upload_id', uploadID);
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
									syntax   : null,
									added    : null
								}, {
									id       : 1,
									title    : 'React CSS',
									filename : 'React CSS',
									contents : null,
									syntax   : null,
									added    : null
								}, {
									id       : 2,
									title    : 'Swift',
									filename : 'Swift',
									contents : null,
									syntax   : null,
									added    : null
								}
							]);

							this.setState({
								upload  : upload,
								tabs    : tabs,
								tooltip : ''
							});

						}).catch((error) => {
					});

				} else if (section === 'parts') {
					const tabs = [
						{
							id       : 0,
							title    : 'Parts',
							filename : 'Parts',
							contents : null,
							syntax   : null,
							added    : null
						}
					];

					this.setState({
						upload  : upload,
						tabs    : tabs,
						tooltip : ''
					});

				} else if (section === 'colors') {
					const tabs = [
						{
							id       : 0,
							title    : 'Primary',
							filename : 'Primary',
							contents : null,
							syntax   : null,
							added    : null
						}, {
							id       : -1,
							title    : 'Secondary',
							filename : 'Secondary',
							contents : null,
							syntax   : null,
							added    : null
						}, {
							id       : -2,
							title    : 'Tertiary',
							filename : 'Tertiary',
							contents : null,
							syntax   : null,
							added    : null
						}
					];

					this.setState({
						upload  : upload,
						tabs    : tabs,
						tooltip : ''
					});

				} else if (section === 'typography') {
					const tabs = [
						{
							id       : 0,
							title    : 'Headlines',
							filename : 'Headlines',
							contents : null,
							syntax   : null,
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
							syntax   : null,
							added    : null
						}
					];

					this.setState({
						upload  : upload,
						tabs    : tabs,
						tooltip : ''
					});
				}
			}).catch((error) => {
		});
	};

	onUpdateCanvas = ()=> {
		const { scale, offset, scrollOffset } = this.state;
		const { slice, hoverSlice } = this.state;
		const context = canvas.current.getContext('2d');
		context.clearRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);


// 		context.fillStyle = 'rgba(0, 0, 0, 0.25)';
// 		context.fillRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		if (slice) {
			const selectedSrcFrame = slice.meta.frame;
			const selectedOffset = {
				x : offset.x - scrollOffset.x,
				y : offset.y - scrollOffset.y
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
			context.fillText(`${selectedSrcFrame.size.width}PX`, selectedFrame.origin.x + (selectedFrame.size.width * 0.5), selectedFrame.origin.y - 1);

			context.textAlign = 'right';
			context.textBaseline = 'middle';
			context.fillText(`${selectedSrcFrame.size.height}PX`, selectedFrame.origin.x - 2, selectedFrame.origin.y + (selectedFrame.size.height * 0.5));

			context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
			context.beginPath();
			context.setLineDash([4, 2]);
			context.lineDashOffset = this.antsOffset;
			context.strokeRect(selectedFrame.origin.x, selectedFrame.origin.y, selectedFrame.size.width, selectedFrame.size.height);
		}

		if (hoverSlice) {
			const srcFrame = hoverSlice.meta.frame;

			const hoverOffset = {
				x : this.state.hoverOffset.x - scrollOffset.x,
				y : this.state.hoverOffset.y - scrollOffset.y
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

// 			console.log('HOVER:', hoverOffset, frame.origin);

			context.fillStyle = 'rgba(0, 0, 0, 0.5)';
			context.fillStyle = (hoverSlice.type === 'slice') ? 'rgba(255, 181, 18, 0.5)' : (hoverSlice.type === 'hotspot') ? 'rgba(62, 84, 255, 0.5)' : (hoverSlice.type === 'textfield') ? 'rgba(255, 88, 62, 0.5)' : 'rgba(62, 255, 109, 0.5)';
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
			context.fillText(`${srcFrame.size.width}PX`, frame.origin.x + (frame.size.width * 0.5), frame.origin.y - 1);

			context.textAlign = 'right';
			context.textBaseline = 'middle';
			context.fillText(`${srcFrame.size.height}PX`, frame.origin.x - 2, frame.origin.y + (frame.size.height * 0.5));
		}
	};

	onUpdateAnts = ()=> {
		if (canvas.current) {
			this.antsOffset = (++this.antsOffset % 16);
			this.onUpdateCanvas();
		}
	};

	transformPoint = ({ x, y })=> {
// 		console.log('InspectorPage.transformPoint()', x, y);
		const { scale } = this.state;
		return ({
			x : 0.5 + (scale * (x - this.state.x)),
			y : 0.5 + (scale * (y - this.state.y))
		});
	};


	render() {
		const { profile, processing } = this.props;

		const { section, upload, slice, hoverSlice, tabs, scale, selectedTab, scrolling, viewport, x, y, percent } = this.state;
		const { tooltip, restricted, shownInvite, sentInvites } = this.state;


		const activeSlice = (hoverSlice) ? hoverSlice : slice;
		const p1 = this.transformPoint({ x : 0.5, y : 0.5 });
		const artboards = (upload) ? upload.pages.map((page)=> {
			return (page.artboards);
		}).flat() : [];


		const artboardsStyle = {
			position  : 'absolute',
			width     : `${this.size.width * scale}px`,
			height    : `${this.size.height * scale}px`,
			transform : `translate(${p1.x * viewport.width}px, ${p1.y * viewport.height}px) translate(${(viewport.width * -0.5) * scale}px, ${(viewport.height * -0.5) * scale}px)`
		};

		const canvasStyle = {
			top     : `${-((p1.y * viewport.height) + ((viewport.height * -0.5) * scale))}px`,
			left    : `${-((p1.x * viewport.width) + ((viewport.width * -0.5) * scale))}px`,
			display : (scrolling) ? 'none' : 'block'
		};
		const progressStyle = { width : `${percent}%` };


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
				top            : `${Math.floor(offset.y)}px`,
				left           : `${Math.floor(offset.x)}px`,
				width          : `${Math.floor(scale * artboard.meta.frame.size.width)}px`,
				height         : `${Math.floor(scale * artboard.meta.frame.size.height)}px`,
				background     : `#111111 url("${artboard.filename}") no-repeat center`,
// 				backgroundSize : 'cover',
// 				backgroundSize : '100% auto',
				backgroundSize : `${Math.floor(scale * artboard.meta.frame.size.width)}px ${Math.floor(scale * artboard.meta.frame.size.height)}px`,
				border         : '2px dotted #00ff00'
			};

			const sliceWrapperStyle = {
				position : 'absolute',
				top      : `${Math.floor(offset.y)}px`,
				left     : `${Math.floor(offset.x)}px`,
				width    : `${(scale * artboard.meta.frame.size.width)}px`,
				height   : `${(scale * artboard.meta.frame.size.height)}px`
			};

			const groupSlices = artboard.slices.filter((slice)=> (slice.type === 'group')).map((slice, i) => (
				<SliceRolloverItem
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
					onClick={(offset) => this.handleSliceClick(i, slice, offset)} />)
			);

			const hotspotSlices = artboard.slices.filter((slice)=> (slice.type === 'hotspot')).map((slice, i) => (
				<SliceRolloverItem
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
					onClick={(offset) => this.handleSliceClick(i, slice, offset)} />)
			);

			const textfieldSlices = artboard.slices.filter((slice)=> (slice.type === 'textfield')).map((slice, i) => (
				<SliceRolloverItem
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
					onClick={(offset) => this.handleSliceClick(i, slice, offset)} />)
			);

			const sliceSlices = artboard.slices.filter((slice)=> (slice.type === 'slice')).map((slice, i) => (
				<SliceRolloverItem
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
					onClick={(offset) => this.handleSliceClick(i, slice, offset)} />)
			);

			artboardImages.push(
				<div key={i} style={artboardStyle}>
					<div className="inspector-page-caption">{artboard.title}</div>
				</div>
			);

			slices.push(
				<div key={i} data-artboard-id={artboard.id} className="inspector-page-slices-wrapper" style={sliceWrapperStyle} onMouseOver={this.handleArtboardRollOver} onMouseOut={this.handleArtboardRollOut}>
					<div data-artboard-id={artboard.id} className="inspector-page-group-slice-wrapper">{groupSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-hotspot-slice-wrapper">{hotspotSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-textfield-slice-wrapper">{textfieldSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-slice-slice-wrapper">{sliceSlices}</div>
				</div>
			);

			offset.x += Math.round(50 + (artboard.meta.frame.size.width * scale));
		});

		artboardImages = (!restricted) ? artboardImages : [];
		slices = (!restricted) ? slices : [];


// 		console.log('InspectorPage.render()', this.state);

// 		console.log('InspectorPage.render()', this.props, this.state);
// 		console.log('InspectorPage.render()', (artboardsWrapper.current) ? artboardsWrapper.current.scrollTop : 0, (artboardsWrapper.current) ? artboardsWrapper.current.scrollLeft : 0, scale);
// 		console.log('InspectorPage:', window.performance.memory);

		return (<>
			{(this.state.uploading) && (<div className="upload-progress-bar-wrapper">
				<div className="upload-progress-bar" style={progressStyle} />
			</div>)}
			<div className="page-wrapper inspector-page-wrapper">
				<div className="inspector-page-content">
					<InteractiveDiv
						x={x}
						y={y}
						scale={scale}
						scaleFactor={ZOOM_FACTOR}
						minScale={ZOOM_NOTCHES[0]}
						maxScale={ZOOM_NOTCHES.slice(-1)[0]}
						onPanAndZoom={this.handlePanAndZoom}
						ignorePanOutside={true}
						renderOnChange={true}
						style={{ width : '100%', height : '100%' }}
						onPanStart={this.handlePanStart}
						onPanMove={this.handlePanMove}
						onPanEnd={this.handlePanEnd}>
						<div className="inspector-page-artboards-wrapper" ref={artboardsWrapper}>
							{(artboards.length > 0) && (<div style={artboardsStyle}>
								{artboardImages}
								<div className="inspector-page-canvas-wrapper" style={canvasStyle} ref={canvasWrapper}>
									<canvas width={(artboardsWrapper.current) ? artboardsWrapper.current.clientWidth : 0} height={(artboardsWrapper.current) ? artboardsWrapper.current.clientHeight : 0} ref={canvas}>Your browser does not support the HTML5 canvas tag.</canvas>
								</div>
								{slices}
							</div>)}
						</div>
					</InteractiveDiv>
					{(artboards.length > 0) && (<div className="inspector-page-zoom-wrapper">
						<button className={`inspector-page-float-button${(scale >= Math.max(...ZOOM_NOTCHES)) ? ' button-disabled' : ''}`} onClick={()=> this.handleZoom(1)}><img className="inspector-page-float-button-image" src={(scale < 3) ? enabledZoomInButton : disabledZoomInButton} alt="+" /></button><br />
						<button className={`inspector-page-float-button${(scale <= Math.min(...ZOOM_NOTCHES)) ? ' button-disabled' : ''}`} onClick={()=> this.handleZoom(-1)}><img className="inspector-page-float-button-image" src={(scale > 0.03) ? enabledZoomOutButton : disabledZoomOutButton} alt="-" /></button><br />
						<button className={`inspector-page-float-button${(scale === 1.0) ? ' button-disabled' : ''}`} onClick={()=> this.handleZoom(0)}><img className="inspector-page-float-button-image" src={(scale !== 1.0) ? enabledZooResetButton : disabledZoomResetButton} alt="0" /></button>
					</div>)}

					{(upload && profile && upload.creator.user_id === profile.id && artboards.length > 0 && shownInvite) && (<div className="inspector-page-modal-button-wrapper">
						<button className="tiny-button" onClick={()=> this.setState({ shownInvite : false })}>Invite Team</button>
					</div>)}
				</div>

				{(section === 'inspect') && (<div className="inspector-page-panel">
					<div className="inspector-page-panel-split-content-wrapper">
						<ul className="inspector-page-panel-tab-wrapper">
							{(tabs.map((tab, i) => (<li key={i} className={`inspector-page-panel-tab${(selectedTab === i) ? ' inspector-page-panel-tab-selected' : ''}`} onClick={()=> this.handleTab(i)}>{tab.title}</li>)))}
						</ul>
						<div className="inspector-page-panel-tab-content-wrapper">
							{(tabs.filter((tab, i)=> (i === selectedTab)).map((tab, i) => {
								return (<div key={i} className="inspector-page-panel-tab-content">
									<span dangerouslySetInnerHTML={{ __html : (tab.contents) ? String(JSON.parse(tab.contents).replace(/ /g, '&nbsp;').replace(/\n/g, '<br />')) : '' }} />
								</div>);
							}))}
						</div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<CopyToClipboard onCopy={()=> this.handleCopyCode()} text={(tabs[selectedTab]) ? tabs[selectedTab].syntax : ''}>
							<button className="inspector-page-panel-button">Copy</button>
						</CopyToClipboard>
					</div>
					<div className="inspector-page-panel-split-content-wrapper">
						<ul className="inspector-page-panel-tab-wrapper">
							<li className={'inspector-page-panel-tab inspector-page-panel-tab-selected'}>Specs</li>
							{(section === 'parts') && (<li className={'inspector-page-panel-tab'}>Parts</li>)}
						</ul>
						<div className="inspector-page-panel-tab-content-wrapper">
							<div className="inspector-page-panel-tab-content">
								<SpecsList upload={upload} slice={activeSlice} />
							</div>
						</div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<CopyToClipboard onCopy={()=> this.handleCopyCode()} text={(activeSlice) ? toSpecs(activeSlice) : ''}>
							<button className="inspector-page-panel-button">Copy</button>
						</CopyToClipboard>
					</div>
				</div>)}

				{(section === 'parts') && (<div className="inspector-page-panel">
					<div className="inspector-page-panel-full-content-wrapper">
						<ul className="inspector-page-panel-tab-wrapper">
							{(tabs.map((tab, i) => (<li key={i} className={`inspector-page-panel-tab${(selectedTab === i) ? ' inspector-page-panel-tab-selected' : ''}`} onClick={()=> this.handleTab(i)}>{tab.title}</li>)))}
						</ul>
						<div className="inspector-page-panel-tab-content-wrapper">
							{(tabs.filter((tab, i)=> (i === selectedTab)).map((tab, i) => {
								return ((tab.contents)
									? (<PartsList key={i} contents={tab.contents} onPartItem={(sliceID)=> this.handlePartItem(sliceID)} onDownload={this.handleDownload} />)
									: ('')
								);
							}))}
						</div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<button className="inspector-page-panel-button" onClick={()=> this.handleDownload()}><FontAwesome name="download" style={{ fontSize:'12px', marginRight:'8px' }} />Download All</button>
					</div>
				</div>)}
			</div>

			{(tooltip !== '') && (<div className="inspector-page-tooltip">{tooltip}</div>)}
			{(restricted) && (<ContentModal
				closeable={false}
				onComplete={()=> this.props.onPage('register')}>
					This project is private, you must be logged in as one of its team members to view!
			</ContentModal>)}

			{(upload && profile && !restricted && upload.creator.user_id === profile.id && (!shownInvite || processing)) && (<InviteTeamModal
				profile={profile}
				upload={upload}
				sentInvites={sentInvites}
				onCopyURL={this.handleCopyURL}
				onInviteTeamFormSubmitted={this.handleInviteTeamFormSubmitted}
				onComplete={()=> this.setState({ shownInvite : true })}
				/>
			)}
		</>);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InspectorPage);
