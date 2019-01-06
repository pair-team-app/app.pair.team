
import React from 'react';
import './GridHeader.css';

import { isUserLoggedIn } from '../../utils/funcs';

function LoggedInHeader(props) {
	return (<div className="grid-header-wrapper">
		<h3>Create a new design project</h3>
		<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
		<div>
			<button onClick={()=> props.onPage('new')}>New Project</button>
		</div>
	</div>);
}

function LoggedOutHeader(props) {
	return (<div className="grid-header-wrapper">
		<h3>Sign up or Login</h3>
		<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
		<div>
			<button className="adjacent-button" onClick={()=> props.onPage('register')}>Sign up with Email</button>
			<button onClick={()=> props.onPage('login')}>Login</button>
		</div>
	</div>);
}

function GridHeader(props) {
	return ((isUserLoggedIn())
		? <LoggedInHeader onPage={(url)=> props.onPage(url)} />
		: <LoggedOutHeader onPage={(url)=> props.onPage(url)} />
	);
}

export default GridHeader;
