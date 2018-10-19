
import React, { Component } from 'react';
import './SliceItem.css'

import FontAwesome from 'react-fontawesome';

class SliceItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		const style = {
			top    : this.props.top + 'px',
			left   : this.props.left + 'px',
			width  : this.props.width + 'px',
			height : this.props.height + 'px',
			zoom   : this.props.scale
		};

		return (
			<div className="slice-item" style={style} onClick={()=> this.props.onClick()}>
				<FontAwesome name="plus-circle" className="slice-item-plus" />
			</div>
		);
	}
}

export default SliceItem;
