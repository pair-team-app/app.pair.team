
// todo: select all button
// todo: comprehend details to checkout

/*
http://www.pictaculous.com/api/
http://colormind.io/
http://www.colr.org/api.html
https://coolors.co/
http://www.thecolorapi.com/
 */

import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import cookie from 'react-cookies';
// import { geolocated } from 'react-geolocated';
import ReactPixel from 'react-facebook-pixel';
import { Column } from 'simple-flexbox';

import BottomNav from './components/elements/BottomNav';
import CompletionStep from './components/steps/CompletionStep';
import DetailsStep from './components/steps/DetailsStep';
import FAQStep from './components/steps/FAQStep';
import GeneratingStep from './components/steps/GeneratingStep';
import GetStartedStep from './components/steps/GetStartedStep';
import PrivacyStep from './components/steps/PrivacyStep';
import PurchaseStep from './components/steps/PurchaseStep';
import SplashIntro from './components/elements/SplashIntro';
import TemplateStep from './components/steps/TemplateStep';
import TermsStep from './components/steps/TermsStep';
import Tooltip from './components/elements/Tooltip';
import TopNav from './components/elements/TopNav';
import UsersStep from "./components/steps/UsersStep";

class App extends Component {
	constructor(props) {
// 		console.log("constructor()");

		super(props);

		this.state = {
			orderID : 0,
		  step : 0,
			pages : {
				isIntro : false,
				isProjects : false,
				isFAQ : false,
				isUsers : false
			},
			isTooltip : false,
			amount : 0.00,
			selectedItems : null,
			purchasedItems : null,
			tooltip: {
		  	isAnimated : true,
				txt        : ''
			},
			comprehend : []
		};

		this.templateID = 0;
		this.images = [];
		this.interval = null;
	}

