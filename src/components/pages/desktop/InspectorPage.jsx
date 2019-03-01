
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
// import moment from 'moment-timezone';
import qs from 'qs';
import ReactNotifications from 'react-browser-notifications';
import cookie from 'react-cookies';
import CopyToClipboard from 'react-copy-to-clipboard';
import FontAwesome from 'react-fontawesome';
// import { Helmet } from 'react-helmet';
import ImageLoader from 'react-loading-image';
import Moment from 'react-moment';
import panAndZoomHoc from 'react-pan-and-zoom-hoc';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import BaseDesktopPage from './BaseDesktopPage';
import ContentModal from '../../elements/ContentModal';
import { POPUP_TYPE_INFO } from '../../elements/Popup';
import TutorialOverlay from '../../elements/TutorialOverlay';

import { MOMENT_TIMESTAMP } from '../../../consts/formats';
import { ARROW_LT_KEY, ARROW_RT_KEY, MINUS_KEY, PLUS_KEY } from '../../../consts/key-codes';
import { CANVAS, PAN_ZOOM, SECTIONS, STATUS_INTERVAL, TAB_CONTENT_PLACEHOLDERS } from '../../../consts/inspector';
import { DE_LOGO_SMALL } from '../../../consts/uris';
import { setRedirectURI } from '../../../redux/actions';
import {
	areaSize,
	buildInspectorPath,
	buildInspectorURL,
	capitalizeText,
	convertURISlug,
	cropFrame,
	epochDate,
	frameToRect,
	isSizeDimensioned,
	limitString,
	makeDownload,
	rectContainsRect} from '../../../utils/funcs.js';
import { fontSpecs, toAndroid, toCSS, toReactCSS, toSpecs, toSwift } from '../../../utils/inspector-langs.js';
import { trackEvent } from '../../../utils/tracking';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';
import bannerPanel from '../../../assets/json/banner-panel';
import inspectorTabSets from '../../../assets/json/inspector-tab-sets';


const InteractiveDiv = panAndZoomHoc('div');
const artboardsWrapper = React.createRef();
const canvasWrapper = React.createRef();
const canvas = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		deeplink    : state.deeplink,
		profile     : state.userProfile,
		redirectURI : state.redirectURI
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		setRedirectURI : (url)=> dispatch(setRedirectURI(url))
	});
};


const artboardForID = (upload, artboardID)=> {
	return (flattenUploadArtboards(upload).find((artboard)=> (artboard.id === artboardID)));
};

const fillGroupPartItemSlices = (upload, slice)=> {
// 	console.log('fillGroupPartItemSlices()', upload, slice);
	let slices = [slice];

	artboardForID(upload, slice.artboardID).slices.filter((item)=> (item.type !== 'symbol_child' && item.id !== slice.id)).forEach((item)=> {
		if (rectContainsRect(frameToRect(slice.meta.frame), frameToRect(item.meta.frame))) {
			slices.push(item);
		}
	});

	return (slices);
};

const flattenUploadArtboards = (upload)=> {
// 	console.log('flattenUploadArtboards()', upload);

	return ([...upload.pages].flatMap((page)=> (page.artboards)).map((artboard)=> ({
		id        : artboard.id << 0,
		pageID    : artboard.page_id << 0,
		uploadID  : artboard.upload_id << 0,
		title     : artboard.title,
		pageTitle : artboard.page_title,
		filename  : artboard.filename,
		creator   : artboard.creator,
		meta      : (typeof artboard.meta === 'string') ? JSON.parse(artboard.meta) : artboard.meta,
		slices    : [...artboard.slices].map((slice, i)=> ({
			id         : slice.id << 0,
			artboardID : artboard.id << 0,
			title      : slice.title,
			type       : slice.type,
			filename   : slice.filename,
			meta       : (typeof slice.meta === 'string') ? JSON.parse(slice.meta) : slice.meta,
			added      : slice.added,
			filled     : false,
			children   : slice.children
		})),
		added     : artboard.added
	})).reverse());
};

const slicesByArea = (slices)=> {
// 	console.log('slicesByArea()', slices);
	return(slices.sort((s1, s2)=> ((areaSize(s1.meta.frame.size) < areaSize(s2.meta.frame.size)) ? -1 : (areaSize(s1.meta.frame.size) > areaSize(s2.meta.frame.size)) ? 1 : 0)));
};


const drawCanvasSliceBorder = (context, frame)=> {
	context.strokeStyle = CANVAS.slices.borderColor;
	context.lineWidth = CANVAS.slices.lineWidth;
	context.setLineDash([]);
	context.beginPath();
	context.strokeRect(frame.origin.x + 1, frame.origin.y + 1, frame.size.width - 2, frame.size.height - 2);
	context.stroke();
};

const drawCanvasSliceFill = (context, frame, color)=> {
	context.fillStyle = color;
	context.fillRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
};

const drawSliceGuides = (context, frame, size, color)=> {
	context.strokeStyle = color;
	context.lineWidth = CANVAS.guides.lineWidth;
	context.setLineDash(CANVAS.guides.lineDash);
	context.lineDashOffset = 0;
	context.beginPath();
	context.moveTo(0, frame.origin.y); // h-top
	context.lineTo(size.width, frame.origin.y);
	context.moveTo(0, frame.origin.y + frame.size.height); // h-bottom
	context.lineTo(size.width, frame.origin.y + frame.size.height);
	context.moveTo(frame.origin.x, 0); // v-left
	context.lineTo(frame.origin.x, size.height);
	context.moveTo(frame.origin.x + frame.size.width, 0); // v-right
	context.lineTo(frame.origin.x + frame.size.width, size.height);
	context.stroke();
};

const drawCanvasSliceMarchingAnts = (context, frame, offset)=> {
	context.strokeStyle = CANVAS.marchingAnts.stroke;
	context.lineWidth = CANVAS.marchingAnts.lineWidth;
	context.setLineDash(CANVAS.marchingAnts.lineDash);
	context.lineDashOffset = offset;
	context.beginPath();
	context.strokeRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
	context.stroke();
};

const drawCanvasSliceTooltip = (context, text, origin, maxWidth=-1)=> {
	maxWidth = (maxWidth === -1) ? 500 : maxWidth;

	let caption = text;
	let txtWidth = context.measureText(caption.toUpperCase()).width << 0;
	while ((txtWidth + CANVAS.caption.padding) > maxWidth) {
		caption = `${caption.substring(0, -3)}…`;
		txtWidth = context.measureText(caption.toUpperCase()).width << 0;
		if (caption.length === 1) {
			break;
		}
	}

	const txtMetrics = {
		width   : txtWidth,
		height  : CANVAS.caption.height,
		padding : CANVAS.caption.padding
	};

	context.fillStyle = CANVAS.caption.bgColor;
	context.fillRect(origin.x + 1, (origin.y - txtMetrics.height), (txtMetrics.width + (txtMetrics.padding * 2)) - 2, txtMetrics.height);

	context.strokeStyle = CANVAS.caption.lineColor;
	context.lineWidth = 1;
	context.setLineDash([]);
	context.beginPath();
	context.strokeRect(origin.x + 1, (origin.y - txtMetrics.height), (txtMetrics.width + (txtMetrics.padding * 2)) - 2, txtMetrics.height);
	context.stroke();

	context.fillStyle = CANVAS.caption.textColor;
	context.fillText(caption.toUpperCase(), txtMetrics.padding + origin.x, txtMetrics.padding + (origin.y - txtMetrics.height));
};



const ArtboardsList = (props)=> {
// 	console.log('InspectorPage.ArtboardsList()', props);

	const { contents } = props;
	return ((contents.length > 0) ? <div className="artboards-list-wrapper">
		{contents.map((artboard, i)=> {
			const { meta } = artboard;

			return (
				<ArtboardListItem
					key={i}
					id={artboard.id}
					filename={`${artboard.filename}@1x.png`}
					title={artboard.title}
					size={meta.frame.size}
					onClick={()=> {trackEvent('button', 'change-artboard', null, artboard.id); props.onArtboardListItem(artboard);}}
				/>
			);
		})}
	</div> : <div className="artboards-list-wrapper">{TAB_CONTENT_PLACEHOLDERS.ARTBOARDS}</div>);
};

const ArtboardListItem = (props)=> {
// 	console.log('InspectorPage.ArtboardListItem()', props)

	const { id, filename, title, size } = props;

	const thumbStyle = {
		width  : `${size.width * 0.25}px`,
		height : `${size.height * 0.25}px`
	};

	let errored = false;

	return (<div data-slice-id={id} className="artboard-list-item" onClick={()=> props.onClick()}><Row vertical="center">
		<div className="artboard-list-item-content-wrapper">
			<img className="artboard-list-item-image" style={thumbStyle} src={filename} alt={title} />
			<div className="artboard-list-item-title">{limitString(title, Math.max(26, 1))}</div>
		</div>
		{(!errored) && (<button className="tiny-button artboard-list-item-button" onClick={()=> props.onClick()}><FontAwesome name="download" /></button>)}
	</Row></div>);
};

const ColorSwatch = (props)=> {
// 	console.log('InspectorPage.ColorSwatch()', props);

	const { fill } = props;
	return (<div className="inspector-page-color-swatch" style={{ backgroundColor : fill }} />);
};

