
import React, { Component } from 'react';
import './CornersForm.css';
import corners from '../../corners';

import { Column, Row } from 'simple-flexbox';

import CornerType from '../CornerType';


class CornersForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			corners : corners
		};
	}

	componentDidMount() {
	}

	handleToggle(id) {
		let corners = this.state.corners;
		corners.forEach(function(item, i) {
			item.isSelected = (id === item.id);
			corners.splice(i, 1, item);
		});

		this.setState({ corners : corners });

		console.log(JSON.stringify(corners));
		this.props.onToggle(id);
	}

	render() {
		let corners = this.state.corners.map((item, i, arr) => {
			return (
				<Column key={i}>
					<CornerType title={item.title} url={item.url} isSelected={item.isSelected} onClick={()=> this.handleToggle(item.id)} />
				</Column>
			);
		});

		return (
			<div style={{textAlign:'left'}}>
				<div className="input-title">Shape</div>
				<div className="step-text" style={{marginBottom:'10px'}}>Select a corner style for your design system.</div>
				<div className="corner-item-wrapper">
					<Row horizontal="center" style={{flexWrap:'wrap'}}>
						{corners}
					</Row>
				</div>
			</div>
		);
	}
}

export default CornersForm;
