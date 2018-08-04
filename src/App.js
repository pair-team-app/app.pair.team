
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
import { Column } from 'simple-flexbox';

import BottomNav from './components/elements/BottomNav'
import DetailsStep from './components/steps/DetailsStep';
import GeneratingStep from './components/steps/GeneratingStep';
import GetStartedStep from './components/steps/GetStartedStep';
import ProcessingStatus from './components/elements/ProcessingStatus';
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
			isIntro : true,
			isProjects : false,
			isStatus : false,
			isFAQ : false,
			amount : 0.00,
			selectedItems : null,
			purchasedItems : null,
			processingStatus: [],
			comprehend : []
		};

		this.templateID = 0;
		this.images = [];
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
				self.setState({ processingStatus: [
					"Keywords & entities ("+(response.data.comprehend.keywords.length+response.data.comprehend.entities.length)+")…",
					"Sentiment rating ("+(response.data.comprehend.sentiment.outcome)+")…",
					"Grammar items ("+response.data.comprehend.syntax.length+")…"
				] });

				let colors = [];
				let images = [];
				response.data.comprehend.keywords.forEach(function(item, i) {
					axios.get('http://www.colr.org/json/tag/' + item.Text)
						.then((response)=> {
							console.log("colr", JSON.stringify(response.data));
							response.data.schemes.forEach(function(itm, i) {
								colors.push(itm.colors);
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
// 								axios.post('https://api.designengine.ai/templates.php', formData)
// 									.then((response)=> {
// 										console.log("ADD_IMAGE", JSON.stringify(response.data));
// 									}).catch((error) => {
// 								});
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
		this.setState({
			step : 5,
			isStripeOverlay : true
		});
	}

	handleProjects() {
		console.log("handleProjects()");
		this.setState({ isProjects : true });
		let self = this;
		setTimeout(function() {
			self.setState({ isProjects : false })
		}, 1000);
	}

	handleFAQ() {
		console.log("handleFAQ()");
		this.setState({ isFAQ : true });
		let self = this;
		setTimeout(function() {
			self.setState({ isFAQ : false })
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
    return (
    	<div>
		    {this.state.isIntro && (
		    	<SplashIntro onComplete={()=> this.setState({ isIntro : false })}/>
		    )}


		    {!this.state.isIntro && (
		    	<div>
				    <Column horizontal="center" className="page-wrapper">
					    <div className="top-nav">
						    <TopNav
							    step={this.state.step}
							    amount={this.state.amount}
							    isProjects={this.state.isProjects}
							    isFAQ={this.state.isFAQ}
							    isStatus={this.state.isFAQ}
							    onStep0={()=> this.handleStep0()}
							    onStep1={()=> this.handleStep1()}
							    onProjects={()=> this.handleProjects()}
							    onFAQ={()=> this.handleFAQ()}
						    />
					    </div>

					    <div className="content-wrapper">
						    {this.state.step === 0 && (
							    <GetStartedStep
								    isProjects={this.state.isProjects}
								    isFAQ={this.state.isFAQ}
								    onClick={()=> this.handleStep1()} />
						    )}

						    {this.state.step === 1 && (
							    <TemplateStep
								    onClick={(id)=> this.handleStep2(id)} />
						    )}

						    {this.state.step === 2 && (
							    <DetailsStep
								    templateID={this.templateID}
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
					    </div>
				    </Column>
				    <Column flexGrow={1} horizontal="center" className="bottom-nav">
				      <BottomNav handleStep1={()=> this.handleStep1()}/>
				    </Column>

				    {this.state.isStatus && (
				    	<ProcessingStatus status={this.state.processingStatus} />
				    )}
			    </div>
		    )}
	    </div>
    );
  }
}

export default App;
