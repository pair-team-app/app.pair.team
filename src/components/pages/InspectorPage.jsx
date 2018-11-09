
import React, { Component } from 'react';
import './InspectorPage.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import cookie from 'react-cookies';
import FontAwesome from 'react-fontawesome';
// eslint-disable-next-line
import Tooltip from 'rc-tooltip';
import { Column, Row } from 'simple-flexbox';

import CommentItem from '../iterables/CommentItem';
import Dropdown from '../elements/Dropdown';
import SliceItem from '../iterables/SliceItem';
import SliceToggle from '../elements/SliceToggle';

const heroImage = React.createRef();

class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pageID        : this.props.match.params.pageID,
			artboardID    : this.props.match.params.artboardID,
			sliceID       : this.props.match.params.sliceID,
			slice         : null,
			scaleSize     : 2,
			page          : null,
			artboard      : null,
			code          : {
				html   : '#block {<br>&nbsp;&nbsp;width: 100%;<br>&nbsp;&nbsp;color: #ffffff;<br>}',
				syntax : '#block {width: 100%; color: #ffffff;}'
			},
			comment       : '',
			visibleTypes  : {
				slice      : true,
				hotspot    : false,
				textfield  : false,
				background : false
			},
			languages     : [{
				id       : 1,
				title    : 'CSS/HTML',
				selected : true,
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
			}]
		};
	}

	componentDidMount() {
		this.refreshData();
	}

	componentDidUpdate(prevProps) {
		if (this.props.match.params.artboardID !== prevProps.match.params.artboardID) {
			this.refreshData();
			return (null);
		}
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
		console.log('handleSliceToggle()', type);

		let visibleTypes = this.state.visibleTypes;
		Object.keys(visibleTypes).forEach(function(key) {
			visibleTypes[key] = false;

		});
		visibleTypes[type] = true;

		this.setState({
			slice        : (this.state.slice) ? (this.state.slice.type === type) ? null : this.state.slice : null,
			visibleTypes : visibleTypes
		});
	};

	handleCodeCopy = ()=> {
		window.alert('Code copied to clipboard!');
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

	handleSliceClick = (ind, item)=> {
		this.setState({ slice : item });
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
		this.ddTitle = tmp[ind].title;
		this.setState({ [key] : tmp });
	};

	render() {
// 		console.log('InspectorPage.render()', this.state);

		const tsOptions = {
			year   : 'numeric',
			month  : 'numeric',
			day    : 'numeric'
		};

// 		const { page, artboard, slice } = this.state;
		const { artboard, slice } = this.state;

		const scale = (artboard && heroImage && heroImage.current) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? heroImage.current.clientWidth / artboard.meta.frame.size.width : heroImage.current.clientHeight / artboard.meta.frame.size.height : 1;
		const heroImageClass = 'inspector-page-hero-image' + ((artboard) ? (artboard.meta.frame.size.width > artboard.meta.frame.size.height) ? ' inspector-page-hero-image-landscape' : ' inspector-page-hero-image-portrait' : '');
		const panelImageClass = 'inspector-page-panel-image' + ((slice) ? ((slice.meta.frame.size.width > slice.meta.frame.size.height) ? ' inspector-page-panel-image-landscape' : ' inspector-page-panel-image-portrait')  + ' ' + ((slice.type === 'slice') ? 'inspector-page-panel-image-slice' : (slice.type === 'hotspot') ? 'inspector-page-panel-image-hotspot' : (slice.type === 'textfield') ? 'inspector-page-panel-image-textfield' : 'inspector-page-panel-image-background') : '');
		const slicesStyle = (artboard) ? {
			width   : (scale * artboard.meta.frame.size.width) + 'px',
			height  : (scale * artboard.meta.frame.size.height) + 'px'
		} : {
			width   : '100%',
			height  : '100%'
		};

		const commentButtonClass = (this.state.comment.length !== 0) ? 'inspector-page-comment-button' : 'inspector-page-comment-button button-disabled';

		const slices = (artboard) ? artboard.slices.map((item, i, arr) => {
			return (
				<SliceItem
					key={i}
					title={item.title}
					type={item.type}
					visible={this.state.visibleTypes[item.type]}
					top={item.meta.frame.origin.y}
					left={item.meta.frame.origin.x}
					width={item.meta.frame.size.width}
					height={item.meta.frame.size.height}
					scale={scale}
					onClick={() => this.handleSliceClick(i, item)} />
			);
		}) : [];

		const comments = (artboard) ? artboard.comments.map((item, i, arr) => {
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
			<div className="inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-hero-wrapper">
						{(artboard) && (<img className={heroImageClass} src={artboard.filename} alt="Hero" ref={heroImage} />)}
						<div className="inspector-page-hero-slice-wrapper" style={slicesStyle}>
							{slices}
						</div>
						<div className="inspector-page-hero-title-wrapper">
							{/*<Column flexGrow={1} horizontal="start">{(artboard) ? artboard.title : 'N/A'}</Column>*/}
							<Column flexGrow={1} horizontal="center"><Row>
								<SliceToggle type="slice" selected={this.state.visibleTypes.slice} onClick={(isSelected)=> this.handleSliceToggle('slice')} last={false} />
								<SliceToggle type="hotspot" selected={this.state.visibleTypes.hotspot} onClick={(isSelected)=> this.handleSliceToggle('hotspot')} last={false} />
								<SliceToggle type="textfield" selected={this.state.visibleTypes.textfield} onClick={(isSelected)=> this.handleSliceToggle('textfield')} last={false} />
								<SliceToggle type="background" selected={this.state.visibleTypes.background} onClick={(isSelected)=> this.handleSliceToggle('background')} last={true} />
							</Row></Column>
						</div>
					</div>
					<textarea className="inspector-page-comment-txt" name="comment" placeholder="Enter Comment" value={this.state.comment} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />
					<button className={commentButtonClass} onClick={()=> this.submitComment()}>Submit</button>

					<div className="inspector-page-hero-info-wrapper">
						{(artboard) ? artboard.views + ' View' + ((parseInt(artboard.views, 10) !== 1) ? 's' : '') : 'Views'}<br />
						{(artboard) ? artboard.downloads + ' Download' + ((parseInt(artboard.downloads, 10) !== 1) ? 's' : '') : 'Downloads'}<br />
						{(artboard) ? artboard.comments.length + ' Comment' + ((artboard.comments.length !== 1) ? 's' : '') : 'Comments'}
					</div>
					<div className="inspector-page-comment-wrapper">
						{comments}
					</div>
				</div>
				<div className="inspector-page-panel">
					<div className="inspector-page-panel-display">
						{(slice) && (
							<img className={panelImageClass} src={((slice.type === 'slice') ? slice.filename + '@' + this.state.scaleSize + 'x.png' : ('https://via.placeholder.com/' + (slice.meta.frame.size.width * this.state.scaleSize) + 'x' + (slice.meta.frame.size.height * this.state.scaleSize)))} alt={(slice.title + ' - @' + this.state.scaleSize + 'x')} />
						)}
						<div className="inspector-page-panel-zoom-wrapper">
							<button className={(slice && this.state.scaleSize < 3) ? 'inspector-page-zoom-button' : 'inspector-page-zoom-button button-disabled'} onClick={()=> this.handleZoom(1)}><FontAwesome name="plus" /></button><br />
							<button className={(slice && this.state.scaleSize > 1) ? 'inspector-page-zoom-button' : 'inspector-page-zoom-button button-disabled'} onClick={()=> this.handleZoom(-1)} style={{marginRight:'6px'}}><FontAwesome name="minus" /></button>
						</div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<div><button className="inspector-page-download-button" onClick={()=> this.handleDownload()}>Download</button></div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<Dropdown
							title="CSS/HTML"
							list={this.state.languages}
							resetThenSet={this.resetThenSet}
						/>
					</div>
					<div className="inspector-page-panel-code-wrapper">
						<div className="inspector-page-panel-code"><span dangerouslySetInnerHTML={{ __html : this.state.code.html }} /></div>
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<CopyToClipboard onCopy={()=> this.handleCodeCopy()} text={this.state.code.syntax}>
							<button className="inspector-page-copy-code-button">Copy</button>
						</CopyToClipboard>
					</div>
					<div className="inspector-page-panel-info-wrapper">
						{/*<Row><Column flexGrow={1}>System</Column><Column flexGrow={1} horizontal="end">{(artboard && artboard.system) ? artboard.system.title : 'N/A'}</Column></Row>*/}
						{/*<Row><Column flexGrow={1}>Author</Column><Column flexGrow={1} horizontal="end"><a href={'mailto:' + ((artboard && artboard.system) ? artboard.system.author : '#')} style={{textDecoration:'none'}}>{(artboard && artboard.system) ? artboard.system.author : 'N/A'}</a></Column></Row>*/}
						{/*<Row><Column flexGrow={1}>Page</Column><Column flexGrow={1} horizontal="end">{(page) ? page.title : 'N/A'}</Column></Row>*/}
						{/*<Row><Column flexGrow={1}>Artboard</Column><Column flexGrow={1} horizontal="end">{(artboard) ? artboard.title : 'N/A'}</Column></Row>*/}
						{/*<Row><Column flexGrow={1}>Name</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.title : 'N/A'} {(slice) ? '(' + slice.type.replace(/(\b\w)/gi, function(m) {return (m.toUpperCase());}) + ')' : ''}</Column></Row>*/}
						<Row><Column flexGrow={1}>Name</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.title : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Type</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.type.replace(/(\b\w)/gi, function(m) {return (m.toUpperCase());}) : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Date</Column><Column flexGrow={1} horizontal="end">{(slice) ? (new Intl.DateTimeFormat('en-US', tsOptions).format(Date.parse(slice.added))) : 'N/A'}</Column></Row>
						<Row>
							<Column flexGrow={1} flexBasis={1}>Export Size</Column>
							<Row flexGrow={1} flexBasis={1}>
								<div style={{width:'50%'}}>W: {(slice) ? slice.meta.frame.size.width : 0}px</div>
								<div style={{width:'50%', textAlign:'right'}}>H: {(slice) ? slice.meta.frame.size.height : 0}px</div>
							</Row>
						</Row>
						<Row>
							<Column flexGrow={1} flexBasis={1}>Position</Column>
							<Row flexGrow={1} flexBasis={1}>
								<div style={{width:'50%'}}>X: {(slice) ? slice.meta.frame.origin.x : 0}px</div>
								<div style={{width:'50%', textAlign:'right'}}>Y: {(slice) ? slice.meta.frame.origin.y : 0}px</div>
							</Row>
						</Row>
						{/*<Row><Column flexGrow={1}>Scale</Column><Column flexGrow={1} horizontal="end">{(this.state.scaleSize + 'x')}</Column></Row>*/}
						<Row><Column flexGrow={1}>Rotation</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.meta.rotation : 0}&deg;</Column></Row>
						<Row><Column flexGrow={1}>Opacity</Column><Column flexGrow={1} horizontal="end">{(slice) ? (slice.meta.opacity * 100) : 100}%</Column></Row>
						<Row><Column flexGrow={1}>Color</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.meta.fillColor.toUpperCase() : 'N/A'}</Column></Row>
						{/*<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end">{(slice && slice.meta.font.family) ? slice.meta.font.family : 'N/A'}</Column></Row>*/}
						<Row><Column flexGrow={1}>Font</Column><Column flexGrow={1} horizontal="end">{(slice && slice.type === 'textfield') ? (artboard.system.title.toLowerCase().includes('ios')) ? 'SFProText' : 'Roboto' : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Font size</Column><Column flexGrow={1} horizontal="end">{(slice && slice.type === 'textfield' && slice.meta.font.size) ? (slice.meta.font.size + 'px') : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Font color</Column><Column flexGrow={1} horizontal="end">{(slice && slice.type === 'textfield' && slice.meta.font.color) ? slice.meta.font.color.toUpperCase() : 'N/A'}</Column></Row>
						<Row><Column flexGrow={1}>Blend</Column><Column flexGrow={1} horizontal="end">{(slice) ? slice.meta.blendMode.toLowerCase().replace(/(\b\w)/gi, function(m) { return m.toUpperCase(); }) : 'N/A'}</Column></Row>
					</div>
				</div>
			</div>
		);
	}
}

export default InspectorPage;
