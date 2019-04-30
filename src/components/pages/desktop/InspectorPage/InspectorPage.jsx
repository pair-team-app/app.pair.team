
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import copy from 'copy-to-clipboard';
import qs from 'qs';
import ReactNotifications from 'react-browser-notifications';
import cookie from 'react-cookies';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import fs from 'fs';
// import { Helmet } from 'react-helmet';
import ImageLoader from 'react-loading-image';
import Moment from 'react-moment';
import MonacoEditor from 'react-monaco-editor';
import panAndZoomHoc from 'react-pan-and-zoom-hoc';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import BaseDesktopPage from '../BaseDesktopPage';
import ConfirmDialog from '../../../overlays/ConfirmDialog';
import BaseOverlay from '../../../overlays/BaseOverlay/BaseOverlay';
import InputField, { INPUTFIELD_STATUS_IDLE } from '../../../forms/InputField/InputField';
import { POPUP_TYPE_ERROR, POPUP_TYPE_OK, POPUP_TYPE_STATUS } from '../../../overlays/PopupNotification';
import TutorialBubble from '../../../overlays/TutorialBubble';

import {
	CANVAS,
	EDITOR,
	GRID,
	PAN_ZOOM,
	SECTIONS,
	STATUS_INTERVAL } from './consts';
import {
	calcCanvasSliceFrame,
	drawCanvasSliceBorder,
	drawCanvasSliceMarchingAnts,
	drawCanvasSliceGuides } from './utils/canvas';
import { 
	fontSpecs, 
// 	toAndroid, 
	toBootstrap, 
	toCSS, 
	toGridHTML, 
	toReactJS,
	// 	toSwift
	toSpecs } from './utils/code-generator.js';
import {
	calcArtboardBaseSize,
	calcArtboardScaledCoords,
	calcFitScale,
	calcScrollPoint,
	calcTransformPoint
} from './utils/layout';
import {
	artboardForID,
	fillGroupPartItemSlices,
	flattenUploadArtboards,
	intersectSlices} from './utils/model';
import { MOMENT_TIMESTAMP } from '../../../../consts/formats';
import {
	ARROW_LT_KEY,
	ARROW_RT_KEY,
	MINUS_KEY,
	PLUS_KEY } from '../../../../consts/key-codes';
import {
	DE_LOGO_SMALL,
	API_ENDPT_URL,
	CDN_DOWNLOAD_PARTS_URL,
	CDN_DOWNLOAD_PDF_URL,
	CDN_DOWNLOAD_PROJECT_URL,
	CDN_UPLOAD_URL,
	LINTER_ENDPT_URL } from '../../../../consts/uris';
import { setRedirectURI } from '../../../../redux/actions';
import {
	buildInspectorPath,
	buildInspectorURL,
	createGist,
	sendToSlack } from '../../../../utils/funcs.js';
import {
	Arrays,
	Browsers,
	DateTimes,
	Files,
	Maths,
	Strings,
	URIs } from '../../../../utils/lang.js';
import { trackEvent } from '../../../../utils/tracking';

// import downloadButton from '../../../../assets/images/buttons/btn-download.svg';
import adBannerPanel from '../../../../assets/json/ad-banner-panel';
import inspectorTabSets from '../../../../assets/json/inspector-tab-sets';
import deLogo from '../../../../assets/images/logos/logo-designengine.svg';


const InteractiveDiv = panAndZoomHoc('div');
const artboardsWrapper = React.createRef();
const canvasWrapper = React.createRef();
const canvas = React.createRef();


const CodeEditor = (props)=> {
// 	console.log('InspectorPage.CodeEditor()', props);

	const { lang, syntax } = props;
	return (<div className="code-editor-wrapper"><MonacoEditor
		width="100%"
		height="100%"
		language={lang}
		theme="vs-dark"
		value={syntax}
		options={EDITOR.opts}
		onChange={props.onEditorChange}
		editorDidMount={props.onEditorMounted}
	/></div>);
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
		{contents}
		{/*{((!type || type === 'json_html') && contents) && (<span dangerouslySetInnerHTML={{ __html : String(((enabled) ? JSON.parse(contents) : '').replace(/ /g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt').replace(/\n/g, '<br />')) }} />)}*/}
		{/*{(type === 'component') && (contents)}*/}
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
			{(creator) && (<Dropzone
				multiple={false}
				disablePreview={true}
				onDrop={props.onDrop}
			>{({ getRootProps, getInputProps })=> (
				<div { ...getRootProps() } className="inspector-page-footer-dz">
					{/*<button className="inspector-page-footer-button" onClick={()=> trackEvent('button', 'version')}>Version</button>*/}
					<input { ...getInputProps() } />
				</div>
			)}</Dropzone>)}

			<button disabled={(scale >= Math.max(...PAN_ZOOM.zoomNotches))} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-in'); props.onZoom(1);}}><FontAwesome name="search-plus" /></button>
			<button disabled={(scale <= Math.min(...PAN_ZOOM.zoomNotches))} className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-out'); props.onZoom(-1);}}><FontAwesome name="search-minus" /></button>
			<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'zoom-reset'); props.onZoom(0);}}>Reset ({(fitScale * 100) << 0}%)</button>

			{(section === SECTIONS.EDIT && artboards.length < 1) && (<>
				<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'prev-artboard'); props.onChangeArtboard(prevArtboard);}}><FontAwesome name="arrow-left" /></button>
				<button className="inspector-page-footer-button" onClick={()=> {trackEvent('button', 'next-artboard'); props.onChangeArtboard(nextArtboard);}}><FontAwesome name="arrow-right" /></button>
			</>)}

			{(section !== SECTIONS.INSPECT) && (<button className="inspector-page-footer-button" onClick={()=> props.onChangeSection(SECTIONS.INSPECT)}>Inspect</button>)}
			{(section !== SECTIONS.EDIT) && (<button className="inspector-page-footer-button" onClick={()=> props.onChangeSection(SECTIONS.EDIT)}>Edit</button>)}
		</div>)}
	</Row></div>);
};

