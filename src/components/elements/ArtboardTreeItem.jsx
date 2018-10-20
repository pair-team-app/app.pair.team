
import React, { Component } from 'react';
import './ArtboardTreeItem.css';

import FontAwesome from 'react-fontawesome';

import SliceTreeItem from './SliceTreeItem';

class ArtboardTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		const faClass = (this.props.selected) ? 'artboard-tree-item-arrow page-tree-item-arrow-selected' : 'artboard-tree-item-arrow';
		const textClass = (this.props.selected) ? 'artboard-tree-item-text page-tree-item-text-selected' : 'artboard-tree-item-text';

		const items = (this.props.selected) ? this.props.slices.map((slice, j)=>
			<SliceTreeItem
				key={slice.id}
				title={slice.title}
				description=""
				selected={slice.selected}
				onClick={()=> this.props.onSliceClick(slice.id)} />
		) : [];

		return (
			<div className="artboard-tree-item">
				<div className={textClass} onClick={()=> this.props.onClick()}><FontAwesome name={(this.props.selected) ? 'caret-down' : 'caret-right'} className={faClass} />{this.props.title}</div>
				{items}
			</div>
		);
	}
}

export default ArtboardTreeItem;
