
import React, { Component } from 'react';
import './UploadTreeItem.css';

import PageTreeItem from './PageTreeItem';

class UploadTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		console.log('UploadTreeItem.render()', this.props);
		const arrowClass = (this.props.selected) ? 'upload-tree-item-arrow upload-tree-item-arrow-selected' : 'upload-tree-item-arrow';
		const textClass = (this.props.selected) ? 'upload-tree-item-text upload-tree-item-text-selected' : 'upload-tree-item-text';

		const pages = this.props.pages.map((page, i)=> {
			return (
				<PageTreeItem
					key={i}
					title={(page.title.length > 45) ? (page.title.substring(0, 44) + '…') : page.title}
					description={page.description}
					artboards={page.artboards}
					selected={page.selected}
					onClick={()=> this.props.onPageClick(page)}
					onArtboardClick={(artboard)=> this.props.onArtboardClick(artboard)} />
			);
		});

		return (
			<div className="upload-tree-item">
				<div className={textClass} onClick={()=> this.props.onClick()}><img className={arrowClass} src={(this.props.selected) ? '/images/chevron-down.svg' : '/images/chevron-right.svg'} alt="chevron" />{this.props.title}</div>
				{(this.props.selected) && (<div className="upload-tree-item-artboards">
					{pages}
				</div>)}
			</div>
		);
	}
}

export default UploadTreeItem;
