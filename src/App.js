
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
import { Column } from 'simple-flexbox';

import BottomNav from './components/elements/BottomNav';
import CompletionStep from './components/steps/CompletionStep';
import DetailsStep from './components/steps/DetailsStep';
import FAQStep from './components/steps/FAQStep';
import GeneratingStep from './components/steps/GeneratingStep';
import GetStartedStep from './components/steps/GetStartedStep';
import PurchaseStep from './components/steps/PurchaseStep';
import SplashIntro from './components/elements/SplashIntro';
import TemplateStep from './components/steps/TemplateStep';
import Tooltip from './components/elements/Tooltip';
import TopNav from './components/elements/TopNav';
import UsersStep from "./components/steps/UsersStep";

class App extends Component {
	constructor(props) {
// 		console.log("constructor()");

		super(props);

		this.state = {
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
		  	img : '',
				txt : ''
			},
			comprehend : []
		};

		this.templateID = 0;
		this.images = [];
		this.interval = null;
	}

	componentDidMount() {
		this.showStatus({
			img : '/images/logo_icon.png',
			txt : 'Design Systems loaded.'
		});
	}

	componentWillUnmount() {
	}

	showStatus(tooltip) {
		let self = this;

		this.setState({
			isTooltip : true,
			tooltip : tooltip
		});

		setTimeout(function() {
			self.setState({ isTooltip : false });
		}, 1500);
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
		this.setState({ step : 0 });
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
		window.scrollTo(0, 0);
		this.setState({ step : 3 });
	}

	handleDetailsStep(id) {
		console.log("handleDetailsStep("+id+")");
		this.templateID = id;
		window.scrollTo(0, 0);
		this.setState({ step : 4 });

		this.showStatus({
			img : '/images/logo_icon.png',
			txt : 'Template ['+this.templateID+'] selected.'
		});
	}

	handleStartGenerating(obj) {
		let self = this;
		let formData = new FormData();
		formData.append('action', 'MAKE_ORDER');
		formData.append('template_id', this.templateID);
		formData.append('email', obj.email);
		formData.append('title', obj.title);
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("MAKE_ORDER", JSON.stringify(response.data));
				cookie.save('order_id', response.data.order_id, { path: '/' });

				let keywords = obj.title.split();
				keywords.push('layout');
				obj.keywords.forEach(function(keyword, i) {
					keywords.push(keyword.title);
				});

				axios.get('http://192.241.197.211/aws.php?action=COMPREHEND&phrase=' + encodeURIComponent(keywords.join(' ')))
					.then((response)=> {
						console.log("COMPREHEND", JSON.stringify(response.data));

						self.showStatus({
							'img' : '/images/logo_icon.png',
							'txt' : 'Found ' + response.data.comprehend.keywords.length + ' keyword(s).'
						});

						let colors = [];
						let images = [];
						response.data.comprehend.syntax.forEach(function(item, i) {
							let formData = new FormData();
							formData.append('action', 'ADD_KEYWORD');
							formData.append('order_id', cookie.load('order_id'));
							formData.append('keyword', item.Text);
							axios.post('https://api.designengine.ai/templates.php', formData)
								.then((response)=> {
									console.log("ADD_KEYWORD", JSON.stringify(response.data));
								}).catch((error) => {
							});

							axios.get('http://www.colr.org/json/tag/' + item.Text)
								.then((response)=> {
									console.log("colr", JSON.stringify(response.data));
									self.showStatus({
										'img' : '/images/logo_icon.png',
										'txt' : 'Found ' + response.data.schemes.length + ' color theme(s).'
									});

									response.data.schemes.forEach(function(itm, i) {
										colors.push(itm.colors);

										itm.colors.forEach(function(color, i) {
											let formData = new FormData();
											formData.append('action', 'ADD_COLOR');
											formData.append('order_id', cookie.load('order_id'));
											formData.append('keyword', item.Text);
											formData.append('index', itm.id);
											formData.append('hex', color);
											axios.post('https://api.designengine.ai/templates.php', formData)
												.then((response)=> {
													console.log("ADD_COLOR", JSON.stringify(response.data));
												}).catch((error) => {
											});
										});
									});

									console.log("COLORS", colors);

								}).catch((error) => {
							});

							axios.get('https://api.unsplash.com/search/photos?query='+item.Text+'&per_page=50', {headers:{Authorization:'Bearer 946641fbc410cd54ff5bf32dbd0710dddef148f85f18a7b3907deab3cecb1479'}})
								.then((response)=> {
// 									console.log("UNSPLASH", JSON.stringify(response.data));
									self.showStatus({
										'img' : '/images/logo_icon.png',
										'txt' : 'Located ' + response.data.results.length + ' image(s).'
									});

									response.data.results.forEach(function(itm, i) {
										images.push(itm.urls.small);

										let formData = new FormData();
										formData.append('action', 'ADD_IMAGE');
										formData.append('order_id', cookie.load('order_id'));
										formData.append('keyword', item.Text);
										formData.append('url', itm.urls.small);
										axios.post('https://api.designengine.ai/templates.php', formData)
											.then((response)=> {
												console.log("ADD_IMAGE", JSON.stringify(response.data));
											}).catch((error) => {
										});
									});
									self.images = self.images.concat(images);
									console.log(JSON.stringify(self.images));
								}).catch((error) => {
							});
						});

					}).catch((error) => {
				});

			}).catch((error) => {
		});
	}

	handleGeneratingStep(obj) {
		window.scrollTo(0, 0);
		console.log("handleGeneratingStep("+JSON.stringify(obj)+")");

// 		cookie.save('order_id', "22", { path: '/' });
// 		this.setState({ step : 3 });

		this.showStatus({
			'img' : '/images/logo_icon.png',
			'txt' : 'Submitting order'
		});

		this.setState({ step : 5 });
	}

	handlePurchaseStep(obj) {
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

		this.setState({ pages : pages });

		setTimeout(function() {
			pages.isProjects = false;
			self.setState({ pages : pages })
		}, 1000);
	}

	handleFAQ() {
		console.log("handleFAQ()");
		let self = this;
		let pages = this.state.pages;
		pages.isFAQ = true;

		this.setState({ pages : pages });

		setTimeout(function() {
			pages.isFAQ = false;
			self.setState({ pages : pages })
		}, 1000);
	}

	handleUsers() {
		console.log("handleUsers()");
		let self = this;
		let pages = this.state.pages;
		pages.isUsers = true;

		this.setState({ pages : pages });

		setTimeout(function() {
			pages.isUsers = false;
			self.setState({ pages : pages })
		}, 1000);
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
							    isTooltip={this.state.pages.isFAQ}
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
								    onTooltip={(obj)=> this.showStatus(obj)}
								    onCancel={()=> this.handleTemplateStep()}
								    onStart={(obj)=> this.handleStartGenerating(obj)}
								    onClick={(obj)=> this.handleGeneratingStep(obj)} />
						    )}

						    {this.state.step === 5 && (
							    <GeneratingStep
								    orderID={cookie.load('order_id')}
								    onTooltip={(obj)=> this.showStatus(obj)}
								    onBack={()=> this.handleDetailsStep(this.templateID)}
								    onClick={(obj)=> this.handlePurchaseStep(obj)}
								    onItemToggle={(obj)=> this.handleItemToggle(obj)} />
						    )}

						    {this.state.step === 6 && (
							    <PurchaseStep
								    onClick={()=> this.handleCompletionStep()}
								    onItemToggle={(obj)=> this.handleItemToggle(obj)}
								    selectedItems={this.state.selectedItems} />
						    )}

						    {this.state.step === 7 && (
							    <CompletionStep />
						    )}
					    </div>
				    </Column>
				    <Column flexGrow={1} horizontal="center" className="bottom-nav">
				      <BottomNav
					      onFAQ={()=> this.handleFAQStep()}
					      onStep1={()=> this.handleTemplateStep()}/>
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
