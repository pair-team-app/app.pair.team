
import React, { Component } from 'react';
import './MobileMenu.css';

import PageNavLink from '../../iterables/PageNavLink';
import navLinks from '../../../assets/json/nav-links';


const MobileMenuItem = (props)=> {
	const { navLink } = props;

	return (<div className="mobile-menu-item">
		<PageNavLink navLink={navLink} />
	</div>);
};


class MobileMenu extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (<div className="mobile-menu">
			<div className="mobile-menu-header">
				Menu
			</div>
			<div className="mobile-menu-item-wrapper">
				{([ ...navLinks.top, ...navLinks.bottom].map((navLink, i)=> (<MobileMenuItem key={i} navLink={navLink} />)))}
			</div>
		</div>);
	}
}

export default (MobileMenu);
