
import React, { Component } from 'react';
import './RateThisPage.css';

import axios from 'axios';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import { trackEvent } from '../../utils/tracking';


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};


const txtfieldClass = (isValid)=> {
	return ((isValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error');
};


const RateItem = (props)=> {
// 	console.log('RateThisPage.RateItem()', props);

	const { ind, username, avatar, score, comment } = props;
	const stars = [0, 0, 0, 0, 0].fill(1, 0, score);

	return (<div className="rate-item"><Row vertical="center">
		<div className="rate-item-column rate-item-column-index">{ind}</div>
		<div className="rate-item-column rate-item-column-avatar">
			<img src={avatar} className="rate-item-image" alt={ind} />
		</div>
		<div className="rate-item-column rate-item-column-username">{username}</div>
		<div className="rate-item-column rate-item-column-score">{stars.map((score, i)=> {
			return (<FontAwesome key={i} name={(score === 1) ? 'star' : 'star-o'} className="rate-item-star" />);
		})}</div>
		<div className="rate-item-column rate-item-column-comment">{(comment.length > 0) ? `"${comment}"` : comment}</div>
	</Row></div>);
};

const RateThisForm = (props)=> {
// 	console.log('RateThisPage.RateThisForm()', props);

	const { comment, commentValid } = props;
	const commentClass = txtfieldClass(commentValid);

	return (<div className="rate-this-page-form-wrapper">
		<form onSubmit={props.onSubmit}><Row vertical="center">
			<div className={commentClass}><input type="text" name="comment" placeholder="Comment here" value={comment} onFocus={props.onFocus} onChange={props.onChange} /></div>
			<button type="submit" className="rate-this-page-submit-button" onClick={(event)=> props.onSubmit(event)}>Comment</button>
		</Row></form>
	</div>);
};

const RateThisList = (props)=> {
// 	console.log('RateThisPage.RateThisList()', props);

	const { ratings } = props;

	return (<div className="rate-this-page-item-wrapper">
		{ratings.map((rating, i)=> {
			return (<RateItem
				key={i}
				ind={ratings.length - i}
        username={rating.username}
				avatar={rating.avatar}
				score={parseInt(rating.score, 10)}
				comment={rating.comment}
			/>);
		})}
	</div>);
};


class RateThisPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ratingID     : 0,
			ratings      : [],
			comment      : '',
			commentValid : true
		};
	}

	componentDidMount() {
		console.log('RateThisPage.componentDidMount()', this.props, this.state);
		const { profile, score } = this.props;

		if (score > 0) {
			let formData = new FormData();
			formData.append('action', 'ADD_RATE');
			formData.append('user_id', (profile) ? profile.id : '0');
			formData.append('score', score);
			formData.append('comment', '');
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log('ADD_RATE', response.data);
					this.setState({ ratingID : response.data.rating.id });
					this.onFetchRates();
				}).catch((error) => {
			});

		} else {
			this.onFetchRates();
		}
	}

	componentWillUnmount() {
		console.log('RateThisPage.componentWillUnmount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('RateThisPage.componentDidUpdate()', prevProps, this.props, this.state);

		const { profile, score } = this.props;
		const { ratingID } = this.state;

		if (score !== prevProps.score && ratingID === 0) {
			let formData = new FormData();
			formData.append('action', 'ADD_RATE');
			formData.append('user_id', (profile) ? profile.id : '0');
			formData.append('score', score);
			formData.append('comment', '');
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log('ADD_RATE', response.data);
					this.setState({ ratingID : response.data.rating.id });
					this.onFetchRates();
				}).catch((error) => {
			});
		}
	}


	handleSubmit = (event)=> {
		console.log('RateThisPage.handleSubmit()', this.props, this.state);
		event.preventDefault();

		const { score } = this.props;
		const { ratingID, comment } = this.state;
		const commentValid = (comment.length > 0);

		this.setState({
			comment      : (commentValid) ? comment : 'Invalid comment',
			commentValid : commentValid
		});

		if (commentValid) {
			trackEvent('rate', 'comment');
			let formData = new FormData();
			formData.append('action', 'EDIT_RATE');
			formData.append('rating_id', ratingID);
			formData.append('score', score);
			formData.append('comment', comment);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log('EDIT_RATE', response.data);
					this.setState({ ratingID : 0 });
					this.onFetchRates();
				}).catch((error) => {
			});
		}
	};

	onFetchRates = ()=> {
		console.log('RateThisPage.onFetchRates()');

		let formData = new FormData();
		formData.append('action', 'RATES');
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('RATES', response.data);
				this.setState({ ratings : response.data.ratings });
			}).catch((error) => {
		});
	};


	render() {
		console.log('RateThisPage.render()', this.props, this.state);

		const { score } = this.props;
		const { ratingID, comment, commentValid, ratings } = this.state;
		return (<div className="page-wrapper rate-this-page-wrapper">
			<h3>Rate This Title</h3>
			<h4>Rate This subtitle</h4>

			{(ratingID > 0 && score > 0) && (<RateThisForm
				comment={comment}
				commentValid={commentValid}
				onFocus={()=> this.setState({ comment : '', commentValid : true })}
				onChange={(event)=> this.setState({ [event.target.name] : event.target.value })}
				onSubmit={this.handleSubmit} />)}

			<RateThisList ratings={ratings} />
		</div>);
	}
}

export default connect(mapStateToProps)(RateThisPage);