const FilingTabContent = (props)=> {
// 	console.log('InspectorPage.FilingTabContent()', props);

	const { tab } = props;
	const { type, contents } = tab;

	return (<div key={tab.id} className="filing-tab-content">
		{(!type || type === 'json_html') && (<span dangerouslySetInnerHTML={{ __html : (contents && contents.length > 0) ? String(JSON.parse(contents).replace(/ /g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt').replace(/\n/g, '<br />')) : TAB_CONTENT_PLACEHOLDERS.CODE }} />)}
		{(type === 'component') && (contents)}
	</div>);
};

const FilingTabSet = (props)=> {
// 	console.log('InspectorPage.FilingTabSet()', props);

	const { tabs, activeTab } = props;
	return (<div className="filing-tab-set">
		<ul className="filing-tab-set-title-wrapper">
			{tabs.map((tab, i)=> (
				<FilingTabTitle
					key={i}
					tab={tab}
					selected={activeTab && tab.id === activeTab.id}
					onClick={()=> props.onTabClick(tab)}
				/>
			))}
		</ul>

		<div className="filing-tab-set-content-wrapper">
			{tabs.filter((tab)=> (activeTab && tab.id === activeTab.id)).map((tab, i)=> (
				<FilingTabContent
					key={i}
					tab={tab}
					onClick={()=> props.onContentClick(tab)}
				/>
			))}
		</div>
	</div>);
};

const FilingTabTitle = (props)=> {
// 	console.log('InspectorPage.FilingTabTitle()', props);

	const { tab, selected } = props;
	const { title } = tab;

	const className = `filing-tab-title${(!title || title.length === 0) ? ' filing-tab-title-blank' : ''}${(selected) ? ' filing-tab-title-selected' : ''}`;
	return (<React.Fragment key={tab.id}>
		<li className={className} onClick={()=> props.onClick()}>{title}</li>
	</React.Fragment>);
};

const InspectorFooter = (props)=> {
// 	console.log('InspectorPage.InspectorFooter()', props);

	const { section, scale, fitScale, artboards, processing } = props;
	const prevArtboard = {
		id     : -1,
		pageID : 0
	};

	const nextArtboard = {
		id     : 1,
		pageID : 0
	};

	return (<div className="inspector-page-footer-wrapper"><Row vertical="center">
		<img src={deLogo} className="inspector-page-footer-logo" onClick={()=> props.onPage('')} alt="Design Engine" />
		{(!processing) && (<div className="inspector-page-footer-button-wrapper">
			{/*{(profile && ((upload.id << 0) === 1 || upload.contributors.filter((contributor)=> (contributor.id === profile.id)).length > 0)) && (<button className="adjacent-button" onClick={()=> {trackEvent('button', 'share'); this.setState({ shareModal : true });}}>Share</button>)}*/}

			<button disabled={(scale >= Math.max(...PAN_ZOOM.zoomNotches))} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-in'); props.onZoom(1);}}><FontAwesome name="search-plus" /></button>
			<button disabled={(scale <= Math.min(...PAN_ZOOM.zoomNotches))} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-out'); props.onZoom(-1);}}><FontAwesome name="search-minus" /></button>
			<button disabled={false} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-reset'); props.onZoom(0);}}>Reset ({(fitScale * 100) << 0}%)</button>

			{(section === SECTIONS.PRESENTER && artboards.length > 1) && (<>
				<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'prev-artboard'); props.onChangeArtboard(prevArtboard);}}><FontAwesome name="arrow-left" /></button>
				<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'next-artboard'); props.onChangeArtboard(nextArtboard);}}><FontAwesome name="arrow-right" /></button>
			</>)}
		</div>)}
	</Row></div>);
};

const MarqueeBanner = (props)=> {
// 	console.log('InspectorPage.MarqueeBanner()', props);

	const { width, background, copyText, outro, track, children } = props;
	const className = `marquee-banner${(outro) ? ' marquee-banner-outro' : ''}`;
	const style = {
		width      : `calc(100% - ${(width) ? width : 0}px)`,
		background : background
	};

	return (<div className={className} style={style}>
		<div className="marquee-banner-content-wrapper">
			<CopyToClipboard onCopy={()=> props.onCopy(track)} text={copyText}>
				{children}
			</CopyToClipboard>
		</div>
		<button className="tiny-button marquee-banner-close-button" onClick={props.onClose}><FontAwesome name="times" /></button>
	</div>);
};

const PartsList = (props)=> {
// 	console.log('InspectorPage.PartsList()', props);

	const { contents } = props;
	return ((contents) ? <div className="parts-list-wrapper">
		{contents.map((slice, i)=> {
			return (
				<PartListItem
					key={i}
					id={slice.id}
					filename={slice.filename}
					title={slice.title}
					type={slice.type}
					size={slice.meta.frame.size}
					onClick={()=> props.onPartListItem(slice)}
				/>
			);
		})}
	</div> : <div className="parts-list-wrapper">{TAB_CONTENT_PLACEHOLDERS.PARTS}</div>);
};

const PartListItem = (props)=> {
// 	console.log('InspectorPage.PartListItem()', props);

	const { id, filename, title, type, size } = props;

	const thumbStyle = {
		width  : `${size.width * 0.25}px`,
		height : `${size.height * 0.25}px`
	};

	let errored = false;

	const t = capitalizeText((type.includes('child')) ? type.split('_').pop() : type, true);

	return (<div data-slice-id={id} className="part-list-item"><Row vertical="center">
		<ImageLoader
			style={thumbStyle}
			src={`${filename}@2x.png`}
			image={(props)=> <PartListItemThumb {...props} width={size.width * 0.25} height={size.height * 0.25} />}
			loading={()=> (<div className="part-list-item-image part-list-item-image-loading" style={thumbStyle}><FontAwesome name="circle-o-notch" size="2x" pulse fixedWidth /></div>)}
			error={()=> (<div className="part-list-item-image part-list-item-image-error"><FontAwesome name="exclamation-circle" size="2x" /></div>)}
			onError={(event)=> (errored = true)}
		/>
		<div className="part-list-item-title">{`${limitString(title, Math.max(26 - t.length, 1))} (${capitalizeText(t, true)})`}</div>
		{(!errored) && (<button className="tiny-button part-list-item-button" onClick={()=> props.onClick()}><FontAwesome name="download" /></button>)}
	</Row></div>);
};

const PartListItemThumb = (props)=> {
// 	console.log('InspectorPage.PartListItemThumb()', props);

	const { src, title, width, height } = props;
	return (<img src={src} className="part-list-item-image" width={width} height={height} alt={title} />);
};

const SliceRolloverItem = (props)=> {
// 	console.log('InspectorPage.SliceRolloverItem()', props);

	const { id, artboardID, type, offset, top, left, width, height, scale, visible, filled } = props;

	const className = `slice-rollover-item slice-rollover-item-${type}`;
	const style = (visible) ? {
		top     : `${top}px`,
		left    : `${left}px`,
		width   : `${width}px`,
		height  : `${height}px`,
		zoom    : scale,
// 		transform : `scale(${scale}) translate(${(left - (left * scale)) * -0.5}px, ${(top - (top * scale)) * -0.5}px)`,
// 		transform : `scale(${scale})`,
// 		transformOrigin : `${left * -scale}px ${top * -scale}px`
// 		margin  : `${(top) * -0.5}px ${(left - (left * scale)) * -0.5}px ${(top) * -0.5}px ${(left) * -0.5}px`
	} : {
		display : 'none'
	};

	return (<div
		data-slice-id={id}
		data-artboard-id={artboardID}
		className={`${className}${(filled) ? '-filled' : ''}`}
		style={style}
		onMouseEnter={()=> props.onRollOver(offset)}
		onMouseLeave={()=> props.onRollOut(offset)}
		onClick={()=> props.onClick(offset)}>
	</div>);
};

const SpecsList = (props)=> {
// 	console.log('InspectorPage.SpecsList()', props);

	const { upload, slice, creatorID } = props;

	if (!upload || !slice) {
		return (<div className="inspector-page-specs-list-wrapper">Rollover to display specs…</div>);
	}

	const fillColor = ((slice.type === 'textfield' && slice.meta.font.color) ? slice.meta.font.color : slice.meta.fillColor).toUpperCase();
	const padding = `${slice.meta.padding.top}px ${slice.meta.padding.left}px ${slice.meta.padding.bottom}px ${slice.meta.padding.right}px`;
	const added = `${slice.added.replace(' ', 'T')}Z`;//moment(`${slice.added.replace(' ', 'T')}Z`);
	const font = (slice.meta.font) ? fontSpecs(slice.meta.font) : null;
	const sliceStyles = (slice.meta.styles) ? slice.meta.styles : null;
	const border = (sliceStyles && sliceStyles.border) ? sliceStyles.border : null;
	const shadow = (sliceStyles && sliceStyles.shadow) ? sliceStyles.shadow : null;
	const innerShadow = (sliceStyles && sliceStyles.innerShadow) ? sliceStyles.innerShadow : null;

	const styles = (sliceStyles) ? {
		border : (border) ? {
			color     : border.color.toUpperCase(),
			position  : capitalizeText(border.position, true),
			thickness : `${border.thickness}px`
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

	/*
			<SpecsListItem*
				attribute=""
				value={}
				copyText={}
				onCopy={props.onCopySpec} />
	*/

	return (
		<div className="inspector-page-specs-list-wrapper">
			<SpecsListItem
				attribute="Name"
				value={slice.title}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Type"
				value={capitalizeText(slice.type, true)}
				onCopy={props.onCopySpec} />

			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={`W: ${slice.meta.frame.size.width}px H: ${slice.meta.frame.size.height}px`}>
				<Row><div className="inspector-page-specs-list-item-attribute">Export Size</div><div className="inspector-page-specs-list-item-val">{`W: ${slice.meta.frame.size.width}px H: ${slice.meta.frame.size.height}px`}</div></Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={`X: ${slice.meta.frame.origin.x}px Y: ${slice.meta.frame.origin.y}px`}>
				<Row><div className="inspector-page-specs-list-item-attribute">Position</div><div className="inspector-page-specs-list-item-val">{`X: ${slice.meta.frame.origin.x}px Y: ${slice.meta.frame.origin.y}px`}</div></Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={`${slice.meta.rotation}°`}>
				<Row><div className="inspector-page-specs-list-item-attribute">Rotation</div><div className="inspector-page-specs-list-item-val">{slice.meta.rotation}&deg;</div></Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={`${slice.meta.opacity * 100}%`}>
				<Row><div className="inspector-page-specs-list-item-attribute">Opacity</div><div className="inspector-page-specs-list-item-val">{slice.meta.opacity * 100}%</div></Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(fillColor.length > 0) ? fillColor : ''}>
				<Row><div className="inspector-page-specs-list-item-attribute">Fill</div>{(fillColor.length > 0) && (<div className="inspector-page-specs-list-item-val"><Row vertical="center">{fillColor}<ColorSwatch fill={fillColor} /></Row></div>)}</Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(border) ? `${styles.border.position} S: ${styles.border.thickness} ${styles.border.color}` : ''}>
				<Row><div className="inspector-page-specs-list-item-attribute">Border</div>{(border) && (<div className="inspector-page-specs-list-item-val"><Row vertical="center">{`${styles.border.position} S: ${styles.border.thickness} ${styles.border.color}`}<ColorSwatch fill={styles.border.color} /></Row></div>)}</Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(shadow) ? `X: ${styles.shadow.offset.x} Y: ${styles.shadow.offset.y} B: ${styles.shadow.blur} S: ${styles.shadow.spread}` : ''}>
				<Row><div className="inspector-page-specs-list-item-attribute">Shadow</div>{(shadow) && (<div className="inspector-page-specs-list-item-val"><Row vertical="center">{`X: ${styles.shadow.offset.x} Y: ${styles.shadow.offset.y} B: ${styles.shadow.blur} S: ${styles.shadow.spread}`}<ColorSwatch fill={styles.shadow.color} /></Row></div>)}</Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(innerShadow) ? `X: ${styles.innerShadow.offset.x} Y: ${styles.innerShadow.offset.y} B: ${styles.innerShadow.blur} S: ${styles.shadow.spread}` : ''}>
				<Row><div className="inspector-page-specs-list-item-attribute">Inner Shadow</div>{(innerShadow) && (<div className="inspector-page-specs-list-item-val"><Row vertical="center">{`X: ${styles.innerShadow.offset.x} Y: ${styles.innerShadow.offset.y} B: ${styles.innerShadow.blur} S: ${styles.shadow.spread}`}<ColorSwatch fill={styles.innerShadow.color} /></Row></div>)}</Row>
			</CopyToClipboard>
			{(slice.type === 'textfield') && (<>
				<CopyToClipboard onCopy={()=> props.onCopySpec()} text={`${font.family} ${font.name}`}>
					<Row><div className="inspector-page-specs-list-item-attribute">Font</div><div className="inspector-page-specs-list-item-val">{`${font.family} ${font.name}`}</div></Row>
				</CopyToClipboard>
				<CopyToClipboard onCopy={()=> props.onCopySpec()} text={font.weight}>
					<Row><div className="inspector-page-specs-list-item-attribute">Font Weight</div><div className="inspector-page-specs-list-item-val">{font.weight}</div></Row>
				</CopyToClipboard>
				<CopyToClipboard onCopy={()=> props.onCopySpec()} text={`${font.size}px`}>
					<Row><div className="inspector-page-specs-list-item-attribute">Font Size</div><div className="inspector-page-specs-list-item-val">{`${font.size}px`}</div></Row>
				</CopyToClipboard>
				<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(font.color) ? font.color.toUpperCase() : ''}>
					<Row><div className="inspector-page-specs-list-item-attribute">Font Color</div><div className="inspector-page-specs-list-item-val"><Row vertical="center">{(font.color) ? font.color.toUpperCase() : ''}<ColorSwatch fill={font.color} /></Row></div></Row>
				</CopyToClipboard>
				<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(font.alignment) ? capitalizeText(font.alignment) : 'Left'}>
					<Row><div className="inspector-page-specs-list-item-attribute">Alignment</div><div className="inspector-page-specs-list-item-val">{(font.alignment) ? capitalizeText(font.alignment) : 'Left'}</div></Row>
				</CopyToClipboard>
				<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(font.lineHeight) ? `${font.lineHeight}px` : ''}>
					<Row><div className="inspector-page-specs-list-item-attribute">Line Spacing</div>{(font.lineHeight) && (<div className="inspector-page-specs-list-item-val">{`${font.lineHeight}px`}</div>)}</Row>
				</CopyToClipboard>
				<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(font.kerning) ? `${font.kerning.toFixed(2)}px` : ''}>
					<Row><div className="inspector-page-specs-list-item-attribute">Char Spacing</div>{(font.kerning) && (<div className="inspector-page-specs-list-item-val">{`${font.kerning.toFixed(2)}px`}</div>)}</Row>
				</CopyToClipboard>
			</>)}
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(padding) ? padding : ''}>
				<Row><div className="inspector-page-specs-list-item-attribute">Padding</div>{(padding) && (<div className="inspector-page-specs-list-item-val">{padding}</div>)}</Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={capitalizeText(slice.meta.blendMode, true)}>
				<Row><div className="inspector-page-specs-list-item-attribute">Blend Mode</div><div className="inspector-page-specs-list-item-val">{capitalizeText(slice.meta.blendMode, true)}</div></Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={added}>
				<Row><div className="inspector-page-specs-list-item-attribute">Date</div>{(added) && (<div className="inspector-page-specs-list-item-val"><Moment format={MOMENT_TIMESTAMP}>{added}</Moment></div>)}</Row>
			</CopyToClipboard>
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={upload.creator.username}>
				<Row><div className="inspector-page-specs-list-item-attribute">Uploader</div><div className="inspector-page-specs-list-item-val">{upload.creator.username + ((creatorID === upload.creator.user_id) ? ' (You)' : '')}</div></Row>
			</CopyToClipboard>
		</div>
	);
};

