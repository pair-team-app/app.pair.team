
import React, { Component } from 'react';
import './GitHubModal.css';

import axios from 'axios';
import Octokit from '@octokit/rest';
import qs from 'qs';
import { Row } from 'simple-flexbox';

import BaseOverlay from '../BaseOverlay';
import { API_ENDPT_URL } from './../../../consts/uris';
import { Strings, URLs } from './../../../utils/lang';
import { trackEvent } from './../../../utils/tracking';
// import githubCreds from '../../../assets/json/github-creds';


const GitHubAuthForm = (props)=> {
// 	console.log('GitHubModal.GitHubAuthForm()', props);

	const { accessToken } = props;
	return (<div className="github-modal-form github-auth-form">
		<form onSubmit={props.onSubmit}>
			<div className="input-wrapper"><input type="text" autoComplete="off" name="accessToken" placeholder="Enter Personal Access Token" value={accessToken} onChange={props.onChange} /></div>
			<Row vertical="center">
				<button className="adjacent-button" onClick={props.onCancel}>Cancel</button>
				<button disabled={(accessToken.length === 0)} type="submit" className="long-button" onClick={props.onSubmit}>Authorize</button>
			</Row>
		</form>
	</div>);
};

const GitHubRepoList = (props)=> {
// 	console.log('GitHubModal.GitHubRepoList()', props);

	const { repos } = props;
	return (<div className="github-modal-form github-repo-list">
		{repos.map((repo, i)=> (
			<GitHubRepoListItem
				key={i}
				repo={repo}
				title={repo.fullName}
				onClick={()=> props.onClick(repo)}
			/>
		))}
	</div>);
};

const GitHubRepoListItem = (props)=> {
// 	console.log('GitHubModal.GitHubRepoListItem()', props);

	const { title } = props;
	return (<div className="github-repo-list-item" onClick={props.onClick}>
		<div className="github-repo-list-item-title">{`${Strings.truncate(`${title}`, 80)}`}</div>
	</div>);
};



class GitHubModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step             : 0,
			action           : (typeof props.match.params.action !== 'undefined') ? props.match.params.action : null,
			qsParams         : URLs.queryString(props.location.search),
			accessToken      : '',
			repos            : [],
			selectedRepo     : null,
			oauthToken       : null,
			authed           : false,
			error            : null,
			outro            : false,
			submitting       : false
		};
	}

	componentDidMount() {
// 		console.log('GitHubModal.componentDidMount()', this.props, this.state);

// 		const { action, qsParams, error } = this.state;
// 		if (Objects.hasKey(qsParams, 'error') && !error) {
// 			this.setState({ error : `${qsParams.error}\n${qsParams.error_description}` });
//
// 		} else {
// 			if (action === 'callback' && Objects.hasKey(qsParams, 'code')) {
// 				this.setState({ step : 1 });
// 				this.onFetchToken(qsParams.code, qsParams.state);
// 			}
// 		}
	}

	handleAuthRequest = (event)=> {
		console.log('GitHubModal.handleAuthRequest()', event);
// 		window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubCreds.clientID}&redirect_uri=${window.location.origin}/github-connect/callback&scope=repo&state=${DateTimes.epoch()}`;

		event.preventDefault();


		const { accessToken } = this.state;
		const octokit = new Octokit({
			auth : `token ${accessToken}`
		});

		octokit.repos.list().then((response) => {
// 			console.log(':::::::::::::::::', data, status, headers);

			const repos = response.data.filter((repo)=> (repo.permissions.push)).map((repo)=> ({
				id       : repo.id,
				fullName : repo.full_name,
				gitURL   : repo.git_url,
				name     : repo.name,
				nodeID   : repo.node_id,
				owner    : repo.owner,
				url      : repo.url
			}));

			this.setState({ repos,
				step : 1
			});
		});
	};

// 	handleAuthSubmitted = ()=> {
// 		console.log('GitHubModal.handleAuthSubmitted()');
// 		this.setState({
// 			step   : 1,
// 			authed : true
// 		});
// 	};


	handleCancel = (event)=> {
		event.preventDefault();
		this.setState({ outro : true });
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

	handleRepoSelected = (repo)=> {
		console.log('GitHubModal.handleRepoSelected()', repo);
		this.setState({ selectedRepo : repo });
	};

	handleSubmit = ()=> {
// 		console.log('GitHubModal.handleSubmit()');

		const { profile, deeplink } = this.props;
		const { repo, accessToken } = this.state;
		this.setState({ submitting : true }, ()=> {
			axios.post(API_ENDPT_URL, qs.stringify({
				action     : 'INTEGRATE_UPLOAD',
				user_id    : profile.id,
				upload_id  : deeplink.uploadID,
				repo_url   : repo.url,
				token      : accessToken
			})).then((response) => {
				console.log('INTEGRATE_UPLOAD', response.data);

				trackEvent('github', 'success');
				this.setState({ submitting : false });
				this.handleComplete(true);
			}).catch((error)=> {
			});
		});
	};

// 	onFetchToken = (code, state)=> {
// 		console.log('GitHubModal.onFetchToken()', code, state);
//
// 		const config = {
// 			headers : {
// 				'Content-Type' : 'multipart/form-data',
// 				'Accept'       : 'application/json'
// 			}
// 		};
//
// 		axios.post('https://github.com/login/oauth/access_token', qs.stringify({
// 			client_id     : githubCreds.clientID,
// 			client_secret : githubCreds.clientSecret,
// 			code          : code,
// 			redirect_uri  : `${window.location.origin}/github-connect/auth`,
// 			state         : state
// 		}), config).then((response) => {
// 			console.log('ACCESS_TOKEN', response.data);
//
//
// 		}).catch((error)=> {
// 		});
// 	};


	render() {
		console.log('GitHubModal.render()', this.props, this.state);

		const { step, accessToken, repos, outro } = this.state;
		const title = (step === 0) ? 'Connect to GitHub' : 'Choose A Repository';

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

						{(step === 0) && (<GitHubAuthForm
							accessToken={accessToken}
							onCancel={this.handleCancel}
							onChange={(event)=> this.setState({ accessToken : event.target.value })}
							onSubmit={this.handleAuthRequest}
						/>)}

						{(step === 1) && (<>
							<GitHubRepoList
								repos={repos}
								onClick={this.handleRepoSelected}
							/>
							<button className="adjacent-button" onClick={this.handleCancel}>Cancel</button>
						</>)}
					</div>
				</div>
			</BaseOverlay>);
	}
}

export default GitHubModal;
