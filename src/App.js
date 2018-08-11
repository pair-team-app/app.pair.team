
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
import { geolocated } from 'react-geolocated';
import { Column } from 'simple-flexbox';

import BottomNav from './components/elements/BottomNav';
import CompletionStep from './components/steps/CompletionStep';
import DetailsStep from './components/steps/DetailsStep';
import GeneratingStep from './components/steps/GeneratingStep';
import GetStartedStep from './components/steps/GetStartedStep';
import Tooltip from './components/elements/Tooltip';
import PurchaseStep from './components/steps/PurchaseStep';
import SplashIntro from './components/elements/SplashIntro';
import TemplateStep from './components/steps/TemplateStep';
import TopNav from './components/elements/TopNav';

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
// 		let self = this;
// 		setInterval(function() {
// 			self.statusCheck();
// 		}, 2000);
// 		this.statusCheck();

		this.showStatus({
			img : '/images/logo_icon.png',
			txt : 'Design Systems loaded.'
		})
	}

	showStatus(tooltip) {
		let self = this;

		this.setState({
			isTooltip : true,
			tooltip : tooltip
		});

		setTimeout(function() {
			self.setState({ isTooltip : false });
		}, 2000);
	}

	statusCheck() {
		let self = this;
		let formData = new FormData();
		formData.append('action', 'STATUS_CHECK');
		formData.append('order_id', cookie.load('order_id'));
		axios.post('https://api.designengine.ai/templates.php', formData)
			.then((response)=> {
				console.log("STATUS_CHECK", JSON.stringify(response.data));
				self.showStatus({
					img : '/images/logo_icon.png',
					txt : response.data.status
				});

			}).catch((error) => {
		});
	}

	handleIntroComplete() {
		console.log("handleIntroComplete()");
		let pages = this.state.pages;
		pages.isIntro = false;
		this.setState({ pages : pages });
	}

	handleStep0() {
		console.log("handleStep0()");
		window.scrollTo(0, 0);
		this.setState({ step : 0 });
	}

  handleStep1() {
    console.log("handleStep1()");
	  window.scrollTo(0, 0);
    this.setState({ step : 1 });
  }

	handleStep2(id) {
		console.log("handleStep2("+id+")");
		this.templateID = id;
		window.scrollTo(0, 0);
		this.setState({ step : 2 });

		this.showStatus({
			img : '/images/logo_icon.png',
			txt : 'Template ['+this.templateID+'] selected.'
		});
	}

	handleStep3(obj) {
		window.scrollTo(0, 0);

		let colorCount = (obj.colors.match(/\d+/g) || []).length;
		if (3 - colorCount > 0) {
			for (let i=0; i<3-colorCount; i++) {
				obj.colors += (((i === 0 && colorCount === 0) ? '' : ',') + (3-i));
			}
		}

		console.log("handleStep3("+JSON.stringify(obj)+")");

		let self = this;
// 		let formData = new FormData();
// 		formData.append('action', 'MAKE_ORDER');
// 		formData.append('template_id', this.templateID);
// 		formData.append('email', obj.email);
// 		formData.append('title', obj.company);
// 		formData.append('description', obj.description);
// 		formData.append('colors', obj.colors);
// 		formData.append('corner_type', obj.cornerType);
// 		formData.append('imagery', obj.imagery);
// 		axios.post('https://api.designengine.ai/templates.php', formData)
// 			.then((response)=> {
// 				console.log("MAKE_ORDER", JSON.stringify(response.data));
// 				cookie.save('order_id', response.data.order_id, { path: '/' });
// 			}).catch((error) => {
// 		});

		axios.get('http://192.241.197.211/aws.php?action=COMPREHEND&phrase=' + encodeURIComponent(obj.description))
			.then((response)=> {
				console.log("COMPREHEND", JSON.stringify(response.data));
// 				self.setState({ tooltip: [
// 					"Keywords & entities ("+(response.data.comprehend.keywords.length+response.data.comprehend.entities.length)+")…",
// 					"Sentiment rating ("+(response.data.comprehend.sentiment.outcome)+")…",
// 					"Grammar items ("+response.data.comprehend.syntax.length+")…"
// 				] });

				let colors = [];
				let images = [];
				response.data.comprehend.keywords.forEach(function(item, i) {
					axios.get('http://www.colr.org/json/tag/' + item.Text)
						.then((response)=> {
							console.log("colr", JSON.stringify(response.data));
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
// 							console.log("UNSPLASH", JSON.stringify(response.data));
							response.data.results.forEach(function(itm, i) {
								images.push(itm.urls.full);

								let formData = new FormData();
								formData.append('action', 'ADD_IMAGE');
								formData.append('order_id', cookie.load('order_id'));
								formData.append('keyword', item.Text);
								formData.append('url', itm.urls.full);
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

		this.setState({ step : 3 });
		cookie.save('order_id', "9", { path: '/' });
	}

	handleStep4(obj) {
		console.log("handleStep4("+JSON.stringify(obj)+")");
		window.scrollTo(0, 0);
		this.setState({
			step : 4,
			selectedItems : obj
		});
	}

	handleStep5() {
		console.log("handleStep5()");
		window.scrollTo(0, 0);
		this.setState({ step : 5 });
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
		console.log("coords", JSON.stringify(this.props.coords));
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
							    onStep0={()=> this.handleStep0()}
							    onStep1={()=> this.handleStep1()}
							    onProjects={()=> this.handleProjects()}
							    onFAQ={()=> this.handleFAQ()}
							    onUsers={()=> this.handleUsers()}
						    />
					    </div>

					    <div className="content-wrapper">
						    {this.state.step === 0 && (
							    <GetStartedStep
								    isProjects={this.state.pages.isProjects}
								    isFAQ={this.state.pages.isFAQ}
								    isUsers={this.state.pages.isUsers}
								    onClick={()=> this.handleStep1()} />
						    )}

						    {this.state.step === 1 && (
							    <TemplateStep
								    onClick={(id)=> this.handleStep2(id)} />
						    )}

						    {this.state.step === 2 && (
							    <DetailsStep
								    templateID={this.templateID}
								    onTooltip={(obj)=> this.showStatus(obj)}
								    onClick={(obj)=> this.handleStep3(obj)} />
						    )}

						    {this.state.step === 3 && (
							    <GeneratingStep
								    orderID={cookie.load('order_id')}
								    onClick={(obj)=> this.handleStep4(obj)}
								    onItemToggle={(obj)=> this.handleItemToggle(obj)} />
						    )}

						    {this.state.step === 4 && (
							    <PurchaseStep
								    onClick={()=> this.handleStep5()}
								    onItemToggle={(obj)=> this.handleItemToggle(obj)}
								    selectedItems={this.state.selectedItems} />
						    )}

						    {this.state.step === 5 && (
							    <CompletionStep />
						    )}
					    </div>
				    </Column>
				    <Column flexGrow={1} horizontal="center" className="bottom-nav">
				      <BottomNav handleStep1={()=> this.handleStep1()}/>
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

export default geolocated({
	positionOptions: {
		enableHighAccuracy : false,
	},
	userDecisionTimeout : 5000,
})(App);
