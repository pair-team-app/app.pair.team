
import React, { Component } from 'react';
import './Tooltip.css'

import { Column, Row } from 'simple-flexbox';

class Tooltip extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isFade : false
		};
	}

	componentDidMount() {
		let self = this;
		setTimeout(function() {
			self.setState({ isFade : true });

			setTimeout(function() {
				self.setState({ isFade : false });
			}, 500);
		}, 1500);
	}

	render() {
		const className = (this.state.isFade) ? 'tooltip-wrapper tooltip-fade' : 'tooltip-wrapper';

		return (
			<Row className={className}>
				<Column><img src={this.props.content.img} className="tooltip-icon" alt={this.props.content.txt} /></Column>
				<Column className="tooltip-content">
					<Row vertical="center" style={{height:'30px'}}>{this.props.content.txt}</Row>
				</Column>
			</Row>
		);
	}
}

export default Tooltip;
