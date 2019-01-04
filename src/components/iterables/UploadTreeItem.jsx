
import React, { Component } from 'react';
import './UploadTreeItem.css';

import { Row } from 'simple-flexbox';

import { limitString } from '../../utils/funcs';
import sketchIcon from '../../images/icon-sketch.png';

const UPLOAD_CHAR_LIMIT = 26;
const PAGE_CHAR_LIMIT = 27;
const ARTBOARD_CHAR_LIMIT = 21;


function ArtboardTreeItem(props) {
	const textClass = (props.selected) ? 'artboard-tree-item-text page-tree-item-text-selected' : 'artboard-tree-item-text';

	return (
		<div className="artboard-tree-item">
			<div className={textClass} onClick={()=> props.onClick()}>{limitString(props.title, ARTBOARD_CHAR_LIMIT)}</div>
		</div>
	);
}

function PageTreeItem(props) {
	const textClass = (props.selected) ? 'page-tree-item-text page-tree-item-text-selected' : 'page-tree-item-text';

	return (
		<div className="page-tree-item">
			<div className={textClass} onClick={()=> props.onClick()}>{limitString(props.title, PAGE_CHAR_LIMIT)}</div>
			{(props.selected) && (<div className="page-tree-item-artboards">
				{props.artboards.map((artboard, i)=> {
					return (
						<ArtboardTreeItem
							key={artboard.id}
							title={artboard.title}
							description=""
							slices={artboard.slices}
							selected={artboard.selected}
							onClick={()=> props.onArtboardClick(artboard)} />
					);
				})}
			</div>)}
		</div>
	);
}

// function SliceTreeItem(props) {
// 	const icon = (props.type === 'slice') ? '/images/layer-slice' : (props.type === 'hotspot') ? '/images/layer-hotspot' : (props.type === 'textfield') ? '/images/layer-textfield' : '/images/layer-background';
// 	const textClass = (props.selected) ? 'slice-tree-item-text slice-tree-item-text-selected' : 'slice-tree-item-text';
// 	const title = limitString(props.title, 17);
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
		};
	}

	static getDerivedStateFromProps(nextProps) {
		return ({ title : limitString(nextProps.title, UPLOAD_CHAR_LIMIT) });
	}

	render() {
		const { selected, pages } = this.props;
		const textClass = (this.props.selected) ? 'upload-tree-item-text upload-tree-item-text-selected' : 'upload-tree-item-text';

		return (
			<div className="upload-tree-item">
				<Row vertical="center">
					<img src={sketchIcon} className="upload-tree-item-icon" alt="Icon" />
					<div className={textClass} onClick={()=> this.props.onClick()}>{this.state.title}</div>
				</Row>
				{(selected) && (<div className="upload-tree-item-pages">
					{pages.map((page, i)=> {
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
					})}
				</div>)}
			</div>
		);
	}
}

export default UploadTreeItem;
