
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import copy from 'copy-to-clipboard';
import qs from 'qs';
import ReactNotifications from 'react-browser-notifications';
import cookie from 'react-cookies';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import ImageLoader from 'react-loading-image';
import Moment from 'react-moment';
import panAndZoomHoc from 'react-pan-and-zoom-hoc';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';
import styled from 'styled-components';

import BaseDesktopPage from '../BaseDesktopPage';
import BaseOverlay from '../../../overlays/BaseOverlay/BaseOverlay';
import InputField, { INPUTFIELD_STATUS_IDLE } from '../../../forms/InputField/InputField';
import { POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../../../overlays/PopupNotification';
import TutorialBubble from '../../../overlays/TutorialBubble';

import { CANVAS, PAN_ZOOM, GRID, SECTIONS, STATUS_INTERVAL } from './consts';
import {
	drawCanvasSliceBorder,
	drawCanvasSliceRollOverBorder,
// 	drawCanvasSliceMarchingAnts,
	drawCanvasSliceGuides
} from './utils/canvas';
import { 
	fontSpecs,
	toCSS,
	toReactCSS,
	toReactJS,
	toSCSS,
	toSpecs
} from './utils/code-generator.js';
import {
	calcArtboardBaseSize,
	calcArtboardScaledCoords,
	calcFitScale,
	calcIntersectSlices,
	calcScrollPoint,
	calcTransformPoint
} from './utils/calcs';
import { MOMENT_TIMESTAMP } from '../../../../consts/formats';
import { ARROW_LT_KEY, ARROW_RT_KEY, MINUS_KEY, PLUS_KEY, TAB_KEY } from '../../../../consts/key-codes';
import {
	DE_LOGO_SMALL, API_ENDPT_URL, CDN_DOWNLOAD_PDF_URL, CDN_DOWNLOAD_PROJECT_URL, CDN_UPLOAD_URL, LINTER_ENDPT_URL, Modals
} from '../../../../consts/uris';
import { setArtboardComponent, setArtboardGroups, setRedirectURI } from '../../../../redux/actions';
import {
	buildInspectorPath,
	buildInspectorURL,
	createGist,
	editGist,
	sendToSlack
} from '../../../../utils/funcs.js';
import {
	Arrays,
	Browsers,
	Colors,
	DateTimes,
	Files,
	Maths,
	Objects,
	Strings,
	URIs
} from '../../../../utils/lang.js';
import { trackEvent } from '../../../../utils/tracking';

import adBannerPanel from '../../../../assets/json/ad-banner-panel';
import inspectorTabSets from '../../../../assets/json/inspector-tab-sets';
import deLogo from '../../../../assets/images/logos/logo-designengine.svg';


const InteractiveDiv = panAndZoomHoc('div');
const artboardsWrapper = React.createRef();
const canvasWrapper = React.createRef();
const canvas = React.createRef();


const artboardForID = (upload, artboardID)=> {
	return (flattenUploadArtboards(upload).find((artboard)=> (artboard.id === artboardID)));
};

const flattenUploadArtboards = (upload, type=null)=> {
// 	console.log('flattenUploadArtboards()', upload, type);
	return ((upload) ? upload.pages.flatMap((page)=> (page.artboards)).filter((artboard)=> ((type) ? (artboard.type === type || artboard.type.includes(type)) : true)).reverse() : []);
};

const ColorSwatch = (props)=> {
// 	console.log('InspectorPage.ColorSwatch()', props);

	const { fill } = props;
	return (<div className="inspector-page-color-swatch" style={{ background : fill }} />);
};

const FilingTabContent = (props)=> {
// 	console.log('InspectorPage.FilingTabContent()', props);

	const { tab, enabled } = props;
	const { contents } = tab;
	const className = `filing-tab-content${(!enabled) ? ' filing-tab-content-disabled' : ''}`;

	return (<div key={tab.id} className={className}>
		{contents}
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

	const className = `filing-tab-title${(! title || title.length === 0) ? ' filing-tab-title-blank' : ''}${(selected) ? ' filing-tab-title-selected' : ''}${(!enabled) ? ' filing-tab-title-disabled' : ''}`;
	return (<React.Fragment key={tab.id}>
		<li className={className} onClick={()=> (enabled) ? props.onClick() : null}>{title}</li>
	</React.Fragment>);
};

const InspectorFooter = (props)=> {
// 	console.log('InspectorPage.InspectorFooter()', props);

	const { section, artboards, processing, creator, scale, fitScale } = props;
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
			{(creator) && (<Dropzone
				className="inspector-page-footer-dz"
				multiple={false}
				disablePreview={true}
				onDrop={props.onDrop}>
				{/*<button className="inspector-page-footer-button" onClick={()=> trackEvent('button', 'version')}>Version</button>*/}
			</Dropzone>)}

			<button disabled={(scale >= Math.max(...PAN_ZOOM.zoomNotches))} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-in'); props.onZoom(1);}}><FontAwesome name="search-plus" /></button>
			<button disabled={(scale <= Math.min(...PAN_ZOOM.zoomNotches))} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-out'); props.onZoom(-1);}}><FontAwesome name="search-minus" /></button>
			<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-reset'); props.onZoom(0);}}>Reset ({(fitScale * 100) << 0}%)</button>

			{(section === SECTIONS.EDIT && artboards.length < 1) && (<>
				<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'prev-artboard'); props.onChangeArtboard(prevArtboard);}}><FontAwesome name="arrow-left" /></button>
				<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'next-artboard'); props.onChangeArtboard(nextArtboard);}}><FontAwesome name="arrow-right" /></button>
			</>)}

			{(section === SECTIONS.SPECS) && (<>
				<button className="inspector-page-footer-button" onClick={()=> props.onChangeSection('styles')}>Styles</button>
				<button className="inspector-page-footer-button" onClick={()=> props.onChangeSection('edit')}>Edit</button>
			</>)}

			{(section === SECTIONS.STYLES) && (<>
				<button className="inspector-page-footer-button" onClick={()=> props.onChangeSection('specs')}>Specs</button>
				<button className="inspector-page-footer-button" onClick={()=> props.onChangeSection('edit')}>Edit</button>
			</>)}

			{(section === SECTIONS.EDIT) && (<>
				<button className="inspector-page-footer-button" onClick={()=> props.onChangeSection('specs')}>Specs</button>
				<button className="inspector-page-footer-button" onClick={()=> props.onChangeSection('styles')}>Styles</button>
			</>)}
		</div>)}
	</Row></div>);
};


