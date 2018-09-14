
import React, { Component } from 'react';
import './DetailsStep.css';

import axios from 'axios';
import cookie from "react-cookies";
import ReactPixel from 'react-facebook-pixel';
import { Column } from 'simple-flexbox';

import ColorsForm from '../forms/ColorsForm';
import CornersForm from '../forms/CornersForm';
import ImageryForm from '../forms/ImageryForm';
import TitleForm from '../forms/TitleForm';
import KeywordsForm from "../forms/KeywordsForm";
import TonesForm from "../forms/TonesForm";


class DetailsStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step   : 0,
			form   : {
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
		this.orderTimeout = null;
		this.orderInterval = null;
	}

	componentDidMount() {
		const advancedMatching = { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
		const options = {
			autoConfig : true, 	// set pixel's autoConfig
			debug      : false, // enable logs
		};
		ReactPixel.init('318191662273348', advancedMatching, options);

		this.handleStepChange({
			email : "FunnelTest1@gmail.com",
			title : "Funnel Test 1"
		})
	}

	componentWillUnmount() {
		clearTimeout(this.orderTimeout);
		clearInterval(this.orderInterval);
	}

	handleStepChange(vals) {
		console.log("handleStepChange()", JSON.stringify(vals));

		let form = this.state.form;

		// title + email
		if (this.state.step === 0) {
			ReactPixel.trackCustom('email-company');
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;
			}

			//if (form.email === 'jason@designengine.ai' || form.email === 'a@gmail.com') {
			if (form.email.length > 0) {
// 				this.props.onStart(form);

				let self = this;
				this.orderInterval = setInterval(function() {
					let formData = new FormData();
					formData.append('action', 'ORDER_PING');
					formData.append('order_id', self.props.orderID);
					axios.post('https://api.designengine.ai/templates.php', formData)
						.then((response)=> {
							console.log("ORDER_PING", JSON.stringify(response.data));
						}).catch((error) => {
					});
				}, 5000);

				this.props.onTooltip({
					txt : 'Loading Artboards into AI.'
				});

				setTimeout(function() {
					self.props.onTooltip({ txt : 'Design Engine is ready.' });
				}, 2000);

			} else {
				window.alert("Design Engine is invite only at the moment.");
			}

		// keywords
		} else if (this.state.step === 1) {
			ReactPixel.trackCustom('design-type');
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;

				value.forEach(function(item, i) {
					let formData = new FormData();
					formData.append('action', 'ADD_KEYWORD');
					formData.append('order_id', cookie.load('order_id'));
					formData.append('keyword', item.title);
					axios.post('https://api.designengine.ai/templates.php', formData)
						.then((response)=> {
							console.log("ADD_KEYWORD", JSON.stringify(response.data));
						}).catch((error) => {
					});
				});
			}

		// tones
		} else if (this.state.step === 2) {
			ReactPixel.trackCustom('tones');
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;

				value.forEach(function(item, i) {
					let formData = new FormData();
					formData.append('action', 'ADD_TONE');
					formData.append('order_id', cookie.load('order_id'));
					formData.append('tone', item.title);
					axios.post('https://api.designengine.ai/templates.php', formData)
						.then((response) => {
							console.log("ADD_TONE", JSON.stringify(response.data));
						}).catch((error) => {
					});
				});
			}

			// colors
		} else if (this.state.step === 3) {
			ReactPixel.trackCustom('colors');
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;

				value.forEach(function(item, i) {
					let formData = new FormData();
					formData.append('action', 'ADD_COLOR');
					formData.append('order_id', cookie.load('order_id'));
					formData.append('keyword', item.title);
					formData.append('index', "0");
					formData.append('gradient', item.gradient);
					formData.append('hex', item.hex);
					axios.post('https://api.designengine.ai/templates.php', formData)
						.then((response) => {
							console.log("ADD_COLOR", JSON.stringify(response.data));
						}).catch((error) => {
					});
				});
			}

			// corners
		} else if (this.state.step === 4) {
			ReactPixel.trackCustom('corners');
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;

				value.forEach(function(item, i) {
					let formData = new FormData();
					formData.append('action', 'ADD_CORNER');
					formData.append('order_id', cookie.load('order_id'));
					formData.append('name', item.title);
					formData.append('radius', item.amount);
					axios.post('https://api.designengine.ai/templates.php', formData)
						.then((response) => {
							console.log("ADD_CORNER", JSON.stringify(response.data));
						}).catch((error) => {
					});
				});
			}

			// imagery
		} else if (this.state.step === 5) {
			ReactPixel.trackCustom('imagery');
			for (let [key, value] of Object.entries(vals)) {
				form[key] = value;

				value.forEach(function(item, i) {
					let formData = new FormData();
					formData.append('action', 'ADD_IMAGE');
					formData.append('order_id', cookie.load('order_id'));
					formData.append('keyword', item.title);
					formData.append('url', item.url);
					axios.post('https://api.designengine.ai/templates.php', formData)
						.then((response) => {
							console.log("ADD_IMAGE", JSON.stringify(response.data));
						}).catch((error) => {
					});
				});
			}
			this.setState({ form : form });
		}

		if (this.state.step > 0 && this.state.step < 4) {
			this.props.onTooltip({
				txt : 'Design Engine is ready.'
			});
		}

		if (this.state.step === 0) {
// 			if (form.email === 'jason@designengine.ai' || form.email === 'a@gmail.com') {
			if (form.email.length > 0) {
				this.setState({
					step : 1,
					form : form
				});
			}

		} else if (this.state.step < 4) {
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
						<KeywordsForm onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} onTooltip={(obj)=> this.props.onTooltip(obj)} />
					)}

					{this.state.step === 2 && (
						<TonesForm onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} onTooltip={(obj)=> this.props.onTooltip(obj)} />
					)}

					{this.state.step === 3 && (
						<ColorsForm templateID={this.props.templateID} onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} onTooltip={(obj)=> this.props.onTooltip(obj)} />
					)}

					{this.state.step === 4 && (
						<CornersForm onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} onTooltip={(obj)=> this.props.onTooltip(obj)} />
					)}

					{this.state.step === 5 && (
						<ImageryForm templateID={this.props.templateID} onBack={()=> this.handleBack()} onNext={(vals)=> this.handleStepChange(vals)} onTooltip={(obj)=> this.props.onTooltip(obj)} />
					)}
				</Column>
			</div>
		);
	}
}

export default DetailsStep;
