
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

		const items = this.props.urls.map((url, i, arr) => {
			return (
				<div key={i}><img src={url} className="lightbox-image" alt={this.props.title} /></div>
			);
		});

		return (
			<div className="lightbox-wrapper" onClick={()=> this.props.onClick()}>
				<div className="lightbox-container">
					<div className="lightbox-content" ref={(element) => { this.contentElement = element; }}>
						{items}
					</div>
				</div>
			</div>
		);
	}
}

export default LightBox;
