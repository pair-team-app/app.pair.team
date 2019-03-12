
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import copy from 'copy-to-clipboard';
// import moment from 'moment-timezone';
import qs from 'qs';
import ReactNotifications from 'react-browser-notifications';
import cookie from 'react-cookies';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
// import { Helmet } from 'react-helmet';
import ImageLoader from 'react-loading-image';
import Moment from 'react-moment';
import panAndZoomHoc from 'react-pan-and-zoom-hoc';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import BaseDesktopPage from './BaseDesktopPage';
import ContentModal from '../../elements/ContentModal';
import InputField, { INPUTFIELD_STATUS_IDLE } from '../../forms/elements/InputField';
import { POPUP_TYPE_ERROR, POPUP_TYPE_OK, POPUP_TYPE_STATUS } from '../../elements/Popup';
import TutorialOverlay from '../../elements/TutorialOverlay';

import { MOMENT_TIMESTAMP } from '../../../consts/formats';
import { ARROW_LT_KEY, ARROW_RT_KEY, MINUS_KEY, PLUS_KEY } from '../../../consts/key-codes';
import { CANVAS, PAN_ZOOM, GRID, SECTIONS, STATUS_INTERVAL } from '../../../consts/inspector';
import { DE_LOGO_SMALL } from '../../../consts/uris';
import { setRedirectURI } from '../../../redux/actions';
import { buildInspectorPath, buildInspectorURL, sendToSlack } from '../../../utils/funcs.js';
import { Browsers, DateTimes, Files, Maths, Strings } from '../../../utils/lang.js';
import { fontSpecs, toAndroid, toCSS, toReactCSS, toSpecs, toSwift } from '../../../utils/inspector-langs.js';
import { trackEvent } from '../../../utils/tracking';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';
import downloadButton from '../../../assets/images/buttons/btn-download.svg';
// import androidIcon from '../../../assets/images/icons/ico-android.png';
// import html5Icon from '../../../assets/images/icons/ico-html5.png';
// import iosIcon from '../../../assets/images/icons/ico-ios.png';

import adBannerPanel from '../../../assets/json/ad-banner-panel';
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
// 	return ([slice, ...artboardForID(upload, slice.artboardID).slices.filter((item)=> (item.type !== 'artboard' && item.id !== slice.id && (Maths.geom.rectContainsRect(Maths.geom.frameToRect(slice.meta.frame), Maths.geom.frameToRect(item.meta.frame)))))]);
	return ([slice, ...artboardForID(upload, slice.artboardID).slices.filter((item)=> (item.type !== 'artboard' && item.id !== slice.id && Maths.geom.frameContainsFrame(slice.meta.frame, item.meta.frame)))]);
};

const flattenUploadArtboards = (upload, type=null)=> {
// 	console.log('flattenUploadArtboards()', upload, type);
	return ((upload) ? upload.pages.flatMap((page)=> (page.artboards)).filter((artboard)=> ((type) ? (artboard.type === type || artboard.type.includes(type)) : true)).reverse() : []);
};

/*
const slicesByArea = (slices)=> {
// 	console.log('slicesByArea()', slices);
	return(slices.sort((s1, s2)=> ((Maths.geom.sizeArea(s1.meta.frame.size) < Maths.geom.sizeArea(s2.meta.frame.size)) ? -1 : (Maths.geom.sizeArea(s1.meta.frame.size) > Maths.geom.sizeArea(s2.meta.frame.size)) ? 1 : 0)));
};
*/

const drawCanvasSliceBorder = (context, frame)=> {
	context.strokeStyle = CANVAS.slices.borderColor;
	context.lineWidth = CANVAS.slices.lineWidth;
	context.setLineDash([]);
	context.lineDashOffset = 0;
	context.beginPath();
	context.strokeRect(frame.origin.x + 1, frame.origin.y + 1, frame.size.width - 2, frame.size.height - 2);
	context.stroke();
};

/*
const drawCanvasSliceFill = (context, frame, color)=> {
	context.fillStyle = color;
	context.fillRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
};
*/

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

/*
const drawCanvasSliceTooltip = (context, text, origin, maxWidth=-1)=> {
	maxWidth = (maxWidth === -1) ? 250 : maxWidth;

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
	context.lineDashOffset = 0;
	context.beginPath();
	context.strokeRect(origin.x + 1, (origin.y - txtMetrics.height), (txtMetrics.width + (txtMetrics.padding * 2)) - 2, txtMetrics.height);
	context.stroke();

	context.fillStyle = CANVAS.caption.textColor;
	context.fillText(caption.toUpperCase(), txtMetrics.padding + origin.x, txtMetrics.padding + (origin.y - txtMetrics.height));
};
*/

const intersectSlices = (slices, frame)=> {
// 	console.log('interectSlices()', slices, frame);
// 	return (slices.filter((slice)=> (Maths.geom.rectContainsRect(Maths.geom.frameToRect(frame), Maths.geom.frameToRect(slice.meta.frame)))));
	return (slices.filter((slice)=> (Maths.geom.frameContainsFrame(frame, slice.meta.frame))));
};



const ArtboardsList = (props)=> {
// 	console.log('InspectorPage.ArtboardsList()', props);

	const { enabled, contents } = props;
	return ((contents.length > 0) ? <div className="artboards-list-wrapper">
		{contents.map((artboard, i)=> {
			const { meta } = artboard;

			return (
				<ArtboardListItem
					key={i}
					enabled={enabled}
					id={artboard.id}
					filename={`${artboard.filename}@1x.png`}
					title={artboard.title}
					size={meta.frame.size}
					onClick={()=> {trackEvent('button', 'change-artboard', null, artboard.id); props.onArtboardListItem(artboard);}}
				/>
			);
		})}
	</div> : <div className="artboards-list-wrapper artboards-list-wrapper-empty">{(enabled) ? '' : ''}</div>);
};

const ArtboardListItem = (props)=> {
// 	console.log('InspectorPage.ArtboardListItem()', props);

	const { enabled, id, filename, title, size } = props;

	const className = `artboard-list-item${(!enabled) ? ' artboard-list-item-disabled' : ''}`;
	const thumbStyle = {
		width  : `${size.width}px`,
		height : `${size.height}px`
	};

	let errored = false;

	return (<div data-slice-id={id} className={className} onClick={()=> (enabled) ? props.onClick() : null}><Row vertical="center">
		<div className="artboard-list-item-content-wrapper">
			<ImageLoader
				style={thumbStyle}
				src={filename}
				image={(props)=> <PartListItemThumb {...props} width={size.width} height={size.height} />}
				loading={()=> (<div className="artboard-list-item-image artboard-list-item-image-loading" style={thumbStyle}><FontAwesome className="artboard-list-item-fa-status" name="clock-o" size="2x" /></div>)}
				error={()=> (<div className="artboard-list-item-image artboard-list-item-image-loading"><FontAwesome className="artboard-list-item-fa-status" name="clock-o" size="2x" /></div>)}
				onError={(event)=> (errored = true)}
			/>

			{/*<img className="artboard-list-item-image" src={filename} width={size.width} height={size.height} style={thumbStyle} alt={title} />*/}
			<div className="artboard-list-item-title">{Strings.truncate(title, 18)}</div>
		</div>
		{(!errored) && (<button className="tiny-button artboard-list-item-button" onClick={()=> (enabled) ? props.onClick() : null}><img src={downloadButton} width="20" height="14" alt="Download" /></button>)}
	</Row></div>);
};

const ColorSwatch = (props)=> {
// 	console.log('InspectorPage.ColorSwatch()', props);

	const { fill } = props;
	return (<div className="inspector-page-color-swatch" style={{ backgroundColor : fill }} />);
};

