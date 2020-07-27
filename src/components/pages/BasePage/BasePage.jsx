
import React from 'react';
import './BasePage.css';


function BasePage(props) {
	// console.log('BasePage()', { props });

	const { className, children, style } = props;

	let attribs = {};
	Object.keys(props).filter((key)=> (/^data-/.test(key))).forEach((key)=> {
		attribs[key] = props[key];
	});

 	return (<div className={`base-page ${className}`} { ...attribs } style={style}>
		{(children)}
	</div>);
}


export default (BasePage);
