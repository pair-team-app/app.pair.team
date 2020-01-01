
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
        This website uses essential functional (session) cookies, which do not identify you in any way. Additionally, cookies may also be used to improve your experience, never used for tracking, analytical or any unlawful purposes. We'll assume you're ok with this, but you can opt-out if you wish. <NavLink to={Pages.LEGAL}>Read More</NavLink>.
			</div>

			<div className="button-wrapper-col cookies-overlay-button-wrapper">
				<button onClick={()=> this.handleClick(true)}>Accept</button>
				<button className="quiet-button" onClick={()=> this.handleClick(false)}>Reject</button>
			</div>
		</div>);
	}
}


export default onClickOutside(CookiesOverlay);
