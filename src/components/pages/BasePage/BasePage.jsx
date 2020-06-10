
import React from 'react';
import { matchPath, withRouter } from 'react-router-dom';
import { Pages } from '../../../consts/uris';

import { RoutePaths } from '../../helpers/Routes';
import PageNavLink from '../../iterables/PageNavLink';
import './BasePage.css';



function BasePage(props) {
	// console.log('BasePage()', props);

	const { location, className, children, style } = props;
	const matchPlaygrounds = (location) ? matchPath(location.pathname, {
		path : RoutePaths.PROJECT,
		exact : false,
		strict: false
	}) : {};

	let attribs = {};
	Object.keys(props).filter((key)=> (/^data-/.test(key))).forEach((key)=> {
		attribs[key] = props[key];
	});

 	return (<div className={`base-page ${className}`} { ...attribs } style={style}>
		{(children)}
		{/* {(!matchPlaygrounds) && (<BottomNav navLinks={navLinks.bottom} />)} */}
	</div>);
}


const BottomNav = (props)=> {
	// console.log('BasePage.BottomNav()', props);

	const { navLinks } = props;
	return (<div className="base-page-bottom-nav"><ul>
		{(navLinks.map((navLink, i)=> {
			return (<li key={i}><PageNavLink navLink={navLink} onClick={()=> null} /></li>);
		}))}
	</ul></div>);
};


export default withRouter(BasePage);
// export default (BasePage);
