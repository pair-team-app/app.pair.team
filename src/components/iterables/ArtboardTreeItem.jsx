
import React, { Component } from 'react';
import './ArtboardTreeItem.css';

import { Column, Row } from 'simple-flexbox';

class ArtboardTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			title : this.props.title
		};
	}

	componentDidMount() {
	}

	static getDerivedStateFromProps(nextProps) {
		return ({ title : (nextProps.title.length > 25) ? (nextProps.title.substring(0, 24) + '…') : nextProps.title });
	}

	render() {
		const textClass = (this.props.selected) ? 'artboard-tree-item-text page-tree-item-text-selected' : 'artboard-tree-item-text';

		return (
			<div className="artboard-tree-item">
				<div className={textClass} onClick={()=> this.props.onClick()}><Row vertical="center">
					<img className="side-nav-arrow" src="/images/chevron-right.svg" alt="chevron" />
					{this.state.title}
				</Row></div>
			</div>
		);
	}
}

export default ArtboardTreeItem;
