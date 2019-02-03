
import React, { Component } from 'react';
import './TopNavRate.css';

import FontAwesome from 'react-fontawesome';
import { Row } from 'simple-flexbox';


const RateStarItem = (props)=> {
	const { ind, filled } = props;
	return (<FontAwesome
		name="star"
		className={(filled) ? 'top-nav-rate-star top-nav-rate-star-filled' : 'top-nav-rate-star'}
		onClick={()=> props.onClick(ind)}
		onMouseEnter={()=> props.onRollOver(ind)}
		onMouseLeave={()=> props.onRollOut(ind)}
	/>);
};


class TopNavRate extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stars : new Array(5).fill(false)
		};
	}

	handleStarClick = (ind)=> {
// 		console.log('TopNavRate.handleStarClick()', ind);
		this.props.onScore(ind + 1);
	};

	handleStarRollOut = (ind)=> {
		let stars = [...this.state.stars];
		stars.filter((star)=> (star === true)).forEach((star, i)=> {
			stars[i] = false;
		});

		this.setState({ stars });
	};

	handleStarRollOver = (ind)=> {
		let stars = [...this.state.stars];
		stars.forEach((star, i)=> {
			stars[i] = (i <= ind);
		});

		this.setState({ stars });
	};

	render() {
// 		console.log('TopNavRate.render()', this.props, this.state);

		const { selected } = this.props;
		const { stars } = this.state;
		const titleClass = (selected) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link';

		return (<div className="top-nav-rate-wrapper"><Row vertical="center">
			<div className={titleClass} onClick={()=> this.props.onPage('rate-this')}>Rate This</div>
			<div className="top-nav-rate-star-wrapper">
				{stars.map((star, i)=> {
					return (<RateStarItem
						key={i}
						ind={i}
						filled={(star === true)}
						onClick={this.handleStarClick}
						onRollOver={this.handleStarRollOver}
						onRollOut={this.handleStarRollOut}
					/>);
				})}
			</div>
		</Row></div>);
	}
}

export default TopNavRate;
