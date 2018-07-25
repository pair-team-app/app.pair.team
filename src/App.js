
import React, { Component } from 'react';
import './App.css';

// import axios from 'axios';
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
      isStripeOverlay : false,
			amount : 0.00,
			selectedItems : null,
			purchasedItems : null
		};

		this.templateID = 0;

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
		console.log("handleStep3("+JSON.stringify(obj)+")");
		window.scrollTo(0, 0);
		cookie.save('order_id', "9", { path: '/' });

// 		let formData = new FormData();
// 		formData.append('action', 'MAKE_ORDER');
// 		formData.append('template_id', this.templateID);
// 		formData.append('email', obj.email);
// 		formData.append('title', obj.company);
// 		formData.append('headline', obj.headline);
// 		formData.append('subheadline', obj.subheadline);
// 		formData.append('main_headline', obj.mainHeadline);
// 		formData.append('colors', obj.colors);
// 		formData.append('corner_type', obj.cornerType);
// 		formData.append('imagery', obj.imagery);
// 		axios.post('https://api.designengine.ai/templates.php', formData)
// 			.then((response)=> {
// 				console.log("MAKE_ORDER", JSON.stringify(response.data));
// 				cookie.save('order_id', response.data.order_id, { path: '/' });
// 			}).catch((error) => {
// 		});

		this.setState({ step : 3 });
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
      <div className="page-wrapper">
        <Column horizontal="center">
          <div className="top-nav">
	          <TopNav
		          step={this.state.step}
		          amount={this.state.amount}
		          handleStep0={()=> this.handleStep0()}
		          handleStep1={()=> this.handleStep1()} />
          </div>

          <div className="content-wrapper">
	          {this.state.step === 0 && (
              <GetStartedStep onClick={()=> this.handleStep1()} />
            )}

	          {this.state.step === 1 && (
		          <TemplateStep onClick={(id)=> this.handleStep2(id)} />
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

	        <div className="bottom-nav">
		        <BottomNav handleStep1={()=> this.handleStep1()}/>
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
      </div>
    );
  }
}

export default App;
