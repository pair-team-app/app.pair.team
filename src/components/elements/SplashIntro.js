
import React, { Component } from 'react';
import './SplashIntro.css'

class SplashIntro extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.interval = null;
	}

	componentDidMount() {
		let self = this;
		this.interval = setTimeout(function() {
			self.props.onComplete();
		}, 2000);
	}

	componentWillUnmount() {
		clearTimeout(this.interval);
	}

	render() {
		return (
			<div className="intro-wrapper" onClick={()=> this.props.onClick()}>
				<div className="intro-container">
					<div className="intro-content">
						<div>INTRO SOMETHING</div>
					</div>
				</div>
			</div>
		);
	}
}

export default SplashIntro;