/*
const InspectorPageEditorStatus = (props)=> {
// 	console.log('InspectorPage.InspectorPageEditorStatus()', props);

	const { message } = props;
	return (<div className="inspector-page-editor-status">
		{message}
	</div>);
};
*/


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
		data-offset={`${offset.x}-${offset.y}`}
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
		return (
			<div className="inspector-page-specs-list-wrapper">
				<SpecsListItem
					disabled={true}
					attribute="Owner"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Date"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Version"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Name"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Type"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Export Size"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Position"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Rotation"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Opacity"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Blend Mode"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Radius"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Fill Type"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Fill Color"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Gradient Color"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Fill Opacity"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Padding"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Borders Color"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Borders Type"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Borders Width"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Borders Opacity"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Shadows"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Inner Shadows"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Blurs"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Size"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Color"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Character"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Line"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Paragraph"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Horizontal"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Vertical"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Decoration"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Transform"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					disabled={true}
					attribute="Text Padding"
					value={null}
					onCopy={props.onCopySpec} />
			</div>
		);
	}

	const { frame } = slice.meta;
	const fillColor = (typeof slice.meta.fillColor === 'object') ? Colors.rgbaToHex(slice.meta.fillColor).toUpperCase() : (slice.meta.fillColor.length > 0) ? `${slice.meta.fillColor.toUpperCase()}FF` : null;
	const gradient = (slice.meta.fillType === 'gradient' && slice.meta.gradient) ? {
		type   : slice.meta.gradient.type,
		colors : slice.meta.gradient.colors.map((color)=> {
			return ({
				position : (color.position * 100) << 0,
				hex      : Colors.rgbaToHex(color.color).toUpperCase()
			});
		})
	} : null;
	const padding = `${slice.meta.padding.top}px ${slice.meta.padding.left}px ${slice.meta.padding.bottom}px ${slice.meta.padding.right}px`;
	const added = `${slice.added.replace(' ', 'T')}Z`;
	const font = (slice.meta.font) ? fontSpecs(slice.meta.font) : null;
	const sliceStyles = (slice.meta.styles) ? slice.meta.styles : null;
	const border = (sliceStyles && sliceStyles.border) ? sliceStyles.border : null;
	const shadow = (sliceStyles && sliceStyles.shadow) ? sliceStyles.shadow : null;
	const innerShadow = (sliceStyles && sliceStyles.innerShadow) ? sliceStyles.innerShadow : null;

	const styles = (sliceStyles) ? {
		border : (border) ? {
			color     : (typeof border.color === 'object') ? Colors.rgbaToHex(border.color).toUpperCase() : (border.color.length > 0) ? `${border.color.toUpperCase()}FF` : null,
			position  : Strings.capitalize(border.position, true),
			thickness : `${border.thickness}px`
		} : null,
		shadow : (shadow) ? {
			color  : (typeof shadow.color === 'object') ? Colors.rgbaToHex(shadow.color).toUpperCase() : (shadow.color.length > 0) ? `${shadow.color.toUpperCase()}FF` : null,
			offset : {
				x : shadow.offset.x,
				y : shadow.offset.y
			},
			spread : `${shadow.spread}px`,
			blur   : `${shadow.blur}px`
		} : null,
		innerShadow : (innerShadow) ? {
			color  : (typeof innerShadow.color === 'object') ? Colors.rgbaToHex(innerShadow.color) : (innerShadow.color.length > 0) ? `${innerShadow.color.toUpperCase()}FF` : null,
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
			<SpecsListItem
				attribute="Owner"
				value={`${upload.creator.username}${((creatorID === upload.creator.user_id) ? ' (You)' : '')}`}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Date"
				value={<Moment format={MOMENT_TIMESTAMP}>{added}</Moment>}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Version"
				value="Version 1"
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Name"
				value={Files.basename(upload.filename)}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Type"
				value="Sketch File"
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Export Size"
				value={`W: ${frame.size.width}px H: ${frame.size.height}px`}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Position"
				value={`X: ${frame.origin.x}px Y: ${frame.origin.y}px`}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Rotation"
				value={`${slice.meta.rotation}°`}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Opacity"
				value={`${slice.meta.opacity * 100}%`}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Blend Mode"
				value={Strings.capitalize(slice.meta.blendMode, true)}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Radius"
				value={`${slice.meta.radius << 0}px`}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Fill Type"
				value={(slice.meta.fillType) ? Strings.capitalize(slice.meta.fillType) : 'Solid'}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Fill Color"
				value={fillColor}
				onCopy={props.onCopySpec}>{(fillColor) && (<ColorSwatch fill={fillColor} />)}</SpecsListItem>
			<SpecsListItem
				attribute="Gradient Color"
				value={(gradient) ? gradient.colors.map((color)=> (`${color.hex} (${color.position}%)`)).join(' ') : null}
				onCopy={props.onCopySpec}>{(gradient) && (gradient.colors.map((color, i)=> (<ColorSwatch key={i} fill={color.hex} />)))}
			</SpecsListItem>
			<SpecsListItem
				attribute="Fill Opacity"
				value={`${((parseInt(Colors.componentHex(fillColor, 'a'), 16) / 255) * 100) << 0}%`}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Padding"
				value={padding}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Borders Color"
				value={(border) ? styles.border.color : null}
				onCopy={props.onCopySpec}>{(border) && (<ColorSwatch fill={styles.border.color} />)}</SpecsListItem>
			<SpecsListItem
				attribute="Borders Type"
				value={(border) ? styles.border.position : null}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Borders Width"
				value={(border) ? styles.border.thickness : null}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Borders Opacity"
				value={null}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Shadows"
				value={(shadow) ? `X: ${styles.shadow.offset.x} Y: ${styles.shadow.offset.y} B: ${styles.shadow.blur} S: ${styles.shadow.spread}` : null}
				onCopy={props.onCopySpec}>{(shadow) && (<ColorSwatch fill={styles.shadow.color} />)}</SpecsListItem>
			<SpecsListItem
				attribute="Inner Shadows"
				value={(innerShadow) ? `X: ${styles.innerShadow.offset.x} Y: ${styles.innerShadow.offset.y} B: ${styles.innerShadow.blur} S: ${styles.innerShadow.spread}` : null}
				onCopy={props.onCopySpec} />
			<SpecsListItem
				attribute="Blurs"
				value={null}
				onCopy={props.onCopySpec} />
			{(slice.type === 'textfield') && (<>
				<SpecsListItem
					attribute="Text"
					value={`${font.family} ${font.name}`}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Size"
					value={`${font.size}px`}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Color"
					value={(typeof font.color === 'object') ? Colors.rgbaToHex(font.color).toUpperCase() : (font.color.length > 0) ? `${font.color.toUpperCase()}FF` : null}
					onCopy={props.onCopySpec}><ColorSwatch fill={(typeof font.color === 'object') ? Colors.rgbaToHex(font.color) : (font.color.length > 0) ? `${font.color.toUpperCase()}FF` : null} /></SpecsListItem>
				<SpecsListItem
					attribute="Text Character"
					value={`${font.kerning.toFixed(2)}px`}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Line"
					value={`${font.lineHeight}px`}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Paragraph"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Horizontal"
					value={(font.alignment) ? Strings.capitalize(font.alignment, true) : 'Left'}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Vertical"
					value="Top"
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Decoration"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Transform"
					value={null}
					onCopy={props.onCopySpec} />
				<SpecsListItem
					attribute="Text Padding"
					value={null}
					onCopy={props.onCopySpec} />
			</>)}
		</div>
	);
};

const SpecsListItem = (props)=> {
// 	console.log('InspectorPage.SpecsListItem()', props);

	const VAL_PLACEHOLDER = '—';

	const { attribute, value, copyText, children, disabled } = props;
	const attrClass = `inspector-page-specs-list-item-attribute${(!value) ? ' inspector-page-specs-list-item-attribute-empty' : ''}`;
	const valClass = (disabled) ? 'inspector-page-specs-list-item-attribute' :  `inspector-page-specs-list-item-val${(!value) ? ' inspector-page-specs-list-item-val-empty' : ''}`;

	return ((!disabled) ? <CopyToClipboard onCopy={()=> (copyText || value) ? props.onCopy((copyText) ? copyText : (value) ? value : '') : null} text={(copyText) ? copyText : (value) ? value : ''}>
		<Row>
			<div className={attrClass}>{attribute}</div>
			<div className={valClass}><Row vertical="center">
				{(value) ? value : VAL_PLACEHOLDER}
				{children}
			</Row></div>
		</Row>
	</CopyToClipboard> : <Row>
		<div className={attrClass}>{attribute}</div>
		<div className={valClass}><Row vertical="center">
			{(value) ? value : VAL_PLACEHOLDER}
			{children}
		</Row></div>
	</Row>);
};