const MarqueeBanner = (props)=> {
// 	console.log('InspectorPage.MarqueeBanner()', props);

	const { background, copyText, outro, removable, track, children } = props;
	const className = `marquee-banner${(outro) ? (removable) ? ' marquee-banner-outro-remove' : ' marquee-banner-outro' : ''}`;
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
		return (<div className="inspector-page-specs-list-wrapper inspector-page-specs-list-wrapper-empty">{((upload.state << 0) < 3) ? '' : '/* Rollover to display specs. */'}</div>);
	}

	const { frame } = slice.meta;
	const fillColor = ((slice.type === 'textfield' && slice.meta.font.color) ? slice.meta.font.color : slice.meta.fillColor).toUpperCase();
	const padding = `${slice.meta.padding.top}px ${slice.meta.padding.left}px ${slice.meta.padding.bottom}px ${slice.meta.padding.right}px`;
	const added = `${slice.added.replace(' ', 'T')}Z`;
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
	const urlEditor = buildInspectorURL(upload, '/editor');

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
				name="urlEditor"
				placeholder={urlEditor}
				value={urlEditor}
				button="Copy"
				status={INPUTFIELD_STATUS_IDLE}
				onChange={null}
				onErrorClick={()=> null}
				onFieldClick={()=> {copy(urlEditor); props.onCopyURL(urlEditor)}}
				onSubmit={()=> {copy(urlEditor); props.onCopyURL(urlEditor)}}
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
			urlBanner   : true,
			scrolling   : false,
			tutorial    : null,
			code        : {
				lang   : '',
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

			rendered    : []
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

// 		document.addEventListener('keydown', this.handleKeyDown);
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
// 		const { upload, panMultPt } = this.state;
		const { section, upload, rendered } = this.state;

		if (!upload && deeplink && deeplink !== prevProps.deeplink && deeplink.uploadID !== 0) {
			this.onFetchUpload();
		}

		if (upload && rendered.length === 0) {
// 			fs.readFile("test.txt", (err, data)=> {
// 				if (err) {
// 					throw (err);
// 				}
// 				console.log(data.toString());
// 			});

			const rendered = [{
				lang    : 'html',
				content : `<input id="anPageName" name="page" type="hidden" value="step0"><div class="step0" style="-webkit-text-size-adjust:none;width:100%;min-width:375px;height:100vh;min-height:812px;position:relative;overflow:hidden;margin:0px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;background-color:rgba(67, 175, 251, 1.0);">
            <div style="width:375px;height:100%;position:relative;margin:auto;-webkit-text-size-adjust:none;">
                <div class="map" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:812px;width:375px;position:absolute;margin:0;left:0px;overflow:hidden;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                    <img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-1-background.png" class="background" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 0px;
  height              : 812px;
  width               : 375px;
  position            : absolute;
  margin              : 0;
  left                : 0px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);"><img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-0-bitmap.png" class="bitmap" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : -78px;
  height              : 877px;
  width               : 1451px;
  position            : absolute;
  margin              : 0;
  left                : -518px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);">
</div>
                <div class="header" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:68px;width:375px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                    <div class="background" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:68px;width:375px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                        <div class="background1" style="-webkit-text-size-adjust:none;background-color:rgba(255, 255, 255, 1.0);top:0px;height:68px;width:375px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                        </div>
                        <div class="line" style="-webkit-text-size-adjust:none;background-color:rgba(216, 216, 216, 1.0);top:67px;height:1px;width:375px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                        </div>
                    </div>
                    <img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-1-shape.svg" class="shape" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 19px;
  height              : 30px;
  width               : 30px;
  position            : absolute;
  margin              : 0;
  left                : 20px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);"><img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-3-search.svg" class="search" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 18px;
  height              : 32px;
  width               : 30px;
  position            : absolute;
  margin              : 0;
  left                : 325px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);"><div class="tableft" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:13px;height:42px;width:196px;position:absolute;margin:0;left:90px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                        <div class="left" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:42px;width:99px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                            <img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-2-background-1@2x.png" class="background1" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 0px;
  height              : 42px;
  width               : 99px;
  position            : absolute;
  margin              : 0;
  left                : 0px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);"><img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-1-map-icon-active.svg" class="mapiconactive" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 7px;
  height              : 28px;
  width               : 28px;
  position            : absolute;
  margin              : 0;
  left                : 36px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);">
</div>
                        <div class="right" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:42px;width:99px;position:absolute;margin:0;left:97px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                            <img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-3-background-2@2x.png" class="background1" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 0px;
  height              : 42px;
  width               : 99px;
  position            : absolute;
  margin              : 0;
  left                : 0px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);"><img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-1-list-icon-tab-nonactive.svg" class="listicontabnonactive" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 7px;
  height              : 28px;
  width               : 22px;
  position            : absolute;
  margin              : 0;
  left                : 39px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);">
</div>
                    </div>
                </div>
                <div class="footer" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:763px;height:48px;width:375px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                    <div class="background" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:48px;width:375px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                        <img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-1-rectangle-2.png" class="rectangle2" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 0px;
  height              : 48px;
  width               : 375px;
  position            : absolute;
  margin              : 0;
  left                : 0px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);">
</div>
                    <div class="signup anima-valign-text-middle" style='-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:7px;height:36px;width:66px;position:absolute;margin:0;left:20px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);font-family:"AvenirNext-DemiBold", Helvetica, Arial, serif;font-size:15.0px;color:rgba(62, 62, 62, 1.0);text-align:left;line-height:20.0px;'>
                        Sign Up
                    </div>
                    <div class="login anima-valign-text-middle" style='-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:7px;height:36px;width:66px;position:absolute;margin:0;left:289px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);font-family:"AvenirNext-DemiBold", Helvetica, Arial, serif;font-size:15.0px;color:rgba(62, 62, 62, 1.0);text-align:right;line-height:20.0px;'>
                        Login
                    </div>
                </div>
                <div class="tint" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:812px;width:375px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                    <img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-3-svg-tint-background.svg" class="svgtintbackground" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 0px;
  height              : 812px;
  width               : 375px;
  position            : absolute;
  margin              : 0;
  left                : 0px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);">
</div>
                <div class="button" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:669px;height:70px;width:286px;position:absolute;margin:0;left:45px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                    <div class="background" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:70px;width:286px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                        <div class="rectangle3" style="-webkit-text-size-adjust:none;background-color:rgba(2, 160, 0, 1.0);top:0px;height:70px;box-sizing:border-box;width:286px;position:absolute;margin:0;left:0px;border-style:solid;border-width:5px;border-color:rgba(255, 255, 255, 1.0);-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                        </div>
                        <img anima-src="http://cdn.designengine.ai/renders/249/html/img/step-1-rectangle-3@2x.png" class="rectangle31" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="background-color    : rgba(255,255,255,0.0);
  top                 : 58px;
  height              : 7px;
  width               : 276px;
  position            : absolute;
  margin              : 0;
  left                : 5px;
  -ms-transform       : rotate(0deg); 
  -webkit-transform   : rotate(0deg); 
  transform           : rotate(0deg);">
</div>
                    <div class="next anima-valign-text-middle" style='-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:6px;height:53px;width:278px;position:absolute;margin:0;left:4px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);font-family:"AvenirNext-Bold", Helvetica, Arial, serif;font-size:25.0px;color:rgba(255, 255, 255, 1.0);text-align:center;letter-spacing:2.0px;line-height:34.0px;'>
                        <span><span class="span1">Nex</span><span class="span2">t</span>
    </span>
                    </div>
                </div>
                <div class="copy" style="-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:225px;height:269px;width:310px;position:absolute;margin:0;left:33px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);">
                    <div class="upland anima-valign-text-middle" style='-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:30px;height:95px;width:312px;position:absolute;margin:0;left:-1px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);font-family:"Helvetica", Helvetica, Arial, serif;font-size:70.0px;color:rgba(240, 255, 0, 1.0);text-align:center;letter-spacing:10.0px;line-height:84.0px;'>
                        UPLAND
                    </div>
                    <div class="apropertytradingg anima-valign-text-middle" style='-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:118px;height:36px;width:312px;position:absolute;margin:0;left:-1px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);font-family:"Helvetica", Helvetica, Arial, serif;font-size:13.0px;color:rgba(255, 255, 255, 1.0);text-align:center;letter-spacing:3.5px;line-height:128.0px;'>
                        <span><span class="span1">a property trading gam</span><span class="span2">e</span>
    </span>
                    </div>
                    <div class="welcometo anima-valign-text-middle" style='-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:0px;height:36px;width:312px;position:absolute;margin:0;left:-1px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);font-family:"Helvetica", Helvetica, Arial, serif;font-size:13.0px;color:rgba(255, 255, 255, 1.0);text-align:center;letter-spacing:3.5px;line-height:128.0px;'>
                        WELCOME TO
                    </div>
                    <div class="welcometouplanda anima-valign-text-middle" style='-webkit-text-size-adjust:none;background-color:rgba(255,255,255,0.0);top:158px;height:111px;width:312px;position:absolute;margin:0;left:0px;-ms-transform:rotate(0deg);-webkit-transform:rotate(0deg);transform:rotate(0deg);font-family:"AvenirNext-DemiBold", Helvetica, Arial, serif;font-size:15.0px;color:rgba(255, 255, 255, 1.0);text-align:justify;line-height:24.0px;'>
                        Welcome to Upland, a very unique property trading game where you buy &amp; sell real-world locations.
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>`
			}];

			this.setState({ rendered });
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
				const baseSize = calcArtboardBaseSize((section === SECTIONS.EDIT) ? artboards.slice(0, 1) : artboards, viewSize);
				console.log('_-]BASE SIZE[-_', baseSize);

				const fitScale = calcFitScale(baseSize, viewSize);
				console.log('_-]FIT SCALE[-_', fitScale);

// 				const scrollPt = this.calcScrollPoint(PAN_ZOOM.panMultPt, viewSize, baseSize, fitScale);
				const scrollPt = calcScrollPoint({
					panMultPt : this.state.panMultPt,
					scale     : this.state.scale
					}, PAN_ZOOM.panMultPt, viewSize, baseSize, fitScale);

				const scaledCoords = calcArtboardScaledCoords((section === SECTIONS.EDIT) ? artboards.slice(0, 1) : artboards, fitScale);
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
// 				const scrollPt = calcScrollPoint({
// 		  		  panMultPt : this.state.panMultPt,
// 		  		  scale     : this.state.scale
// 		  		}, PAN_ZOOM.panMultPt, viewSize, this.contentSize, fitScale);
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

	resetTabSets = (upload, artboards)=> {
// 		console.log('InspectorPage.resetTabSets()', upload, artboards);

		const { section  } = this.state;
		let tabSets = inspectorTabSets[section];
		if (section === SECTIONS.INSPECT) {
			tabSets = [...tabSets].map((tabSet, i) => {
				if (i === 0) {
					return (tabSet);

				} else {
					return (tabSet.map((tab, ii) => {
						return ((ii === 0) ? Object.assign({}, tab, {
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
				artboard    : (section === SECTIONS.EDIT && artboards.length > 0) ? artboards[0] : null,
				slice       : null,
				offset      : null,
				hoverSlice  : null,
				hoverOffset : null,
				tooltip     : null,
				linter      : null,
				gist        : null
			});

		} else if (section === SECTIONS.PARTS) {
			tabSets = [...tabSets].map((tabSet, i) => {
				return (tabSet.map((tab, ii) => {
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
				artboard : (section === SECTIONS.EDIT && artboards.length > 0) ? artboards[0] : null,
				slice    : null,
				tooltip  : null,
				linter   : null,
				gist     : null
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

						const slices = [...intersectSlices(artboard.slices, artboard.meta.frame)];

						const langs = [
							toGridHTML(slices),
							toReactJS(slices),
// 							toSwift(slices, artboard),
							toCSS(slices),
// 							toAndroid(slices, artboard),
							toBootstrap(slices)
						];

						tabSets = [...tabSets].map((tabSet, i) => {
							return (tabSet.map((tab, ii) => {
								if (i === 0) {
									return (Object.assign({}, tab, {
										type     : 'component',
										enabled  : ((upload.state << 0) === 3),
										contents : <CodeEditor lang={tab.meta.lang.split(',').shift()} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
										meta     : { ...tab.meta,
											syntax : langs[ii].syntax
										}
									}));

								} else {
									return (Object.assign({}, tab, {
										enabled  : ((upload.state << 0) === 3),
										contents : <div>Nothing to compile</div>
									}));
								}
							}));
						});

						const activeTabs = tabSets.map((tabSet)=> {
							return ([...tabSet].shift());
						});

// 						console.log(':::::::::::: reset', tabSets, activeTabs);

						this.setState({ upload, tabSets, activeTabs, artboard,
							slice     : [...slices].shift(),
							offset    : artboard.meta.frame.origin,
							tooltip   : null,
							linter    : null,
							gist      : null
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
			toGridHTML(slices),
			toReactJS(slices),
// 			toSwift(slices, artboard),
			toCSS(slices),
// 			toAndroid(slices, artboard),
			toBootstrap(slices)
		];

		if (section === SECTIONS.INSPECT) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				if (i === 1) {
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
					return (tabSet.map((tab, ii)=> {
						return (Object.assign({}, tab, {
							enabled  : true,
							contents : <CodeEditor lang={tab.meta.lang.split(',').shift()} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
							meta     : { ...tab.meta,
								syntax : langs[ii].syntax
							}
						}));
					}));
				}
			});

		} else if (section === SECTIONS.PARTS) {
			tabSets[0][0].enabled = true;

			if (slice.type === 'symbol') {
				let formData = new FormData();
				formData.append('action', 'SYMBOL_SLICES');
				formData.append('slice_id', slice.id);
				axios.post(API_ENDPT_URL, formData)
					.then((response)=> {
						console.log('SYMBOL_SLICES', response.data);
						slice.children = [...fillGroupPartItemSlices(upload, slice), ...response.data.slices.map((item)=> {
							const meta = JSON.parse(item.meta.replace(/\n/g, '\\\\n'));
							return (Object.assign({}, item, {
								id         : item.id << 0,
								artboardID : item.artboard_id << 0,
								meta       : Object.assign({}, meta, {
									orgFrame : meta.frame,
									frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
								}),
								filled     : false
							}))
						})];
						tabSets[0][0].enabled = true;
						tabSets[0][0].contents = <PartsList
							enabled={true}
							contents={slice.children}
							onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
						this.setState({ tabSets });
					}).catch((error)=> {
				});

			} else if (slice.type === 'artboard' || slice.type === 'group' || slice.type === 'background') {
				tabSets[0][0].enabled = true;
				tabSets[0][0].contents = <PartsList
					enabled={true}
					contents={fillGroupPartItemSlices(upload, slice)}
					onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
				this.setState({ tabSets });
			}

		} else if (section === SECTIONS.EDIT) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				return (tabSet.map((tab, ii)=> {
					if (i === 0) {
						return (Object.assign({}, tab, {
							enabled  : true,
							contents : <CodeEditor lang={tab.meta.lang.split(',').shift()} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
							meta     : { ...tab.meta,
								syntax : langs[ii].syntax
							}
						}));

					} else {
						return (Object.assign({}, tab, {
							enabled  : true,
							contents : <div>Nothing to compile</div>
						}));
					}
				}));
			});
		}

		const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
			const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
			return ((tab) ? tab : activeTab);
		});

// 		console.log(':::::::::::: replace', tabSets, activeTabs);

		this.setState({ upload, artboard, tabSets, activeTabs,
			linter : null,
			gist   : null
		});
	};

	restoreTabSets = (upload, artboard, slice)=> {
// 		console.log('InspectorPage.restoreTabSets()', upload, artboard, slice);

		const { profile } = this.props;
		const { section } = this.state;
		let tabSets = [...this.state.tabSets];
// 		let activeTabs = [...this.state.activeTabs];

		const slices = [...intersectSlices(artboard.slices, slice.meta.frame)];
		const langs = [
			toGridHTML(slices),
			toReactJS(slices),
// 			toSwift(slices, artboard),
			toCSS(slices),
// 			toAndroid(slices, artboard),
			toBootstrap(slices)
		];

		if (section === SECTIONS.INSPECT) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				if (i === 1) {
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
					return (tabSet.map((tab, ii)=> {
						return (Object.assign({}, tab, {
							enabled  : true,
							contents : <CodeEditor lang={tab.meta.lang.split(',').shift()} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
							meta     : { ...tab.meta,
								syntax : langs[ii].syntax
							}
						}));
					}));
				}
			});

		} else if (section === SECTIONS.PARTS) {
			if (slice.type === 'symbol') {
				let formData = new FormData();
				formData.append('action', 'SYMBOL_SLICES');
				formData.append('slice_id', slice.id);
				axios.post(API_ENDPT_URL, formData)
					.then((response)=> {
						console.log('SYMBOL_SLICES', response.data);
						slice.children = [...fillGroupPartItemSlices(upload, slice), ...response.data.slices.map((item)=> {
							const meta = JSON.parse(item.meta.replace(/\n/g, '\\\\n'));
							return (Object.assign({}, item, {
								id         : item.id << 0,
								artboardID : item.artboard_id << 0,
								meta       : Object.assign({}, meta, {
									orgFrame : meta.frame,
									frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
								}),
								filled     : false
							}));
						})];
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

		} else if (section === SECTIONS.EDIT) {
			tabSets = [...this.state.tabSets].map((tabSet, i)=> {
				return (tabSet.map((tab, ii)=> {
					if (i === 0) {
						return (Object.assign({}, tab, {
							enabled  : true,
							contents : <CodeEditor lang={tab.meta.lang.split(',').shift()} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
							meta     : { ...tab.meta,
								syntax : langs[ii].syntax
							}
						}));

					} else {
						return (Object.assign({}, tab, {
							enabled  : true,
							contents : <div>Nothing to compile</div>
						}));
					}
				}));
			});
		}

		const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
			const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
			return ((tab) ? tab : activeTab);
		});

// 		console.log(':::::::::::: restore', tabSets, activeTabs);

		this.setState({ artboard, tabSets, activeTabs,
			hoverSlice  : null,
			hoverOffset : null,
			linter      : null,
			gist        : null
		});
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
// 			this.resetTabSets(upload, [artboard]);
			this.resetTabSets(upload, (artboard) ? [artboard] : []);
		}
	};

	handleCanvasUpdate = ()=> {
// 		console.log('InspectorPage.handleCanvasUpdate()', this.antsOffset);

		const { scrollPt, offset, hoverOffset } = this.state;
		const { artboard, slice, hoverSlice } = this.state;
		const { section, upload, scale, urlBanner } = this.state;

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
// 				const frame = this.calcCanvasSliceFrame(slice, artboard, offset, scrollPt);
				const frame = calcCanvasSliceFrame({ section, upload, scale, urlBanner }, slice, artboard, offset, scrollPt);
// 				drawCanvasSliceFill(context, frame, CANVAS.slices.fillColor);
// 				drawCanvasSliceTooltip(context, slice.type, frame.origin, frame.size.width);
				drawCanvasSliceBorder(context, frame);
				drawCanvasSliceGuides(context, frame, { width : canvas.current.clientWidth, height : canvas.current.clientHeight }, CANVAS.guides.color);
				drawCanvasSliceMarchingAnts(context, frame, this.antsOffset);
			}

			if (hoverSlice) {
				if (!slice || (slice && slice.id !== hoverSlice.id)) {
// 					const frame = this.calcCanvasSliceFrame(hoverSlice, artboard, hoverOffset, scrollPt);
					const frame = calcCanvasSliceFrame({ section, upload, scale, urlBanner }, hoverSlice, artboard, hoverOffset, scrollPt);
// 					drawCanvasSliceFill(context, frame, CANVAS.slices.fillColor);
// 					drawCanvasSliceTooltip(context, `W:${frame.size.width}px H:${frame.size.height}px`, frame.origin, frame.size.width * 7);
					drawCanvasSliceBorder(context, frame);
					drawCanvasSliceGuides(context, frame, { width : canvas.current.clientWidth, height : canvas.current.clientHeight }, CANVAS.guides.color);
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
		const { viewSize, urlBanner } = this.state;

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : window.innerWidth - viewSize.width
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

	handleDownloadPartListItem = (slice)=> {
// 		console.log('InspectorPage.handleDownloadPartListItem()', slice);

		trackEvent('button', 'download-part');
		const { upload } = this.state;
		Browsers.makeDownload(`${CDN_DOWNLOAD_PARTS_URL}?upload_id=${upload.id}&slice_title=${slice.title}&slice_ids=${[slice.id]}`);
	};

	handleDownloadPartsList = ()=> {
// 		console.log('InspectorPage.handleDownloadPartsList()');

		trackEvent('button', 'download-parts');
		const { upload, slice } = this.state;
		const sliceIDs = (slice.type === 'group') ? fillGroupPartItemSlices(upload, slice).map((slice)=> (slice.id)).join(',') : slice.children.map((slice)=> (slice.id)).join(',');

		Browsers.makeDownload(`${CDN_DOWNLOAD_PARTS_URL}?upload_id=${upload.id}&slice_title=${slice.title}&slice_ids=${sliceIDs}`);
	};

	handleEditorChange = (val, event)=> {
		console.log('InspectorPage.handleEditorChange()', val, event);

		const rendered = Object.assign({}, { ...this.state.rendered[0],
			content : val
		});

		this.setState({ rendered : [rendered] });
	};

	handleEditorMounted = (editor, monaco)=> {
// 		console.log('InspectorPage.handleEditorMounted()', editor, monaco);
		editor.focus();
	};

	handleEditorRun = (lang, html)=> {
		console.log('InspectorPage.handleEditorRun()', lang, html);

		const tabSets = [...this.state.tabSets].map((tabSet, i)=> {
			return (tabSet.map((tab, ii)=> {
				return ((i === 0) ? tab : Object.assign({}, tab, {
					enabled  : true,
					lang     : lang,
// 					contents : <span style={{position:'relative'}} dangerouslySetInnerHTML={{ __html : html }} />
// 					contents : <span style={{position:'relative'}} dangerouslySetInnerHTML={{ __html : this.state.rendered[0].content }} />
					contents : <iframe src={"http://cdn.designengine.ai/renders/249/html/step0.html"} width={"100%"} height={"100%"} frameborder={"0"} sandbox={"allow-modals allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"} style={{border:'none'}} />
				}));
			}));
		});

		const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
			const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
			return ((tab) ? tab : activeTab);
		});

		this.setState({ tabSets, activeTabs });
	};

	handleFileDrop = (files, rejected)=> {
// 		console.log('InspectorPage.handleFileDrop()', files, rejected);

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

		trackEvent('keypress', (keyCode === PLUS_KEY) ? 'plus' : (keyCode === MINUS_KEY) ? 'minus' : (keyCode === ARROW_LT_KEY) ? 'left-arrow' : (keyCode === ARROW_RT_KEY) ? 'right-arrow' : `${keyCode}`);
		if (event.keyCode === PLUS_KEY) {
			this.handleZoom(1);

		} else if (event.keyCode === MINUS_KEY) {
			this.handleZoom(-1);
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
			const { viewSize, scale } = this.state;
			const pt = calcTransformPoint({ scale,
				panMultPt : this.state.panMultPt
			});

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
		const { viewSize, urlBanner } = this.state;

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : window.innerWidth - viewSize.width
			},
			content  : `Sending ${lang} snippet to Atom…`
		});

		window.postMessage({
			action  : 'SYNTAX_SEND',
			payload : {
				lang   : lang,
				syntax : tab.meta.syntax
			}
		}, '*');
	};

	handleSendSyntaxGist = (tab)=> {
		console.log('InspectorPage.handleSendSyntaxGist()', tab);

		const { profile, processing } = this.props;
		const { viewSize, urlBanner, slice, linter } = this.state;

		const lang = (tab.title === 'ReactJSX') ? 'jsx' : (tab.title === 'Android') ? 'xml' : (tab.title === 'Bootstrap') ? 'html' : tab.title.toLowerCase();
		trackEvent('button', `send-gist-${lang}`);

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : window.innerWidth - viewSize.width
			},
			content  : `Creating “${Strings.slugifyURI(slice.title)}.${lang}” gist on GitHub…`
		});

		this.setState({ gist : { busy : true }}, ()=> {
			createGist(profile.github.accessToken, `${Strings.slugifyURI(slice.title)}.${lang}`, tab.meta.syntax, `Design Engine auto generated ${(linter) ? 'linted ' : ''}syntax v1`, true, (data)=> {
				this.setState({ gist : {
						busy : false,
						url  : data.html_url
					}});
			});
		});
	};

	handleSendSyntaxLinter = (tab)=> {
		console.log('InspectorPage.handleSendSyntaxLinter()', tab);

		const tabID = tab.id;
		const lang = (tab.title === 'ReactJSX') ? 'jsx' : (tab.title === 'Android') ? 'xml' : (tab.title === 'Bootstrap') ? 'html' : tab.title.toLowerCase();
		const linter = (lang === 'css') ? 'StyleLint' : (lang === 'html') ? 'HTMLHint' : (lang === 'js' || lang === 'jsx') ? 'Prettier + ESLint' : 'Linter';

		trackEvent('button', `send-linter-${lang}`);

		const { processing } = this.props;
		const { viewSize, urlBanner } = this.state;

		this.props.onPopup({
			type     : POPUP_TYPE_OK,
			offset   : {
				top   : (urlBanner << 0 && !processing) * 38,
				right : window.innerWidth - viewSize.width
			},
			content  : `Sending ${lang} snippet to ${linter}…`
		});


		const html = `Loading ${linter}…\n`;
		const tabSets = [...this.state.tabSets].map((tabSet, i)=> {
			return (tabSet.map((tab)=> {
				if (i === 0) {
					return ((tab.id === tabID) ? Object.assign({}, tab, { contents : JSON.stringify(html) }) : tab);

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
			axios.post(LINTER_ENDPT_URL, {
				lang   : lang,
				config : '',
				syntax : Strings.sliceLines(tab.meta.syntax, 5)
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

				const html = `Loading ${linter}…\n${output.length} ${Strings.pluralize('change', output.length)} made.\n\n\n${syntax}`;

				const tabSets = [...this.state.tabSets].map((tabSet, i)=> {
					return (tabSet.map((tab)=> {
						if (i === 0) {
							return ((tab.id === tabID) ? Object.assign({}, tab, {
								contents : JSON.stringify(html),
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
		trackEvent('tab', Strings.slugifyURI(tab.title));

		const { tabSets } = this.state;
		const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
			return ((tabSets[i].find((item)=> (item.id === tab.id))) ? tab : activeTab);
		});

		this.setState({ activeTabs,
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
		})
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


		const { processing, profile, atomExtension } = this.props;

		const { section, upload, artboard, slice, hoverSlice, tabSets, scale, fitScale, activeTabs, scrolling, viewSize, panMultPt, code } = this.state;
		const { valid, restricted, urlBanner, tutorial, percent, tooltip, fontState, linter, gist } = this.state;

		const artboards = (section === SECTIONS.EDIT) ? (artboard) ? [artboard] : [] : flattenUploadArtboards(upload, 'page_child');
// 		const artboards = (section === SECTIONS.EDIT) ? (artboard) ? [artboard] : [] : (section === SECTIONS.PARTS) ? flattenUploadArtboards(upload, 'page_child').slice(0, 3) : flattenUploadArtboards(upload, 'page_child');
		const activeSlice = (hoverSlice) ? hoverSlice : slice;

		const listTotal = (upload && activeSlice) ? (section === SECTIONS.EDIT) ? flattenUploadArtboards(upload, 'page_child').length : (activeSlice) ? (activeSlice.type === 'group') ? fillGroupPartItemSlices(upload, activeSlice).length : activeSlice.children.length : 0 : 0;
		const missingFonts = (upload) ? upload.fonts.filter((font)=> (!font.installed)) : [];

		const pt = calcTransformPoint({ panMultPt, scale });

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
			const sliceSlices = (artboard.slices.length > 0) ? this.buildSliceRollOverItemTypes(artboard, 'slice', sliceOffset, scale, scrolling) : [];
// 			const sliceSlices = (section !== SECTIONS.PARTS) ? [] : [<img key={i} data-artboard-id={artboard.id} src={icon} width="100%" height="100%" style={iconStyle} alt="ICON" />];
// 			const sliceSlices = (section !== SECTIONS.PARTS) ? [] : [<img key={i} data-artboard-id={artboard.id} src={icon} style={iconStyle} alt="ICON" />];

			artboardImages.push(
				<div key={i} data-artboard-id={artboard.id} className="inspector-page-artboard" style={artboardStyle}>
					<div className="inspector-page-artboard-caption">{Strings.truncate((artboard.type === 'page_child') ? artboard.title : artboard.title.split('[').shift(), 8)}</div>
					{/*<div className="inspector-page-artboard-icon-wrapper" style={{width:`${(scale * artboard.meta.frame.size.width) << 0}px`,height:`${(scale * artboard.meta.frame.size.height) << 0}px`}}><img src={icon} width="100%" height="100%" style={iconStyle} alt="ICON" /></div>*/}
				</div>
			);

			slices.push(
				<div key={artboard.id} data-artboard-id={artboard.id} className="inspector-page-slices-wrapper" style={slicesWrapperStyle} onMouseOver={this.handleArtboardRollOver} onMouseOut={this.handleArtboardRollOut} onDoubleClick={(event)=> this.handleZoom(1)}>
					<div data-artboard-id={artboard.id} className={`inspector-page-${(section === SECTIONS.EDIT) ? 'artboard' : 'group'}-slices-wrapper`}>{(section === SECTIONS.EDIT) ? artboardSlices : (section === SECTIONS.PARTS) ? [...artboardSlices, ...groupSlices ] : groupSlices }</div>
					{(section !== SECTIONS.EDIT) && (<div data-artboard-id={artboard.id} className="inspector-page-background-slices-wrapper">{(section === SECTIONS.INSPECT) ? [...artboardSlices, ...backgroundSlices ] : backgroundSlices}</div>)}
					{/*<div data-artboard-id={artboard.id} className="inspector-page-background-slices-wrapper">{backgroundSlices}</div>*/}
					<div data-artboard-id={artboard.id} className="inspector-page-symbol-slices-wrapper">{symbolSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-textfield-slices-wrapper">{textfieldSlices}</div>
					<div data-artboard-id={artboard.id} className="inspector-page-slice-slices-wrapper">{sliceSlices}</div>
				</div>
			);

			offset.x += Math.round(((i % GRID.colsMax < (GRID.colsMax - 1)) ? GRID.padding.col : 0) + (artboard.meta.frame.size.width * scale));
			this.contentSize.width = Math.max(this.contentSize.width, offset.x);
		});

// 		artboardImages = (!restricted) ? artboardImages : [];
// 		slices = (!restricted) ? slices : [];



// 		console.log('InspectorPage.render()', this.state, this.contentSize);
// 		console.log('InspectorPage.render()', slices);
// 		console.log('InspectorPage.render()', upload, activeSlice);
// 		console.log('InspectorPage:', window.performance.memory);



		const contentClass = `inspector-page-canvas-content ${(section === SECTIONS.EDIT) ? 'inspector-page-canvas-content-edit' : 'inspector-page-canvas-content-inspect'}`;
		const panelClass = `inspector-page-panel ${(section === SECTIONS.EDIT) ? 'inspector-page-panel-edit' : 'inspector-page-panel-inspect'}`;

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

		return (<>
			<BaseDesktopPage className="inspector-page-wrapper">
				<div className={contentClass} onWheel={this.handleWheelStart}>
					{(percent < 100) && (<div className="upload-progress-bar-wrapper" style={{width:`${(section === SECTIONS.EDIT && !processing) ? 33 : 67}%`}}>
						<div className="upload-progress-bar" style={{ width : `${percent}%` }} />
					</div>)}

					<div className="inspector-page-marquee-wrapper" style={{width:`${(section === SECTIONS.EDIT && !processing) ? 33 : 67}%`}}>
						{(upload && urlBanner && percent === 100) && (<MarqueeBanner
							copyText={buildInspectorURL(upload)}
							removable={true}
							outro={!urlBanner}
							onCopy={()=> this.handleClipboardCopy('url', buildInspectorURL(upload))}
							onClose={()=> {trackEvent('button', 'close-url-banner'); this.setState({ urlBanner : false });}}>
							<div className="marquee-banner-content marquee-banner-content-url"><span className="txt-bold" style={{paddingRight:'5px'}}>Share on Slack:</span> {buildInspectorPath(upload)}</div>
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
						className="full-width full-height"
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
								<div className="inspector-page-panel-filing-tab-set-wrapper" style={{ height : `calc(100% - ${(i === 0 ? 202 : 58)}px)` }}>
									<FilingTabSet
										tabs={tabSet}
										activeTab={activeTabs[i]}
										enabled={!processing}
										onTabClick={(tab)=> this.handleTab(tab)}
										onContentClick={(payload)=> console.log('onContentClick', payload)}
									/>
									{(i === 0)
										? (<div className="inspector-page-panel-button-wrapper">
												<CopyToClipboard onCopy={()=> this.handleClipboardCopy('code', activeTabs[i].meta.syntax)} text={(activeTabs && activeTabs[i]) ? activeTabs[i].meta.syntax : ''}>
													<button disabled={!slice} className="inspector-page-panel-button">{(processing) ? 'Processing' : 'Copy'}</button>
												</CopyToClipboard>
												<button disabled={!slice || (linter && linter.busy)} className={`inspector-page-panel-button${(linter && !linter.busy) ? ' destruct-button' : ''}`} onClick={()=> (!linter) ? this.handleSendSyntaxLinter(activeTabs[i]) : this.handleLinterLog(activeTabs[i])}>{(processing) ? 'Processing' : (!linter || (linter && linter.busy)) ? 'Lint' : 'Show Errors'}</button>
												<button disabled={!atomExtension || !slice || (linter && linter.busy) || (gist && gist.busy)} className="inspector-page-panel-button" onClick={()=> this.handleSendSyntaxAtom(activeTabs[i])}>{(processing) ? 'Processing' : 'Atom'}</button>
												<button disabled={!profile || !profile.github || !slice || (gist && gist.busy) || (linter && linter.busy)} className={`inspector-page-panel-button${(gist && !gist.busy) ? ' aux-button' : ''}`} onClick={()=> (!gist) ? this.handleSendSyntaxGist(activeTabs[i]) : window.open(gist.url)}>{(processing) ? 'Processing' : (!gist || (gist && gist.busy)) ? 'Gist' : 'View Gist'}</button>
											</div>)
										: (<div className="inspector-page-panel-button-wrapper">
												<CopyToClipboard onCopy={()=> this.handleClipboardCopy('specs', toSpecs(activeSlice))} text={(activeSlice) ? toSpecs(activeSlice) : ''}>
													<button disabled={!slice} className="inspector-page-panel-button">{(processing) ? 'Processing' : 'Copy'}</button>
												</CopyToClipboard>
											</div>)
									}
								</div>
							</div>)
						))}
					</>)}

					{(section === SECTIONS.PARTS) && (<div className="inspector-page-panel-content-wrapper inspector-page-panel-full-width-content-wrapper inspector-page-panel-full-height-content-wrapper">
						{(tabSets.map((tabSet, i)=> (
							<div className="inspector-page-panel-filing-tab-set-wrapper" key={i} style={{ height : `calc(100% - 154px)` }}>
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
								</div>
							</div>)
						))}
					</div>)}

					{(section === SECTIONS.EDIT) && (<div className="inspector-page-panel-content-wrapper inspector-page-panel-full-width-content-wrapper inspector-page-panel-full-height-content-wrapper inspector-page-panel-editor-wrapper">
						{(tabSets.map((tabSet, i)=> (
							<div key={i} className="inspector-page-panel-content-wrapper inspector-page-panel-split-width-content-wrapper inspector-page-panel-full-height-content-wrapper">
								<div className="inspector-page-panel-filing-tab-set-wrapper" style={{ height : `calc(100% - ${(i === 0 ? 202 : 58)}px)` }}>
									<FilingTabSet
										tabs={tabSet}
										activeTab={activeTabs[i]}
										enabled={!processing}
										onTabClick={(tab)=> this.handleTab(tab)}
										onContentClick={(payload)=> console.log('onContentClick', payload)}
									/>

									{(i === 0)
										? (<div className="inspector-page-panel-button-wrapper">
												<button disabled={!slice} className="inspector-page-panel-button" onClick={()=> this.handleEditorRun(activeTabs[i].meta.lang.split(',').pop(), activeTabs[i].meta.syntax)}>{(processing) ? 'Processing' : 'Run'}</button>
												<button disabled={!slice || (linter && linter.busy)} className={`inspector-page-panel-button${(linter && !linter.busy) ? ' destruct-button' : ''}`} onClick={()=> (!linter) ? this.handleSendSyntaxLinter(activeTabs[i]) : this.handleLinterLog(activeTabs[i])}>{(processing) ? 'Processing' : (!linter || (linter && linter.busy)) ? 'Lint' : 'Show Errors'}</button>
												<button disabled={!atomExtension || !slice || (linter && linter.busy) || (gist && gist.busy)} className="inspector-page-panel-button" onClick={()=> this.handleSendSyntaxAtom(activeTabs[i])}>{(processing) ? 'Processing' : 'Atom'}</button>
												<button disabled={!profile || !profile.github || !slice || (gist && gist.busy) || (linter && linter.busy)} className={`inspector-page-panel-button${(gist && !gist.busy) ? ' aux-button' : ''}`} onClick={()=> (!gist) ? this.handleSendSyntaxGist(activeTabs[i]) : window.open(gist.url)}>{(processing) ? 'Processing' : (!gist || (gist && gist.busy)) ? 'Gist' : 'View Gist'}</button>
											</div>)
										: (<div className="inspector-page-panel-button-wrapper">
												{/*<button disabled={(processing || artboards.length === 0)} className="inspector-page-panel-button" onClick={()=> this.handleDownloadArtboardPDF()}>{(processing) ? 'Processing' : 'Download PDF'}</button>*/}
												<button disabled={true} className="inspector-page-panel-button" onClick={()=> this.handleDownloadArtboardPDF()}>{(processing) ? 'Processing' : 'Compile'}</button>
											</div>)
									}
								</div>
							</div>
						)))}
					</div>)}
				</div>)}
			</BaseDesktopPage>


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

			{(fontState === 1) && (<ConfirmDialog
				title="Missing Font(s)"
				message={`Some fonts (${missingFonts.map((font)=> (font.postscript_name)).join(', ')}) need to be installed to complete processing, upload now?`}
				onComplete={this.handleFontDialogComplete}
			/>)}


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
		deeplink      : state.deeplink,
		profile       : state.userProfile,
		redirectURI   : state.redirectURI,
		atomExtension : state.atomExtension
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		setRedirectURI : (url)=> dispatch(setRedirectURI(url))
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(InspectorPage);
