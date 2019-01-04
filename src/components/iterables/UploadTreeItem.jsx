
import React, { Component } from 'react';
import './UploadTreeItem.css';

import { Row } from 'simple-flexbox';

import sketchIcon from '../../images/icon-sketch.png';
import { limitString } from '../../utils/funcs';

function ArtboardTreeItem(props) {
	const textClass = (props.selected) ? 'artboard-tree-item-text page-tree-item-text-selected' : 'artboard-tree-item-text';
	const title = limitString(props.title, 24);

	return (
		<div className="artboard-tree-item">
			<div className={textClass} onClick={()=> props.onClick()}>{title}</div>
		</div>
	);
}

function PageTreeItem(props) {
	const textClass = (props.selected) ? 'page-tree-item-text page-tree-item-text-selected' : 'page-tree-item-text';
	const title = limitString(props.title, 27);

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
// 	const title = limitString(props.title, 24);
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
		return ({ title : limitString(nextProps.title, 26) });
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
