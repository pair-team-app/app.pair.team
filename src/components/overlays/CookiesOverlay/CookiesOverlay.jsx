
import React, { Component } from 'react';
import './CookiesOverlay.css';

import onClickOutside from 'react-onclickoutside';
import { NavLink } from 'react-router-dom';

import { Pages } from '../../../consts/uris';


class CookiesOverlay extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ok    : false,
			outro : false
		};
	}

	handleClick = (ok)=> {
// 		console.log('%s.handleClick()', this.constructor.name, ok);

		if (ok) {
			this.props.onConfirmed();
		}

		this.setState({ ok,
			outro : true
		});
	};

	handleClickOutside(event) {
		this.setState({
			ok    : false,
			outro : true
		});
	}

	render() {
		const { outro } = this.state;
		return (<div className={`cookies-overlay${(outro) ? ' cookies-overlay-hide' : ' cookies-overlay-intro'}`}>
			<div className="cookies-overlay-title">Accept Cookies</div>

			<div className="cookies-overlay-content">
				This site uses cookies to ensure you get the best experience. By using our website, you agree to our <NavLink to={Pages.LEGAL}>Privacy Policy</NavLink>.
			</div>

			<div className="button-wrapper-col cookies-overlay-button-wrapper">
				<button className="quiet-button" onClick={()=> this.handleClick(false)}>Cancel</button>
				<button onClick={()=> this.handleClick(true)}>OK</button>
			</div>
		</div>);
	}
}


export default onClickOutside(CookiesOverlay);
