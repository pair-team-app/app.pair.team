
import React, { Component } from 'react';
import './SliceTreeItem.css'

class SliceTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		const icon = (this.props.type === 'slice') ? '/images/layer-slice' : (this.props.type === 'hotspot') ? '/images/layer-hotspot' : (this.props.type === 'textfield') ? '/images/layer-textfield' : '/images/layer-background';
		const textClass = (this.props.selected) ? 'slice-tree-item-text slice-tree-item-text-selected' : 'slice-tree-item-text';

		return (
			<div className="slice-tree-item" onClick={()=> this.props.onClick()}>
				<div className={textClass}><img className="slice-tree-item-icon" src={(this.props.selected) ? icon + '_selected.svg' : icon + '.svg'} alt='icon' />{this.props.title}</div>
			</div>
		);
	}
}

export default SliceTreeItem;
