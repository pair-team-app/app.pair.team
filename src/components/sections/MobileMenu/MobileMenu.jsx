
import React, { Component } from 'react';
import './MobileMenu.css';

import onClickOutside from 'react-onclickoutside';

import PageNavLink from '../../iterables/PageNavLink';
import navLinks from '../../../assets/json/nav-links';
import { GITHUB_XD_PLUGIN, NPM_DE_PLAYGROUND } from '../../../consts/uris';

class MobileMenu extends Component {
	constructor(props) {
		super(props);

		this.state = {
			opened : false,
			btnLinks : [{
				title : "NPM Module",
				url   : `/url/${NPM_DE_PLAYGROUND}`
			}, {
				title : "Open in Adobe XD",
				url   : `/url/${GITHUB_XD_PLUGIN}`
			}]
		};
	}

	handleClickOutside(event) {
		this.setState({ opened : false });
	}

	handleHeaderClick = (event)=> {
		this.setState({ opened : ! this.state.opened });
	};

	render() {
		const { opened, btnLinks } = this.state;

		return (<div className="mobile-menu">
			<div className={`mobile-menu-header${(opened) ? ' mobile-menu-header-open' : ''}`} onClick={this.handleHeaderClick}>
				{/*<div className="derp-derp">DERP</div>*/}
				<div className="mobile-menu-header-title">Menu</div>
			</div>
			<div className={`mobile-menu-item-wrapper${(opened) ? ' mobile-menu-item-wrapper-open' : ''}`}>
				{([ ...navLinks.top, ...btnLinks, ...navLinks.bottom].map((navLink, i)=> (<MobileMenuItem key={i} navLink={navLink} onClick={(event)=> this.setState({ opened : false })} />)))}
			</div>
		</div>);
	}
}


const MobileMenuItem = (props)=> {
	const { navLink } = props;

	const handleClick = (event, url)=> {
		event.preventDefault();
		window.open(url);
	};

	return (<div className="mobile-menu-item">
		<PageNavLink navLink={navLink} onClick={props.onClick} />
	</div>);
};


export default onClickOutside(MobileMenu);
