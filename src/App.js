
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import cookie from 'react-cookies';
import {Elements, StripeProvider} from 'react-stripe-elements';
import { Column } from 'simple-flexbox';

import BottomNav from './components/elements/BottomNav'
import DetailsStep from './components/steps/DetailsStep';
import GeneratingStep from './components/steps/GeneratingStep';
import GetStartedStep from './components/steps/GetStartedStep';
import PurchaseStep from './components/steps/PurchaseStep';
import StripeCheckout from './components/elements/StripeCheckout';
import TemplateStep from './components/steps/TemplateStep';
import TopNav from './components/elements/TopNav';

class App extends Component {
	constructor(props) {
		console.log("constructor()");

		super(props);

		this.state = {
		  step : 0,
			isProjects : false,
			isFAQ : false,
      isStripeOverlay : false,
			amount : 0.00,
			selectedItems : null,
			purchasedItems : null,
			comprehend : []
		};

		this.templateID = 0;
		this.images = [];

		this.STRIPE_TEST_TOKEN = 'pk_test_hEOqIXLLiGcTTj7p2W9XxuCP';
		this.STRIPE_LIVE_TOKEN = 'pk_live_7OvF9BcQ3LvNZd0z0FsPPgNF';
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
				let images = [];
				response.data.comprehend.keywords.forEach(function(item, i) {
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
    const stripeStyle = {
      width: '300px',
      height: '150px',
      border: '1px solid #000000'
    };

    return (
    	<div>
        <Column horizontal="center" className="page-wrapper">
          <div className="top-nav">
	          <TopNav
		          step={this.state.step}
		          amount={this.state.amount}
		          isProjects={this.state.isProjects}
		          isFAQ={this.state.isFAQ}
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

	        {this.state.isStripeOverlay && (
            <StripeProvider apiKey={this.STRIPE_TEST_TOKEN}>
            {/*<StripeProvider apiKey={this.STRIPE_LIVE_TOKEN}>*/}
              <div className="example" style={stripeStyle}>
                <h3>React Stripe Elements Example</h3>
                <Elements>
                  <StripeCheckout />
                </Elements>
              </div>
            </StripeProvider>
          )}
        </Column>
		    <Column flexGrow={1} horizontal="center" className="bottom-nav">
			    <BottomNav handleStep1={()=> this.handleStep1()}/>
		    </Column>
	    </div>
    );
  }
}

export default App;