const FilingTabContent = (props)=> {
// 	console.log('InspectorPage.FilingTabContent()', props);

	const { tab, enabled } = props;
	const { type, contents } = tab;
	const className = `filing-tab-content${(!enabled) ? ' filing-tab-content-disabled' : ''}`;

	return (<div key={tab.id} className={className}>
		{((!type || type === 'json_html') && contents) && (<span dangerouslySetInnerHTML={{ __html : String(((enabled) ? JSON.parse(contents) : '').replace(/ /g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt').replace(/\n/g, '<br />')) }} />)}
		{(type === 'component') && (contents)}
	</div>);
};

const FilingTabSet = (props)=> {
// 	console.log('InspectorPage.FilingTabSet()', props);

	const { tabs, activeTab, enabled } = props;
	return (<div className="filing-tab-set">
		<ul className="filing-tab-set-title-wrapper">
			{tabs.map((tab, i)=> (
				<FilingTabTitle
					key={i}
					tab={tab}
					enabled={enabled || tab.enabled}
					selected={activeTab && tab.id === activeTab.id}
					onClick={()=> (enabled) ? props.onTabClick(tab) : null}
				/>
			))}
		</ul>

		<div className="filing-tab-set-content-wrapper">
			{tabs.filter((tab)=> (activeTab && tab.id === activeTab.id)).map((tab, i)=> (
				<FilingTabContent
					key={i}
					tab={tab}
					enabled={enabled}
					onClick={()=> (enabled) ? props.onContentClick(tab) : null}
				/>
			))}
		</div>
	</div>);
};

const FilingTabTitle = (props)=> {
// 	console.log('InspectorPage.FilingTabTitle()', props);

	const { tab, enabled, selected } = props;
	const { title } = tab;

	const className = `filing-tab-title${(!title || title.length === 0) ? ' filing-tab-title-blank' : ''}${(selected) ? ' filing-tab-title-selected' : ''}${(!enabled) ? ' filing-tab-title-disabled' : ''}`;
	return (<React.Fragment key={tab.id}>
		<li className={className} onClick={()=> (enabled) ? props.onClick() : null}>{title}</li>
	</React.Fragment>);
};

const InspectorFooter = (props)=> {
// 	console.log('InspectorPage.InspectorFooter()', props);

	const { section, scale, fitScale, artboards, processing, creator } = props;
	const prevArtboard = {
		id     : -1,
		pageID : -1
	};

	const nextArtboard = {
		id     : 1,
		pageID : -1
	};

	return (<div className="inspector-page-footer-wrapper"><Row vertical="center">
		<img src={deLogo} className="inspector-page-footer-logo" onClick={()=> props.onPage('')} alt="Design Engine" />
		{(!processing) && (<div className="inspector-page-footer-button-wrapper">
			{/*{(profile && ((upload.id << 0) === 1 || upload.contributors.filter((contributor)=> (contributor.id === profile.id)).length > 0)) && (<button className="adjacent-button" onClick={()=> {trackEvent('button', 'share'); this.setState({ shareModal : true });}}>Share</button>)}*/}
			{(creator) && (<Dropzone
				className="inspector-page-footer-dz"
				multiple={false}
				disablePreview={true}
				onDrop={props.onDrop}
			><button className="inspector-page-footer-button" onClick={()=> trackEvent('button', 'resubmit')}>Resubmit</button></Dropzone>)}

			<button disabled={(scale >= Math.max(...PAN_ZOOM.zoomNotches))} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-in'); props.onZoom(1);}}><FontAwesome name="search-plus" /></button>
			<button disabled={(scale <= Math.min(...PAN_ZOOM.zoomNotches))} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-out'); props.onZoom(-1);}}><FontAwesome name="search-minus" /></button>
			<button disabled={false} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-reset'); props.onZoom(0);}}>Reset ({(fitScale * 100) << 0}%)</button>

			{(section === SECTIONS.PRESENTER && artboards.length < 1) && (<>
				<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'prev-artboard'); props.onChangeArtboard(prevArtboard);}}><FontAwesome name="arrow-left" /></button>
				<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'next-artboard'); props.onChangeArtboard(nextArtboard);}}><FontAwesome name="arrow-right" /></button>
			</>)}

			{(section !== SECTIONS.INSPECT) && (<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'inspect'); props.onChangeSection('inspect');}}>Inspect</button>)}
			{(section !== SECTIONS.PARTS) && (<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'parts'); props.onChangeSection('parts');}}>Parts</button>)}
			{(section !== SECTIONS.PRESENTER) && (<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'present'); props.onChangeSection('present');}}>Presenter</button>)}

		</div>)}
	</Row></div>);
};

const MarqueeBanner = (props)=> {
// 	console.log('InspectorPage.MarqueeBanner()', props);

	const { background, copyText, outro, removable, track, children } = props;
	const className = `marquee-banner${(outro) ? (removable) ? '  marquee-banner-outro-remove' : ' marquee-banner-outro' : ''}`;
	const style = {
		width      : '100%',
		background : background
	};

	return (<div className={className} style={style}>
		<div className="marquee-banner-content-wrapper">
			{(copyText)
				? (<CopyToClipboard onCopy={()=> props.onCopy(track)} text={copyText}>
						{children}
					</CopyToClipboard>)
				: (children)}
		</div>
		{(copyText) && (<button className="tiny-button marquee-banner-close-button" onClick={props.onClose}><FontAwesome name="times" /></button>)}
	</div>);
};

const PartsList = (props)=> {
// 	console.log('InspectorPage.PartsList()', props);

	const { enabled, contents } = props;
	return ((contents && contents.length > 0) ? <div className="parts-list-wrapper">
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
	</div> : <div className="parts-list-wrapper parts-list-wrapper-empty">{(enabled) ? '/* Rollover to display parts. */' : ''}</div>);
};

