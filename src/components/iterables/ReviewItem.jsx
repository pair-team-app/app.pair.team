
import React, { Component } from 'react';
import './ReviewItem.css';

class ReviewItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<div className="review-item">
				<img className="review-item-image" src={this.props.image} alt={this.props.author} />
				<div className="review-item-quote">
					&ldquo;{this.props.quote}&rdquo;<br />
					&mdash;{this.props.author}
				</div>
			</div>
		);
	}
}

export default ReviewItem;
