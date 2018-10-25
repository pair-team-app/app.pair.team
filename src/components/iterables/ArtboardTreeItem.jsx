
import React, { Component } from 'react';
import './ArtboardTreeItem.css';

import SliceTreeItem from './SliceTreeItem';

class ArtboardTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			items : {
				slices     : [],
				hotspots   : [],
				textfields : []
			},
		};
	}

	componentDidMount() {
		let slices = [];
		let hotspots = [];
		let textfields = [];

		this.props.slices.forEach(function(item, i ) {
			if (item.type === 'slice') {
				slices.push(item);

			} else if (item.type === 'hotspot') {
				hotspots.push(item);

			} else if (item.type === 'textfield') {
				textfields.push(item);
			}
		});

		this.setState({
			items : {
				slices     : slices,
				hotspots   : hotspots,
				textfields : textfields
			}
		})
	}

	render() {
		const textClass = (this.props.selected) ? 'artboard-tree-item-text page-tree-item-text-selected' : 'artboard-tree-item-text';
		const slices = this.state.items.slices.map((slice, j)=>
			<SliceTreeItem
				key={slice.id}
				title={slice.title}
				description=""
				selected={slice.selected}
				onClick={()=> this.props.onSliceClick(slice.id)} />
		);

		const hotspots = this.state.items.hotspots.map((slice, j)=>
			<SliceTreeItem
				key={slice.id}
				title={slice.title}
				description=""
				selected={slice.selected}
				onClick={()=> this.props.onSliceClick(slice.id)} />
		);

		const textfields = this.state.items.textfields.map((slice, j)=>
			<SliceTreeItem
				key={slice.id}
				title={slice.title}
				description=""
				selected={slice.selected}
				onClick={()=> this.props.onSliceClick(slice.id)} />
		);

		return (
			<div className="artboard-tree-item">
				<div className={textClass} onClick={()=> this.props.onClick()}><img className="artboard-tree-item-arrow" src={(this.props.selected) ? '/images/chevron-down.svg' : '/images/chevron-right.svg'} alt="chevron" />{this.props.title}</div>
				{(this.props.selected) && (<div>
					<div className="artboard-tree-item-slices">
						<img className="artboard-tree-item-arrow" src={(slices.length > 0) ? '/images/chevron-down.svg' : '/images/chevron-right.svg'} alt="chevron" />Slices
					</div>
					{slices}
					<div className="artboard-tree-item-hotspots">
						<img className="artboard-tree-item-arrow" src={(hotspots.length > 0) ? '/images/chevron-down.svg' : '/images/chevron-right.svg'} alt="chevron" />Hotspots
					</div>
					{hotspots}
					<div className="artboard-tree-item-textfields">
						<img className="artboard-tree-item-arrow" src={(textfields.length > 0) ? '/images/chevron-down.svg' : '/images/chevron-right.svg'} alt="chevron" />Textfields
					</div>
					{textfields}
				</div>)}
			</div>
		);
	}
}

export default ArtboardTreeItem;
