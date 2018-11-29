
import React, { Component } from 'react';
import './AddOnItem.css';

class AddOnItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<div className="add-on-item" onClick={()=> this.props.onClick(this.props.url)}>
				<img className="add-on-item-image" src={this.props.image} alt={this.props.title} />
				<div className="add-on-item-overlay" />
				<div className="add-on-item-title-wrapper">
					<div className="add-on-item-title">{this.props.title}</div>
				</div>
			</div>
		);
	}
}

export default AddOnItem;
