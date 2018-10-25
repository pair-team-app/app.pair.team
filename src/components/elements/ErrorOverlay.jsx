
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
				<div className="overlay-container">
					<div className="overlay-content">
						<div className="page-header">
							<Row horizontal="center"><div className="page-header-text">Error</div></Row>
							<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
							<Row horizontal="center"><button className="page-button" onClick={()=> this.props.onClick('cancel')}>Cancel</button></Row>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ErrorOverlay;