const SpecsListItem = (props)=> {
// 	console.log('InspectorPage.SpecsListItem()', props);

	const { attribute, value, copyText } = props;
	return (<CopyToClipboard onCopy={()=> props.onCopy((copyText) ? copyText : value)} text={(copyText) ? copyText : value}>
		<Row><div className="inspector-page-specs-list-item-attribute">{attribute}</div><div className="inspector-page-specs-list-item-val">{value}</div></Row>
	</CopyToClipboard>);
};

const UploadProcessing = (props)=> {
// 	console.log('InspectorPage.UploadProcessing()', props);

	const { upload, processing, vpHeight } = props;
	const artboards = flattenUploadArtboards(upload);
	const url = buildInspectorURL(upload);

	const secs = String((epochDate() * 0.01).toFixed(2)).substr(-2) << 0;
	const ind = (secs / (100 / artboards.length)) << 0;

	const artboard = artboards[ind];
	const imgStyle = (artboard) ? {
		width  : `${artboard.meta.frame.size.width * ((vpHeight - 250) / artboard.meta.frame.size.height)}px`,
		height : `${artboard.meta.frame.size.height * ((vpHeight - 250) / artboard.meta.frame.size.height)}px`
	} : null;

	return (<div className="upload-processing-wrapper"><Column horizontal="center" vertical="start">
		{(processing.message.length > 0) && (<Row><div className="upload-processing-title">{processing.message}</div></Row>)}
		<Row><CopyToClipboard onCopy={props.onCopyURL} text={url}>
			<div className="upload-processing-url">{url}</div>
		</CopyToClipboard></Row>

		<Row><div className="upload-processing-button-wrapper">
			<CopyToClipboard onCopy={props.onCopyURL} text={url}>
				<button className="adjacent-button">Copy</button>
			</CopyToClipboard>
			<button onClick={()=> props.onCancel()}>Cancel</button>
		</div></Row>

		<Row horizontal="center">{(artboard)
			? (<ImageLoader
				src={`${artboard.filename}@1x.png`}
				image={()=> (<img className="upload-processing-image" src={`${artboard.filename}@1x.png`} style={imgStyle} alt={upload.title} />)}
				loading={()=> (<div className="upload-processing-image upload-processing-image-loading"><FontAwesome name="circle-o-notch" size="2x" pulse fixedWidth /></div>)}
				error={()=> (<div className="upload-processing-image upload-processing-image-error"><FontAwesome name="exclamation-circle" size="2x" /></div>)}
			/>)
			: (<img className="upload-processing-image" src={bannerPanel.image} alt={bannerPanel.title} />)
		}</Row>
	</Column></div>);
};




