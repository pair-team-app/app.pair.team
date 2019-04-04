
import React, { Component } from 'react';
import './GitHubModal.css';

import axios from 'axios';
import qs from 'qs';
// import { Column, Row } from 'simple-flexbox';

import BaseOverlay from '../BaseOverlay';
import { API_ENDPT_URL } from './../../../consts/uris';
import { DateTimes, Objects, URLs } from './../../../utils/lang';
import { trackEvent } from './../../../utils/tracking';
import githubCreds from '../../../assets/json/github-creds';


const GitHubRepoForm = (props)=> {
// 	console.log('GitHubModal.GitHubRepoForm()', props);

	return (<div className="github-modal-form github-repo-form">

	</div>);
};



class GitHubModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step       : 0,
			action     : (typeof props.match.params.action !== 'undefined') ? props.match.params.action : null,
			qsParams   : URLs.queryString(props.location.search),
			oauthToken : null,
			repoURL    : null,
			authed     : false,
			error      : null,
			outro      : false,
			submitting : false
		};
	}

	componentDidMount() {
// 		console.log('GitHubModal.componentDidMount()', this.props, this.state);

// 		const { profile } = this.props;
// 		this.setState({ sources, devs });


		const { action, qsParams, error } = this.state;
		if (Objects.hasKey(qsParams, 'error') && !error) {
			this.setState({ error : `${qsParams.error}\n${qsParams.error_description}` });

		} else {
			if (action === 'callback' && Objects.hasKey(qsParams, 'code')) {
				this.setState({ step : 1 });
				this.onFetchToken(qsParams.code, qsParams.state);
			}
		}
	}

	handleAuthRequest = ()=> {
		console.log('GitHubModal.handleAuthRequest()');
		window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubCreds.clientID}&redirect_uri=${window.location.origin}/github-connect/callback&scope=repo&state=${DateTimes.epoch()}`;
	};

	handleComplete = (submitted)=> {
// 		console.log('GitHubModal.handleComplete()', submitted);

		this.setState({ outro : false }, ()=> {
			this.props.onPage('');

			setTimeout(()=> {
				if (submitted) {
					this.props.onSubmitted();

				} else {
					this.props.onComplete();
				}
			}, 333);
		});
	};

	handleAuthSubmitted = ()=> {
		console.log('GitHubModal.handleAuthSubmitted()');
		this.setState({
			step   : 1,
			authed : true
		});
	};

	handleSubmit = ()=> {
// 		console.log('GitHubModal.handleSubmit()');

		const { profile, deeplink } = this.props;
		const { repoURL, oauthToken } = this.state;
		this.setState({ submitting : true }, ()=> {
			axios.post(API_ENDPT_URL, qs.stringify({
				action     : 'INTEGRATE_UPLOAD',
				user_id    : profile.id,
				upload_id  : deeplink.uploadID,
				repo_url   : repoURL,
				token      : oauthToken
			})).then((response) => {
				console.log('INTEGRATE_UPLOAD', response.data);

				trackEvent('github', 'success');
				this.setState({ submitting : false });
				this.handleComplete(true);
			}).catch((error)=> {
			});
		});
	};

	onFetchToken = (code, state)=> {
		console.log('GitHubModal.onFetchToken()', code, state);

		const config = {
			headers : {
				'Content-Type' : 'multipart/form-data',
				'Accept'       : 'application/json'
			}
		};

		axios.post('https://github.com/login/oauth/access_token', qs.stringify({
			client_id     : githubCreds.clientID,
			client_secret : githubCreds.clientSecret,
			code          : code,
			redirect_uri  : `${window.location.origin}/github-connect/auth`,
			state         : state
		}), config).then((response) => {
			console.log('ACCESS_TOKEN', response.data);


		}).catch((error)=> {
		});
	};

	render() {
		console.log('GitHubModal.render()', this.props, this.state);

		const { step, outro } = this.state;
		const title = (step === 0) ? 'Connect to GitHub' : 'Choose Yer Repo';

		return (
			<BaseOverlay
				tracking={`github/${URLs.firstComponent()}`}
				delay={0}
				outro={outro}
				unblurred={true}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="github-modal-wrapper">
					<div className="github-modal-header">
						<h4 className="full-width">{title}</h4>
					</div>
					<div className="github-modal-content-wrapper">
						<div>{(this.state.action)}</div>
						<div>{(this.state.error)}</div>

						{(step === 0) && (<button className="long-button" onClick={()=> this.handleAuthRequest()}>Authorize</button>)}

						{(step === 1) && (<GitHubRepoForm
							onSubmit={this.handleAuthSubmitted}
						/>)}

					</div>
				</div>
			</BaseOverlay>);
	}
}

export default GitHubModal;
