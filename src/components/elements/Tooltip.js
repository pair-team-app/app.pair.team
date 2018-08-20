
import React, { Component } from 'react';
import './Tooltip.css'

import { Column, Row } from 'simple-flexbox';

class Tooltip extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isFade : false
		};

		this.interval = null
	}

	componentDidMount() {
		let self = this;
		this.interval = setTimeout(function() {
			self.setState({ isFade : true });
		}, 1500);
	}

	componentWillUnmount() {
		clearTimeout(this.interval);
	}

	render() {
		const className = (this.state.isFade) ? 'tooltip-wrapper tooltip-fade' : 'tooltip-wrapper';

		return (
			<Row className={className}>
				<Column vertical="center"><div className="tooltip-icon">{this.props.content.ico}</div></Column>
				<Column className="tooltip-content">
					<Row vertical="center">{this.props.content.txt}</Row>
				</Column>
			</Row>
		);
	}
}

export default Tooltip;
