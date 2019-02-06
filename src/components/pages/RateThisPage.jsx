
import React, { Component } from 'react';
import './RateThisPage.css';

import axios from 'axios';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { Row, Column } from 'simple-flexbox';

import { trackEvent } from '../../utils/tracking';


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};


const RateStarItem = (props)=> {
	const { ind, filled } = props;
	return (<FontAwesome
		name="star"
		className={(filled) ? 'rate-this-star-item rate-this-star-item-filled' : 'rate-this-star-item'}
		onClick={()=> props.onClick(ind)}
		onMouseEnter={()=> props.onRollOver(ind)}
		onMouseLeave={()=> props.onRollOut(ind)}
	/>);
};

const RateThisItem = (props)=> {
// 	console.log('RateThisPage.RateThisItem()', props);

	const { ind, username, avatar, score, comment } = props;
	const stars = new Array(5).fill(false).fill(true, 0, score);

	return (<div className="rate-item"><Row vertical="center">
		<Column flexBasis="30px" horizontal="start" className="rate-item-column rate-item-column-index">#{ind}</Column>
		<Column flexBasis="60px" horizontal="center" className="rate-item-column rate-item-column-avatar"><img src={avatar} className="rate-item-image" alt={ind} /></Column>
		<Column flexGrow={1} flexShrink={1} flexBasis="auto" horizontal="start" className="rate-item-column rate-item-column-username">{username}{(comment) && ('*')}</Column>
		<Column flexBasis="138px" horizontal="end" className="rate-item-column rate-item-column-score"><Row horizontal="end">{stars.map((score, i)=> { return (<FontAwesome key={i} name="star" className={`rate-item-star${(score) ? ' rate-item-star-filled' : ''}`} />); })}</Row></Column>
	</Row></div>);
};

const RateThisForm = (props)=> {
// 	console.log('RateThisPage.RateThisForm()', props);

	const { score, comment, commentValid } = props;
// 	const stars = new Array(5).fill(false).fill(true, 0, score);

	let stars = [...props.stars];
	stars.forEach((star, i)=> {
		star = (star === true || i <= score);
	});

	const commentClass = (commentValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';

	return (<div className="rate-this-page-form-wrapper">
		<div className="rate-this-page-star-wrapper">
			{stars.map((star, i)=> {
				return (<RateStarItem
					key={i}
					ind={i}
					filled={(star)}
					onClick={props.onStarClick}
					onRollOver={props.onStarRollOver}
					onRollOut={props.onStarRollOut}
				/>);
			})}
		</div>
		<form onSubmit={props.onSubmit}>
			<div className={commentClass}><textarea className="rate-this-comment-text" name="comment" value={comment} placeholder="Add Comment" onFocus={props.onFocus} onChange={props.onChange} /></div>
			<button disabled={(stars.reduce((acc, val)=> (acc + val)) === 0)} className="long-button" type="submit" onClick={(event)=> props.onSubmit(event)}>Comment</button>
		</form>
	</div>);
};

const RateThisList = (props)=> {
// 	console.log('RateThisPage.RateThisList()', props);

	const { ratings } = props;
	const avgScore = (ratings.reduce((acc, val)=> ({ score : parseInt(acc.score, 10) + parseInt(val.score, 10)})).score / ratings.length).toFixed(1);
	const commentTotal = ratings.filter((rating)=> (rating.comment.length > 0)).length;

	return (<div className="rate-this-page-list-wrapper">
		<h3>{`${avgScore}/5 star rating`} &amp; {`${commentTotal} comment${(commentTotal === 1) ? '' : 's'}`}</h3>
		{ratings.map((rating, i)=> {
			return (<RateThisItem
				key={i}
				ind={ratings.length - i}
        username={rating.username}
				avatar={rating.avatar}
				score={parseInt(rating.score, 10)}
				comment={rating.comment.length > 0}
			/>);
		})}
	</div>);
};


class RateThisPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stars        : new Array(5).fill(false),
			score        : (props.score) ? props.score : 0,
			comment      : '',
			commentValid : true,
			ratingID     : 0,
			ratings      : []
		};
	}

	componentDidMount() {
		console.log('RateThisPage.componentDidMount()', this.props, this.state);
		const { profile, score } = this.props;


		if (score > 0) {
			const stars = [...this.state.stars].fill(true, 0, score);
			this.setState({ stars });

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
				}).catch((error)=> {
			});

		} else {
			this.onFetchRates();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('RateThisPage.componentDidUpdate()', prevProps, this.props, this.state);

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
				}).catch((error)=> {
			});
		}
	}


	handleStarClick = (ind)=> {
		console.log('RateThisPage.handleStarClick()', ind);

		const score = ind + 1;
		const stars = new Array(5).fill(false).fill(true, 0, score);
		this.setState({ stars, score });
	};

	handleStarRollOut = (ind)=> {
// 		console.log('RateThisPage.handleStarRollOut()', ind);

		const { score } = this.state;
		let stars = [...this.state.stars];
		stars.forEach((star, i)=> {
			stars[i] = (i < score);
// 			star = (i < score);
		});

		this.setState({ stars });
	};

	handleStarRollOver = (ind)=> {
// 		console.log('RateThisPage.handleStarRollOver()', ind);

		let stars = [...this.state.stars];
		stars.forEach((star, i)=> {
			stars[i] = (i <= ind);
// 			star = (i <= ind);
		});

		this.setState({ stars });
	};

	handleSubmit = (event)=> {
		console.log('RateThisPage.handleSubmit()', this.props, this.state);
		event.preventDefault();

		const { score, ratingID, comment } = this.state;
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
				}).catch((error)=> {
			});
		}
	};

	onFetchRates = ()=> {
// 		console.log('RateThisPage.onFetchRates()');

		let formData = new FormData();
		formData.append('action', 'RATES');
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('RATES', response.data);
				this.setState({ ratings : response.data.ratings });
			}).catch((error)=> {
		});
	};


	render() {
// 		console.log('RateThisPage.render()', this.props, this.state);

		const { stars, score, ratingID, comment, commentValid, ratings } = this.state;
		return (<div className="page-wrapper rate-this-page-wrapper">
			<h3>Please Rate &amp; Comment</h3>
			{(ratingID === 0) && (<RateThisForm
				stars={stars}
				score={score}
				comment={comment}
				commentValid={commentValid}
				onStarClick={this.handleStarClick}
				onStarRollOver={this.handleStarRollOver}
				onStarRollOut={this.handleStarRollOut}
				onFocus={()=> this.setState({ comment : '', commentValid : true })}
				onChange={(event)=> this.setState({ [event.target.name] : event.target.value })}
				onSubmit={this.handleSubmit} />)}

			{(ratings.length > 0) && (<RateThisList ratings={ratings} />)}
		</div>);
	}
}

export default connect(mapStateToProps)(RateThisPage);
