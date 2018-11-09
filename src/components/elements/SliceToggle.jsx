
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
		const className = (this.props.last) ? 'slice-toggle slice-toggle-last' : 'slice-toggle';
		const icon = (this.props.type === 'slice') ? '/images/layer-slice' : (this.props.type === 'hotspot') ? '/images/layer-hotspot' : (this.props.type === 'textfield') ? '/images/layer-textfield' : '/images/layer-background';

		return (
			<div className={className} onClick={()=> this.props.onClick()}>
				<img className="slice-toggle-image" src={(this.props.selected) ? icon + '_selected.svg' : icon + '.svg'} alt="Toggle" />
			</div>
		);
	}
}

export default SliceTreeItem;
