
import React, { Component } from 'react';
import './LightBox.css';


class LightBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.contentElement = null;
		//this.onKeyDown = this.onKeyDown.bind(this);
	}

	componentDidMount() {
		window.addEventListener('keydown', (e)=> this.onKeyDown(e));
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', (e)=> this.onKeyDown(e));
	}

	onKeyDown(event) {
		const key = event.key;
		console.log('onKeyDown()', key);
		if (event.key === 'leftArrow') {
			this.props.onNext();

		} else if (event.key === 'rightArrow') {
			this.props.onBack();
		}
	}


	render() {
		const items = this.props.urls.map((url, i, arr) => {
			return (
				<div key={i}><img src={url} className="lightbox-image" alt={this.props.title} /></div>
			);
		});

		return (
			<div className="lightbox-wrapper" onKeyDown={()=> this.onKeyDown()}>
				<img src="/images/close.png" className="lightbox-close" alt="Close" onClick={()=> this.props.onClick()} />
				<div className="lightbox-container">
					<div className="lightbox-title">{this.props.title}</div>
					<div className="lightbox-content" ref={(element) => { this.contentElement = element; }}>
						{items}
					</div>
					<div className="lightbox-footer">
						<button className="form-button form-button-secondary" onClick={()=> this.props.onClick()}>Close</button>
						<button className="form-button" onClick={()=> this.props.onSelect(this.props.file_id)}>Select ${this.props.price}</button>
					</div>
				</div>
			</div>
		);
	}
}

export default LightBox;