class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			section     : window.location.pathname.substr(1).split('/').shift(),
			upload      : null,
			artboard    : null,
			slice       : null,
			hoverSlice  : null,
			offset      : null,
			hoverOffset : null,
			tabSets     : [],
			activeTabs  : [],
			scale       : 1.0,
			fitScale    : 0.0,
			panMultPt   : PAN_ZOOM.panMultPt,
			viewSize    : {
				width  : 0,
				height : 0
			},
			scrollPt    : {
				x : 0,
				y : 0
			},
			valid       : true,
			restricted  : false,
			shareModal  : false,
			urlBanner   : true,
			scrolling   : false,
			tutorial    : null,
			code        : {
				html   : '',
				syntax : ''
			},
			processing  : {
				state   : 0,
				message : ''
			},
			tooltip     : null
		};

		this.recordedHistory = false;
		this.processingInterval = null;
		this.canvasInterval = null;
		this.scrollTimeout = null;
		this.notification = null;
		this.antsOffset = 0;
		this.contentSize = {
			width  : 0,
			height : 0
		};
	}

	componentDidMount() {
		console.log('InspectorPage.componentDidMount()', this.props, this.state);

		if (this.props.redirectURI) {
			this.props.setRedirectURI(null);
		}

		const { section } = this.state;
		if (section !== '') {
			this.setState({
				tabSets    : inspectorTabSets[section],
				activeTabs : [...inspectorTabSets[section]].map((tabSet) => {
					return (tabSet.slice(0, 1).pop());
				})
			});
		}

		const { deeplink } = this.props;
		if (deeplink.uploadID !== 0) {
			this.onFetchUpload();
		}

		document.addEventListener('keydown', this.handleKeyDown.bind(this));
// 		document.addEventListener('wheel', this.handleWheelStart.bind(this));
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
// 		console.log('InspectorPage.shouldComponentUpdate()', this.props, nextProps, this.state, nextState, nextContext);

		const { upload, restricted } = nextState;
		if (upload && (upload.private << 0) === 1) {
			const isOwner = (nextProps.profile && upload.creator.user_id === nextProps.profile.id);
			const isContributor = (nextProps.profile && !isOwner && (upload.contributors.filter((contributor)=> (contributor.id === nextProps.profile.id)).length > 0));

			if (!restricted && (!isOwner && !isContributor)) {
				this.setState({
					restricted : true,
					tooltip    : null
				});
			}
		}

		return (true);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('InspectorPage.componentDidUpdate()', prevProps, this.props, this.state);

		const { profile, deeplink, processing } = this.props;
// 		const { upload, panMultPt } = this.state;
		const { upload } = this.state;

		if (!this.recordedHistory && profile && upload && deeplink && deeplink.uploadID !== 0) {
			this.recordedHistory = true;
			this.onAddHistory();
		}

		if (deeplink && deeplink !== prevProps.deeplink && deeplink.uploadID !== 0) {
			this.onFetchUpload();
		}


		if (upload && processing && this.processingInterval === null) {
			this.setState({
				tabSets    : [],
				processing : {
					state   : 0,
					message : `…`
				}
			});

			this.processingInterval = setInterval(()=> this.onProcessingUpdate(), STATUS_INTERVAL);
			this.onProcessingUpdate();
		}

		if (!processing && this.processingInterval) {
			clearInterval(this.processingInterval);
			this.processingInterval = null;
			this.onFetchUpload();
		}


		if (artboardsWrapper.current && isSizeDimensioned({ width : artboardsWrapper.current.clientWidth, height : artboardsWrapper.current.clientHeight}) && !isSizeDimensioned(this.state.viewSize)) {
			const viewSize = {
				width  : artboardsWrapper.current.clientWidth,
				height : artboardsWrapper.current.clientHeight - 150
			};

			this.setState({ viewSize });
		}

		if (this.state.fitScale === 0.0 && isSizeDimensioned(this.contentSize) && isSizeDimensioned(this.state.viewSize)) {
			const fitScale = Math.max(Math.min(this.state.viewSize.height / this.contentSize.height, this.state.viewSize.width / this.contentSize.width, PAN_ZOOM.zoomNotches.slice(-1)[0]), PAN_ZOOM.zoomNotches[0]);
			const scrollPt = this.calcScrollPoint(PAN_ZOOM.panMultPt, this.state.viewSize, this.contentSize, fitScale);

			console.log('-=-=-=-=-=-', this.state.viewSize, this.contentSize, fitScale, scrollPt);
			this.setState({ scale : fitScale, fitScale },
				()=> {this.handlePanMove(PAN_ZOOM.panMultPt.x, PAN_ZOOM.panMultPt.y); this.setState({ scrolling : false });
			});
		}

		if (upload && canvasWrapper.current) {
			if (!this.state.tutorial && cookie.load('tutorial') === '0') {
				cookie.save('tutorial', '1', { path : '/' });

				const { scrollPt } = this.state;
// 				let artboard = flattenUploadArtboards(upload).shift();
// 				artboard.meta = (typeof artboard.meta === 'string') ? JSON.parse(artboard.meta) : artboard.meta;
				const tutorial = {
					origin : {
						top  : `${5 + -scrollPt.y}px`,
						left : `${5 + -scrollPt.x}px`
					}
				};

				this.setState({ tutorial });
			}
		}
	}

	componentWillUnmount() {
		console.log('InspectorPage.componentWillUnmount()', this.state);

		clearInterval(this.processingInterval);
		clearInterval(this.canvasInterval);
		clearTimeout(this.scrollTimeout);

		this.processingInterval = null;
		this.canvasInterval = null;
		this.scrollTimeout = null;

		document.removeEventListener('keydown', this.handleKeyDown.bind(this));
// 		document.removeEventListener('wheel', this.handleWheelStart.bind(this));

		const { upload, section, valid, restricted } = this.state;
		if (upload && valid && restricted) {
			this.props.setRedirectURI(buildInspectorPath(upload), section);
		}
	}

	buildSliceRollOverItemTypes = (artboard, type, offset, scale, scrolling)=> {
// 		console.log('InspectorPage.buildSliceRollOverItemTypes()', artboard, type, offset, scale, scrolling);

		const slices = artboard.slices.filter((slice)=> (slice.type === type)).map((slice, i)=> {
			return (<SliceRolloverItem
				key={i}
				id={slice.id}
				artboardID={artboard.id}
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
				onRollOut={(offset)=> this.handleSliceRollOut(i, slice, offset)}
				onClick={(offset)=> this.handleSliceClick(i, slice, offset)}
			/>);
		});

// 		console.log('::::::::::', slices, artboard.slices);
		return(slices);
	};

	calcArtboardBaseMetrics = (artboards, vpSize)=> {
// 		console.log('InspectorPage.calcArtboardBaseMetrics()', artboards, vpSize);

		const vpRatio = {
			width  : vpSize.width / vpSize.height,
			height : vpSize.height / vpSize.width
		};

		let baseMetrics = {
			size  : {
				width  : 1,
				height : 1
			},
			grid  : {
				cols : 0,
				rows : 0
			},
			grids : []
		};

		artboards.map((artboard, i)=> ({
			id   : artboard.id,
			row  : 0,
			col  : 0,
			size : {
				width  : artboard.meta.frame.size.width,
				height : artboard.meta.frame.size.height
			},
			area : areaSize(artboard.meta.frame.size)

		})).sort((a, b)=> { // desc
			return ((a.area > b.area) ? -1 : (a.area < b.area) ? 1 : 0);

		}).forEach((metric, i)=> {
			const baseRatio = {
				width  : baseMetrics.size.width / baseMetrics.size.height,
				height : baseMetrics.size.height / baseMetrics.size.width
			};

			if (baseRatio.width < vpRatio.width || baseRatio.height > vpRatio.height) {
				baseMetrics.grid.cols++;
				baseMetrics.size.width += metric.size.width;
				metric.col++;

			} else {
				baseMetrics.grid.cols = 0;
				baseMetrics.grid.rows++;
				baseMetrics.size.height += metric.size.height;
				metric.row++;
			}

			baseMetrics.grids.push({
				id  : metric.id,
				row : metric.row,
				col : metric.col
			});
		});

		return (baseMetrics);
	};

	calcArtboardScaledMetrics = (artboards, baseMetrics, scale)=> {
// 		console.log('InspectorPage.calcArtboardScaledMetrics()', artboards, baseMetrics, scale);

		let scaledMetrics = [];
		let coords = {
			x : 0,
			y : 0
		};

		let rowHeight = 0;
		artboards.forEach((artboard, i)=> {
			const frame = artboard.meta.frame;
			const grid = baseMetrics.grids.filter((metric)=> (metric.id === artboard.id)).pop();

// 			rowHeight = Math.round((grid.col === 0) ? ((grid.row !== 0 && grid.row < baseMetrics.grid.rows) ? 50 : 0) + (scale * frame.size.height) : Math.max(rowHeight, scale * frame.size.height));
			rowHeight = Math.round((grid.col === 0) ? 0 : Math.max(rowHeight, scale * frame.size.height));
			coords = {
// 				x : Math.round(((grid.col !== 0 && grid.col < baseMetrics.grid.cols) ? 50 : 0) + (grid.col * (scale * frame.size.width))),
				x : Math.round(grid.col * (scale * frame.size.width)),
				y : Math.round((grid.row > 0 && grid.col === 0) ? rowHeight : coords.y)
			};

			scaledMetrics.push({ artboard, coords });
		});


		return (scaledMetrics);
	};

	calcCanvasSliceFrame = (slice, artboard, offset, scrollPt)=> {
// 		console.log('InspectorPage.calcCanvasSliceFrame()', slice, artboard, offset, scrollPt);

		const { scale } = this.state;
		const srcFrame = cropFrame(slice.meta.frame, artboard.meta.frame);
		const srcOffset = {
			x : ((offset.x - scrollPt.x) << 0),
			y : ((offset.y - scrollPt.y) << 0)
		};

		return ({
			origin : {
				x : (srcOffset.x + (srcFrame.origin.x * scale)) << 0,
				y : (srcOffset.y + (srcFrame.origin.y * scale)) << 0

			},
			size   : {
				width  : (srcFrame.size.width * scale) << 0,
				height : (srcFrame.size.height * scale) << 0
			}
		});
	};

	calcFitScale = (baseSize, vpSize)=> {
// 		console.log('InspectorPage.calcFitScale()', baseSize, vpSize);
		return (Math.max(Math.min(vpSize.height / baseSize.height, vpSize.width / baseSize.width, Math.max(...PAN_ZOOM.zoomNotches)), Math.min(...PAN_ZOOM.zoomNotches)));
	};

	calcScrollPoint = (panPt, vpSize, baseSize, scale)=> {
// 		console.log('InspectorPage.calcScrollPoint()', panPt, vpSize, baseSize, scale);

		const pt = this.calcTransformPoint();
		return ({
			x : -Math.round((pt.x * vpSize.width) + ((baseSize.width * scale) * -0.5)),
// 			x : -Math.round((vpSize.width - (baseSize.height * scale)) * 0.5),
			y : -Math.round((pt.y * vpSize.height) + ((baseSize.height * scale) * -0.5))
		});
	};

	calcTransformPoint = ()=> {
// 		console.log('InspectorPage.calcTransformPoint()');

		const { panMultPt, scale } = this.state;
		return {
			x : 0.5 + scale * (PAN_ZOOM.panMultPt.x - panMultPt.x),
			y : 0.5 + scale * (PAN_ZOOM.panMultPt.y - panMultPt.y)
		};
	};

	handleArtboardClick = (event)=> {
// 		console.log('InspectorPage.handleArtboardClick()', event.target);

		const { upload } = this.state;
		const artboardID = event.target.getAttribute('data-artboard-id');

		if (artboardID) {
			const artboard = artboardForID(upload, artboardID);
			this.setState({ artboard });
		}
	};

	handleArtboardRollOut = (event)=> {
// 		console.log('InspectorPage.handleArtboardRollOut()', event.target);

		const { artboard, slice } = this.state;
		artboard.slices.filter((item)=> (slice && slice.id !== item.id)).forEach((item)=> {
			item.filled = false;
		});

		this.setState({
// 			artboard    : (slice) ? artboard : null,
			hoverSlice  : null,
			hoverOffset : null
		});
	};

	handleArtboardRollOver = (event)=> {
		console.log('InspectorPage.handleArtboardRollOver()', event.target.getAttribute('data-artboard-id'));

// 		event.stopPropagation();
		const artboardID = event.target.getAttribute('data-artboard-id') << 0;

		if (this.state.section === SECTIONS.PRESENTER) {
			return;
		}

		if (artboardID) {
			let { upload, artboard, section } = this.state;
			if (!artboard || artboard.id !== artboardID) {
				artboard = artboardForID(upload, artboardID);
				if (artboard) {
					this.setState({ artboard });
				}
			}

			if (artboard.slices.length === 0) {
				let formData = new FormData();
				formData.append('action', 'ARTBOARD_SLICES');
				formData.append('artboard_id', artboardID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('ARTBOARD_SLICES', response.data);

						let { upload } = this.state;
						let pages = [...upload.pages];
						pages.forEach((page)=> {
							page.artboards.filter((artboard)=> ((artboard.id << 0) === artboardID)).map((artboard)=> {
								artboard.slices = response.data.slices.map((slice)=> ({
									id         : slice.id << 0,
									artboardID : slice.artboard_id << 0,
									title      : slice.title,
									type       : slice.type,
									filename   : slice.filename,
									meta       : JSON.parse(slice.meta),
									added      : slice.added,
									filled     : false,
									children   : []
								}));
							});
						});

						upload.pages = pages;
						this.setState({ upload });
					}).catch((error)=> {
				});
			}

			if (section !== SECTIONS.PRESENTER && !this.canvasInterval) {
				this.canvasInterval = setInterval(()=> this.onCanvasInterval(), CANVAS.marchingAnts.interval);
			}
		}
	};

	handleCanvasClick = (event)=> {
// 		console.log('InspectorPage.handleCanvasClick()', this.state.tabSets);
		event.stopPropagation();

		const { section, scrolling } = this.state;
		if (!scrolling) {
			this.setState({
				tabSets : inspectorTabSets[section],
				slice   : null
			});
		}
	};

	handleCanvasUpdate = ()=> {
// 		console.log('InspectorPage.handleCanvasUpdate()', this.antsOffset);

		const { scrollPt, offset, hoverOffset } = this.state;
		const { section, artboard, slice, hoverSlice } = this.state;

		const context = canvas.current.getContext('2d');
		context.clearRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		context.font = CANVAS.caption.fontFace;
		context.textAlign = CANVAS.caption.align;
		context.textBaseline = CANVAS.caption.baseline;

		// debug fill 100%
// 		context.fillStyle = 'rgba(0, 0, 0, 0.25)';
// 		context.fillRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);


		if (artboard) {
			if (slice) {
				const frame = this.calcCanvasSliceFrame(slice, artboard, offset, scrollPt);
// 				drawCanvasSliceFill(context, frame, CANVAS.slices.fillColor);
// 				drawCanvasSliceTooltip(context, slice.type, frame.origin, frame.size.width);
				drawCanvasSliceBorder(context, frame);
				drawSliceGuides(context, frame, { width : canvas.current.clientWidth, height : canvas.current.clientHeight }, CANVAS.guides.color);
				drawCanvasSliceMarchingAnts(context, frame, this.antsOffset);
			}

			if (hoverSlice) {
				if (!slice || (slice && slice.id !== hoverSlice.id)) {
					const frame = this.calcCanvasSliceFrame(hoverSlice, artboard, hoverOffset, scrollPt);
// 					drawCanvasSliceFill(context, frame, CANVAS.slices.fillColor);
// 					drawCanvasSliceTooltip(context, `W:${frame.size.width}px H:${frame.size.height}px`, frame.origin, frame.size.width * 7);
					drawCanvasSliceBorder(context, frame);
					drawSliceGuides(context, frame, { width : canvas.current.clientWidth, height : canvas.current.clientHeight }, CANVAS.guides.color);
				}
			}
		}
	};

	handleCloseNotification = (event)=> {
// 		console.log('InspectorPage.handleCloseNotification()', event, this.notification);
		window.focus();
		trackEvent('notification', 'close');
		this.notification.close(event.target.tag);
	};

	handleChangeArtboard = (artboard)=> {
// 		console.log('InspectorPage.handleChangeArtboard()', artboard);

		if (artboard.pageID <= 0) {
			const { upload } = this.state;
			const dir = artboard.id;

			const artboards = flattenUploadArtboards(upload);
			const ind = (artboards.findIndex((item)=> (item.id === this.state.artboard.id)) + dir) % artboards.length;

			if (this.state.artboard.id !== artboards[((ind < 0) ? artboards.length + ind : ind)].id) {
				this.setState({
					artboard    : artboards[((ind < 0) ? artboards.length + ind : ind)],
					slice       : null,
					offset      : null,
					hoverSlice  : null,
					hoverOffset : null,
				}, ()=> {
					this.handleZoom(-1);
					setTimeout(()=> this.handleZoom(0), 12);
				});
			}


		} else {
			this.setState({ artboard,
				slice       : null,
				offset      : null,
				hoverSlice  : null,
				hoverOffset : null,
			}, ()=> {
				this.handleZoom(-1);
				setTimeout(()=> this.handleZoom(0), 12);
			});
		}
	};

	handleClipboardCopy = (type, msg='Copied to Clipboard!')=> {
		console.log('InspectorPage.handleClipboardCopy()', type, msg);

		trackEvent('button', `copy-${type}`);
		this.props.onPopup({
			type    : POPUP_TYPE_INFO,
			content : (msg.length >= 80) ? `Copied ${type} to clipboard` : msg
		});
	};

	handleDownloadAll = ()=> {
// 		console.log('InspectorPage.handleDownloadAll()');

		trackEvent('button', 'download-project');
		const { upload } = this.state;
		makeDownload(`http://cdn.designengine.ai/download-project.php?upload_id=${upload.id}`);
	};

	handleDownloadArtboardPDF = ()=> {
// 		console.log('InspectorPage.handleDownloadArtboardPDF()');

		trackEvent('button', 'download-pdf');
		const { upload } = this.state;
		makeDownload(`http://cdn.designengine.ai/download-pdf.php?upload_id=${upload.id}`);
	};

	handleDownloadPartListItem = (slice)=> {
// 		console.log('InspectorPage.handleDownloadPartListItem()', slice);

		trackEvent('button', 'download-part');
		const { upload } = this.state;
		makeDownload(`http://cdn.designengine.ai/download-slices.php?upload_id=${upload.id}&slice_title=${slice.title}&slice_ids=${[slice.id]}`);
	};

	handleDownloadPartsList = ()=> {
// 		console.log('InspectorPage.handleDownloadPartsList()');

		trackEvent('button', 'download-parts');
		const { upload, slice } = this.state;
		const sliceIDs = (slice.type === 'group') ? fillGroupPartItemSlices(upload, slice).map((slice)=> (slice.id)).join(',') : slice.children.map((slice)=> (slice.id)).join(',');

		makeDownload(`http://cdn.designengine.ai/download-slices.php?upload_id=${upload.id}&slice_title=${slice.title}&slice_ids=${sliceIDs}`);
	};

	handleInviteTeamFormSubmitted = (result)=> {
// 		console.log('InspectorPage.handleInviteTeamFormSubmitted()', result);

		this.props.onPopup({
			type    : POPUP_TYPE_INFO,
			content : `Sent ${result.sent.length} invite${(result.sent.length === 1) ? '' : 's'}!`
		});
	};

	handleInviteModalClose = ()=> {
		const { processing } = this.state;
		this.setState({
			processing : {
				state : processing.state,
				message : ''
			},
			shareModal : false
		});
	};

	handleKeyDown = (event)=> {
// 		console.log('InspectorPage.handleKeyDown()', event);

		const { section } = this.state;

		trackEvent('keypress', (event.keyCode === PLUS_KEY) ? 'plus' : 'minus');
		if (event.keyCode === PLUS_KEY) {
			this.handleZoom(1);

		} else if (event.keyCode === MINUS_KEY) {
			this.handleZoom(-1);
		}

		if (section === SECTIONS.PRESENTER) {
			if (event.keyCode === ARROW_LT_KEY) {
				this.handleChangeArtboard({
					id     : -1,
					pageID : 0
				});

			} else if (event.keyCode === ARROW_RT_KEY) {
				this.handleChangeArtboard({
					id     : 1,
					pageID : 0
				});
			}
		}
	};

	handlePanAndZoom = (x, y, scale)=> {
// 		console.log('InspectorPage.handlePanAndZoom()', x, y, scale);

// 		const panMultPt = { x, y };
// 		this.setState({ panMultPt, scale });
// 		this.setState({ panMultPt });
// 		this.setState({ scale });
	};

	handlePanMove = (x, y)=> {
// 		console.log('InspectorPage.handlePanMove()', x, y, this.state.scale);

		const panMultPt = { x, y };
		const { viewSize } = this.state;
		const pt = this.calcTransformPoint();

		const scrollPt = {
			x : -Math.round((pt.x * viewSize.width) + (this.contentSize.width * -0.5)),
			y : -Math.round((pt.y * viewSize.height) + (this.contentSize.height * -0.5))
		};

		this.setState({ panMultPt, scrollPt, scrolling : true });
	};

	handleSliceClick = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceClick()', ind, slice, offset);

		trackEvent('slice', `${slice.id}_${convertURISlug(slice.title)}`);

		const { profile } = this.props;
		const { upload, artboard, section } = this.state;
		let { tabSets } = this.state;

		slice.filled = true;
		artboard.slices.filter((item)=> (item.id !== slice.id)).forEach((item)=> {
			item.filled = false;
		});

		const langs = [
			toCSS(slice),
			toReactCSS(slice),
			toSwift(slice, artboard),
			toAndroid(slice, artboard)
		];

		if (section === SECTIONS.INSPECT) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				if (i === 1) {
					return (tabSet.map((tab, j)=> {
						return ((j === 0) ? Object.assign({}, tab, {
							type     : 'component',
							contents : <SpecsList
								upload={upload}
								slice={slice}
								creatorID={(profile) ? profile.id : 0}
								onCopySpec={(msg)=> this.handleClipboardCopy('spec', msg)}
							/>
						}) : tab);
					}));

				} else {
					return (tabSet.map((tab, i)=> {
						return (Object.assign({}, tab, {
							contents : langs[i].html,
							syntax   : langs[i].syntax
						}));
					}));
				}
			});

		} else if (section === SECTIONS.PARTS) {
			tabSets[0][0].type = 'component';

			if (slice.type === 'symbol') {
				let formData = new FormData();
				formData.append('action', 'SYMBOL_SLICES');
				formData.append('slice_id', slice.id);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('SYMBOL_SLICES', response.data);

						const slices = response.data.slices.map((item)=> ({
							id         : item.id << 0,
							artboardID : item.artboard_id << 0,
							title      : item.title,
							type       : item.type,
							filename   : item.filename,
							meta       : JSON.parse(item.meta),
							added      : item.added,
							filled     : false,
						}));

						slice.children = slices;
						tabSets[0][0].contents = <PartsList
							contents={slices}
							onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
						this.setState({ tabSets });
					}).catch((error)=> {
				});

			} else if (slice.type === 'group') {
				tabSets[0][0].contents = <PartsList
					contents={fillGroupPartItemSlices(upload, slice)}
					onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
			}

		} else if (section === SECTIONS.PRESENTER) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				return (tabSet.map((tab, j)=> {
						if (i === 0) {
							return (Object.assign({}, tab, {
								contents : langs[j].html,
								syntax   : langs[j].syntax
							}));

						} else {
							return (Object.assign({}, tab, {
								type     : 'component',
								contents : <ArtboardsList
									contents={flattenUploadArtboards(upload)}
									onArtboardListItem={(artboard)=> this.handleChangeArtboard(artboard)} />
							}));
						}
				}));
			});
		}

		const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
			const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
			return ((tab) ? tab : activeTab);
		});

