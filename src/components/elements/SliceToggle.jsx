
import React, { Component } from 'react';
import './SliceToggle.css';

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

		return (
			<div className="slice-toggle" onClick={()=> this.props.onClick()}>
				<button className="inspector-page-float-button"><img className="inspector-page-float-button-image" src={(this.props.selected) ? icon + '_selected.svg' : icon + '.svg'} alt="Toggle" /></button>
			</div>
		);
	}
}

export default SliceTreeItem;
