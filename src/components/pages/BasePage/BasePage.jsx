
import React from 'react';
import { matchPath, withRouter } from 'react-router-dom';
import PageNavLink from '../../iterables/PageNavLink';
import { Pages } from "../../../consts/uris";
import './BasePage.css';


function BasePage(props) {
	console.log('BasePage()', props);

	const { className, children, style } = props;
	const { navLinks, location } = props;
	const matchPlaygrounds = (location) ? matchPath(location.pathname, {
		path : `${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:playgroundID([0-9]+)?/:componentsSlug([A-Za-z-]+)?/:componentID([0-9]+)?/(accessibility)?/(comments)?/:commentID([0-9]+)?`,
		exact : false,
		strict: false
	}) : {};

	return (<div className={`base-page ${className}`} style={style}>
		{(children)}
		{(!matchPlaygrounds) && (<BottomNav navLinks={navLinks.bottom} />)}
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
