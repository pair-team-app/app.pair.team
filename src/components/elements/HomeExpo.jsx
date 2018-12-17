
import React, { Component } from 'react';
import './HomeExpo.css';

import { Column, Row } from 'simple-flexbox';

class HomeExpo extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<div className="home-expo">
				<Row className="home-page-artboards-wrapper">
					<div className="home-expo-item" onClick={()=> this.props.onClick(0)}>
						<img className="home-expo-item-image" src="/images/home-expo_01.png" />
					</div>
					<div className="home-expo-item" onClick={()=> this.props.onClick(1)}>
						<img className="home-expo-item-image" src="/images/home-expo_02.png" />
					</div>
					<div className="home-expo-item" onClick={()=> this.props.onClick(2)}>
						<img className="home-expo-item-image" src="/images/home-expo_03.png" style={{marginRight:'10px'}} />
					</div>
				</Row>
			</div>
		);
	}
}

export default HomeExpo;