const PartListItem = (props)=> {
// 	console.log('InspectorPage.PartListItem()', props);

// 	const { id, filename, title, type, size } = props;
	const { id, filename, title, size } = props;
	const thumbStyle = {
		width  : `${size.width}px`,
		height : `${size.height}px`
	};

	let errored = false;

	return (<div data-slice-id={id} className="part-list-item"><Row vertical="center" horizontal="center">
		<div className="part-list-item-content-wrapper">
			<ImageLoader
				style={thumbStyle}
				src={`${filename}@2x.png`}
				image={(props)=> <PartListItemThumb {...props} width={size.width} height={size.height} />}
				loading={()=> (<div className="part-list-item-image part-list-item-image-loading" style={thumbStyle}><FontAwesome className="part-list-item-fa-status" name="clock-o" size="2x" /></div>)}
				error={()=> (<div className="part-list-item-image part-list-item-image-loading"><FontAwesome className="part-list-item-fa-status" name="clock-o" size="2x" /></div>)}
				onError={(event)=> (errored = true)}
			/>
			<div className="part-list-item-title">{`${Strings.truncate(`${title}`, 18)}`}</div>
		</div>
		{(!errored) && (<button className="tiny-button part-list-item-button" onClick={()=> props.onClick()}><img src={downloadButton} width="20" height="14" alt="Download" /></button>)}
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

	if (!upload || !slice || (upload && (upload.state << 0) < 3)) {
		return (<div className="inspector-page-specs-list-wrapper inspector-page-specs-list-wrapper-empty">{((upload.state << 0) < 3) ? '' : '/* Rollover to display specs. */'}</div>);
	}

	const { frame } = slice.meta;
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
			position  : Strings.capitalize(border.position, true),
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
	
			<SpecsListItem
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
				value={Strings.capitalize(slice.type, true)}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Export Size"
				value={`W: ${frame.size.width}px H: ${frame.size.height}px`}
				onCopy={props.onCopySpec} />


			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={`X: ${frame.origin.x}px Y: ${frame.origin.y}px`}>
				<Row><div className="inspector-page-specs-list-item-attribute">Position</div><div className="inspector-page-specs-list-item-val">{`X: ${frame.origin.x}px Y: ${frame.origin.y}px`}</div></Row>
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
			<SpecsListItem
				attribute="Border"
				value={(border) ? `${styles.border.position} S: ${styles.border.thickness} ${styles.border.color}` : null}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Shadow"
				value={(shadow) ? `X: ${styles.shadow.offset.x} Y: ${styles.shadow.offset.y} B: ${styles.shadow.blur} S: ${styles.shadow.spread}` : null}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Inner Shadow"
				value={(innerShadow) ? `X: ${styles.innerShadow.offset.x} Y: ${styles.innerShadow.offset.y} B: ${styles.innerShadow.blur} S: ${styles.innerShadow.spread}` : null}
				onCopy={props.onCopySpec} />
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
				<CopyToClipboard onCopy={()=> props.onCopySpec()} text={(font.alignment) ? Strings.capitalize(font.alignment) : 'Left'}>
					<Row><div className="inspector-page-specs-list-item-attribute">Alignment</div><div className="inspector-page-specs-list-item-val">{(font.alignment) ? Strings.capitalize(font.alignment) : 'Left'}</div></Row>
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
			<CopyToClipboard onCopy={()=> props.onCopySpec()} text={Strings.capitalize(slice.meta.blendMode, true)}>
				<Row><div className="inspector-page-specs-list-item-attribute">Blend Mode</div><div className="inspector-page-specs-list-item-val">{Strings.capitalize(slice.meta.blendMode, true)}</div></Row>
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

	const VAL_PLACEHOLDER = '—';

	const { attribute, value, copyText } = props;
	const attrClass = `inspector-page-specs-list-item-attribute${(!value) ? ' inspector-page-specs-list-item-attribute-empty' : ''}`;
	const valClass = `inspector-page-specs-list-item-val${(!value) ? ' inspector-page-specs-list-item-val-empty' : ''}`;

	return (<CopyToClipboard onCopy={()=> (copyText || value) ? props.onCopy((copyText) ? copyText : (value) ? value : '') : null} text={(copyText) ? copyText : (value) ? value : ''}>
		<Row>
			<div className={attrClass}>{attribute}</div>
			<div className={valClass}>{(value) ? value : VAL_PLACEHOLDER}</div>
		</Row>
	</CopyToClipboard>);
};

const UploadProcessing = (props)=> {
// 	console.log('InspectorPage.UploadProcessing()', props);

	const { upload, processing, vpHeight } = props;
	const artboards = flattenUploadArtboards(upload, 'page_child');
	const urlInspect = buildInspectorURL(upload, '/inspect');
	const urlParts = buildInspectorURL(upload, '/parts');
	const urlPresent = buildInspectorURL(upload, '/present');

	const secs = String((DateTimes.epoch() * 0.01).toFixed(2)).substr(-2, 1) << 0;
	const ind = (secs) % artboards.length;

	const artboard = artboards[ind];
	const imgStyle = (artboard && ((secs - 1) % artboards.length !== ind)) ? {
		width  : `${artboard.meta.frame.size.width * ((vpHeight - 278) / artboard.meta.frame.size.height)}px`,
		height : `${artboard.meta.frame.size.height * ((vpHeight - 278) / artboard.meta.frame.size.height)}px`
	} : null;

	return (<div className="upload-processing-wrapper"><Column horizontal="center" vertical="start">
		{(processing.message.length > 0) && (<Row><div className="upload-processing-title">{processing.message}</div></Row>)}
		<Row horizontal="center" style={{width:'100%'}}><div className="upload-processing-url-wrapper">
			<InputField
				type="lbl"
				name="urlInspect"
				placeholder={urlInspect}
				value={urlInspect}
				button="Copy"
				status={INPUTFIELD_STATUS_IDLE}
				onChange={null}
				onErrorClick={()=> null}
				onFieldClick={()=> {copy(urlInspect); props.onCopyURL(urlInspect)}}
				onSubmit={()=> {copy(urlInspect); props.onCopyURL(urlInspect)}}
			/>
			<InputField
				type="lbl"
				name="urlParts"
				placeholder={urlParts}
				value={urlParts}
				button="Copy"
				status={INPUTFIELD_STATUS_IDLE}
				onChange={null}
				onErrorClick={()=> null}
				onFieldClick={()=> {copy(urlParts); props.onCopyURL(urlParts)}}
				onSubmit={()=> {copy(urlParts); props.onCopyURL(urlParts)}}
			/>
			<InputField
				type="lbl"
				name="urlPresent"
				placeholder={urlPresent}
				value={urlPresent}
				button="Copy"
				status={INPUTFIELD_STATUS_IDLE}
				onChange={null}
				onErrorClick={()=> null}
				onFieldClick={()=> {copy(urlPresent); props.onCopyURL(urlPresent)}}
				onSubmit={()=> {copy(urlPresent); props.onCopyURL(urlPresent)}}
			/>
		</div></Row>

		<Row><div className="upload-processing-button-wrapper">
			{/*<CopyToClipboard onCopy={props.onCopyURL} text={url}>*/}
				{/*<button className="adjacent-button" style={{marginRight:'10px'}}>Copy</button>*/}
			{/*</CopyToClipboard>*/}
			<button onClick={()=> props.onCancel()}>Cancel</button>
		</div></Row>

		<Row horizontal="center">{(artboard && ((secs - 1) % artboards.length !== ind))
			? (<ImageLoader
				src={`${artboard.filename}@0.25x.png`}
				image={()=> (<img className="upload-processing-image" src={`${artboard.filename}@0.25x.png`} style={imgStyle} alt={upload.title} />)}
				loading={()=> (<div className="upload-processing-image upload-processing-image-loading" style={imgStyle}>…</div>)}
				error={()=> (<div className="upload-processing-image upload-processing-image-error" style={imgStyle}>…</div>)}
			/>)
			: (<img className="upload-processing-image upload-processing-image-placeholder" src={adBannerPanel.image} onClick={()=> {trackEvent('ad-banner', 'click'); window.open(adBannerPanel.url);}} alt={adBannerPanel.title} />)
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
				message : '…'
			},
			percent     : 100,
			tooltip     : 'Loading…'
		};

		this.recordedHistory = false;
		this.busyInterval = null;
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
					return ([...tabSet].shift());
				})
			});
		}

		const { deeplink } = this.props;
		if (deeplink.uploadID !== 0) {
			this.onFetchUpload();
		}

		document.addEventListener('keydown', this.handleKeyDown.bind(this));
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
		const { section, upload } = this.state;

		if (!this.recordedHistory && profile && upload && deeplink && deeplink.uploadID !== 0) {
			this.recordedHistory = true;
			this.onAddHistory();
		}

		if (deeplink && deeplink !== prevProps.deeplink && deeplink.uploadID !== 0) {
			this.onFetchUpload();
		}


		if (upload && processing && this.processingInterval === null) {
			this.setState({
				urlBanner  : false,
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


		const insetHeight = 120 + (((flattenUploadArtboards(upload, 'page_child').length > GRID.colsMax) << 0) * GRID.padding.row);

// 		if (artboardsWrapper.current && Maths.geom.isSizeDimensioned({ width : artboardsWrapper.current.clientWidth, height : artboardsWrapper.current.clientHeight}) && !isSizeDimensioned(this.state.viewSize)) {
		if (artboardsWrapper.current && artboardsWrapper.current.clientWidth !== this.state.viewSize.width && artboardsWrapper.current.clientHeight - insetHeight !== this.state.viewSize.height) {
			const viewSize = {
				width  : artboardsWrapper.current.clientWidth,
				height : artboardsWrapper.current.clientHeight - insetHeight
			};


// 			const artboards = flattenUploadArtboards(upload, (section === SECTIONS.PARTS) ? 'container' : 'page_child');
			const artboards = flattenUploadArtboards(upload, 'page_child');
			if (artboards.length > 0) {
				const baseSize = this.calcArtboardBaseSize((section === SECTIONS.PRESENTER) ? artboards.slice(0, 1) : artboards, viewSize);
				console.log('_-]BASE SIZE[-_', baseSize);

				const fitScale = this.calcFitScale(baseSize, viewSize);
				console.log('_-]FIT SCALE[-_', fitScale);

				const scrollPt = this.calcScrollPoint(PAN_ZOOM.panMultPt, viewSize, baseSize, fitScale);

				const scaledCoords = this.calcArtboardScaledCoords((section === SECTIONS.PRESENTER) ? artboards.slice(0, 1) : artboards, fitScale);
				console.log('_-]SCALED COORDS[-_', scaledCoords);

				console.log('-=-=-=-=-=-', insetHeight, viewSize, baseSize, fitScale, scrollPt);
				this.setState({ fitScale, viewSize, scrollPt,
					scale : fitScale
				}, ()=> {
// 					this.contentSize = {
// 						width  : baseSize.width * fitScale,
// 						height : baseSize.height * fitScale,
// 					};
					this.handlePanMove(PAN_ZOOM.panMultPt.x, PAN_ZOOM.panMultPt.y); this.setState({ scrolling : false });
				});
			}

// 			if (Maths.geom.isSizeDimensioned(this.contentSize)) {
// 				const fitScale = Math.max(Math.min(viewSize.height / this.contentSize.height, viewSize.width / this.contentSize.width, PAN_ZOOM.zoomNotches.slice(-1)[0]), PAN_ZOOM.zoomNotches[0]);
// 				const scrollPt = this.calcScrollPoint(PAN_ZOOM.panMultPt, viewSize, this.contentSize, fitScale);
//
// 				console.log('-=-=-=-=-=-', viewSize, this.contentSize, fitScale, scrollPt);
// 				this.setState({ fitScale, viewSize,
// 					scale : fitScale
// 				}, ()=> {
// 					this.handlePanMove(PAN_ZOOM.panMultPt.x, PAN_ZOOM.panMultPt.y); this.setState({ scrolling : false });
// 				});
// 			}
		}

		if (upload && canvasWrapper.current) {
			if (!this.state.tutorial && cookie.load('tutorial') === '0' && this.state.section === SECTIONS.INSPECT) {
				cookie.save('tutorial', '1', { path : '/' });

				const { scrollPt } = this.state;
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

		clearInterval(this.busyInterval);
		clearInterval(this.processingInterval);
		clearInterval(this.canvasInterval);
		clearTimeout(this.scrollTimeout);

		this.busyInterval = null;
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
			const { frame } = slice.meta;
			return (<SliceRolloverItem
				key={i}
				id={slice.id}
				artboardID={artboard.id}
				title={slice.title}
				type={slice.type}
				filled={slice.filled}
				visible={(!scrolling)}
				top={frame.origin.y}
				left={frame.origin.x}
				width={frame.size.width}
				height={frame.size.height}
				scale={scale}
				offset={offset}
				onRollOver={(offset)=> this.handleSliceRollOver(i, slice, offset)}
				onRollOut={(offset)=> this.handleSliceRollOut(i, slice, offset)}
				onClick={(offset)=> this.handleSliceClick(i, slice, offset)}
			/>);
		});

		return(slices);
	};

	calcArtboardBaseSize = (artboards, vpSize)=> {
// 		console.log('InspectorPage.calcArtboardBaseSize()', artboards, vpSize);

		let maxH = 0;
		let offset = {
			x : 0,
			y : 0
		};

		let baseSize = {
			width  : 0,
			height : 0
		};


		artboards.forEach((artboard, i)=> {
			if ((i % GRID.colsMax) << 0 === 0 && i > 0) {
				offset.x = 0;
				offset.y += maxH + GRID.padding.row;
				maxH = 0;
			}

			maxH = Math.round(Math.max(maxH, artboard.meta.frame.size.height));
			baseSize.height = Math.max(baseSize.height, offset.y + maxH);

			offset.x += Math.round(((i % GRID.colsMax < (GRID.colsMax - 1) && i < artboards.length - 1) ? GRID.padding.col : 0) + (artboard.meta.frame.size.width));
			baseSize.width = Math.max(baseSize.width, offset.x);
		});

		return (baseSize);
	};

	calcArtboardScaledCoords = (artboards, scale)=> {
// 		console.log('InspectorPage.calcArtboardScaledCoords()', artboards, scale);

// 		const grid = {
// 			cols : (Math.min(artboards.length, GRID.colsMax) - 1) * 50,
// 			rows : ((artboards.length > 0) ? ((artboards.length / GRID.colsMax) << 0) : 0) * 50
// 		};

		let maxH = 0;
		let offset = {
			x : 0,
			y : 0
		};

		let scaledCoords = [];
		artboards.forEach((artboard, i)=> {
			if (((i % GRID.colsMax) << 0) === 0 && i > 0) {
				offset.x = 0;
				offset.y += maxH + GRID.padding.row;
				maxH = 0;
			}

			scaledCoords.push({ artboard,
				coords : Object.assign({}, offset)
			});

			maxH = Math.round(Math.max(maxH, artboard.meta.frame.size.height * scale));
			offset.x += Math.round(((i % GRID.colsMax < (GRID.colsMax - 1)) ? GRID.padding.col : 0) + (artboard.meta.frame.size.width * scale));
		});

		return (scaledCoords);
	};

	calcCanvasSliceFrame = (slice, artboard, offset, scrollPt)=> {
// 		console.log('InspectorPage.calcCanvasSliceFrame()', slice, artboard, offset, scrollPt);

		const { section, upload, scale, urlBanner } = this.state;
		const artboards = flattenUploadArtboards(upload, 'page_child');

		const baseOffset = {
			x : (artboards.length < GRID.colsMax || section === SECTIONS.PRESENTER) ? GRID.padding.col * 0.5 : 0,
			y : 24 + (38 * (urlBanner << 0)) + PAN_ZOOM.insetSize.height
		};

// 		const baseOffset = {
// 			x : (artboards.length < GRID.colsMax || section === SECTIONS.PRESENTER) ? GRID.padding.col * 0.5 : 0,
// 			y :(38 * (urlBanner << 0)) + (artboards.length < GRID.colsMax) ? PAN_ZOOM.insetSize.height : 0,
// 		};

		const srcFrame = Maths.geom.cropFrame(slice.meta.frame, artboard.meta.frame);
		const srcOffset = {
			x : baseOffset.x + ((offset.x - scrollPt.x) << 0),
			y : baseOffset.y + ((offset.y - scrollPt.y) << 0)
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
    //const fitScale = Math.max(Math.min(this.state.viewSize.height / this.contentSize.height, this.state.viewSize.width / this.contentSize.width, PAN_ZOOM.zoomNotches.slice(-1)[0]), PAN_ZOOM.zoomNotches[0]);
		//return (Math.max(Math.min(vpSize.height / baseSize.height, vpSize.width / baseSize.width, Math.max(...PAN_ZOOM.zoomNotches)), Math.min(...PAN_ZOOM.zoomNotches)));
		return (Math.max(Math.min(vpSize.height / baseSize.height, vpSize.width / baseSize.width, 3), 0.001));
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

	resetTabSets = (upload, artboards)=> {
// 		console.log('InspectorPage.resetTabSets()', upload, artboards);

		const { section  } = this.state;
		let tabSets = inspectorTabSets[section];
		if (section === SECTIONS.INSPECT) {
			tabSets = [...tabSets].map((tabSet, i) => {
				if (i === 0) {
					return (tabSet);

				} else {
					return (tabSet.map((tab, j) => {
						return ((j === 0) ? Object.assign({}, tab, {
							type     : 'component',
							enabled  : ((upload.state << 0) === 3),
							contents : <SpecsList
								upload={upload}
								slice={null}
								creatorID={0}
								onCopySpec={(msg) => this.handleClipboardCopy('spec', msg)}
							/>
						}) : tab);
					}));
				}
			});

			const activeTabs = (this.state.activeTabs.length === 0) ? tabSets.map((tabSet)=> {
				return ([...tabSet].shift());
			}) : this.state.activeTabs;

			this.setState({ tabSets, activeTabs,
				artboard    : (section === SECTIONS.PRESENTER && artboards.length > 0) ? artboards[0] : null,
				slice       : null,
				offset      : null,
				hoverSlice  : null,
				hoverOffset : null,
				tooltip     : null
			});

		} else if (section === SECTIONS.PARTS) {
			tabSets = [...tabSets].map((tabSet, i) => {
				return (tabSet.map((tab, j) => {
					return (Object.assign({}, tab, {
						enabled  : ((upload.state << 0) === 3),
						contents : <PartsList
							enabled={((upload.state << 0) === 3)}
							contents={null}
							onPartListItem={(slice) => this.handleDownloadPartListItem(slice)} />
					}));
				}));
			});

			const activeTabs = (this.state.activeTabs.length === 0) ? tabSets.map((tabSet)=> {
				return ([...tabSet].shift());
			}) : this.state.activeTabs;

			this.setState({ upload, tabSets, activeTabs,
				artboard  : (section === SECTIONS.PRESENTER && artboards.length > 0) ? artboards[0] : null,
				slice     : null,
				tooltip   : null
			});

		} else if (section === SECTIONS.PRESENTER) {
			if (artboards.length > 0) {
				const artboard = (this.state.artboard) ? this.state.artboard : artboards[0];

				let formData = new FormData();
				formData.append('action', 'ARTBOARD_SLICES');
				formData.append('artboard_id', artboard.id);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('ARTBOARD_SLICES', response.data);

						artboard.slices = response.data.slices.map((slice)=> {
							const meta = JSON.parse(slice.meta.replace(/\n/g, '\\\\n'));
							return ({
								id         : slice.id << 0,
								artboardID : slice.artboard_id << 0,
								title      : slice.title,
								type       : slice.type,
								filename   : slice.filename,
								meta       : Object.assign({}, meta, {
									orgFrame : meta.frame,
									frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
								}),
								added      : slice.added,
								filled     : false,
								children   : []
							});
						});

						upload.pages = upload.pages.map((page)=> (Object.assign({}, page, {
							artboards : page.artboards.map((item) => ((item.id === artboard.id) ? artboard : item))
						})));

						const slices = [...intersectSlices(artboard.slices, artboard.meta.frame)];
						const langs = [
							toCSS(slices),
							toReactCSS(slices),
							toSwift(slices, artboard),
							toAndroid(slices, artboard)
						];

						tabSets = [...tabSets].map((tabSet, i) => {
							return (tabSet.map((tab, j) => {
								if (i === 0) {
									return (Object.assign({}, tab, {
										enabled  : ((upload.state << 0) === 3),
										contents : langs[j].html,
										syntax   : langs[j].syntax
									}));

								} else {
									return (Object.assign({}, tab, {
										type     : 'component',
										enabled  : ((upload.state << 0) === 3),
										contents : <ArtboardsList
											enabled={((upload.state << 0) === 3)}
											contents={flattenUploadArtboards(upload, 'page_child')}
											onArtboardListItem={(artboard) => this.handleChangeArtboard(artboard)} />
									}));
								}
							}));
						});

						const activeTabs = (this.state.activeTabs.length === 0) ? tabSets.map((tabSet)=> {
							return ([...tabSet].shift());
						}) : this.state.activeTabs;

						this.setState({ upload, tabSets, activeTabs, artboard,
							slice     : slices[0],
							offset    : slices[0].meta.frame.origin,
							tooltip   : null
						});

						if (!this.canvasInterval) {
							this.canvasInterval = setInterval(()=> this.onCanvasInterval(), CANVAS.marchingAnts.interval);
						}

					}).catch((error)=> {
				});
			}
		}
	};

	replaceTabSets = (artboard, slice, offset)=> {
// 		console.log('InspectorPage.replaceTabSets()', artboard, slice, offset);

		const { profile } = this.props;
		const { section, upload } = this.state;
		let tabSets = [...this.state.tabSets];

		const slices = [...intersectSlices(artboard.slices, slice.meta.frame)];
		const langs = [
			toCSS(slices),
			toReactCSS(slices),
			toSwift(slices, artboard),
			toAndroid(slices, artboard)
		];

		if (section === SECTIONS.INSPECT) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				if (i === 1) {
					return (tabSet.map((tab, j)=> {
						return ((j === 0) ? Object.assign({}, tab, {
							type     : 'component',
							enabled  : true,
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
							enabled  : true,
							contents : langs[i].html,
							syntax   : langs[i].syntax
						}));
					}));
				}
			});

		} else if (section === SECTIONS.PARTS) {
			tabSets[0][0].type = 'component';
			tabSets[0][0].enabled = true;

			if (slice.type === 'symbol') {
				let formData = new FormData();
				formData.append('action', 'SYMBOL_SLICES');
				formData.append('slice_id', slice.id);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('SYMBOL_SLICES', response.data);

						const slices = response.data.slices.map((item)=> {
							const meta = JSON.parse(item.meta.replace(/\n/g, '\\\\n'));
							return ({
								id         : item.id << 0,
								artboardID : item.artboard_id << 0,
								title      : item.title,
								type       : item.type,
								filename   : item.filename,
								meta       : Object.assign({}, meta, {
									orgFrame : meta.frame,
									frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
								}),
								added      : item.added,
								filled     : false
							});
						});

						slice.children = [...fillGroupPartItemSlices(upload, slice), ...slices];
						tabSets[0][0].enabled = true;
						tabSets[0][0].contents = <PartsList
							enabled={true}
							contents={slice.children}
							onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
						this.setState({ tabSets });
					}).catch((error)=> {
				});

			} else if (slice.type === 'group' || slice.type === 'background') {
				tabSets[0][0].enabled = true;
				tabSets[0][0].contents = <PartsList
					enabled={true}
					contents={fillGroupPartItemSlices(upload, slice)}
					onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
				this.setState({ tabSets });
			}

		} else if (section === SECTIONS.PRESENTER) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				return (tabSet.map((tab, j)=> {
					if (i === 0) {
						return (Object.assign({}, tab, {
							enabled  : true,
							contents : langs[j].html,
							syntax   : langs[j].syntax
						}));

					} else {
						return (Object.assign({}, tab, {
							type     : 'component',
							enabled  : true,
							contents : <ArtboardsList
								enabled={true}
								contents={flattenUploadArtboards(upload, 'page_child')}
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

		this.setState({ upload, artboard, tabSets, activeTabs });
	};

	restoreTabSets = (upload, artboard, slice)=> {
		console.log('InspectorPage.restoreTabSets()', upload, artboard, slice);

		const { profile } = this.props;
		const { section } = this.state;
		let tabSets = [...this.state.tabSets];
		let activeTabs = [...this.state.activeTabs];

		const slices = [...intersectSlices(artboard.slices, slice.meta.frame)];
		const langs = [
			toCSS(slices),
			toReactCSS(slices),
			toSwift(slices, artboard),
			toAndroid(slices, artboard)
		];

		if (section === SECTIONS.INSPECT) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				if (i === 1) {
					return (tabSet.map((tab, j)=> {
						return ((j === 0) ? Object.assign({}, tab, {
							type     : 'component',
							enabled  : true,
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
							enabled  : true,
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

						slice.children = [...fillGroupPartItemSlices(upload, slice), ...slices];
						tabSets[0][0].enabled = true;
						tabSets[0][0].contents = <PartsList
							enabled={true}
							contents={slice.children}
							onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
						this.setState({ tabSets });
					}).catch((error)=> {
				});

			} else if (slice.type === 'group' || slice.type === 'background') {
				tabSets[0][0].enabled = true;
				tabSets[0][0].contents = <PartsList
					enabled={true}
					contents={fillGroupPartItemSlices(upload, slice)}
					onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
			}

		} else if (section === SECTIONS.PRESENTER) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				return (tabSet.map((tab, j)=> {
					if (i === 0) {
						return (Object.assign({}, tab, {
							enabled  : true,
							contents : langs[j].html,
							syntax   : langs[j].syntax
						}));

					} else {
						return (Object.assign({}, tab, {
							enabled  : true,
							type     : 'component',
							contents : <ArtboardsList
								enabled={true}
								contents={flattenUploadArtboards(upload, 'page_child')}
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

		this.setState({ artboard, tabSets, activeTabs,
			hoverSlice  : null,
			hoverOffset : null
		});
	};

	handleArtboardClick = (event)=> {
		console.log('InspectorPage.handleArtboardClick()', event.target);

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
		if (artboard && slice) {
			artboard.slices.filter((item)=> (slice.id !== item.id)).forEach((item)=> {
				item.filled = false;
			});
		}

		this.setState({
			artboard    : (slice) ? artboard : null,
// 			hoverSlice  : null,
// 			hoverOffset : null
		});
	};

	handleArtboardRollOver = (event)=> {
// 		console.log('InspectorPage.handleArtboardRollOver()', event.target);

// 		event.stopPropagation();
		const artboardID = event.target.getAttribute('data-artboard-id') << 0;
		if (artboardID) {
// 			let { upload, artboard, section } = this.state;
			let { upload, artboard } = this.state;
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

						artboard.slices = response.data.slices.map((slice)=> {
							const meta = JSON.parse(slice.meta.replace(/\n/g, '\\\\n'));
							return ({
								id         : slice.id << 0,
								artboardID : slice.artboard_id << 0,
								title      : slice.title,
								type       : slice.type,
								filename   : slice.filename,
								meta       : Object.assign({}, meta, {
									orgFrame : meta.frame,
									frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
								}),
								added      : slice.added,
								filled     : false,
								children   : []
							});
						});

						upload.pages = upload.pages.map((page)=> (Object.assign({}, page, {
							artboards : page.artboards.map((item) => ((item.id === artboardID) ? artboard : item))
						})));

						this.setState({ upload, artboard });
					}).catch((error)=> {
				});

			} else {
				this.setState({ upload, artboard });
			}

			if (!this.canvasInterval) {
				this.canvasInterval = setInterval(()=> this.onCanvasInterval(), CANVAS.marchingAnts.interval);
			}
		}
	};

	handleCanvasClick = (event)=> {
// 		console.log('InspectorPage.handleCanvasClick()', this.state.tabSets);
		event.stopPropagation();

		const { upload, artboard, scrolling } = this.state;
		if (!scrolling) {
			this.resetTabSets(upload, [artboard]);
// 			this.resetTabSets(upload, (artboard) ? [artboard] : []);
		}
	};

	handleCanvasUpdate = ()=> {
// 		console.log('InspectorPage.handleCanvasUpdate()', this.antsOffset);

		const { scrollPt, offset, hoverOffset } = this.state;
		const { artboard, slice, hoverSlice } = this.state;

		const context = canvas.current.getContext('2d');
		context.clearRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		context.font = CANVAS.caption.fontFace;
		context.textAlign = CANVAS.caption.align;
		context.textBaseline = CANVAS.caption.baseline;

		// debug fill
// 		context.fillStyle = 'rgba(0, 0, 0, 0.25)';
// 		context.fillRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		// debug lines
// 		context.lineWidth = 1.0;
// 		context.setLineDash([]);
// 		context.lineDashOffset = 0;
// 		context.beginPath();
// 		context.strokeStyle = 'rgba(0, 255, 255, 0.5)';
// 		context.strokeRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);
// 		context.moveTo(canvas.current.clientWidth * 0.5, 0); // top-center
// 		context.lineTo(canvas.current.clientWidth * 0.5, canvas.current.clientHeight);
// 		context.moveTo(0, canvas.current.clientHeight * 0.5); // left-center
// 		context.lineTo(canvas.current.clientWidth, canvas.current.clientHeight * 0.5);
// 		context.stroke();


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

		const { upload } = this.state;
		if (artboard.pageID === -1) {
			const dir = artboard.id;

			const artboards = flattenUploadArtboards(upload, 'page_child');
			const ind = (artboards.findIndex((item)=> (item.id === this.state.artboard.id)) + dir) % artboards.length;

			if (this.state.artboard.id !== artboards[((ind < 0) ? artboards.length + ind : ind)].id) {
				this.setState({
					artboard    : artboards[((ind < 0) ? artboards.length + ind : ind)],
					slice       : null,
					offset      : null,
					hoverSlice  : null,
					hoverOffset : null,
				}, ()=> {
					this.resetTabSets(upload, artboards);
					this.handleZoom(666);
					setTimeout(()=> this.handleZoom(0), 10);
				});
			}

		} else {
			this.setState({ artboard,
				slice       : null,
				offset      : null,
				hoverSlice  : null,
				hoverOffset : null,
			}, ()=> {
				this.resetTabSets(upload, [artboard]);
				this.handleZoom(666);
				setTimeout(()=> this.handleZoom(0), 10);
			});
		}
	};

	handleChangeSection = (section)=> {
		console.log('InspectorPage.handleChangeSection()', section);

		const { upload } = this.state;
// 		this.setState({ section }, ()=> {
// 			this.handleZoom(-1);
// 			this.props.onPage(buildInspectorPath(upload, section));
// 			this.resetTabSets(upload, flattenUploadArtboards(upload, 'page_child'));
// 			setTimeout(()=> this.handleZoom(0), 5);
// 		});
		window.location.href = buildInspectorPath(upload, `/${section}`);
	};

	handleClipboardCopy = (type, msg='Copied to Clipboard!')=> {
		console.log('InspectorPage.handleClipboardCopy()', type, msg);

		trackEvent('button', `copy-${type}`);
		const { processing } = this.props;
		const { section, urlBanner } = this.state;

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : (section === SECTIONS.PRESENTER && !processing) ? 880 : 360
			},
			content  : (type === 'url' || msg.length >= 100) ? `Copied ${type} to clipboard` : msg,
			duration : 1750
		});
	};

	handleDownloadAll = ()=> {
// 		console.log('InspectorPage.handleDownloadAll()');

		trackEvent('button', 'download-project');
		const { upload } = this.state;
		Browsers.makeDownload(`http://cdn.designengine.ai/download-project.php?upload_id=${upload.id}`);
	};

	handleDownloadArtboardPDF = ()=> {
// 		console.log('InspectorPage.handleDownloadArtboardPDF()');

		trackEvent('button', 'download-pdf');
		const { upload } = this.state;
		Browsers.makeDownload(`http://cdn.designengine.ai/download-pdf.php?upload_id=${upload.id}`);
	};

	handleDownloadPartListItem = (slice)=> {
// 		console.log('InspectorPage.handleDownloadPartListItem()', slice);

		trackEvent('button', 'download-part');
		const { upload } = this.state;
		Browsers.makeDownload(`http://cdn.designengine.ai/download-slices.php?upload_id=${upload.id}&slice_title=${slice.title}&slice_ids=${[slice.id]}`);
	};

	handleDownloadPartsList = ()=> {
// 		console.log('InspectorPage.handleDownloadPartsList()');

		trackEvent('button', 'download-parts');
		const { upload, slice } = this.state;
		const sliceIDs = (slice.type === 'group') ? fillGroupPartItemSlices(upload, slice).map((slice)=> (slice.id)).join(',') : slice.children.map((slice)=> (slice.id)).join(',');

		Browsers.makeDownload(`http://cdn.designengine.ai/download-slices.php?upload_id=${upload.id}&slice_title=${slice.title}&slice_ids=${sliceIDs}`);
	};

	handleFileDrop = (files)=> {
// 		console.log('InspectorPage.handleFileDrop()', files);

		const { id, email } = this.props.profile;
		const { upload, viewSize, urlBanner } = this.state;

		if (files.length > 0) {
			const file = files.pop();

			if (Files.extension(file.name) === 'sketch') {
				if (file.size < 100 * (1024 * 1024)) {
					if (Files.basename(upload.filename) === file.name) {
						sendToSlack(`*[${id}]* *${email}* started uploading file "_${file.name}_" (\`${(file.size / (1024 * 1024)).toFixed(2)}MB\`)`);
						trackEvent('upload', 'file');

						const config = {
							headers            : { 'content-type' : 'multipart/form-data' },
							onDownloadProgress : (progressEvent)=> {},
							onUploadProgress   : (progressEvent)=> {
								const { loaded, total } = progressEvent;

								const percent = Maths.clamp(Math.round((loaded * 100) / total), 0, 99);
								this.setState({ percent });

								if (progressEvent.loaded >= progressEvent.total) {
									sendToSlack(`*[${id}]* *${email}* completed uploading file "_${file.name}_" (\`${(file.size / (1024 * 1024)).toFixed(2)}MB\`)`);
									trackEvent('button', 'resubmit');

									if (this.busyInterval) {
										clearInterval(this.busyInterval);
										this.busyInterval = null;
									}

									this.busyInterval = setInterval(()=> this.onBusyInterval(), STATUS_INTERVAL);
									this.onBusyInterval();

									let formData = new FormData();
									formData.append('action', 'RESET_UPLOAD');
									formData.append('upload_id', upload.id);
									axios.post('https://api.designengine.ai/system.php', formData)
										.then((response)=> {
											console.log('RESET_UPLOAD', response.data);

											if (this.busyInterval) {
												clearInterval(this.busyInterval);
												this.busyInterval = null;
											}

											if (response.data.reset) {
												this.setState({
													percent : 100
												}, ()=> this.props.onProcessing(true));

											} else {
												this.props.onPopup({
													type     : POPUP_TYPE_ERROR,
													content  : 'Revision error occurred, try uploading again.',
													offset  : {
														right : window.innerWidth - viewSize.width
													}
												});
											}
										}).catch((error)=> {
									});
								}
							}
						};

						let formData = new FormData();
						formData.append('file', file);
						axios.post('http://cdn.designengine.ai/upload.php?dir=/system', formData, config)
							.then((response)=> {
								console.log("upload.php", response.data);
							}).catch((error)=> {
							sendToSlack(`*${email}* failed uploading file _${file.name}_`);
						});

					} else {
						this.props.onPopup({
							type     : POPUP_TYPE_ERROR,
							content  : 'File names do not match',
							offset  : {
								top   : (urlBanner << 0) * 38,
								right : window.innerWidth - viewSize.width
							}
						});
					}

				} else {
					sendToSlack(`*[${id}]* *${email}* uploaded oversized file "_${file.name}_" (${Math.round(file.size * (1 / (1024 * 1024)))}MB)`);
					this.props.onPopup({
						type     : POPUP_TYPE_ERROR,
						content  : 'File size must be under 100MB.',
						offset  : {
							top   : (urlBanner << 0) * 38,
							right : window.innerWidth - viewSize.width
						}
					});
				}

			} else {
				sendToSlack(`*[${id}]* *${email}* uploaded incompatible file "_${file.name}_"`);
				this.props.onPopup({
					type     : POPUP_TYPE_ERROR,
					content  : (Files.extension(file.name) === 'fig') ? 'Figma Support Coming Soon!' : (Files.extension(file.name) === 'psd') ? 'Photoshop Support Coming Soon!' :  (Files.extension(file.name) === 'xd') ? 'Adobe XD Support Coming Soon!' : 'Only Sketch files are support at this time.',
					offset  : {
						top   : (urlBanner << 0) * 38,
						right : window.innerWidth - viewSize.width
					},
					duration : 2500
				});
			}
		}
	};

	handleInviteTeamFormSubmitted = (result)=> {
// 		console.log('InspectorPage.handleInviteTeamFormSubmitted()', result);
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
					pageID : -1
				});

			} else if (event.keyCode === ARROW_RT_KEY) {
				this.handleChangeArtboard({
					id     : 1,
					pageID : -1
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
		console.log('InspectorPage.handlePanMove()', x, y, this.state.viewSize, this.contentSize);

		if (Maths.geom.isSizeDimensioned(this.contentSize)) {
			const panMultPt = { x, y };
			const { viewSize } = this.state;
			const pt = this.calcTransformPoint();

			const scrollPt = {
				x : -Math.round((pt.x * viewSize.width) + (this.contentSize.width * -0.5)),
				y : -Math.round((pt.y * viewSize.height) + (this.contentSize.height * -0.5))
			};

			this.setState({ panMultPt, scrollPt, scrolling : true });
		}
	};

	handleSliceClick = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceClick()', ind, slice, offset);

		trackEvent('slice', `${slice.id}_${Strings.uriSlug(slice.title)}`);
		const { artboard } = this.state;

		slice.filled = true;
		artboard.slices.filter((item)=> (item.id !== slice.id)).forEach((item)=> {
			item.filled = false;
		});

		this.setState({ slice, offset,
			hoverSlice  : null,
			hoverOffset : null

		}, ()=> (this.replaceTabSets(artboard, slice, offset)));
	};

	handleSliceRollOut = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceRollOut()', ind, slice, offset, this.state);

		const { upload, artboard } = this.state;
		if (this.state.slice) {
			this.restoreTabSets(upload, artboard, this.state.slice);

		} else {
			this.resetTabSets(upload, (artboard) ? [artboard] : []);
		}
	};

	handleSliceRollOver = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceRollOver()', ind, slice, offset);

		const { artboard } = this.state;
		if (artboard) {
			slice.filled = true;
			artboard.slices.filter((item)=> (this.state.slice && this.state.slice.id !== item.id)).forEach((item)=> {
				item.filled = false;
			});

			this.setState({
				hoverSlice : slice,
				hoverOffset : offset
			}, ()=> (this.replaceTabSets(artboard, slice, offset)));
		}
	};

	handleTab = (tab)=> {
// 		 console.log('InspectorPage.handleTab()', tab);
		trackEvent('tab', Strings.uriSlug(tab.title));

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

		const { fitScale, viewSize, urlBanner } = this.state;
		let scale = fitScale;

		let ind = -1;
		if (direction === 666) {
			scale -= 0.0001;

		} else if (direction !== 0) {
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

		const panMultPt = {
			x : this.state.panMultPt.x,
			y : this.state.panMultPt.y
		};

		console.log(':::::::::::::', scale);

		this.setState({ scale, panMultPt,
			slice : null
		}, ()=> (this.forceUpdate()));

		this.props.onPopup({
			type    : POPUP_TYPE_STATUS,
			offset  : {
				top   : (urlBanner << 0) * 38,
				right : window.innerWidth - viewSize.width
			},
			content : `${(scale * 100) << 0}%`
		})
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

	onBusyInterval = ()=> {
		console.log('InspectorPage.onBusyInterval()');

		const { upload } = this.state;
		this.setState({
			processing  : {
				state   : 0,
				message : `Versioning ${Files.truncateName(upload.filename)}${DateTimes.ellipsis()}`
			}
		});
	};

	onCanvasInterval = ()=> {
// 		console.log('InspectorPage.onCanvasInterval()', this.antsOffset);

		const { scrolling } = this.state;
		if (canvas.current && !scrolling) {
			this.antsOffset = ((this.antsOffset + CANVAS.marchingAnts.increment) % CANVAS.marchingAnts.modOffset);
			this.handleCanvasUpdate();
		}
	};

	onFetchUpload = ()=> {
		console.log('InspectorPage.onFetchUpload()', this.props);

		const { processing } = this.props;
		const { uploadID } = this.props.deeplink;
// 		const { section } = this.state;

		this.setState({ tooltip : (!processing) ? 'Loading…' : null });

		axios.post('https://api.designengine.ai/system.php', qs.stringify({
			action    : 'UPLOAD',
			upload_id : uploadID
		})).then((response)=> {
			console.log('UPLOAD', response.data);

			let upload = response.data.upload;
			if (Object.keys(upload).length > 0 && ((upload.state << 0) <= 3)) {
				upload = Object.assign({}, response.data.upload, {
					id    : upload.id << 0,
					state : upload.state << 0,
					pages : upload.pages.map((page)=> (
						Object.assign({}, page, {
							id        : page.id << 0,
							uploadID  : page.upload_id << 0,
							artboards : page.artboards.map((artboard) => (
								Object.assign({}, artboard, {
									id       : artboard.id << 0,
									pageID   : artboard.page_id << 0,
									uploadID : artboard.upload_id << 0,
									meta     : JSON.parse(artboard.meta.replace(/\n/g, '\\\\n'))
								})
							))
						})
					))
				});

				this.setState({ upload,
				}, ()=> {
					if ((upload.state << 0) === 3) {
						this.resetTabSets(upload, flattenUploadArtboards(upload, 'page_child'));
					}
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
		const title = Files.truncateName(upload.filename);

		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', upload.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('UPLOAD_STATUS', response.data);
				const { status } = response.data;
				const processingState = status.state;
// 				const { totals } = status;
//
// 				const total = totals.all << 0;//Object.values(totals).reduce((acc, val)=> ((acc << 0) + (val << 0)));
// 				const mins = moment.duration(moment(`${status.ended.replace(' ', 'T')}Z`).diff(`${status.started.replace(' ', 'T')}Z`)).asMinutes();
// 				const secs = ((mins - (mins << 0)) * 60) << 0;

				if (processingState === 0) {
					const { queue } = status;
					this.setState({
						urlBanner  : false,
						processing : {
							state   : processingState,
							message : `Queued position ${queue.position}/${queue.total}, please wait${DateTimes.ellipsis()}`
						}
					});

				} else if (processingState === 1) {
					this.setState({
						urlBanner  : false,
						processing : {
							state   : processingState,
							message : `Preparing ${title}${DateTimes.ellipsis()}`
						}
					});

				} else if (processingState === 2) {
					this.setState({
						urlBanner  : false,
						processing : {
							state   : processingState,
// 							message : `Processing ${title}, parsed ${total} ${Strings.pluralize('element', total)} in ${(mins >= 1) ? (mins << 0) + 'm' : ''} ${secs}s…`
							message : `Processing ${title}${DateTimes.ellipsis()}`
						}
					});
					this.onFetchUpload();

				} else if (processingState === 3) {
					clearInterval(this.processingInterval);
					this.processingInterval = null;
					this.setState({
						urlBanner  : true,
						processing : {
							state   : processingState,
// 							message : `Completed processing ${total} ${Strings.pluralize('element', total)} in ${(mins >= 1) ? (mins << 0) + 'm' : ''} ${secs}s.`
							message : `Completed processing ${title}`
						}
					}, ()=> this.onShowNotification());
					this.props.onProcessing(false);

				} else if (processingState === 4) {
					clearInterval(this.processingInterval);
					this.processingInterval = null;
					this.setState({
						urlBanner  : false,
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
		console.log('InspectorPage.render()', this.props, this.state);
// 		console.log('InspectorPage.render()', this.props);
// 		console.log('InspectorPage.render()', this.state);
// 		console.log('InspectorPage.render()', (new Array(100)).fill(null).map((i)=> (Maths.randomInt(1, 10))).join(','), this.state);


		const { processing, profile } = this.props;

		const { section, upload, artboard, slice, hoverSlice, tabSets, scale, fitScale, activeTabs, scrolling, viewSize, panMultPt } = this.state;
		const { valid, restricted, urlBanner, tutorial, percent, tooltip } = this.state;

		const artboards = (section === SECTIONS.PRESENTER) ? (artboard) ? [artboard] : [] : flattenUploadArtboards(upload, 'page_child');
// 		const artboards = (section === SECTIONS.PRESENTER) ? (artboard) ? [artboard] : [] : (section === SECTIONS.PARTS) ? flattenUploadArtboards(upload, 'page_child').slice(0, 3) : flattenUploadArtboards(upload, 'page_child');
		const activeSlice = (hoverSlice) ? hoverSlice : slice;

		const listTotal = (upload && activeSlice) ? (section === SECTIONS.PRESENTER) ? flattenUploadArtboards(upload, 'page_child').length : (activeSlice) ? (activeSlice.type === 'group') ? fillGroupPartItemSlices(upload, activeSlice).length : activeSlice.children.length : 0 : 0;

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
			if ((i % GRID.colsMax) << 0 === 0 && i > 0) {
				offset.x = 0;
				offset.y += maxH + GRID.padding.row;
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
				top             : `${offset.y << 0}px`,
				left            : `${offset.x << 0}px`,
				width           : `${(scale * artboard.meta.frame.size.width) << 0}px`,
				height          : `${(scale * artboard.meta.frame.size.height) << 0}px`
				//backgroundColor : (section === SECTIONS.PARTS) ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.0)'
			};


// 			const icon = (i % 3 === 0) ? iosIcon : (i % 3 === 1) ? androidIcon : html5Icon;
// 			const iconStyle = {
// 				position  : 'absolute',
// 				top       : '50%',
// 				left      : '50%',
// 				transform : 'translate(-50%, -50%)',
// 				objectFit : 'scale-down',
// 				border    : '1px dotted rgba(255, 0, 0, 1.0)'
// 			};

			const sliceOffset = Object.assign({}, offset);
			const artboardSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'artboard', sliceOffset, scale, scrolling) : [];
			const groupSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'group', sliceOffset, scale, scrolling) : [];
			const backgroundSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'background', sliceOffset, scale, scrolling) : [];
			const textfieldSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'textfield', sliceOffset, scale, scrolling) : [];
			const symbolSlices =(artboard.slices.length > 0) ?  this.buildSliceRollOverItemTypes(artboard, 'symbol', sliceOffset, scale, scrolling) : [];
			const sliceSlices = [];//(artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'slice', sliceOffset, scale, scrolling) : [];
// 			const sliceSlices = (section !== SECTIONS.PARTS) ? [] : [<img key={i} data-artboard-id={artboard.id} src={icon} width="100%" height="100%" style={iconStyle} alt="ICON" />];
// 			const sliceSlices = (section !== SECTIONS.PARTS) ? [] : [<img key={i} data-artboard-id={artboard.id} src={icon} style={iconStyle} alt="ICON" />];

			artboardImages.push(
				<div key={i} data-artboard-id={artboard.id} className="inspector-page-artboard" style={artboardStyle}>
					<div className="inspector-page-artboard-caption">{Strings.truncate((artboard.type === 'page_child') ? artboard.title : artboard.title.split('[').shift(), 8)}</div>
					{/*<div className="inspector-page-artboard-icon-wrapper" style={{width:`${(scale * artboard.meta.frame.size.width) << 0}px`,height:`${(scale * artboard.meta.frame.size.height) << 0}px`}}><img src={icon} width="100%" height="100%" style={iconStyle} alt="ICON" /></div>*/}
				</div>
			);

			slices.push(
				<div key={i} data-artboard-id={artboard.id} className="inspector-page-slices-wrapper" style={slicesWrapperStyle} onMouseOver={this.handleArtboardRollOver} onMouseOut={this.handleArtboardRollOut} onDoubleClick={(event)=> this.handleZoom(1)}>
					<div data-artboard-id={artboard.id} className={`inspector-page-${(section === SECTIONS.PRESENTER) ? 'artboard' : 'group'}-slices-wrapper`}>{(section === SECTIONS.PRESENTER) ? artboardSlices : groupSlices }</div>
					{(section !== SECTIONS.PRESENTER) && (<div data-artboard-id={artboard.id} className="inspector-page-background-slices-wrapper">{backgroundSlices}</div>)}
					{/*<div data-artboard-id={artboard.id} className="inspector-page-background-slices-wrapper">{backgroundSlices}</div>*/}
					<div data-artboard-id={artboard.id} className="inspector-page-symbol-slices-wrapper">{symbolSlices}</div>
					{(section !== SECTIONS.PARTS) && (<div data-artboard-id={artboard.id} className="inspector-page-textfield-slices-wrapper">{textfieldSlices}</div>)}
					<div data-artboard-id={artboard.id} className="inspector-page-slice-slices-wrapper">{sliceSlices}</div>
				</div>
			);

			offset.x += Math.round(((i % GRID.colsMax < (GRID.colsMax - 1)) ? GRID.padding.col : 0) + (artboard.meta.frame.size.width * scale));
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

		const baseOffset = {
			x : (artboards.length < GRID.colsMax) ? GRID.padding.col * 0.5 : 0,
			y :24 + (38 * (urlBanner << 0)) + PAN_ZOOM.insetSize.height,
		};

		const artboardsStyle = {
			position  : 'absolute',
// 			width     : `${viewSize.width * scale}px`,
			width     : `${this.contentSize.width}px`,
// 			height    : `${viewSize.height * scale}px`,
			height    : `${this.contentSize.height}px`,
			transform : `translate(${Math.round(pt.x * viewSize.width)}px, ${Math.round(pt.y * viewSize.height)}px) translate(${Math.round(this.contentSize.width * -0.5)}px, ${Math.round(this.contentSize.height * -0.5)}px) translate(${baseOffset.x}px, ${baseOffset.y}px)`,
// 			transform : `translate(${ARTBOARD_ORIGIN.x}px, ${ARTBOARD_ORIGIN.y}px)`,
			opacity   : (processing) ? '0' : '1'
		};

		const canvasStyle = (!scrolling) ? {
			top     : `${-Math.round((pt.y * viewSize.height) + (this.contentSize.height * -0.5))}px`,
			left    : `${-Math.round((pt.x * viewSize.width) + (this.contentSize.width * -0.5))}px`,
			transform : `translate(${-baseOffset.x}px, ${-baseOffset.y}px)`,
		} : {
			display : 'none'
		};

		const tabSetWrapperStyle = {
			width  : '100%',
			height : `calc(100% - ${(section === SECTIONS.PARTS ? 154 : 58)}px)`
		};

		const progressStyle = { width : `${percent}%` };

		return (<>
			<BaseDesktopPage className="inspector-page-wrapper">
				<div className={contentClass} onWheel={this.handleWheelStart}>
					{(percent < 100) && (<div className="upload-progress-bar-wrapper" style={{width:`calc(100% - ${(section === SECTIONS.PRESENTER && !processing) ? 880 : 360}px)`}}>
						<div className="upload-progress-bar" style={progressStyle} />
					</div>)}

					<div className="inspector-page-marquee-wrapper" style={{width:`calc(100% - ${(section === SECTIONS.PRESENTER && !processing) ? 880 : 360}px)`}}>
						{(upload && urlBanner && percent === 100) && (<MarqueeBanner
							copyText={buildInspectorURL(upload)}
							removable={true}
							outro={!urlBanner}
							onCopy={()=> this.handleClipboardCopy('url', buildInspectorURL(upload))}
							onClose={()=> this.setState({ urlBanner : false })}>
							<div className="marquee-banner-content marquee-banner-content-url"><span className="txt-bold" style={{paddingRight:'5px'}}>Share on Slack:</span> {buildInspectorURL(upload)}</div>
						</MarqueeBanner>)}

						{(!processing && tooltip) && (<MarqueeBanner
							copyText={null}
							outro={!tooltip}
							onCopy={null}
							onClose={()=> this.setState({ tooltip : null })}>
							<div className="marquee-banner-content marquee-banner-content-tooltip">{tooltip}</div>
						</MarqueeBanner>)}
					</div>

					<InteractiveDiv
						x={panMultPt.x}
						y={panMultPt.y}
						scale={scale}
						scaleFactor={PAN_ZOOM.zoomFactor}
						minScale={Math.min(...PAN_ZOOM.zoomNotches)}
						maxScale={Math.max(...PAN_ZOOM.zoomNotches)}
						ignorePanOutside={false}
						renderOnChange={false}
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
						creator={(profile && profile.id << 0 === upload.creator.user_id << 0)}
						scale={scale}
						fitScale={fitScale}
						section={section}
						processing={processing}
						artboards={flattenUploadArtboards(upload, 'page_child')}
						onDrop={this.handleFileDrop}
						onChangeArtboard={this.handleChangeArtboard}
						onChangeSection={(section)=> this.handleChangeSection(section)}
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
										enabled={!processing}
										onTabClick={(tab)=> this.handleTab(tab)}
										onContentClick={(payload)=> console.log('onContentClick', payload)}
									/>
									<div className="inspector-page-panel-button-wrapper">
										<CopyToClipboard onCopy={()=> this.handleClipboardCopy((i === 0) ? 'code' : 'specs', (i === 0) ? activeTabs[i].syntax : toSpecs(activeSlice))} text={(i === 0) ? (activeTabs && activeTabs[i]) ? activeTabs[i].syntax : '' : (activeSlice) ? toSpecs(activeSlice) : ''}>
											<button disabled={!slice} className="inspector-page-panel-button">{(processing) ? 'Processing' : 'Copy to Clipboard'}</button>
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
									enabled={!processing}
									onTabClick={(tab)=> this.handleTab(tab)}
									onContentClick={(payload)=> console.log('onContentClick', payload)}
								/>
								<div className="inspector-page-panel-button-wrapper">
									<button disabled={!slice} className="inspector-page-panel-button" style={{opacity:(!processing << 0)}} onClick={()=> this.handleDownloadPartsList()}>{(processing) ? 'Processing' : `Download iOS ${Strings.pluralize('Part', listTotal)}`}</button>
									<button disabled={!slice} className="inspector-page-panel-button" style={{opacity:(!processing << 0)}} onClick={()=> this.handleDownloadPartsList()}>{(processing) ? 'Processing' : `Download Android ${Strings.pluralize('Part', listTotal)}`}</button>
									<button disabled={!slice} className="inspector-page-panel-button" style={{opacity:(!processing << 0)}} onClick={()=> this.handleDownloadPartsList()}>{(processing) ? 'Processing' : `Download HTML/CSS ${Strings.pluralize('Part', listTotal)}`}</button>
									{/*<button disabled={!upload || processing} className="inspector-page-panel-button" onClick={()=> this.handleDownloadAll()}>{(processing) ? 'Processing' : 'Download All Parts'}</button>*/}
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
										enabled={!processing}
										onTabClick={(tab)=> this.handleTab(tab)}
										onContentClick={(payload)=> console.log('onContentClick', payload)}
									/>
										<div className="inspector-page-panel-button-wrapper">
											{(i === 0)
												? (<CopyToClipboard onCopy={()=> this.handleClipboardCopy('code', activeTabs[i].syntax)} text={(activeTabs && activeTabs[i]) ? activeTabs[i].syntax : ''}>
														<button disabled={!activeTabs[i].contents} style={{opacity:(!processing << 0)}} className="inspector-page-panel-button">{(processing) ? 'Processing' : 'Copy to Clipboard'}</button>
													</CopyToClipboard>)
												: (<button disabled={(processing || artboards.length === 0)} className="inspector-page-panel-button" onClick={()=> this.handleDownloadArtboardPDF()}>{(processing) ? 'Processing' : 'Download PDF'}</button>)}
										</div>
								</div>
							</div>
						)))}
					</div>)}
				</div>)}
			</BaseDesktopPage>


			{(restricted) && (<ContentModal
				tracking="private/inspector"
				closeable={false}
				defaultButton="Register / Login"
				onComplete={()=> this.props.onPage('register')}>
				This project is private, you must be logged in as one of its team members to view!
			</ContentModal>)}

			{/*{(upload && profile && (upload.contributors.filter((contributor)=> (contributor.id === profile.id)).length > 0)) && (<UploadProcessing*/}
			{(!restricted && upload && (percent === 99 || processing)) && (<UploadProcessing
				upload={upload}
				processing={this.state.processing}
				vpHeight={viewSize.height}
				onCopyURL={(url)=> this.handleClipboardCopy('url', url)}
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
