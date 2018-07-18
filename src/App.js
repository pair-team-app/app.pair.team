
import React, { Component } from 'react';
import './App.css';

import {Elements, StripeProvider} from 'react-stripe-elements';
import { Column, Row } from 'simple-flexbox';

import DetailsStep from './components/DetailsStep';
import GetStartedStep from './components/GetStartedStep';
import StripeCheckout from './components/StripeCheckout';
import TemplateStep from './components/TemplateStep';
import TopNav from './components/TopNav';

class App extends Component {
	constructor(props) {
		console.log("constructor()");

		super(props);

		this.state = {
		  step : 0,
      isStripeOverlay : false
		};
	}

  handleStep1() {
    console.log("handleStep1()");
    this.setState({ step : 1 });
  }

	handleStep2(id) {
		console.log("handleStep2("+id+")");
		this.setState({ step : 2 });
	}

	handleStep3(obj) {
		console.log("handleStep3("+JSON.stringify(obj)+")");
		this.setState({ step : 3 });
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
          <div className="top-nav"><TopNav /></div>

          <div className="content-wrapper">
	          {this.state.step === 0 && (
              <GetStartedStep onClick={()=> this.handleStep1()}/>
            )}

	          {this.state.step === 1 && (
		          <TemplateStep onClick={(id)=> this.handleStep2(id)}/>
            )}

	          {this.state.step === 2 && (
		          <DetailsStep onClick={(obj)=> this.handleStep3(obj)}/>
	          )}
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
