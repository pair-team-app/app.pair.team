
import React, { Component } from 'react';
import './HomeExpo.css';

import { Row } from 'simple-flexbox';

import { isUserLoggedIn } from '../../utils/funcs';
import homeExpo from '../../json/home-expo.json';


class HomeExpo extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const items = (isUserLoggedIn()) ? homeExpo.loggedIn : homeExpo.loggedOut;

		return (
			<div className="home-expo">
				<Row className="home-page-artboards-wrapper">
					{items.map((item, i)=> {
						return (
							<div key={i} className="home-expo-item" onClick={()=> this.props.onClick(item.url)}>
								<img className="home-expo-item-image" src={item.image} alt={item.title} />
							</div>
						);
					})}
				</Row>
			</div>
		);
	}
}

export default HomeExpo;
