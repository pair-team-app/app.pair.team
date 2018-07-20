
import React, { Component } from 'react';
import './App.css';

import {Elements, StripeProvider} from 'react-stripe-elements';
import { Column } from 'simple-flexbox';

import BottomNav from './components/BottomNav'
import DetailsStep from './components/DetailsStep';
import GeneratingStep from './components/GeneratingStep';
import GetStartedStep from './components/GetStartedStep';
import PurchaseStep from './components/PurchaseStep';
import StripeCheckout from './components/StripeCheckout';
import TemplateStep from './components/TemplateStep';
import TopNav from './components/TopNav';

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
		window.scrollTo(0, 0);
		this.setState({ step : 2 });
	}

	handleStep3(obj) {
		console.log("handleStep3("+JSON.stringify(obj)+")");
		window.scrollTo(0, 0);
		this.setState({ step : 3 });
	}

	handleStep4() {
		console.log("handleStep4()");
		window.scrollTo(0, 0);
		this.setState({
			step : 4,
			purchasedItems : this.state.selectedItems
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

	handleItemToggle(obj, isPurchase) {
		console.log("handleItemToggle("+JSON.stringify(obj)+", "+isPurchase+")");

		let amount = 0.00;
		obj.forEach(function(item, i) {
			amount += item.price;
		});

		if (isPurchase) {
			this.setState({
				amount : amount
			});

		} else {
			this.setState({
				amount        : amount,
				selectedItems : obj
			});
		}
	}

	handlePurchaseToggle(obj, isPurchase) {
		console.log("handlePurchaseToggle("+JSON.stringify(obj)+", "+isPurchase+")");

		let amount = 0.00;
		obj.forEach(function(item, i) {
			amount += item.price;
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
		          <DetailsStep onClick={(obj)=> this.handleStep3(obj)} />
	          )}

	          {this.state.step === 3 && (
		          <GeneratingStep
			          onClick={()=> this.handleStep4()}
		            onItemToggle={(obj)=> this.handleItemToggle(obj, false)} />
	          )}

	          {this.state.step === 4 && (
		          <PurchaseStep
			          onClick={()=> this.handleStep5()}
			          onItemToggle={(obj)=> this.handlePurchaseToggle(obj, true)}
			          selectedItems={this.state.selectedItems} />
	          )}
          </div>

	        <div className="bottom-nav">
		        <BottomNav handleStep1={()=> this.handleStep1()}/>
	        </div>

	        {this.state.isStripeOverlay && (
            <StripeProvider apiKey="pk_test_hEOqIXLLiGcTTj7p2W9XxuCP">
            {/*<StripeProvider apiKey="pk_live_7OvF9BcQ3LvNZd0z0FsPPgNF">*/}
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
