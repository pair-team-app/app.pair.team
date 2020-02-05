
import React from 'react';
import PageNavLink from '../../iterables/PageNavLink';
import './BasePage.css';




function BasePage(props) {
	// console.log('BasePage()', props);

	const { className, children, style } = props;
	return (<div className={`base-page ${className}`} style={style}>
		{(children)}
		{/* {(!props.location.pathname.startsWith(Pages.PLAYGROUND)) && (<BottomNav navLinks={navLinks.bottom} />)} */}
	</div>);
}


const BottomNav = (props)=> {
// 	console.log('BasePage.BottomNav()', props);

	const { navLinks } = props;
	return (<div className="base-page-bottom-nav"><ul>
		{(navLinks.map((navLink, i)=> {
			return (<li key={i}><PageNavLink navLink={navLink} onClick={()=> null} /></li>);
		}))}
	</ul></div>);
};


// export default withRouter(BasePage);
export default (BasePage);
