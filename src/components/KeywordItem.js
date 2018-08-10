
import React, { Component } from 'react';
import './KeywordItem.css';

class KeywordItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSelected : false
		};
	}

	handleClick() {
		const isSelected = !this.state.isSelected;
		this.setState({ isSelected : isSelected });
		this.props.onClick(isSelected);
	}

	render() {
		const className = (this.state.isSelected) ? 'keyword-item keyword-item-selected' : 'keyword-item';

		return (
			<div onClick={()=> this.handleClick()} className={className}>
				<span className="keyword-item-text">{this.props.title}</span>
			</div>
		);
	}
}

export default KeywordItem;