	componentDidMount() {
		const advancedMatching = { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
		const options = {
			autoConfig : true, 	// set pixel's autoConfig
			debug      : false, // enable logs
		};
		ReactPixel.init('318191662273348', advancedMatching, options);
		ReactPixel.trackCustom('load');
	}

	componentWillUnmount() {
	}

	showStatus(tooltip) {
		//let self = this;

		this.setState({
			isTooltip : true,
			tooltip : tooltip
		});
	}

	handleIntroComplete() {
		console.log("handleIntroComplete()");
		let pages = this.state.pages;
		pages.isIntro = false;
		this.setState({ pages : pages });
	}

	handleGettingStartedStep() {
		console.log("handleGettingStartedStep()");
		window.scrollTo(0, 0);

		this.setState({
			step      : 0,
			isTooltip : false
		});
	}

  handleFAQStep() {
    console.log("handleFAQStep()");
	  window.scrollTo(0, 0);
    this.setState({ step : 1 });
  }

	handleUsersStep() {
		console.log("handleUsersStep()");

		window.scrollTo(0, 0);
		this.setState({ step : 2 });
	}

	handleTemplateStep() {
		console.log("handleTemplateStep()");
		ReactPixel.trackCustom('get-started');

		window.scrollTo(0, 0);
// 		this.setState({ step : 3 });
		this.setState({ step : 4 });

		this.showStatus({
			isAnimated : true,
			txt        : 'Design Engine is ready.'
		});
	}

	handleDetailsStep(id) {
		console.log("handleDetailsStep("+id+")");
		ReactPixel.trackCustom('pick-template');

		this.templateID = id;
		window.scrollTo(0, 0);

		this.setState({ step : 4 });
	}

	handleStartGenerating(obj) {
		console.log("handleStartGenerating()", obj);

		let self = this;
		let formData = new FormData();
		this.templateID = obj.templateID;

		formData.append('action', 'MAKE_ORDER');
		formData.append('template_id', this.templateID);
		formData.append('email', obj.email);
		formData.append('title', obj.title);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("MAKE_ORDER", JSON.stringify(response.data));
				cookie.save('order_id', response.data.order_id, { path: '/' });
				self.setState({ orderID : response.data.order_id });
			}).catch((error) => {
		});
	}

	handleGeneratingStep(obj) {
		ReactPixel.trackCustom('generating');

		window.scrollTo(0, 0);
		console.log("handleGeneratingStep("+JSON.stringify(obj)+")");
		this.setState({ step : 5 });

		this.showStatus({
			isAnimated : true,
			txt        : 'Rendering dataset into Design Engine AI.'
		});
	}

	handlePurchaseStep(obj) {
		ReactPixel.trackCustom('checkout');

		this.showStatus({
			txt : 'Design Engine has stopped.'
		});

		console.log("handlePurchaseStep("+JSON.stringify(obj)+")");
		window.scrollTo(0, 0);
		this.setState({
			step : 6,
			selectedItems : obj
		});
	}

	handleCompletionStep() {
		console.log("handleCompletionStep()");
		window.scrollTo(0, 0);
		this.setState({ step : 7 });
	}

	handleProjects() {
		console.log("handleProjects()");
		let self = this;
		let pages = this.state.pages;
		pages.isProjects = true;

		this.setState({
			step : 0,
			pages : pages
		});

		setTimeout(function() {
			pages.isProjects = false;
			self.setState({ pages : pages })
		}, 1000);
	}

	handleFAQ() {
		console.log("handleFAQ()");
		window.scrollTo(0, 0);

		let pages = this.state.pages;
		pages.isFAQ = true;

		this.setState({
			step : 0,
			pages : pages
		});
	}

	handleUsers() {
		console.log("handleUsers()");
		window.scrollTo(0, 0);

		let pages = this.state.pages;
		pages.isUsers = true;

		this.setState({
			step : 0,
			pages : pages
		});
	}

	handlePrivacy() {
		console.log("handlePrivacy()");
		window.scrollTo(0, 0);
		this.setState({ step : 8 });
	}

	handleTerms() {
		console.log("handleTerms()");
		window.scrollTo(0, 0);
		this.setState({ step : 9 });
	}

	handleNext() {
		console.log("handleNext()");
		window.scrollTo(0, 0);
		this.setState({
			step : this.state.step + 1
		});
	}

	handleItemToggle(obj) {
		console.log("handleItemToggle("+JSON.stringify(obj)+")");

		let amount = 0.00;
		obj.forEach(function(item, i) {
			amount += parseFloat(item.per_price);
		});

		this.setState({
			amount : amount
		});
	}

	handlePurchaseToggle(obj, isPurchase) {
		console.log("handlePurchaseToggle("+JSON.stringify(obj)+", "+isPurchase+")");

		let amount = 0.00;
		obj.forEach(function(item, i) {
			amount += item.per_price;
		});

		this.setState({
			amount : amount,
			purchasedItems : obj
		});
	}

  render() {
// 		console.log("coords", JSON.stringify(this.props.coords));
    return (
    	<div>
		    {this.state.isIntro && (
		    	<SplashIntro onComplete={()=> this.handleIntroComplete()}/>
		    )}


		    {!this.state.isIntro && (
		    	<div>
				    <Column horizontal="center" className="page-wrapper">
					    <div className="top-nav">
						    <TopNav
							    step={this.state.step}
							    amount={this.state.amount}
							    isProjects={this.state.pages.isProjects}
							    isFAQ={this.state.pages.isFAQ}
							    isUsers={this.state.pages.isUsers}
							    onStep0={()=> this.handleGettingStartedStep()}
							    onStep1={()=> this.handleTemplateStep()}
							    onProjects={()=> this.handleProjects()}
							    onFAQ={()=> this.handleFAQStep()}
							    onUsers={()=> this.handleUsersStep()}
						    />
					    </div>

					    <div className="content-wrapper">
						    {this.state.step === 0 && (
							    <GetStartedStep
								    isProjects={this.state.pages.isProjects}
								    isUsers={this.state.pages.isUsers}
								    onClick={()=> this.handleTemplateStep()} />
						    )}

						    {this.state.step === 1 && (
							    <FAQStep onClick={()=> this.handleTemplateStep()} />
						    )}

						    {this.state.step === 2 && (
							    <UsersStep onClick={()=> this.handleTemplateStep()} />
						    )}

						    {this.state.step === 3 && (
							    <TemplateStep
								    onClick={(id)=> this.handleDetailsStep(id)} />
						    )}

						    {this.state.step === 4 && (
							    <DetailsStep
								    templateID={this.templateID}
								    orderID={this.state.orderID}
								    onTooltip={(obj)=> this.showStatus(obj)}
								    onCancel={()=> this.handleGettingStartedStep()}
								    onStart={(obj)=> this.handleStartGenerating(obj)}
								    onClick={(obj)=> this.handleGeneratingStep(obj)} />
						    )}

						    {this.state.step === 5 && (
							    <GeneratingStep
								    orderID={this.state.orderID}
								    onTooltip={(obj)=> this.showStatus(obj)}
								    onCancel={()=> this.handleGettingStartedStep()}
								    onClick={(obj)=> this.handlePurchaseStep(obj)}
								    onItemToggle={(obj)=> this.handleItemToggle(obj)} />
						    )}

						    {this.state.step === 6 && (
							    <PurchaseStep
								    onTooltip={(obj)=> this.showStatus(obj)}
								    onClick={()=> this.handleCompletionStep()}
								    onItemToggle={(obj)=> this.handleItemToggle(obj)}
								    selectedItems={this.state.selectedItems}
								    onBack={(obj)=> this.handleGeneratingStep(obj)}
							    />
						    )}

						    {this.state.step === 7 && (
							    <CompletionStep />
						    )}

						    {this.state.step === 8 && (
							    <PrivacyStep />
						    )}

						    {this.state.step === 9 && (
							    <TermsStep />
						    )}
					    </div>
				    </Column>
				    <Column flexGrow={1} horizontal="center" className="bottom-nav">
				      <BottomNav
					      onProjects={()=> this.handleProjects()}
					      onFAQ={()=> this.handleFAQStep()}
					      onStep1={()=> this.handleTemplateStep()}
					      onPrivacy={()=> this.handlePrivacy()}
					      onTerms={()=> this.handleTerms()} />
				    </Column>

				    {this.state.isTooltip && (
				    	<Tooltip content={this.state.tooltip} />
				    )}
			    </div>
		    )}
	    </div>
    );
  }
}

export default App;
// export default geolocated({
// 	positionOptions: {
// 		enableHighAccuracy : false,
// 	},
// 	userDecisionTimeout : 5000,
// })(App);
