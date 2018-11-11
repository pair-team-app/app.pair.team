
import React, { Component } from 'react';
import './Overlay.css';

import { Row } from 'simple-flexbox';

class ErrorOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return (
			<div className="overlay-wrapper">
				<div className="overlay-close-background" onClick={()=> this.props.onClick('cancel')} />
				<div className="overlay-container"><Row horizontal="center">
					<div className="overlay-content">
						<div className="page-header">
							<Row horizontal="center"><h1>Error</h1></Row>
							<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
							<Row horizontal="center"><button onClick={()=> this.props.onClick('cancel')}>Cancel</button></Row>
						</div>
					</div>
				</Row></div>
			</div>
		);
	}
}

export default ErrorOverlay;
