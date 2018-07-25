
import React, { Component } from 'react';
import './LightBox.css';

class LightBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.contentElement = null;
	}

	render() {
		if (this.contentElement) {
			console.log(this.contentElement.width, this.contentElement.height);
		}

		return (
			<div className="lightbox-wrapper" onClick={()=> this.props.onClick()}>
				<div className="lightbox-container">
					<div className="lightbox-content" ref={(element) => { this.contentElement = element; }}>
						<img src={this.props.url} className="lightbox-image" alt={this.props.title} />
					</div>
				</div>
			</div>
		);
	}
}

export default LightBox;
