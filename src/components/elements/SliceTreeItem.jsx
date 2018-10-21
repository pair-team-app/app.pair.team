
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
		const textClass = (this.props.selected) ? 'slice-tree-item-text slice-tree-item-text-selected' : 'slice-tree-item-text';

		return (
			<div className="slice-tree-item" onClick={()=> this.props.onClick()}>
				<div className={textClass}>{this.props.title}</div>
			</div>
		);
	}
}

export default SliceTreeItem;
