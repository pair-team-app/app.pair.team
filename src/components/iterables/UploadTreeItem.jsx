
import React, { Component } from 'react';
import './UploadTreeItem.css';

import { Row } from 'simple-flexbox';

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
					<img src="/images/icon-sketch.png" className="upload-tree-item-icon" alt="Icon" />
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
