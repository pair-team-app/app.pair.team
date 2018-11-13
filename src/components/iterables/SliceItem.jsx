
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
		const className = (this.props.type === 'slice') ? 'slice-item slice-item-slice' : (this.props.type === 'hotspot') ? 'slice-item slice-item-hotspot' : (this.props.type === 'textfield') ? 'slice-item slice-item-textfield' : 'slice-item slice-item-background';
		const style = {
			top     : this.props.top + 'px',
			left    : this.props.left + 'px',
			width   : this.props.width + 'px',
			height  : this.props.height + 'px',
			zoom    : this.props.scale,
			display : (this.props.visible) ? 'block' : 'none'
		};

		return (
			<div className={className} style={style} onMouseEnter={()=> this.props.onRollOver()} onMouseLeave={()=> this.props.onRollOut()} onClick={()=> this.props.onClick()}>
				<FontAwesome name="plus-circle" className="slice-item-plus" />
			</div>
		);
	}
}

export default SliceItem;
