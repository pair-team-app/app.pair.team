
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
				email        : '',
				title        : '',
				description  : '',
				colors       : '',
				cornerType   : '1',
				imagery      : ''
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
				console.log(key, value);
			}

		// keywords
		} else if (this.state.step === 1) {

		// tones
		} else if (this.state.step === 2) {

			// colors
		} else if (this.state.step === 3) {
			this.selectedColors = vals;

			// corners
		} else if (this.state.step === 4) {
			let form = this.state.form;
			form.cornerType = vals;
			this.setState({ form : form });

			// imagery
		} else if (this.state.step === 5) {
			this.selectedImagery = vals;
		}

		if (this.state.step < 5) {
			this.setState({
				step : this.state.step + 1,
				form : form
			});

		} else {
			let colors = [];
			this.selectedColors.forEach(color => {
				colors.push(color.id);
			});

			let imagery = [];
			this.selectedImagery.forEach(image => {
				imagery.push(image.id);
			});

			form.colors = colors.join();
			form.imagery = imagery.join();
			this.props.onClick(form);
		}

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
						<ImageryForm templateID={this.props.templateID} onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} onDrop={(files)=> this.onDrop(files)} />
					)}
				</Column>

				{/*<NextButton isEnabled={this.state.isValidated} onClick={()=> this.handleClick()} />*/}
			</div>
		);
	}
}

export default DetailsStep;