// 		const activeTabs = tabSets.map((tabSet)=> {
// 			return ((tabSet.find((tab)=> (tab.id === activeTab.id))) ? tab : activeTab );
// 		});

		this.setState({ tabSets, activeTabs, artboard, slice, offset,
			hoverSlice  : null,
			hoverOffset : null
		});
	};

	handleSliceRollOut = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceRollOut()', ind, slice, offset, this.state);

		const { profile } = this.props;
		const { upload, artboard, section } = this.state;
		let tabSets = [...this.state.tabSets];
		let activeTabs = [...this.state.activeTabs];

		if (this.state.slice) {
			const langs = [
				toCSS(this.state.slice),
				toReactCSS(this.state.slice),
				toSwift(this.state.slice, artboard),
				toAndroid(this.state.slice, artboard)
			];

			if (section === SECTIONS.INSPECT) {
				tabSets = [...this.state.tabSets].map((tabSet, i)=> {
					if (i === 1) {
						return (tabSet.map((tab, j)=> {
							return ((j === 0) ? Object.assign({}, tab, {
								type     : 'component',
								contents : <SpecsList
									upload={upload}
									slice={this.state.slice}
									creatorID={(profile) ? profile.id : 0}
									onCopySpec={(msg)=> this.handleClipboardCopy('spec', msg)}
								/>
							}) : tab);
						}));

					} else {
						return (tabSet.map((tab, i)=> {
							return (Object.assign({}, tab, {
								contents : langs[i].html,
								syntax   : langs[i].syntax
							}));
						}));
					}
				});

			} else if (section === SECTIONS.PARTS) {
				tabSets[0][0].type = 'component';

				if (this.state.slice.type === 'symbol') {
					let formData = new FormData();
					formData.append('action', 'SYMBOL_SLICES');
					formData.append('slice_id', this.state.slice.id);
					axios.post('https://api.designengine.ai/system.php', formData)
						.then((response)=> {
							console.log('SYMBOL_SLICES', response.data);

							const slices = response.data.slices.map((item)=> ({
								id         : item.id << 0,
								artboardID : item.artboard_id << 0,
								title      : item.title,
								type       : item.type,
								filename   : item.filename,
								meta       : JSON.parse(item.meta),
								added      : item.added,
								filled     : false,
							}));

							slice.children = slices;
							tabSets[0][0].contents = <PartsList
								contents={slices}
								onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
							this.setState({ tabSets });
						}).catch((error)=> {
					});

				} else if (this.state.slice.type === 'group') {
					tabSets[0][0].contents = <PartsList
						contents={fillGroupPartItemSlices(upload, this.state.slice)}
						onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
				}

			} else if (section === SECTIONS.PRESENTER) {
				tabSets = [...this.state.tabSets].map((tabSet, i)=> {
					return (tabSet.map((tab, j)=> {
						if (i === 0) {
							return (Object.assign({}, tab, {
								contents : langs[j].html,
								syntax   : langs[j].syntax
							}));

						} else {
							return (Object.assign({}, tab, {
								type     : 'component',
								contents : <ArtboardsList
									contents={flattenUploadArtboards(upload)}
									onArtboardListItem={(artboard)=> this.handleChangeArtboard(artboard)} />
							}));
						}
					}));
				});
			}

			activeTabs = activeTabs.map((activeTab, i)=> {
				const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
				return ((tab) ? tab : activeTab);
			});

		} else {
// 			this.handleSliceClick(ind, slice, offset);

			artboard.slices.forEach((item)=> {
				item.filled = false;
			});

			tabSets = [...this.state.tabSets].map((tabSet)=> {
				return (tabSet.map((tab, i)=> {
					return (Object.assign({}, tab, {
						contents : null,
						syntax   : null
					}));
				}));
			});

			activeTabs = activeTabs.map((activeTab, i)=> {
				const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
				return ((tab) ? tab : activeTab);
			});
		}

		this.setState({ artboard, tabSets, activeTabs,
			hoverSlice  : null,
			hoverOffset : null
		});
	};

	handleSliceRollOver = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceRollOver()', ind, slice, offset);

		const { profile } = this.props;
		const { upload, artboard, section } = this.state;
		let tabSets = [...this.state.tabSets];

		if (artboard) {
			slice.filled = true;
			artboard.slices.filter((item)=> (this.state.slice && this.state.slice.id !== item.id)).forEach((item)=> {
				item.filled = false;
			});

			const langs = [
				toCSS(slice),
				toReactCSS(slice),
				toSwift(slice, artboard),
				toAndroid(slice, artboard)
			];

			if (section === SECTIONS.INSPECT) {
				tabSets = [...this.state.tabSets].map((tabSet, i)=> {
					if (i === 1) {
						return (tabSet.map((tab, j)=> {
							return ((j === 0) ? Object.assign({}, tab, {
								type     : 'component',
								contents : <SpecsList
									upload={upload}
									slice={slice}
									creatorID={(profile) ? profile.id : 0}
									onCopySpec={(msg)=> this.handleClipboardCopy('spec', msg)}
								/>
							}) : tab);
						}));

					} else {
						return (tabSet.map((tab, i)=> {
							return (Object.assign({}, tab, {
								contents : langs[i].html,
								syntax   : langs[i].syntax
							}));
						}));
					}
				});

			} else if (section === SECTIONS.PARTS) {
				tabSets[0][0].type = 'component';

				if (slice.type === 'symbol') {
					let formData = new FormData();
					formData.append('action', 'SYMBOL_SLICES');
					formData.append('slice_id', slice.id);
					axios.post('https://api.designengine.ai/system.php', formData)
						.then((response)=> {
							console.log('SYMBOL_SLICES', response.data);

							const slices = response.data.slices.map((item)=> ({
								id         : item.id << 0,
								artboardID : item.artboard_id << 0,
								title      : item.title,
								type       : item.type,
								filename   : item.filename,
								meta       : JSON.parse(item.meta),
								added      : item.added,
								filled     : false
							}));

							slice.children.push([...slices]);
							tabSets[0][0].contents = <PartsList
								contents={slices}
								onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
							this.setState({ tabSets });
						}).catch((error)=> {
					});

				} else if (slice.type === 'group') {
					tabSets[0][0].contents = <PartsList
						contents={fillGroupPartItemSlices(upload, slice)}
						onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
					this.setState({ tabSets });
				}

			} else if (section === SECTIONS.PRESENTER) {
				tabSets = [...this.state.tabSets].map((tabSet, i)=> {
					return (tabSet.map((tab, j)=> {
						if (i === 0) {
							return (Object.assign({}, tab, {
								contents : langs[j].html,
								syntax   : langs[j].syntax
							}));

						} else {
							return (Object.assign({}, tab, {
								type     : 'component',
								contents : <ArtboardsList
									contents={flattenUploadArtboards(upload)}
									onArtboardListItem={(artboard)=> this.handleChangeArtboard(artboard)} />
							}));
						}
					}));
				});
			}

			const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
				const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
				return ((tab) ? tab : activeTab);
			});

			this.setState({ artboard, tabSets, activeTabs,
				hoverSlice  : slice,
				hoverOffset : offset
			});
		}
	};

	handleTab = (tab)=> {
// 		 console.log('InspectorPage.handleTab()', tab);
		trackEvent('tab', convertURISlug(tab.title));

		const { tabSets } = this.state;
		const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
			return ((tabSets[i].find((item)=> (item.id === tab.id))) ? tab : activeTab);
		});

		this.setState({ activeTabs });
	};

	handleTabContent = (tab)=> {
		 console.log('InspectorPage.handleTabContent()', tab);
	};

	handleTutorialNextStep = (step)=> {
		console.log('InspectorPage.handleTutorialNextStep()', step);
		const tutorial = {
			origin : {
				top  : (step === 1) ? '240px' : '140px',
				left : (step === 1) ? `${artboardsWrapper.current.clientWidth - 250}px` : '50%',
			}
		};

		this.setState({ tutorial : tutorial });
	};

	handleUploadProcessingCancel = ()=> {
// 		console.log('InspectorPage.handleUploadProcessingCancel()');

		const { upload, section } = this.state;

		if (this.processingInterval) {
			clearInterval(this.processingInterval);
			this.processingInterval = null;
		}

		let formData = new FormData();
		formData.append('action', 'CANCEL_PROCESSING');
		formData.append('upload_id', upload.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('CANCEL_PROCESSING', response.data);
				this.props.onProcessing(false);
				this.props.onPage(section);
			}).catch((error)=> {
		});
	};


	handleWheelStart = (event)=> {
// 		console.log('InspectorPage.handleWheelStart()', event, event.type, event.deltaX, event.deltaY, event.target);
		//console.log('wheel', artboardsWrapper.current.clientWidth, artboardsWrapper.current.clientHeight, artboardsWrapper.current.scrollTop, artboardsWrapper.current.scrollLeft);

		clearTimeout(this.scrollTimeout);
		this.scrollTimeout = null;

		event.stopPropagation();

		if (!event.ctrlKey) {
			const panMultPt = {
				x : this.state.panMultPt.x + (event.deltaX * PAN_ZOOM.panFactor),
				y : this.state.panMultPt.y + (event.deltaY * PAN_ZOOM.panFactor)
			};

			this.setState({
				scrolling : true,
				panMultPt : panMultPt,
			}, ()=> (this.handlePanMove(panMultPt.x, panMultPt.y)));
		}

		this.scrollTimeout = setTimeout(()=> this.onWheelTimeout(), 50);
	};

	handleZoom = (direction)=> {
// 		console.log('InspectorPage.handleZoom()', direction);

		const { fitScale } = this.state;
		let scale = fitScale;

		if (direction !== 0) {
			let ind = -1;
			PAN_ZOOM.zoomNotches.forEach((amt, i)=> {
				if (amt === this.state.scale) {
					ind = i + direction;
				}
			});

			PAN_ZOOM.zoomNotches.forEach((amt, i)=> {
				if (ind === -1) {
					if (direction === 1) {
						if (amt > this.state.scale) {
							ind = i;
						}

					} else {
						if (amt > this.state.scale) {
							ind = i - 1;
						}
					}
				}
			});

			scale = PAN_ZOOM.zoomNotches[Math.min(Math.max(0, ind), PAN_ZOOM.zoomNotches.length - 1)];
		}

		this.setState({
			slice     : null,
			offset    : null,
			panMultPt : PAN_ZOOM.panMultPt,
			scale     : scale,
			tooltip   : `${(scale * 100) << 0}%`
		}, ()=> this.handlePanMove(PAN_ZOOM.panMultPt.x, PAN_ZOOM.panMultPt.y));

		setTimeout(()=> {
			this.setState({ tooltip : null });
		}, 1000);
	};

	onAddHistory = ()=> {
// 		console.log('InspectorPage.onAddHistory()');

		const { deeplink, profile } = this.props;

		let formData = new FormData();
		formData.append('action', 'ADD_HISTORY');
		formData.append('user_id', profile.id);
		formData.append('upload_id', deeplink.uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('ADD_HISTORY', response.data);
			}).catch((error)=> {
		});
	};

	onCanvasInterval = ()=> {
// 		console.log('InspectorPage.onCanvasInterval()', this.antsOffset);

		const { scrolling, section } = this.state;

		if (canvas.current && !scrolling && section !== SECTIONS.PRESENTER) {
			this.antsOffset = ((this.antsOffset + CANVAS.marchingAnts.increment) % CANVAS.marchingAnts.modOffset);
			this.handleCanvasUpdate();
		}
	};

	onFetchUpload = ()=> {
		console.log('InspectorPage.onFetchUpload()', this.props);

		const { uploadID } = this.props.deeplink;
		const { viewSize, section } = this.state;

		this.setState({ tooltip : 'Loading…' });

		axios.post('https://api.designengine.ai/system.php', qs.stringify({
			action    : 'UPLOAD',
			upload_id : uploadID
		})).then((response)=> {
			console.log('UPLOAD', response.data);

			const { upload } = response.data;
			if (Object.keys(upload).length > 0 && ((upload.state << 0) <= 3)) {
				let tabSets = inspectorTabSets[section];

				const artboards = flattenUploadArtboards(upload);
				const baseMetrics = this.calcArtboardBaseMetrics((section === SECTIONS.PRESENTER) ? artboards.slice(0, 1) : artboards, viewSize);
				console.log('-_-_-_BASE METRICS_-_-_-', baseMetrics);

// 				const fitScale = this.calcFitScale(baseMetrics.size, viewSize);
// 				console.log(':::::FIT SCALE:::::', fitScale);
//
// 				const scaledMetrics = this.calcArtboardScaledMetrics((section === SECTIONS.PRESENTER) ? artboards.slice(0, 1) : artboards, baseMetrics, fitScale);
// 				console.log(':::::SCALED METRICS:::::', scaledMetrics);


				if (section === SECTIONS.INSPECT) {
					tabSets = [...tabSets].map((tabSet, i) => {
						if (i === 0) {
							return (tabSet);

						} else {
							return (tabSet.map((tab, j) => {
								return ((j === 0) ? Object.assign({}, tab, {
									type     : 'component',
									contents : <SpecsList
										upload={upload}
										slice={null}
										creatorID={0}
										onCopySpec={(msg) => this.handleClipboardCopy('spec', msg)}
									/>
								}) : tab);
							}));
						}

// 						return (tabSet.map((tab, i)=> {
// 							return (Object.assign({}, tab, {
// 								contents : langs[i].html,
// 								syntax   : langs[i].syntax
// 							}));
// 						}));
					});

				} else if (section === SECTIONS.PARTS) {
					tabSets = [...tabSets].map((tabSet, i)=> {
						return (tabSet.map((tab, j)=> {
							return (Object.assign({}, tab, {
								contents : <PartsList
									contents={null}
									onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />
							}));
						}));
					});

				} else if (section === SECTIONS.PRESENTER) {
					const artboard = artboards[0];
					const langs = [
						toCSS(artboard),
						toReactCSS(artboard),
						toSwift(artboard, artboard),
						toAndroid(artboard, artboard)
					];

					tabSets = [...tabSets].map((tabSet, i)=> {
						return (tabSet.map((tab, j)=> {
							if (i === 0) {
								return (Object.assign({}, tab, {
									contents : langs[j].html,
									syntax   : langs[j].syntax
								}));

							} else {
								return (Object.assign({}, tab, {
									type     : 'component',
									contents : <ArtboardsList
										contents={flattenUploadArtboards(upload)}
										onArtboardListItem={(artboard)=> this.handleChangeArtboard(artboard)} />
								}));
							}
						}));
					});
				}

				const activeTabs = tabSets.map((tabSet)=> {
					return (tabSet.slice(0, 1).pop());
				});

				this.setState({ upload, tabSets, activeTabs,
					artboard  : (section === SECTIONS.PRESENTER) ? artboards[0] : null,
					slice     : null,
					tooltip   : null
				});

				const processing = ((upload.state << 0) < 3);
				if (processing && !this.props.processing && !this.processingInterval) {
					this.props.onProcessing(true);
				}

			} else {
				this.setState({
					valid   : false,
					tooltip : null
				});
			}
		}).catch((error)=> {
		});
	};

	onProcessingUpdate = ()=> {
// 		console.log('InspectorPage.onProcessingUpdate()');

		const { upload, section } = this.state;
		const title = `${limitString(upload.filename.split('/').pop().split('.').shift(), 34)}.${upload.filename.split('/').pop().split('.').pop()}`;

		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', upload.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('UPLOAD_STATUS', response.data);
				const { status } = response.data;
// 				const { totals } = status;
				const processingState = status.state << 0;

				const ellipsis = Array((epochDate() % 4) + 1).join('.');
// 				const total = totals.all << 0;//Object.values(totals).reduce((acc, val)=> ((acc << 0) + (val << 0)));
// 				const mins = moment.duration(moment(`${status.ended.replace(' ', 'T')}Z`).diff(`${status.started.replace(' ', 'T')}Z`)).asMinutes();
// 				const secs = ((mins - (mins << 0)) * 60) << 0;

				if (processingState === 0) {
					const { queue } = status;
					this.setState({
						processing : {
							state   : processingState,
							message : `Queued position ${queue.position}/${queue.total}, please wait${ellipsis}`
						}
					});

				} else if (processingState === 1) {
					this.setState({
						processing : {
							state   : processingState,
							message : `Preparing "${title}"${ellipsis}`
						}
					});

				} else if (processingState === 2) {
					this.setState({
						processing : {
							state   : processingState,
// 							message : `Processing ${title}, parsed ${total} element${(total === 1) ? '' : 's'} in ${(mins >= 1) ? (mins << 0) + 'm' : ''} ${secs}s…`
							message : `Processing "${title}"${ellipsis}`
						}
					});
					this.onFetchUpload();

				} else if (processingState === 3) {
					clearInterval(this.processingInterval);
					this.processingInterval = null;
					this.setState({
						processing : {
							state   : processingState,
// 							message : `Completed processing. Parsed ${total} element${(total === 1) ? '' : 's'} in ${(mins >= 1) ? (mins << 0) + 'm' : ''} ${secs}s.`
// 							message : `Completed processing ${total} element${(total === 1) ? '' : 's'} in ${(mins >= 1) ? (mins << 0) + 'm' : ''} ${secs}s.`
							message : `Your design file "${upload.title}" is ready.`
						}
					}, ()=> this.onShowNotification());
					this.props.onProcessing(false);

				} else if (processingState === 4) {
					clearInterval(this.processingInterval);
					this.processingInterval = null;
					this.setState({
						processing : {
							state   : processingState,
							message : `An error has occurred processing "${title}"!`
						}
					}, ()=> this.onShowNotification());
					this.props.onProcessing(false);

				} else if (processingState === 5) {
					this.props.onPage(section);
				}
			}).catch((error)=> {
		});
	};


	onShowNotification = ()=> {
// 		console.log('InspectorPage.onShowNotification()', this.notification);
		if (this.notification.supported()) {
			this.notification.show();
		}
	};

	onWheelTimeout = ()=> {
// 		console.log('InspectorPage.onWheelTimeout()');

		clearTimeout(this.scrollTimeout);
		this.scrollTimeout = null;

		this.setState({ scrolling : false });
	};


	render() {
// 		console.log('InspectorPage.render()', this.props, this.state);
// 		console.log('InspectorPage.render()', this.props);
		console.log('InspectorPage.render()', this.state);


		const { processing } = this.props;

		const { section, upload, artboard, slice, hoverSlice, tabSets, scale, fitScale, activeTabs, scrolling, viewSize, panMultPt } = this.state;
		const { valid, restricted, urlBanner, tutorial, tooltip } = this.state;

		const artboards = (upload) ? (section === SECTIONS.PRESENTER) ? (artboard) ? [artboard] : [] : flattenUploadArtboards(upload) : [];
		const activeSlice = (hoverSlice) ? hoverSlice : slice;

		const listTotal = (upload && activeSlice) ? (section === SECTIONS.PRESENTER) ? flattenUploadArtboards(upload).length : (activeSlice) ? (activeSlice.type === 'group') ? fillGroupPartItemSlices(upload, activeSlice).length : activeSlice.children.length : 0 : 0;

		const pt = this.calcTransformPoint();

		this.contentSize = {
			width  : 0,
			height : 0
		};

		let maxH = 0;
		let offset = {
			x : 0,
			y : 0
		};

		let artboardImages = [];
		let slices = [];

		artboards.forEach((artboard, i)=> {
			if ((i % 5) << 0 === 0 && i > 0) {
				offset.x = 0;
				offset.y += maxH + 50;
				maxH = 0;
			}

			maxH = Math.round(Math.max(maxH, artboard.meta.frame.size.height * scale));
			this.contentSize.height = Math.max(this.contentSize.height, offset.y + maxH);
			const filename = `${artboard.filename}@${(scale <= 0.25) ? '0.25' : (scale < 1) ? 1 : 3}x.png`;// (scale <= 0.25) ? artboard.filename.replace('@3x', '@0.25x') : (scale < 1) ? artboard.filename.replace('@3x', '@1x') : artboard.filename;

			const artboardStyle = {
				position       : 'absolute',
				top            : `${offset.y << 0}px`,
				left           : `${offset.x << 0}px`,
				width          : `${(scale * artboard.meta.frame.size.width) << 0}px`,
				height         : `${(scale * artboard.meta.frame.size.height) << 0}px`,
				background     : `#24282e url("${filename}") no-repeat center`,
				backgroundSize : `${(scale * artboard.meta.frame.size.width) << 0}px ${(scale * artboard.meta.frame.size.height) << 0}px`,
				border         : '1px solid #005cc5'
			};

			const slicesWrapperStyle = {
				top      : `${offset.y << 0}px`,
				left     : `${offset.x << 0}px`,
				width    : `${(scale * artboard.meta.frame.size.width) << 0}px`,
				height   : `${(scale * artboard.meta.frame.size.height) << 0}px`,
			};

			const artboardSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'artboard', offset, scale, scrolling) : [];
			const groupSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'group', offset, scale, scrolling) : [];
			const backgroundSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'background', offset, scale, scrolling) : [];
			const textfieldSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'textfield', offset, scale, scrolling) : [];
			const symbolSlices =(artboard.slices.length > 0) ?  this.buildSliceRollOverItemTypes(artboard, 'symbol', offset, scale, scrolling) : [];
			const sliceSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'slice', offset, scale, scrolling) : [];

			artboardImages.push(
				<div key={i} data-artboard-id={artboard.id} style={artboardStyle}>
					<div className="inspector-page-artboard-caption">{artboard.title}</div>
				</div>
			);

			slices.push(
				<div key={i} data-artboard-id={artboard.id} className="inspector-page-slices-wrapper" style={slicesWrapperStyle} onMouseOver={this.handleArtboardRollOver} onMouseOut={this.handleArtboardRollOut} onDoubleClick={(event)=> this.handleZoom(1)}>
					<div data-artboard-id={artboard.id} className={`inspector-page-${(section === SECTIONS.PRESENTER) ? 'artboard' : 'group'}-slices-wrapper`}>{(section === SECTIONS.PRESENTER) ? artboardSlices : groupSlices }</div>
					{(section === SECTIONS.INSPECT) && (<div data-artboard-id={artboard.id} className="inspector-page-background-slices-wrapper">{backgroundSlices}</div>)}
					{(section !== SECTIONS.PRESENTER) && (<div data-artboard-id={artboard.id} className="inspector-page-symbol-slices-wrapper">{symbolSlices}</div>)}
					{(section === SECTIONS.INSPECT) && (<div data-artboard-id={artboard.id} className="inspector-page-textfield-slices-wrapper">{textfieldSlices}</div>)}
					{(section === SECTIONS.INSPECT) && (<div data-artboard-id={artboard.id} className="inspector-page-slice-slices-wrapper">{sliceSlices}</div>)}
				</div>
			);

			offset.x += Math.round(((i % 5 < 4) ? 50 : 0) + (artboard.meta.frame.size.width * scale));
			this.contentSize.width = Math.max(this.contentSize.width, offset.x);
		});

		artboardImages = (!restricted) ? artboardImages : [];
		slices = (!restricted) ? slices : [];



