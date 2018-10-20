
import React, { Component } from 'react';
import './PageTreeItem.css';

class PageTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		const faClass = (this.props.selected) ? 'page-tree-item-arrow page-tree-item-arrow-selected' : 'page-tree-item-arrow';
		const textClass = (this.props.selected) ? 'page-tree-item-text page-tree-item-text-selected' : 'page-tree-item-text';

		return (
			<div className="page-tree-item" onClick={()=> this.props.onClick()}>
				<div className={textClass}>{this.props.title}</div>
			</div>
		);
	}
}

export default PageTreeItem;
