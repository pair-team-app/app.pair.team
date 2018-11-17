
import React, { Component } from 'react';
import './UploadTreeItem.css';

import PageTreeItem from './PageTreeItem';

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
		return ({ title : (nextProps.title.length > 32) ? (nextProps.title.substring(0, 31) + '…') : nextProps.title });
	}

	render() {
		const textClass = (this.props.selected) ? 'upload-tree-item-text upload-tree-item-text-selected' : 'upload-tree-item-text';

		const pages = this.props.pages.map((page, i)=> {
			return (
				<PageTreeItem
					key={i}
					title={page.title + ' (' + page.total + ')'}
					description={page.description}
					artboards={page.artboards}
					selected={page.selected}
					onClick={()=> this.props.onPageClick(page)}
					onArtboardClick={(artboard)=> this.props.onArtboardClick(artboard)} />
			);
		});

		return (
			<div className="upload-tree-item">
				<div className={textClass} onClick={()=> this.props.onClick()}>{this.state.title}</div>
				{(this.props.selected) && (<div className="upload-tree-item-artboards">
					{pages}
				</div>)}
			</div>
		);
	}
}

export default UploadTreeItem;
