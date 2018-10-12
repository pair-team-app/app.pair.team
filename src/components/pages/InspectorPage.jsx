
import React, { Component } from 'react';
import './InspectorPage.css';

// import axios from 'axios';
// import { Column, Row } from 'simple-flexbox';


class InspectorPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			itemID : 0
		};
	}

	componentDidMount() {
		const { itemID } = this.props.match.params;
		this.setState({ itemID : itemID });
	}

	render() {
		return (
			<div className="inspector-page-wrapper">
				<div className="inspector-page-content">
					<div className="inspector-page-hero-wrapper">
						<img className="inspector-page-hero-image" src="" alt="Hero" />
						<div className="inspector-page-hero-title">
							Material Design System
						</div>
					</div>
					<div className="inspector-page-hero-info-wrapper">
						0 Views<br />
						0 Downloads
					</div>
				</div>
				<div className="inspector-page-panel">
					<div className="inspector-page-panel-display">
					</div>
					<div className="inspector-page-panel-button-wrapper">
						<div>
							<button className="inspector-page-size-button">1x</button>
							<button className="inspector-page-size-button inspector-page-size-button-middle">2x</button>
							<button className="inspector-page-size-button">3x</button>
						</div>
						<div>
							<button className="inspector-page-select-button">Select Part ()</button>
							<button className="inspector-page-download-button">Download All ()</button>
						</div>
					</div>
					<div className="inspector-page-panel-info-wrapper">
						System: <br />
						Author: <br />
						Page: <br />
						Artboard: <br />
						Slice: <br />
						Position: <br />
						Size: <br />
						Rotation: <br />
						Opacity: <br />
						Color: <br />
						Font: <br />
						Font Size: <br />
						Font Color: <br />
						Blend Mode: <br />
					</div>
				</div>
			</div>
		);
	}
}

export default InspectorPage;
