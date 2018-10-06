
import React, { Component } from 'react';
import './BottomNav.css';

import { Row } from 'simple-flexbox';


class BottomNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className="bottom-nav-wrapper">
				<Row horizontal="center">
					<div className="copyright">&copy; {new Date().getFullYear()} Design Engine AI, Inc.</div>
				</Row>
			</div>
		);
	}
}

export default BottomNav;