const UploadProcessing = (props)=> {
// 	console.log('InspectorPage.UploadProcessing()', props);

	const { upload, processing, vpHeight } = props;
	const artboards = flattenUploadArtboards(upload, 'page_child');
	const urlInspect = buildInspectorURL(upload, '/inspect');
	const urlEdit = buildInspectorURL(upload, '/edit');

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
				name="urlEdit"
				placeholder={urlEdit}
				value={urlEdit}
				button="Copy"
				status={INPUTFIELD_STATUS_IDLE}
				onChange={null}
				onErrorClick={()=> null}
				onFieldClick={()=> {copy(urlEdit); props.onCopyURL(urlEdit)}}
				onSubmit={()=> {copy(urlEdit); props.onCopyURL(urlEdit)}}
			/>
		</div></Row>

		<Row><div className="upload-processing-button-wrapper">
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
			section     : URIs.firstComponent(),
			upload      : null,
			artboard    : null,
			slice       : null,
			hoverSlice  : null,
			offset      : null,
			hoverOffset : null,
			tabID       : 1,
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
			fontState   : 0,
			valid       : true,
			restricted  : false,
			shareModal  : false,
			urlBanner   : false,
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
			tooltip     : 'Loading…',
			linter      : null,
			gist        : null,
			syntax      : 'render(<div />);',
			editChange  : true,
			clickTotal  : 0,
			loginCheck  : false
		};

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

		const { deeplink } = this.props;
		const { section, upload } = this.state;

		if (section !== '') {
			this.setState({
				tabSets    : inspectorTabSets[section],
				activeTabs : [...inspectorTabSets[section]].map((tabSet) => {
					return ([...tabSet].shift());
				})
			});
		}

		if (!upload && deeplink && deeplink.uploadID !== 0) {
			this.onFetchUpload();
		}

		document.addEventListener('keydown', this.handleKeyDown);
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
// 		console.log('InspectorPage.shouldComponentUpdate()', this.props, nextProps, this.state, nextState, nextContext);

		const { upload, restricted } = nextState;
		if (upload && (upload.private << 0) === 1) {
			const isOwner = (nextProps.profile && upload.creator.user_id === nextProps.profile.id);
			const isTeamMember = (nextProps.profile && !isOwner && (upload.team.members.filter((member)=> ((member.userID << 0) === nextProps.profile.id)).length > 0));

			if (!restricted && (!isOwner && !isTeamMember)) {
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

		const { deeplink, processing } = this.props;
		const { upload, panMultPt } = this.state;

		if (upload && !this.props.profile && !this.state.loginCheck) {
			this.setState({ loginCheck : true }, ()=> {
				this.props.onModal(Modals.REGISTER);
			});
		}

		if (!upload && deeplink && deeplink !== prevProps.deeplink && deeplink.uploadID !== 0) {
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


		const insetHeight = 80 + (((flattenUploadArtboards(upload, 'page_child').length > GRID.colsMax) << 0) * GRID.padding.row);

// 		if (artboardsWrapper.current && Maths.geom.isSizeDimensioned({ width : artboardsWrapper.current.clientWidth, height : artboardsWrapper.current.clientHeight}) && !isSizeDimensioned(this.state.viewSize)) {
		if (artboardsWrapper.current && artboardsWrapper.current.clientWidth !== this.state.viewSize.width && artboardsWrapper.current.clientHeight - insetHeight !== this.state.viewSize.height) {
			const viewSize = {
				width  : artboardsWrapper.current.clientWidth,
				height : artboardsWrapper.current.clientHeight - insetHeight
			};

			const artboards = flattenUploadArtboards(upload, 'page_child');
			if (artboards.length > 0) {
				const baseSize = calcArtboardBaseSize(artboards, viewSize);
				console.log('_-]BASE SIZE[-_', baseSize);

				const fitScale = calcFitScale(baseSize, viewSize);
				console.log('_-]FIT SCALE[-_', fitScale);

				const scrollPt = calcScrollPoint(PAN_ZOOM.panMultPt, viewSize, baseSize, fitScale, panMultPt);

				const scaledCoords = calcArtboardScaledCoords(artboards, fitScale);
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
// 				const scrollPt = calcScrollPoint(PAN_ZOOM.panMultPt, viewSize, this.contentSize, fitScale, panMultPt);
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
			if (!this.state.tutorial && cookie.load('tutorial') === '0' && this.state.section === SECTIONS.SPECS) {
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

		document.removeEventListener('keydown', this.handleKeyDown);

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
				key={slice.id}
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


	calcCanvasSliceFrame = (slice, artboard, offset, scrollPt)=> {
// 		console.log('InspectorPage.calcCanvasSliceFrame()', slice, artboard, offset, scrollPt);

		const { upload, scale } = this.state;
		const artboards = flattenUploadArtboards(upload, 'page_child');

		const baseOffset = {
			x : (artboards.length < GRID.colsMax) ? GRID.padding.col * 0.5 : 0,
			y : (artboards.length < GRID.colsMax) ? PAN_ZOOM.insetSize.height : 26 + PAN_ZOOM.insetSize.height
		};

		const srcFrame = Maths.geom.cropFrame(slice.meta.frame, artboard.meta.frame);
		const srcOffset = {
			x : baseOffset.x + ((offset.x - scrollPt.x) << 0),
			y : baseOffset.y + ((offset.y - scrollPt.y) << 0)
		};

		const scaledFrame = {
			origin : {
				x : (srcOffset.x + (srcFrame.origin.x * scale)) << 0,
				y : (srcOffset.y + (srcFrame.origin.y * scale)) << 0

			},
			size   : {
				width  : (srcFrame.size.width * scale) << 0,
				height : (srcFrame.size.height * scale) << 0
			}
		};

// 		console.log('-- InspectorPage.calcCanvasSliceFrame()', baseOffset, srcFrame, srcOffset, scaledFrame);
		return (scaledFrame);
	};

	resetTabSets = (upload, artboards)=> {
// 		console.log('InspectorPage.resetTabSets()', upload, artboards);

		const { section  } = this.state;
		let tabSets = inspectorTabSets[section];
		if (section === SECTIONS.SPECS) {
			tabSets = [...tabSets].map((tabSet, i) => {
				return (tabSet.map((tab, ii) => {
					return ((ii === 0) ? Object.assign({}, tab, {
						enabled  : ((upload.state << 0) === 3),
						contents : <SpecsList
							upload={upload}
							slice={null}
							creatorID={0}
							onCopySpec={(msg) => this.handleClipboardCopy('spec', msg)}
						/>
					}) : tab);
				}));
			});

			const activeTabs = (this.state.activeTabs.length === 0) ? tabSets.map((tabSet) => {
				return ([...tabSet].shift());
			}) : this.state.activeTabs;

			this.setState({
				tabSets, activeTabs,
				artboard    : null,
				slice       : null,
				offset      : null,
				hoverSlice  : null,
				hoverOffset : null,
				tooltip     : null,
				linter      : null,
				gist        : null,
				clickTotal  : 0
			});

		} else if (section === SECTIONS.STYLES) {
			const activeTabs = (this.state.activeTabs.length === 0) ? tabSets.map((tabSet) => {
				return ([...tabSet].shift());
			}) : this.state.activeTabs;

			this.setState({ tabSets, activeTabs,
				tabID       : 1,
				artboard    : null,
				slice       : null,
				offset      : null,
				hoverSlice  : null,
				hoverOffset : null,
				tooltip     : null,
				linter      : null,
				gist        : null,
				clickTotal  : 0
			});

		} else if (section === SECTIONS.EDIT) {
			if (artboards.length > 0) {
				const artboard = (this.state.artboard) ? this.state.artboard : artboards[0];

				let formData = new FormData();
				formData.append('action', 'ARTBOARD_SLICES');
				formData.append('artboard_id', artboard.id);
				axios.post(API_ENDPT_URL, formData)
					.then((response)=> {
						console.log('ARTBOARD_SLICES', response.data);
						artboard.slices = response.data.slices.map((slice)=> {
							const meta = JSON.parse(slice.meta.replace(/\n/g, '\\\\n'));
							return (Object.assign({}, slice, {
								id         : slice.id << 0,
								artboardID : slice.artboard_id << 0,
								meta       : Object.assign({}, meta, {
									orgFrame : meta.frame,
									frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
								}),
								filled     : false,
								children   : []
							}));
						});

						upload.pages = upload.pages.map((page)=> (Object.assign({}, page, {
							artboards : page.artboards.map((item)=> ((item.id === artboard.id) ? artboard : item))
						})));

						const slices = [artboard.slices[0], ...calcIntersectSlices(artboard.slices, artboard.meta.frame)];

						const jsx = toReactJS(artboard, slices);
// 						this.props.setArtboardGroups(jsx.groups);

						tabSets = [...tabSets].map((tabSet, i) => {
							return (tabSet.map((tab, ii) => {
								return (Object.assign({}, tab, {
									enabled  : ((upload.state << 0) === 3),
									contents : <LiveProvider code="render(<div />);">
										<LiveEditor />
										<LiveError />
										<LivePreview />
									</LiveProvider>
								}));
							}));
						});

						const activeTabs = tabSets.map((tabSet)=> {
							return ([...tabSet].shift());
						});

						this.setState({ upload, tabSets, activeTabs, artboard,
							slice      : [...slices].shift(),
							offset     : artboard.meta.frame.origin,
							tooltip    : null,
							linter     : null,
							gist       : null,
							syntax     : jsx.syntax,
							clickTotal : 0
						});

						if (!this.canvasInterval) {
							this.canvasInterval = setInterval(()=> this.onCanvasInterval(), CANVAS.marchingAnts.interval);
						}
					}).catch((error)=> {
				});
			}
		}
	};

	replaceTabSets = (artboard, slice, offset=null)=> {
// 		console.log('InspectorPage.replaceTabSets()', artboard, slice, offset);

		const { profile } = this.props;
		const { section, upload } = this.state;
		let tabSets = [...this.state.tabSets];

		const slices = [slice, ...calcIntersectSlices(artboard.slices, slice.meta.frame)];

		if (section === SECTIONS.SPECS) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				if (i === 0) {
					return (tabSet.map((tab, ii)=> {
						return ((ii === 0) ? Object.assign({}, tab, {
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
							contents : <LiveProvider scope={{styled}} code={toReactJS(artboard, slices).syntax} noInline={true} disabled={true}>
								<LiveEditor />
							</LiveProvider>,
							syntax   : toReactJS(artboard, slices).syntax
						}));
					}));
				}
			});

			const activeTabs = [...this.state.activeTabs].map((activeTab, i) => {
				const tab = tabSets[i].find((item) => (item.id === activeTab.id));
				return ((tab) ? tab : activeTab);
			});

			this.setState({
				upload, artboard, tabSets, activeTabs,
				linter : null,
				gist   : null,
				syntax : 'render(<div />);'
			});

		} else if (section === SECTIONS.STYLES) {
			const langs = [
				toReactCSS(slices),
				toSCSS(upload, slices),
				toCSS(slices)
			];

// 			const { syntax } = (Objects.hasKey(this.props.artboardComponents, slice.uuid)) ? this.props.artboardComponents[slice.uuid] : toReactJS(artboard, slices);

			tabSets = [...this.state.tabSets].map((tabSet, i) => {
				return (tabSet.map((tab, ii) => {
					return (Object.assign({}, tab, {
						enabled  : true,
						contents : <LiveProvider code={langs[ii].syntax} disabled={true}>
							<LiveEditor />
						</LiveProvider>,
						syntax   : langs[ii].syntax
					}));
				}));
			});

			const activeTabs = [...this.state.activeTabs].map((activeTab, i) => {
				const tab = tabSets[i].find((item) => (item.id === activeTab.id));
				return ((tab) ? tab : activeTab);
			});

			this.setState({
				upload, artboard, tabSets, activeTabs,
				linter : null,
				gist   : null
			});

		} else if (section === SECTIONS.EDIT) {
			const { syntax } = (Objects.hasKey(this.props.artboardComponents, slice.uuid)) ? this.props.artboardComponents[slice.uuid] : toReactJS(artboard, slices, this.props.artboardComponents);

			tabSets = [...this.state.tabSets].map((tabSet, i) => {
				return (tabSet.map((tab, ii) => {
					return (Object.assign({}, tab, {
						enabled  : true,
						contents : <LiveProvider code="render(<div />)">
							<LiveEditor />
							<LiveError />
							<LivePreview />
						</LiveProvider>
					}));
				}));
			});

			const activeTabs = [...this.state.activeTabs].map((activeTab, i) => {
				const tab = tabSets[i].find((item) => (item.id === activeTab.id));
				return ((tab) ? tab : activeTab);
			});

			this.setState({
				upload, artboard, tabSets, activeTabs, syntax,
				linter : null,
				gist   : null
			});
		}
	};


	handleArtboardClick = (event)=> {
// 		console.log('InspectorPage.handleArtboardClick()', event.target);

		const { upload } = this.state;
		const artboardID = event.target.getAttribute('data-artboard-id');

		if (artboardID) {
			const artboard = artboardForID(upload, artboardID);
			this.setState({ artboard,
				clickTotal : 0
			}, ()=> {
				this.resetTabSets(upload, [artboard]);
			});
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
			hoverSlice  : null,
			hoverOffset : null
		});
	};

	handleArtboardRollOver = (event)=> {
// 		console.log('InspectorPage.handleArtboardRollOver()', event.target);

// 		event.stopPropagation();
		const artboardID = event.target.getAttribute('data-artboard-id') << 0;
		if (artboardID) {
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
				axios.post(API_ENDPT_URL, formData)
					.then((response)=> {
						console.log('ARTBOARD_SLICES', response.data);
						artboard.slices = response.data.slices.map((slice)=> {
							const meta = JSON.parse(slice.meta.replace(/\n/g, '\\\\n'));
							return (Object.assign({}, slice, {
								id         : slice.id << 0,
								artboardID : slice.artboard_id << 0,
								meta       : Object.assign({}, meta, {
									orgFrame : meta.frame,
									frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
								}),
								filled     : false,
								children   : []
							}));
						});

						upload.pages = upload.pages.map((page)=> (Object.assign({}, page, {
							artboards : page.artboards.map((item)=> ((item.id === artboardID) ? artboard : item))
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
			this.resetTabSets(upload, (artboard) ? [artboard] : []);
		}
	};

	handleCanvasUpdate = ()=> {
// 		console.log('InspectorPage.handleCanvasUpdate()', this.antsOffset);

		const { scrollPt, offset, hoverOffset } = this.state;
		const { artboard, slice, hoverSlice, clickTotal } = this.state;

		const context = canvas.current.getContext('2d');
		context.clearRect(0, 0, canvas.current.clientWidth, canvas.current.clientHeight);

		context.font = CANVAS.caption.fontFace;
		context.textAlign = CANVAS.caption.align;
		context.textBaseline = CANVAS.caption.baseline;

		if (artboard) {
			if (slice && clickTotal > 0) {
				const frame = this.calcCanvasSliceFrame(slice, artboard, offset, scrollPt);
// 				drawCanvasSliceFill(context, frame, CANVAS.slices.fillColor);
// 				drawCanvasSliceTooltip(context, slice.type, frame.origin, frame.size.width);
				drawCanvasSliceBorder(context, frame);
				drawCanvasSliceGuides(context, frame, { width : canvas.current.clientWidth, height : canvas.current.clientHeight }, CANVAS.guides.color);
// 				drawCanvasSliceMarchingAnts(context, frame, this.antsOffset);
			}

			if (hoverSlice) {
				if (!slice || (slice && slice.id !== hoverSlice.id)) {
					const frame = this.calcCanvasSliceFrame(hoverSlice, artboard, hoverOffset, scrollPt);
// 					drawCanvasSliceFill(context, frame, CANVAS.slices.fillColor);
// 					drawCanvasSliceTooltip(context, `W:${frame.size.width}px H:${frame.size.height}px`, frame.origin, frame.size.width * 7);
					drawCanvasSliceRollOverBorder(context, frame);
// 					drawCanvasSliceGuides(context, frame, { width : canvas.current.clientWidth, height : canvas.current.clientHeight }, CANVAS.guides.color);
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
			artboard = Arrays.wrapElement(artboards, artboards.findIndex((item)=> (item.id === this.state.artboard.id)) + dir);

			if (this.state.artboard.id !== artboard.id) {
				this.setState({ artboard,
					slice       : null,
					offset      : null,
					hoverSlice  : null,
					hoverOffset : null
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
// 		console.log('InspectorPage.handleChangeSection()', section);

		trackEvent('button', `section-${section}`);
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
// 		console.log('InspectorPage.handleClipboardCopy()', type, msg);

		trackEvent('button', `copy-${type}`);
		const { processing } = this.props;
		const { section, urlBanner } = this.state;

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : (section === SECTIONS.EDIT) ? (window.innerWidth - artboardsWrapper.current.clientWidth) : 360
			},
			content  : (type === 'url' || msg.length >= 100) ? `Copied ${type} to clipboard` : msg,
			duration : 1750
		});
	};

	handleDownloadAll = ()=> {
// 		console.log('InspectorPage.handleDownloadAll()');

		trackEvent('button', 'download-project');
		const { upload } = this.state;
		Browsers.makeDownload(`${CDN_DOWNLOAD_PROJECT_URL}?upload_id=${upload.id}`);
	};

	handleDownloadArtboardPDF = ()=> {
// 		console.log('InspectorPage.handleDownloadArtboardPDF()');

		trackEvent('button', 'download-pdf');
		const { upload } = this.state;
		Browsers.makeDownload(`${CDN_DOWNLOAD_PDF_URL}?upload_id=${upload.id}`);
	};

	handleEditorChange = (val)=> {
// 		console.log('InspectorPage.handleEditorChange()', val);

		this.setState({
			syntax     : val,
			editChange : true,
			gist       : { ...this.state.gist,
				edited : true
			}
		});
	};

	handleEditorSave = ()=> {
		console.log('InspectorPage.handleEditorSave()');

		const { artboard, slice, syntax } = this.state;
		this.setState({ editChange : false }, ()=> {
			const payload = {
				uuid      : slice.uuid,
				syntax    : syntax,
				timestamp : DateTimes.epoch()
			};

// 			Object.keys(this.props.artboardComponents).forEach((key, i)=> {
// 				if (this.props.artboardComponents[key].syntax.includes('')) {
//
// 				}
// 			});

			this.props.setArtboardComponent(payload);
			this.handleSliceClick(0, artboard.slices[0], { x : 0, y : 0 });
		});
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
						sendToSlack(`*[\`${id}\`]* *${email}* started uploading file "_${file.name}_" (\`${(file.size / (1024 * 1024)).toFixed(2)}MB\`)`);
						trackEvent('upload', 'file');

						const config = {
							headers : {
								'Content-Type' : 'multipart/form-data',
								'Accept'       : 'application/json'
							},
							onDownloadProgress : (progressEvent)=> {/* …\(^_^)/… */},
							onUploadProgress   : (progressEvent)=> {
								const { loaded, total } = progressEvent;

								const percent = Maths.clamp(Math.round((loaded * 100) / total), 0, 99);
								this.setState({ percent });

								if (progressEvent.loaded >= progressEvent.total) {
									sendToSlack(`*[\`${id}\`]* *${email}* completed uploading file "_${file.name}_" (\`${(file.size / (1024 * 1024)).toFixed(2)}MB\`)`);
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
									axios.post(API_ENDPT_URL, formData)
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
						axios.post(`${CDN_UPLOAD_URL}?dir=/system`, formData, config)
							.then((response)=> {
								console.log('CDN upload.php', response.data);
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
					sendToSlack(`*[\`${id}\`]* *${email}* uploaded oversized file "_${file.name}_" (${Math.round(file.size * (1 / (1024 * 1024)))}MB)`);
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
				sendToSlack(`*[\`${id}\`]* *${email}* uploaded incompatible file "_${file.name}_"`);
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

	handleFontDialogComplete = (ok)=> {
		console.log('InspectorPage.handleFontDialogComplete()', ok);
		this.setState({ fontState : (ok) ? 3 : 2});
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
		const { keyCode } = event;

		trackEvent('keypress', (keyCode === PLUS_KEY) ? 'plus' : (keyCode === MINUS_KEY) ? 'minus' : (keyCode === ARROW_LT_KEY) ? 'left-arrow' : (keyCode === ARROW_RT_KEY) ? 'right-arrow' : (keyCode === TAB_KEY) ? 'tab' : `${keyCode}`);
		if (event.keyCode === PLUS_KEY) {
			this.handleZoom(1);

		} else if (event.keyCode === MINUS_KEY) {
			this.handleZoom(-1);

		} else if (event.keyCode === TAB_KEY) {
			if (section === SECTIONS.SPECS) {
				this.handleChangeSection(SECTIONS.STYLES);

			} else if (section === SECTIONS.STYLES) {
				this.handleChangeSection(SECTIONS.EDIT);

			} else if (section === SECTIONS.EDIT) {
				this.handleChangeSection(SECTIONS.SPECS);
			}
		}

		if (section === SECTIONS.EDIT) {
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

	handleLinterLog = (tab)=> {
		console.log('InspectorPage.handleLinterLog()', tab);

		const { linter } = this.state;

		trackEvent('button', 'linter-log');
		window.open(linter.logURL);
	};

	handlePanAndZoom = (x, y, scale)=> {
// 		console.log('InspectorPage.handlePanAndZoom()', x, y, scale);

// 		const panMultPt = { x, y };
// 		this.setState({ panMultPt, scale });
// 		this.setState({ panMultPt });
// 		this.setState({ scale });
	};

	handlePanMove = (x, y)=> {
// 		console.log('InspectorPage.handlePanMove()', x, y, this.state.viewSize, this.contentSize);

		if (Maths.geom.isSizeDimensioned(this.contentSize)) {
			const panMultPt = { x, y };
			const { viewSize } = this.state;
			const pt = calcTransformPoint(this.state);

			const scrollPt = {
				x : -Math.round((pt.x * viewSize.width) + (this.contentSize.width * -0.5)),
				y : -Math.round((pt.y * viewSize.height) + (this.contentSize.height * -0.5))
			};

			this.setState({ panMultPt, scrollPt, scrolling : true });
		}
	};

	handleSendSyntaxAtom = (tab)=> {
// 		console.log('InspectorPage.handleSendSyntaxAtom()', tab);

		const lang = (tab.title === 'ReactJSX') ? 'jsx' : (tab.title === 'Android') ? 'xml' : (tab.title === 'Bootstrap') ? 'html' : tab.title.toLowerCase();
		trackEvent('button', `send-atom-${lang}`);

		const { processing } = this.props;
		const { section, urlBanner } = this.state;

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : (section === SECTIONS.EDIT) ? (window.innerWidth - artboardsWrapper.current.clientWidth) : 360
			},
			content  : `Sending ${lang} snippet to Atom…`
		});

		window.postMessage({
			action  : 'SYNTAX_SEND',
			payload : {
				lang   : lang,
				syntax : tab.syntax
			}
		}, '*');
	};

	handleSendSyntaxGist = (syntax, lang='jsx')=> {
		console.log('InspectorPage.handleSendSyntaxGist()', syntax, lang);

		const { profile, processing } = this.props;
		const { section, urlBanner, slice, linter, gist } = this.state;

		trackEvent('button', `send-gist-${lang}`);

		const filename = `${Strings.slugifyURI(slice.title)}.${lang}`;

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : (section === SECTIONS.EDIT) ? (window.innerWidth - artboardsWrapper.current.clientWidth) : 360
			},
			content  : `${(gist) ? 'Editing' : 'Creating'} “${Strings.slugifyURI(slice.title)}.${lang}” gist on GitHub…`
		});


		if (gist && gist.id) {
			this.setState({ gist : { ...gist,
				busy : true }}, ()=> {
					editGist(profile.github.accessToken, gist.id, filename, syntax, `Design Engine auto generated ${(linter) ? 'linted ' : ''}syntax v1`, true, (data)=> {
						this.setState({ gist : { ...this.state.gist,
							busy   : false,
							edited : false
						}});
					});
				}
			);

		} else {
			this.setState({ gist : { busy : true }}, ()=> {
				createGist(profile.github.accessToken, filename, syntax, `Design Engine auto generated ${(linter) ? 'linted ' : ''}syntax v1`, true, (data)=> {
					this.setState({ gist : {
						busy     : false,
						id       : data.id,
						filename : filename,
						url      : data.html_url,
						edited   : false
					}});
				});
			});
		}
	};

	handleSendSyntaxLinter = (syntax, lang='jsx')=> {
		console.log('InspectorPage.handleSendSyntaxLinter()', syntax, lang);

// 		const tabID = tab.id;
// 		const lang = (tab.title === 'ReactJSX') ? 'jsx' : (tab.title === 'Android') ? 'xml' : (tab.title === 'Bootstrap') ? 'html' : tab.title.toLowerCase();
		const linter = (lang === 'css') ? 'StyleLint' : (lang === 'html') ? 'HTML Tidy' : (lang === 'js' || lang === 'jsx') ? 'Prettier + ESLint' : 'Linter';

		trackEvent('button', `send-linter-${lang}`);

		const { processing } = this.props;
		const { section, tabID, urlBanner } = this.state;

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : (section === SECTIONS.EDIT) ? (window.innerWidth - artboardsWrapper.current.clientWidth) : 360
			},
			content  : `Sending ${lang} snippet to ${linter}…`
		});


		const tabSets = [...this.state.tabSets].map((tabSet, i)=> {
			return (tabSet.map((tab)=> {
				if (i === 0) {
					return ((tab.id === tabID) ? { ...tab,
						contents : <LiveProvider code={`// Loading ${linter}…`} disabled={true}>
							<LiveEditor />
						</LiveProvider>
					} : tab);

				} else {
					return (tab);
				}
			}));
		});

		const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
			const tab = tabSets[i].find((tab)=> (tab.id === activeTab.id));
			return ((tab) ? tab : activeTab);
		});

		this.setState({ tabSets, activeTabs,
			linter : {
				busy   : true,
				logURL : null
			},
			gist   : null
		}, ()=> {
			axios.post(LINTER_ENDPT_URL, { lang, syntax,
				config : ''
			}, {
				headers : {
					'Content-Type' : 'multipart/form-data',
					'Accept'       : 'application/json'
				}
			}).then((response) => {
				console.log("LINT", response.data);

				const { syntax } = response.data;
				const logURL = response.data.log_url;
				const output = response.data.log_lines.filter((line)=> (line !== '\n')).slice(1);

				let errors = 0;
				if (lang === 'jsx') {
					const err = output.find((line)=> (line.includes('problem')));
					if (err) {
						errors = (err.split(' ').slice(1, 2).join('') << 0);
					}

				} else {
					errors = output.length + ((lang === 'css') ? -1 : 0);
				}


				const tabSets = [...this.state.tabSets].map((tabSet, i)=> {
					return (tabSet.map((tab)=> {
						if (i === 0) {
							return ((tab.id === tabID) ? Object.assign({}, tab, {
								contents : <LiveProvider code={`// Loading ${linter}…\n//${errors} ${Strings.pluralize('change', errors)} made.\n\n\n${syntax}`} disabled={true}>
									<LiveEditor />
								</LiveProvider>,
								syntax   : syntax
							}) : tab);

						} else {
							return (tab);
						}
					}));
				});

				const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
					const tab = tabSets[i].find((tab)=> (tab.id === activeTab.id));
					return ((tab) ? tab : activeTab);
				});

				this.setState({ tabSets, activeTabs,
					linter : {
						busy   : false,
						logURL : logURL
					}
				});
			}).catch((error) => {
				console.log("LINT ERROR", error);
				this.setState({ tabSets, activeTabs,
					linter : null
				});
			});
		});
	};

	handleSliceClick = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceClick()', ind, slice, offset);

		trackEvent('slice', `${slice.id}_${Strings.slugifyURI(slice.title)}`);
		const { artboard } = this.state;

		slice.filled = true;
		artboard.slices.filter((item)=> (item.id !== slice.id)).forEach((item)=> {
			item.filled = false;
		});

		this.setState({ slice, offset,
			hoverSlice  : null,
			hoverOffset : null,
			clickTotal  : this.state.clickTotal + 1

		}, ()=> (this.replaceTabSets(artboard, slice, offset)));
	};

	handleSliceRollOut = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceRollOut()', ind, slice, offset, this.state);

		const { upload, artboard } = this.state;
		if (this.state.slice) {
			this.replaceTabSets(artboard, this.state.slice);

		} else {
			this.resetTabSets(upload, (artboard) ? [artboard] : []);
		}
	};

	handleSliceRollOver = (ind, slice, offset)=> {
// 		console.log('InspectorPage.handleSliceRollOver()', ind, slice, offset);

		const { section, artboard } = this.state;
		if (artboard) {
			slice.filled = true;
			artboard.slices.filter((item)=> (this.state.slice && this.state.slice.id !== item.id)).forEach((item)=> {
				item.filled = false;
			});

			if (section !== SECTIONS.STYLES) {
				this.setState({
					hoverSlice  : slice,
					hoverOffset : offset
				}, () => {
					this.replaceTabSets(artboard, slice, offset);
				});

			} else {
				this.setState({
					hoverSlice  : slice,
					hoverOffset : offset
				}, () => {
					if (!this.state.slice) {
						this.replaceTabSets(artboard, slice, offset);
					}
				});
			}
		}
	};

	handleTab = (tab)=> {
// 		 console.log('InspectorPage.handleTab()', tab);
		trackEvent('tab', Strings.slugifyURI(tab.title));

		const { tabSets } = this.state;
		const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
			return ((tabSets[i].find((item)=> (item.id === tab.id))) ? tab : activeTab);
		});

		this.setState({ activeTabs,
			tabID  : tab.id,
			linter : null
		});
	};

	handleTabContent = (tab)=> {
		 console.log('InspectorPage.handleTabContent()', tab);
	};

	handleTutorialNextStep = (step)=> {
// 		console.log('InspectorPage.handleTutorialNextStep()', step);

		trackEvent('tutorial', `step-${step}`);
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

		trackEvent('button', 'cancel-processing');
		if (this.processingInterval) {
			clearInterval(this.processingInterval);
			this.processingInterval = null;
		}

		let formData = new FormData();
		formData.append('action', 'CANCEL_PROCESSING');
		formData.append('upload_id', upload.id);
		axios.post(API_ENDPT_URL, formData)
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

		return;

		/*
		const { fitScale, viewSize, urlBanner } = this.state;
		let scale = fitScale;

		let ind = -1;
		if (direction === 666) {
			scale -= 0.0005;

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

// 		console.log(':::::::::::::', scale);

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
		});
		*/
	};

	onBusyInterval = ()=> {
// 		console.log('InspectorPage.onBusyInterval()');

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

		axios.post(API_ENDPT_URL, qs.stringify({
			action    : 'UPLOAD',
			upload_id : uploadID
		})).then((response)=> {
			console.log('UPLOAD', response.data);

			let upload = response.data.upload;
			if (Object.keys(upload).length > 0 && ((upload.state << 0) <= 3)) {
				upload = Object.assign({}, response.data.upload, {
					id    : upload.id << 0,
					state : upload.state << 0,
					fonts : upload.fonts.map((font)=> (
						Object.assign({}, font, {
							id        : font.id << 0,
							installed : ((font.installed << 0) === 1),
							weight    : font.weight << 0
						})
					)),
					pages : upload.pages.map((page)=> (
						Object.assign({}, page, {
							id        : page.id << 0,
							uploadID  : page.upload_id << 0,
							artboards : page.artboards.map((artboard)=> (
								Object.assign({}, artboard, {
									id       : artboard.id << 0,
									pageID   : artboard.page_id << 0,
									uploadID : artboard.upload_id << 0,
									meta     : JSON.parse(artboard.meta.replace(/\n/g, '\\\\n')),
									layers   : JSON.parse(artboard.layers)
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
		axios.post(API_ENDPT_URL, formData)
			.then((response)=> {
				console.log('UPLOAD_STATUS', response.data);
				const { status } = response.data;
				const { fonts } = status;
				const processingState = status.state;
// 				const { totals } = status;
//
// 				const total = totals.all << 0;//Objects.reduceVals(totals);
// 				const mins = DateTimes.diffSecs(status.ended, status.started) * 60;
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
						fontState  : (this.state.fontState === 0 && fonts.length > 0) ? 1 : this.state.fontState,
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
// 		console.log('InspectorPage.render()', this.props, this.state);
// 		console.log('InspectorPage.render()', this.props);
// 		console.log('InspectorPage.render()', this.state);


		const { processing, profile } = this.props;

		const { section, upload, artboard, slice, hoverSlice, tabSets, scale, fitScale, activeTabs, syntax, scrolling, viewSize, panMultPt } = this.state;
		const { valid, restricted, tutorial, percent, linter, gist, editChange } = this.state;

		const artboards = flattenUploadArtboards(upload, 'page_child');
		const activeSlice = (hoverSlice) ? hoverSlice : slice;

// 		const missingFonts = (upload) ? upload.fonts.filter((font)=> (!font.installed)) : [];

		const pt = calcTransformPoint(this.state);

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

// 		console.log('InspectorPage.render()', artboards, this.state);

		artboards.forEach((artboard, i)=> {
			if ((i % GRID.colsMax) << 0 === 0 && i > 0) {
				offset.x = 0;
				offset.y += maxH + GRID.padding.row;
				maxH = 0;
			}

			maxH = Math.round(Math.max(maxH, artboard.meta.frame.size.height * scale));
			this.contentSize.height = Math.max(this.contentSize.height, offset.y + maxH);
			//const filename = `${artboard.filename}@${(scale <= 0.25) ? '0.25' : (scale < 1) ? 1 : 3}x.png`;// (scale <= 0.25) ? artboard.filename.replace('@3x', '@0.25x') : (scale < 1) ? artboard.filename.replace('@3x', '@1x') : artboard.filename;
			const filename = `${artboard.filename}@3x.png`;// (scale <= 0.25) ? artboard.filename.replace('@3x', '@0.25x') : (scale < 1) ? artboard.filename.replace('@3x', '@1x') : artboard.filename;

			const artboardStyle = {
				position       : 'absolute',
				top            : `${offset.y << 0}px`,
				left           : `${offset.x << 0}px`,
				width          : `${(scale * artboard.meta.frame.size.width) << 0}px`,
				height         : `${(scale * artboard.meta.frame.size.height) << 0}px`,
				background     : `#24282e url("${filename}") no-repeat center`,
				backgroundSize : `${(scale * artboard.meta.frame.size.width) << 0}px ${(scale * artboard.meta.frame.size.height) << 0}px`,
			};

			const slicesWrapperStyle = {
				top    : `${offset.y << 0}px`,
				left   : `${offset.x << 0}px`,
				width  : `${(scale * artboard.meta.frame.size.width) << 0}px`,
				height : `${(scale * artboard.meta.frame.size.height) << 0}px`
			};


			const sliceOffset = Object.assign({}, offset);
			const artboardSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'artboard', sliceOffset, scale, scrolling) : [];
			const backgroundSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'background', sliceOffset, scale, scrolling) : [];
			const groupSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'group', sliceOffset, scale, scrolling) : [];
			const symbolSlices =(artboard.slices.length > 0) ?  [...this.buildSliceRollOverItemTypes(artboard, 'bitmap', sliceOffset, scale, scrolling), ...this.buildSliceRollOverItemTypes(artboard, 'symbol', sliceOffset, scale, scrolling), this.buildSliceRollOverItemTypes(artboard, 'svg', sliceOffset, scale, scrolling)] : [];
			const sliceSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'slice', sliceOffset, scale, scrolling) : [];
			const textfieldSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'textfield', sliceOffset, scale, scrolling) : [];

			artboardImages.push(
				<div key={i} data-artboard-id={artboard.id} className="inspector-page-artboard" style={artboardStyle}>
					<div className="inspector-page-artboard-caption">{Strings.truncate((artboard.type === 'page_child') ? artboard.title : artboard.title.split('[').shift(), 8)}</div>
				</div>
			);

			slices.push(
				<div key={artboard.id} data-artboard-id={artboard.id} className="inspector-page-slices-wrapper" style={slicesWrapperStyle} onMouseOver={this.handleArtboardRollOver} onMouseOut={this.handleArtboardRollOut} onDoubleClick={(event)=> this.handleZoom(1)}>
					<div data-artboard-id={artboard.id} className="inspector-page-artboard-slices-wrapper">{artboardSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-background-slices-wrapper">{backgroundSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-group-slices-wrapper">{groupSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-symbol-slices-wrapper">{symbolSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-textfield-slices-wrapper">{textfieldSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-slice-slices-wrapper">{sliceSlices}</div>
				</div>
			);

			offset.x += Math.round(((i % GRID.colsMax < (GRID.colsMax - 1)) ? GRID.padding.col : 0) + (artboard.meta.frame.size.width * scale));
			this.contentSize.width = Math.max(this.contentSize.width, offset.x);
		});


// 		console.log('InspectorPage.render()', this.state, this.contentSize);
// 		console.log('InspectorPage.render()', slices);
// 		console.log('InspectorPage.render()', upload, activeSlice);
// 		console.log('InspectorPage:', window.performance.memory);


		const baseOffset = {
			x : (artboards.length < GRID.colsMax) ? GRID.padding.col * 0.5 : 0,
			y : (artboards.length < GRID.colsMax) ? PAN_ZOOM.insetSize.height : 26 + PAN_ZOOM.insetSize.height
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

		const previewStyle = {
			backgroundColor : (artboard) ? `rgba(${artboard.meta.fillColor.r}, ${artboard.meta.fillColor.g}, ${artboard.meta.fillColor.b}, ${artboard.meta.fillColor.a})` : 'rgba(0, 0, 0, 0.0)'
		};

		return (<>
			<BaseDesktopPage className="inspector-page-wrapper">
				<Row style={{height:'100%'}}>
					<Column flex={`${(section !== SECTIONS.EDIT) ? '3 1 0' : '1 1 0'}`}>
						<ContextMenuTrigger id="RIGHT_CLICK"><InteractiveDiv
							className="inspector-page-interactive-div"
							x={panMultPt.x}
							y={panMultPt.y}
							scale={scale}
							scaleFactor={PAN_ZOOM.zoomFactor}
							minScale={Math.min(...PAN_ZOOM.zoomNotches)}
							maxScale={Math.max(...PAN_ZOOM.zoomNotches)}
							ignorePanOutside={false}
							renderOnChange={false}
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
						</InteractiveDiv></ContextMenuTrigger>

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
					</Column>
					<Column flex={`${(section !== SECTIONS.EDIT) ? '1 0 0' : '2 0 0'}`} className="inspector-page-panel">
						{(section !== SECTIONS.EDIT) ?
							(tabSets.map((tabSet, i)=> (
								<div key={i} className="inspector-page-panel-filing-tab-set-wrapper" style={{ height : `calc(100% - ${(section === SECTIONS.STYLES ? 156 : 106)}px)` }}>
									<FilingTabSet
										tabs={tabSet}
										activeTab={activeTabs[i]}
										enabled={!processing}
										onTabClick={(tab)=> this.handleTab(tab)}
										onContentClick={(payload)=> console.log('onContentClick', payload)}
									/>

									{(section === SECTIONS.SPECS)
										? (<div className="inspector-page-panel-button-wrapper">
											<CopyToClipboard onCopy={()=> this.handleClipboardCopy('specs', toSpecs(upload, activeSlice))} text={(activeSlice) ? toSpecs(upload, activeSlice) : ''}>
												<button disabled={!slice} className="inspector-page-panel-button">{(processing) ? 'Processing' : 'Copy Specs'}</button>
											</CopyToClipboard>
											<button disabled={!profile || !profile.github || !slice || (gist && gist.busy) || (linter && linter.busy)} className={`inspector-page-panel-button${(gist && !gist.busy) ? ' aux-button' : ''}`} onClick={()=> (!gist) ? this.handleSendSyntaxGist(toSpecs(upload, activeSlice), 'txt') : window.open(gist.url)}>{(processing) ? 'Processing' : (!gist || (gist && gist.busy)) ? 'Gist Specs' : 'View Gist'}</button>
										</div>)

										: (<div className="inspector-page-panel-button-wrapper">
											<button disabled={!slice || (linter && linter.busy)} className="inspector-page-panel-button" onClick={()=> this.handleSendSyntaxLinter(activeTabs[i].syntax)}>{(processing) ? 'Processing' : 'Lint'}</button>
											<CopyToClipboard onCopy={()=> this.handleClipboardCopy('code', activeTabs[i].syntax)} text={(activeTabs && activeTabs[i]) ? activeTabs[i].syntax : ''}>
												<button disabled={!slice} className="inspector-page-panel-button">{(processing) ? 'Processing' : 'Copy Code'}</button>
											</CopyToClipboard>
											<button disabled={!profile || !profile.github || !slice || (gist && gist.busy) || (linter && linter.busy)} className={`inspector-page-panel-button${(gist && !gist.busy) ? ' aux-button' : ''}`} onClick={()=> (!gist) ? this.handleSendSyntaxGist(activeTabs[i].contents.props.code, activeTabs[i].contents.props.language) : window.open(gist.url)}>{(processing) ? 'Processing' : (!gist || (gist && gist.busy)) ? 'Gist Code' : 'View Gist'}</button>
										</div>)
									}
								</div>
							)))

						: (<LiveProvider scope={{styled}} code={syntax} noInline={true}><Row>
								<div style={{width:'100%', maxWidth:'585px'}}>
									<div className="inspector-page-panel-header"><Row>
										<Column horizontal="start" vertical="center" flex="1 1 0">
											{(upload) ? (<a href={buildInspectorURL(upload, '/edit')} target="_blank" rel="noopener noreferrer">{buildInspectorURL(upload, '/edit').replace(/^https?:\/\//, '')}</a>) : ('…')}
										</Column>
										<Column horizontal="end" vertical="center">
											{(upload) ? (<CopyToClipboard onCopy={()=> this.handleClipboardCopy('url', buildInspectorURL(upload, '/edit'))} text={buildInspectorURL(upload, '/edit')}><button className="tiny-button">Copy</button></CopyToClipboard>) : ('')}
										</Column>
									</Row></div>
									<div className="inspector-page-live-editor-wrapper">
										<LiveEditor className="inspector-page-live-editor" onChange={(val)=> this.handleEditorChange(val)} style={{opacity:`${(this.state.clickTotal > -1 || hoverSlice !== null) << 0}`}} />
										{/*{(upload) && (<InspectorPageEditorStatus message={`${Files.basename(upload.filename)} file loaded.`} />)}*/}
										<LiveError className="inspector-page-live-error" />
										<div className="inspector-page-panel-button-wrapper inspector-page-panel-editor-button-wrapper"><Column horizontal="end">
											<button disabled={!slice || (linter && linter.busy)} className="inspector-page-panel-button inspector-page-panel-editor-button" onClick={()=> this.handleSendSyntaxLinter(syntax)}>{(processing) ? 'Processing' : 'Lint'}</button>
											<CopyToClipboard onCopy={()=> this.handleClipboardCopy('code', syntax)} text={syntax}>
												<button disabled={!slice} className="inspector-page-panel-button inspector-page-panel-editor-button">{(processing) ? 'Processing' : 'Copy'}</button>
											</CopyToClipboard>
										</Column></div>
									</div>
								</div>
								<div>
									<div className="inspector-page-panel-header inspector-page-panel-header-alt"><Row>
										<Column horizontal="start" vertical="center" flex="1 1 0">
											{(upload && artboard) ? (<a href={`http://cdn.designengine.ai/renders/${upload.id}/${Strings.slugifyURI(artboard.title)}.html`}>{`cdn.designengine.ai/renders/${upload.id}/${Strings.slugifyURI(artboard.title)}.html`}</a>) : ('…')}
										</Column>
										<Column horizontal="end" vertical="center">
											{(upload && artboard) ? (<CopyToClipboard onCopy={()=> this.handleClipboardCopy('url', `http://cdn.designengine.ai/renders/${upload.id}/${Strings.slugifyURI(artboard.title)}.html`)} text={`http://cdn.designengine.ai/renders/${upload.id}/${Strings.slugifyURI(artboard.title)}.html`}><button className="tiny-button">Copy</button></CopyToClipboard>) : ('')}
										</Column>
									</Row></div>
									<div className="inspector-page-live-preview-wrapper">
										<LivePreview className="inspector-page-live-preview" style={previewStyle} />
										<div className="inspector-page-panel-button-wrapper inspector-page-panel-editor-button-wrapper">
											<button disabled={!slice || !editChange} className="inspector-page-panel-button inspector-page-panel-editor-button" onClick={()=> this.handleEditorSave()}>{(processing) ? 'Processing' : 'Save'}</button>
											<button disabled={!profile || !profile.github || !slice || (gist && gist.busy)} className={`inspector-page-panel-button${(gist && !gist.edited) ? ' aux-button' : ''}`} onClick={()=> (!gist || (gist && gist.edited)) ? this.handleSendSyntaxGist(syntax) : window.open(gist.url)}>{(processing) ? 'Processing' : (!gist || (gist && gist.edited)) ? 'Gist' : 'View'}</button>
											{/*<button disabled={!slice || !editChange} className="inspector-page-panel-button inspector-page-panel-editor-button" onClick={()=> this.handleEditorSave()}>{(processing) ? 'Processing' : 'Gist'}</button>*/}
										</div>
									</div>
								</div>
							</Row></LiveProvider>)
						}
					</Column>
				</Row>
			</BaseDesktopPage>

			{(section === SECTIONS.SPECS) && (<ContextMenu id="RIGHT_CLICK" className="inspector-page-context-menu">
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Copy Spec
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Gist Spec
				</MenuItem>
				{/*<MenuItem divider />*/}
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Share Spec
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Export All
				</MenuItem>
			</ContextMenu>)}

			{(section === SECTIONS.STYLES) && (<ContextMenu id="RIGHT_CLICK" className="inspector-page-context-menu">
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Copy ReactCSS
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Copy CSS
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Gist ReactCSS
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Gist CSS
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Export All
				</MenuItem>
			</ContextMenu>)}

			{(section === SECTIONS.EDIT) && (<ContextMenu id="RIGHT_CLICK" className="inspector-page-context-menu">
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Copy ReactCSS
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Copy CSS
				</MenuItem>
				<MenuItem divider />
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Gist ReactCSS
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Gist CSS
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Copy React Component
				</MenuItem>
				<MenuItem divider />
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Gist React Component
				</MenuItem>
				<MenuItem data={{ foo : 'bar' }} onClick={()=> null} className="inspector-page-context-menu-item">
					Export All
				</MenuItem>
			</ContextMenu>)}


			{(!restricted && upload && (percent === 99 || processing)) && (<UploadProcessing
				upload={upload}
				processing={this.state.processing}
				vpHeight={viewSize.height}
				onCopyURL={(url)=> this.handleClipboardCopy('url', url)}
				onCancel={this.handleUploadProcessingCancel}
			/>)}

			{(!restricted && tutorial) && (<TutorialBubble
				origin={tutorial.origin}
				onNext={this.handleTutorialNextStep}
				onClose={()=> this.setState({ tutorial : null })}
			/>)}

			{(!upload && !valid) && (<BaseOverlay
				tracking="invalid/inspector"
				closeable={true}
				defaultButton={null}
				title="Error Loading Project"
				onComplete={()=> this.props.onPage('')}>
				Design file not found.
			</BaseOverlay>)}

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


const mapStateToProps = (state, ownProps)=> {
	return ({
		deeplink           : state.deeplink,
		profile            : state.userProfile,
		redirectURI        : state.redirectURI,
		atomExtension      : state.atomExtension,
		artboardComponents : state.artboardComponents,
		artboardGroups     : state.artboardGroups
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		setArtboardComponent : (components)=> dispatch(setArtboardComponent(components)),
		setArtboardGroups    : (groups)=> dispatch(setArtboardGroups(groups)),
		setRedirectURI       : (url)=> dispatch(setRedirectURI(url))
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(InspectorPage);


/*
`class Counter extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(state => ({ count: state.count + 1 }));
    }, 3333);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <center>
        <h3>
          {this.state.count}
        </h3>
      </center>
    )
  }
}`
*/