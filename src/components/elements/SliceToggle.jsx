
import React, { Component } from 'react';
import './SliceToggle.css';

class SliceTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selected : true
		};
	}

	componentDidMount() {
	}

	handleClick = ()=> {
		let selected = !this.state.selected;

		this.setState({ selected : selected });
		this.props.onClick(selected);
	};

	render() {
		return (
			<div className="slice-toggle" onClick={()=> this.handleClick()}>
				<img className="slice-toggle-image" src={(this.state.selected) ? '/images/slice-toggle_on.svg' : '/images/slice-toggle_off.svg'} alt="Toggle" />
			</div>
		);
	}
}

export default SliceTreeItem;
