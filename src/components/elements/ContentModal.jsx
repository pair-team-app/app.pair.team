
import React, { Component } from 'react';
import './ContentModal.css'

class ContentModal extends Component {
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
			<div className="modal-wrapper" onClick={()=> this.props.onClick()}>
				<div className="modal-container">
					<div className="modal-content" ref={(element) => { this.contentElement = element; }}>
						<span dangerouslySetInnerHTML={{__html : this.props.content}} />
					</div>
				</div>
			</div>
		);
	}
}

export default ContentModal;
