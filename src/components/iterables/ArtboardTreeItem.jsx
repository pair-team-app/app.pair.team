
import React, { Component } from 'react';
import './ArtboardTreeItem.css';

class ArtboardTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		const textClass = (this.props.selected) ? 'artboard-tree-item-text page-tree-item-text-selected' : 'artboard-tree-item-text';

		return (
			<div className="artboard-tree-item">
				<div className={textClass} onClick={()=> this.props.onClick()}><img className="artboard-tree-item-arrow" src="/images/chevron-right.svg" alt="chevron" />{this.props.title}</div>
			</div>
		);
	}
}

export default ArtboardTreeItem;
