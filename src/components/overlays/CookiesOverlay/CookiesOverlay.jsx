
import React, { Component } from 'react';
import './CookiesOverlay.css';

import onClickOutside from 'react-onclickoutside';



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

		return (<div className={`cookies-overlay${(outro) ? ' cookies-overlay-hide' : ''}`}>
			<div className="cookies-overlay-title">Accept Cookies</div>

			<div className="cookies-overlay-content">
				Cras non felis a tortor placerat posuere. Nulla maximus dolor at augue sodales, in venenatis urna luctus. Sed id nibh gravida, rutrum metus id, ultricies justo.
			</div>

			<div className="button-wrapper-col cookies-overlay-button-wrapper">
				<button className="quiet-button" onClick={()=> this.handleClick(false)}>Cancel</button>
				<button onClick={()=> this.handleClick(true)}>OK</button>
			</div>
		</div>);
	}
}


export default onClickOutside(CookiesOverlay);
