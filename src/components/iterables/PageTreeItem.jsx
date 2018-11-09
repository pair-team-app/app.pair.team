
import React, { Component } from 'react';
import './PageTreeItem.css';

import ArtboardTreeItem from './ArtboardTreeItem';

import { Column, Row } from 'simple-flexbox';

class PageTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			title : this.props.title
		};
	}

	componentDidMount() {
	}

	static getDerivedStateFromProps(nextProps) {
		return ({ title : (nextProps.title.length > 27) ? (nextProps.title.substring(0, 26) + '…') : nextProps.title });
	}

	render() {
		const textClass = (this.props.selected) ? 'page-tree-item-text page-tree-item-text-selected' : 'page-tree-item-text';

		const artboards = this.props.artboards.map((artboard, i)=> {
			return (
				<ArtboardTreeItem
					key={artboard.id}
					title={artboard.title}
					description=""
					slices={artboard.slices}
					selected={artboard.selected}
					onClick={()=> this.props.onArtboardClick(artboard)} />
			);
		});

		return (
			<div className="page-tree-item">
				<div className={textClass} onClick={()=> this.props.onClick()}><Row vertical="center">
					<img className="side-nav-arrow" src="/images/chevron-right.svg" alt="chevron" />
					{this.state.title}
				</Row></div>
				{(this.props.selected) && (<div className="page-tree-item-artboards">
					{artboards}
				</div>)}
			</div>
		);
	}
}

export default PageTreeItem;
