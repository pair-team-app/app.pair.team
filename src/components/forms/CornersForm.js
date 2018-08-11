
import React, { Component } from 'react';
import './CornersForm.css';
import corners from '../../corners.json';

import { Column, Row } from 'simple-flexbox';

import CornerType from '../CornerType';


class CornersForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form: {
				corners : []
			}
		};

		this.selectedCorners = [];
	}

	componentDidMount() {
	}

	handleToggle(id, isSelected) {
		let self = this;

		if (isSelected) {
			if (this.selectedCorners.length < 3) {
				corners.forEach(function (item, i) {
					if (item.id === id) {

						let isFound = false;
						self.selectedCorners.forEach(function (itm, j) {
							if (itm.id === id) {
								isFound = true;
							}
						});

						if (!isFound) {
							self.selectedCorners.push(item);
						}
					}
				});
			}

		} else {
			this.selectedCorners.forEach(function(item, i) {
				if (item.id === id) {
					self.selectedCorners.splice(i, 1);
				}
			});
		}

		this.setState({ isValidated : (this.selectedCorners.length > 0) })
	}

	handleClick() {
		if (this.state.isValidated) {
			let form = this.state.form;
			form.corners = this.selectedCorners;
			this.setState({ form : form });
			this.props.onNext(this.state.form);
		}
	}

	render() {
		let items = corners.map((item, i, arr) => {
			return (
				<Column key={i}>
					<CornerType title={item.title} url={item.url} isSelected={item.isSelected} onClick={(isSelected)=> this.handleToggle(item.id, isSelected)} />
				</Column>
			);
		});

		const btnClass = (this.state.isValidated) ? 'action-button step-button' : 'action-button step-button disabled-button';

		return (
			<div style={{width:'100%'}} className="debug-border">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Step 5</div>
						<div className="step-text">What type of corners do you want?</div>
					</Column>
				</Row>
				<button className="action-button step-button" onClick={()=> this.props.onBack()}>Back</button>
				<button className={btnClass} onClick={()=> this.handleClick()}>Next Step</button>
				<Row horizontal="space-around" style={{flexWrap:'wrap'}}>
					{items}
				</Row>
			</div>
		);
	}
}

export default CornersForm;
