
import React from 'react';
import './BasePage.css';


import PageNavLink from '../../iterables/PageNavLink';
import navLinks from '../../../assets/json/nav-links';
import { Pages } from '../../../consts/uris';


function BasePage(props) {
// 	console.log('BasePage()', props);

	const { className, children, style } = props;
	return (<div className={`base-page ${className}`} style={style}>
		{(children)}
		{(!window.location.pathname.startsWith(Pages.PLAYGROUND)) && (<BottomNav navLinks={navLinks.bottom} />)}
	</div>);
}


const BottomNav = (props)=> {
	console.log('BasePage.BottomNav()', props);

	const { navLinks } = props;
	return (<div className="base-page-bottom-nav"><ul>
		{(navLinks.map((navLink, i)=> {
			return (<li key={i}><PageNavLink navLink={navLink} onClick={()=> null} /></li>);
		}))}
	</ul></div>);
};


export default (BasePage);
