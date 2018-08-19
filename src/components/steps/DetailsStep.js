
import React, { Component } from 'react';
import './DetailsStep.css';

import { Column } from 'simple-flexbox';

import ColorsForm from '../forms/ColorsForm';
import CornersForm from '../forms/CornersForm';
import ImageryForm from '../forms/ImageryForm';
// import NextButton from './../elements/NextButton';
import TitleForm from '../forms/TitleForm';
import KeywordsForm from "../forms/KeywordsForm";
import TonesForm from "../forms/TonesForm";


class DetailsStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step : 0,
			form : {
				email    : '',
				title    : '',
				keywords : [],
				tones    : [],
				colors   : [],
				corners  : [],
				imagery  : []
			}
		};

		this.selectedColors = [];
		this.selectedImagery = [];
	}

	handleStepChange(vals) {
		console.log("handleStepChange()", JSON.stringify(vals));

		let form = this.state.form;

		// title + email
		if (this.state.step === 0) {
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;
			}

			this.props.onStart(form);

		// keywords
		} else if (this.state.step === 1) {
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;
			}

		// tones
		} else if (this.state.step === 2) {
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;
			}

			// colors
		} else if (this.state.step === 3) {
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;
			}

			// corners
		} else if (this.state.step === 4) {
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;
			}

			// imagery
		} else if (this.state.step === 5) {
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;
			}
			this.setState({ form : form });
		}

		if (this.state.step < 5) {
			this.setState({
				step : this.state.step + 1,
				form : form
			});

		} else {
			this.props.onClick(form);
		}

		console.log('form', form)

		//this.setState({ [event.target.name] : event.target.value });
	}

	handleBack() {
		this.setState({ step : this.state.step - 1 })
	}

	render() {
// 		const buttonClass = (this.state.isValidated) ? 'action-button full-button' : 'action-button full-button disabled-button';

		return (
			<div>
				<Column flexGrow={1} horizontal="start">
					{this.state.step === 0 && (
						<TitleForm
							onTooltip={(obj)=> this.props.onTooltip(obj)}
							onBack={()=> this.props.onCancel()}
							onNext={(vals)=> this.handleStepChange(vals)} />
					)}

					{this.state.step === 1 && (
						<KeywordsForm onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} />
					)}

					{this.state.step === 2 && (
						<TonesForm onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} />
					)}

					{this.state.step === 3 && (
						<ColorsForm templateID={this.props.templateID} onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} />
					)}

					{this.state.step === 4 && (
						<CornersForm onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} />
					)}

					{this.state.step === 5 && (
						<ImageryForm templateID={this.props.templateID} onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} />
					)}
				</Column>

				{/*<NextButton isEnabled={this.state.isValidated} onClick={()=> this.handleClick()} />*/}
			</div>
		);
	}
}

export default DetailsStep;