// 		console.log('InspectorPage.render()', this.state, this.contentSize);
// 		console.log('InspectorPage.render()', slices);
// 		console.log('InspectorPage.render()', upload, activeSlice);
// 		console.log('InspectorPage:', window.performance.memory);



		const contentClass = `inspector-page-content${(section === SECTIONS.PRESENTER) ? ' inspector-page-content-presenter' : ''}`;
		const panelClass = `inspector-page-panel${(section === SECTIONS.PRESENTER) ? ' inspector-page-panel-presenter' : ''}`;

		const artboardsStyle = {
			position  : 'absolute',
// 			width     : `${viewSize.width * scale}px`,
			width     : `${this.contentSize.width}px`,
// 			height    : `${viewSize.height * scale}px`,
			height    : `${this.contentSize.height}px`,
			transform : `translate(${Math.round(pt.x * viewSize.width)}px, ${Math.round(pt.y * viewSize.height)}px) translate(${Math.round(this.contentSize.width * -0.5)}px, ${Math.round(this.contentSize.height * -0.5)}px)`,
// 			transform : `translate(${ARTBOARD_ORIGIN.x}px, ${ARTBOARD_ORIGIN.y}px)`,
			opacity   : (processing) ? '0' : '1'
		};

		const canvasStyle = (!scrolling) ? {
			top     : `${-Math.round((pt.y * viewSize.height) + (this.contentSize.height * -0.5))}px`,
			left    : `${-Math.round((pt.x * viewSize.width) + (this.contentSize.width * -0.5))}px`
		} : {
			display : 'none'
		};

		const tabSetWrapperStyle = {
			width  : '100%',
			height : 'calc(100% - 42px)'
		};


		return (<>
			<BaseDesktopPage className="inspector-page-wrapper">
				<div className={contentClass} onWheel={this.handleWheelStart}>
					{(upload && !processing) && (<MarqueeBanner
						width={(section === SECTIONS.PRESENTER) ? 880 : 360}
						copyText={buildInspectorURL(upload)}
						outro={!urlBanner}
						onCopy={()=> this.handleClipboardCopy('url', buildInspectorURL(upload))}
						onClose={()=> this.setState({ urlBanner : false })}>
							<div className="marquee-banner-url">{buildInspectorURL(upload)}</div>
					</MarqueeBanner>)}

					<InteractiveDiv
						x={panMultPt.x}
						y={panMultPt.y}
						scale={scale}
						scaleFactor={PAN_ZOOM.zoomFactor}
						minScale={Math.min(...PAN_ZOOM.zoomNotches)}
						maxScale={Math.max(...PAN_ZOOM.zoomNotches)}
						ignorePanOutside={false}
						renderOnChange={true}
						style={{ width : '100%', height : '100%' }}
						onPanAndZoom={this.handlePanAndZoom}
						onPanEnd={()=> (this.setState({ scrolling : false }))}
						onPanMove={this.handlePanMove}>
							<div className="inspector-page-artboards-wrapper" ref={artboardsWrapper}>
								{(artboards.length > 0) && (<div style={artboardsStyle}>
									{artboardImages}
									<div className="inspector-page-canvas-wrapper" onClick={(event)=> this.handleCanvasClick(event)} onDoubleClick={()=> this.handleZoom(1)} style={canvasStyle} ref={canvasWrapper}>
										<canvas width={(artboardsWrapper.current) ? artboardsWrapper.current.clientWidth : 0} height={(artboardsWrapper.current) ? artboardsWrapper.current.clientHeight : 0} ref={canvas}>Your browser does not support the HTML5 canvas tag.</canvas>
									</div>
									{slices}
								</div>)}
							</div>
					</InteractiveDiv>

					{(upload) && (<InspectorFooter
						scale={scale}
						fitScale={fitScale}
						section={section}
						processing={processing}
						artboards={flattenUploadArtboards(upload)}
						onChangeArtboard={this.handleChangeArtboard}
						onPage={this.props.onPage}
						onZoom={this.handleZoom}
					/>)}
				</div>

				{(valid) && (<div className={panelClass}>
					{(section === SECTIONS.INSPECT) && (<>
						{(tabSets.map((tabSet, i)=> (
							<div key={i} className="inspector-page-panel-content-wrapper inspector-page-panel-full-width-content-wrapper inspector-page-panel-split-height-content-wrapper">
								<div style={tabSetWrapperStyle}>
									<FilingTabSet
										tabs={tabSet}
										activeTab={activeTabs[i]}
										onTabClick={(tab)=> this.handleTab(tab)}
										onContentClick={(payload)=> console.log('onContentClick', payload)}
									/>
									<div className="inspector-page-panel-button-wrapper">
										<CopyToClipboard onCopy={()=> this.handleClipboardCopy((i === 0) ? 'code' : 'specs', (i === 0) ? activeTabs[i].syntax : toSpecs(activeSlice))} text={(i === 0) ? (activeTabs && activeTabs[i]) ? activeTabs[i].syntax : '' : (activeSlice) ? toSpecs(activeSlice) : ''}>
											<button disabled={!slice} className="inspector-page-panel-button">Copy to Clipboard</button>
										</CopyToClipboard>
									</div>
								</div>
							</div>)
						))}
					</>)}

					{(section === SECTIONS.PARTS) && (<div className="inspector-page-panel-content-wrapper inspector-page-panel-full-width-content-wrapper inspector-page-panel-full-height-content-wrapper">
						{(tabSets.map((tabSet, i)=> (
							<div key={i} style={tabSetWrapperStyle}>
								<FilingTabSet
									tabs={tabSet}
									activeTab={activeTabs[i]}
									onTabClick={(tab)=> this.handleTab(tab)}
									onContentClick={(payload)=> console.log('onContentClick', payload)}
								/>
								<div className="inspector-page-panel-button-wrapper">
									<button disabled={!slice} className="inspector-page-panel-button" onClick={()=> this.handleDownloadPartsList()}><FontAwesome name="download" className="inspector-page-download-button-icon" />Download ({listTotal}) Part{(listTotal === 1) ? '' : 's'}</button>
								</div>
							</div>)
						))}
					</div>)}

					{(section === SECTIONS.PRESENTER) && (<div className="inspector-page-panel-content-wrapper inspector-page-panel-full-width-content-wrapper inspector-page-panel-full-height-content-wrapper inspector-page-panel-presenter-wrapper">
						{(tabSets.map((tabSet, i)=> (
							<div key={i} className="inspector-page-panel-content-wrapper inspector-page-panel-split-width-content-wrapper inspector-page-panel-full-height-content-wrapper" style={{width:`${(i === 0) ? 520 : 360}px`}}>
								<div style={tabSetWrapperStyle}>
									<FilingTabSet
										tabs={tabSet}
										activeTab={activeTabs[i]}
										onTabClick={(tab)=> this.handleTab(tab)}
										onContentClick={(payload)=> console.log('onContentClick', payload)}
									/>
										<div className="inspector-page-panel-button-wrapper">
											{(i === 0)
												? (<CopyToClipboard onCopy={()=> this.handleClipboardCopy('code', activeTabs[i].syntax)} text={(activeTabs && activeTabs[i]) ? activeTabs[i].syntax : ''}>
														<button disabled={!activeTabs[i].contents} className="inspector-page-panel-button">Copy to Clipboard</button>
													</CopyToClipboard>)
												: (<button disabled={(artboards.length === 0)} className="inspector-page-panel-button" onClick={()=> this.handleDownloadArtboardPDF()}><FontAwesome name="download" className="inspector-page-download-button-icon" />Download PDF</button>)}
										</div>
								</div>
							</div>
						)))}
					</div>)}
				</div>)}
			</BaseDesktopPage>


			{(tooltip && !processing) && (<div className="inspector-page-tooltip">{tooltip}</div>)}
			{(restricted) && (<ContentModal
				tracking="private/inspector"
				closeable={false}
				defaultButton="Register / Login"
				onComplete={()=> this.props.onPage('register')}>
				This project is private, you must be logged in as one of its team members to view!
			</ContentModal>)}

			{/*{(upload && profile && (upload.contributors.filter((contributor)=> (contributor.id === profile.id)).length > 0)) && (<UploadProcessing*/}
			{(!restricted && upload && processing) && (<UploadProcessing
				upload={upload}
				processing={this.state.processing}
				vpHeight={viewSize.height}
				onCopyURL={()=> this.handleClipboardCopy('url', buildInspectorURL(upload))}
				onCancel={this.handleUploadProcessingCancel}
			/>)}

			{(!restricted && tutorial) && (<TutorialOverlay
				origin={tutorial.origin}
				onNext={this.handleTutorialNextStep}
				onClose={()=> this.setState({ tutorial : null })}
			/>)}

			{(!upload && !valid) && (<ContentModal
				tracking="invalid/inspector"
				closeable={true}
				defaultButton={null}
				title="Error Loading Project"
				onComplete={()=> this.props.onPage('')}>
				Design file not found.
			</ContentModal>)}


			{(upload) && (<ReactNotifications
				onRef={(ref)=> (this.notification = ref)}
				title={(this.state.processing.state === 3) ? 'Completed Processing' : 'Error Processing'}
				body={this.state.processing.message}
				icon={DE_LOGO_SMALL}
				timeout="6660"
				tag={`processing-${(this.state.processing.state === 3) ? 'complete' : 'error'}`}
				onClick={(event)=> this.handleCloseNotification(event)}
			/>)}
		</>);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InspectorPage);
