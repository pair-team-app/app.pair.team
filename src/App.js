
import React, { Component } from 'react';
import './App.css';

import ReactPixel from 'react-facebook-pixel';
import { BrowserRouter, Route} from 'react-router-dom'
import { Column, Row } from 'simple-flexbox';

import BottomNav from './components/elements/BottomNav';
import HomePage from './components/pages/HomePage';
import InspectorPage from './components/pages/InspectorPage';
import ManifestoPage from './components/pages/ManifestoPage';
import SideNav from "./components/elements/SideNav";
import TopNav from './components/elements/TopNav';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			url : window.location.pathname
		};

		this.templateID = 0;
		this.images = [];
		this.interval = null;
	}

	componentDidMount() {
		const advancedMatching = { em: 'some@email.com' };
		const options = {
			autoConfig : true,
			debug      : false,
		};

		ReactPixel.init('318191662273348', advancedMatching, options);
		ReactPixel.trackCustom('load');
	}

	componentWillUnmount() {
	}

	handleNavItem = (obj) => {
		console.log('handleNavItem()', obj);
	};


  render() {
    return (
    	<div className="page-wrapper">
		    <TopNav url={this.state.url} />

		    <Row horizontal="start" vertical="start">
		      <Column horizontal="start" className="side-nav-wrapper">
			      <SideNav url={this.state.url} onNavItem={(obj)=> this.handleNavItem(obj)} />
		      </Column>

			    <Column horizontal="start" className="content-wrapper">
				    <BrowserRouter><div style={{width:'100%'}}>
					    <Route exact path="/" component={HomePage} />
					    <Route exact path="/render" component={InspectorPage} />
					    <Route exact path="/manifesto" component={ManifestoPage} />
				    </div></BrowserRouter>
			    </Column>
		    </Row>

		    <div className="bottom-nav-wrapper">
		      <BottomNav />
		    </div>
	    </div>
    );
  }
}

export default App;
