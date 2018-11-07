
import React, { Component } from 'react';
import './PageTreeItem.css';

import ArtboardTreeItem from './ArtboardTreeItem';

class PageTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		const arrowClass = (this.props.selected) ? 'page-tree-item-arrow page-tree-item-arrow-selected' : 'page-tree-item-arrow';
		const textClass = (this.props.selected) ? 'page-tree-item-text page-tree-item-text-selected' : 'page-tree-item-text';

		const artboards = this.props.artboards.map((artboard, i)=> {
			return (
				<ArtboardTreeItem
					key={artboard.id}
					title={(artboard.title.length > 45) ? (artboard.title.substring(0, 44) + '…') : artboard.title}
					description=""
					slices={artboard.slices}
					selected={artboard.selected}
					onClick={()=> this.props.onArtboardClick(artboard)} />
			);
		});

		return (
			<div className="page-tree-item">
				<div className={textClass} onClick={()=> this.props.onClick()}><img className={arrowClass} src={(this.props.selected) ? '/images/chevron-down.svg' : '/images/chevron-right.svg'} alt="chevron" />{this.props.title}</div>
				{(this.props.selected) && (<div className="page-tree-item-artboards">
					{artboards}
				</div>)}
			</div>
		);
	}
}

export default PageTreeItem;
