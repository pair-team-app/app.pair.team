
import React, { Component } from 'react';
import './UploadTreeItem.css';
import './PageTreeItem.css';
import './ArtboardTreeItem.css';
import './SliceTreeItem.css';

import { Row } from 'simple-flexbox';

import sketchIcon from '../../images/icon-sketch.png';

function ArtboardTreeItem(props) {
	const textClass = (props.selected) ? 'artboard-tree-item-text page-tree-item-text-selected' : 'artboard-tree-item-text';
	const title = (props.title.length > 24) ? (props.title.substring(0, 23) + '…') : props.title;

	return (
		<div className="artboard-tree-item">
			<div className={textClass} onClick={()=> props.onClick()}>{title}</div>
		</div>
	);
}

function PageTreeItem(props) {
	const textClass = (props.selected) ? 'page-tree-item-text page-tree-item-text-selected' : 'page-tree-item-text';
	const title = (props.title.length > 27) ? (props.title.substring(0, 26) + '…') : props.title;

	const artboards = props.artboards.map((artboard, i)=> {
		return (
			<ArtboardTreeItem
				key={artboard.id}
				title={artboard.title}
				description=""
				slices={artboard.slices}
				selected={artboard.selected}
				onClick={()=> props.onArtboardClick(artboard)} />
		);
	});

	return (
		<div className="page-tree-item">
			<div className={textClass} onClick={()=> props.onClick()}>{title}</div>
			{(props.selected) && (<div className="page-tree-item-artboards">
				{artboards}
			</div>)}
		</div>
	);
}

// function SliceTreeItem(props) {
// 	const icon = (props.type === 'slice') ? '/images/layer-slice' : (props.type === 'hotspot') ? '/images/layer-hotspot' : (props.type === 'textfield') ? '/images/layer-textfield' : '/images/layer-background';
// 	const textClass = (props.selected) ? 'slice-tree-item-text slice-tree-item-text-selected' : 'slice-tree-item-text';
// 	const title = (props.title.length > 24) ? (props.title.substring(0, 23) + '…') : props.title;
//
// 	return (
// 		<div className="slice-tree-item" onClick={()=> props.onClick()}>
// 			<div className={textClass}><img className="slice-tree-item-icon" src={(props.selected) ? icon + '_selected.svg' : icon + '.svg'} alt='icon' />{title}</div>
// 		</div>
// 	);
// }


class UploadTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			title : this.props.title
		};
	}

	componentDidMount() {
	}

	static getDerivedStateFromProps(nextProps) {
		return ({ title : (nextProps.title.length > 26) ? (nextProps.title.substring(0, 25) + '…') : nextProps.title });
	}

	render() {
		const textClass = (this.props.selected) ? 'upload-tree-item-text upload-tree-item-text-selected' : 'upload-tree-item-text';

		const pages = this.props.pages.map((page, i)=> {
			return (
				<PageTreeItem
					key={i}
					title={page.title}
					description={page.description}
					artboards={page.artboards}
					selected={page.selected}
					onClick={()=> this.props.onPageClick(page)}
					onArtboardClick={(artboard)=> this.props.onArtboardClick(artboard)} />
			);
		});

		return (
			<div className="upload-tree-item">
				<Row vertical="center">
					<img src={sketchIcon} className="upload-tree-item-icon" alt="Icon" />
					<div className={textClass} onClick={()=> this.props.onClick()}>{this.state.title}</div>
				</Row>
				{(this.props.selected) && (<div className="upload-tree-item-artboards">
					{pages}
				</div>)}
			</div>
		);
	}
}

export default UploadTreeItem;
