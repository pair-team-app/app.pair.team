
import React, { Component } from 'react';
import './GitHubModal.css';

import axios from 'axios';
import { Strings, URIs } from 'lang-js-utils';
import Octokit from '@octokit/rest';
import cookie from 'react-cookies';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import { API_ENDPT_URL, DEFAULT_AVATAR } from '../../../consts/uris';
import { setRedirectURI, updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import { buildInspectorPath } from '../../../utils/funcs';


const GitHubAuthForm = (props)=> {
// 	console.log('GitHubModal.GitHubAuthForm()', props);

	const { accessToken } = props;
	return (<div className="github-modal-form github-auth-form">
		<div className="github-modal-form-instructions">
			Create a new GitHub access token with the <code>repo</code> and <code>user:email</code> OAuth scopes <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">here</a>. Then paste the token below to authorize.
		</div>
		<form onSubmit={props.onSubmit}>
			<div className="input-wrapper"><input type="text" autoComplete="off" name="accessToken" placeholder="Enter Personal Access Token" value={(accessToken || '')} onChange={props.onChange} /></div>
			<button disabled={(!accessToken || accessToken.length === 0)} type="submit" className="long-button" onClick={props.onSubmit}>Authorize</button>
		</form>
	</div>);
};

const GitHubRepoList = (props)=> {
// 	console.log('GitHubModal.GitHubRepoList()', props);

	const { repos, selectedRepo } = props;
	return (<div className="github-modal-form github-repo-list">
		<div className="github-modal-form-instructions">
			Choose a repository you want to integrate for pull requests.
		</div>

		<div className="github-repo-list-items-wrapper">
			{repos.map((repo, i)=> (
				<GitHubRepoListItem
					key={i}
					repo={repo}
					title={repo.fullName}
					selected={(selectedRepo && repo.id === selectedRepo.id)}
					onClick={()=> props.onRepoClick(repo)}
				/>
			))}
		</div>
		<button disabled={!selectedRepo} className="long-button" onClick={()=> props.onSubmit()}>Integrate</button>
	</div>);
};

const GitHubRepoListItem = (props)=> {
// 	console.log('GitHubModal.GitHubRepoListItem()', props);

	const { title, selected } = props;
	return (<div className={`github-repo-list-item${(selected) ? ' github-repo-list-item-selected' : ''}`} onClick={props.onClick}>
		<div className="github-repo-list-item-title">{`${Strings.truncate(`${title}`, 80)}`}</div>
	</div>);
};


class GitHubModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step         : 0,
			username     : null,
			avatar       : DEFAULT_AVATAR,
			email        : null,
			accessToken  : null,
			repos        : [],
			selectedRepo : null,
			error        : null,
			outro        : false,
			submitting   : false
		};
	}

	componentDidMount() {
// 		console.log('GitHubModal.componentDidMount()', this.props, this.state);
	}

	handleAuthRequest = (event)=> {
		console.log('GitHubModal.handleAuthRequest()', event);
		event.preventDefault();

		trackEvent('button', 'authorize');

		const { accessToken } = this.state;
		const octokit = new Octokit({
			auth : `token ${accessToken}`
		});

		octokit.users.getAuthenticated().then((response)=> {
// 			console.log(':::::::::::::::::', response);
			const { login, avatar_url, email } = response.data;

			octokit.repos.list({ per_page : 10 }).then((response)=> {
				//console.log(':::::::::::::::::', response);
				const repos = response.data.filter((repo)=> (repo.permissions.push)).map((repo)=> ({
					id       : repo.id,
					fullName : repo.full_name,
					gitURL   : repo.git_url,
					name     : repo.name,
					nodeID   : repo.node_id,
					owner    : repo.owner,
					url      : repo.url
				}));

				this.setState({ email, repos,
					step     : 1,
					username : login,
					avatar   : avatar_url
				});
			});
		});
	};

	handleCancel = (event)=> {
		event.preventDefault();
		this.setState({ outro : true });
	};

	handleComplete = (submitted)=> {
// 		console.log('GitHubModal.handleComplete()', submitted);

		this.setState({ outro : false }, ()=> {
			if (submitted) {
				this.props.onSubmitted();

			} else {
				this.props.onComplete();
			}
		});
	};

	handleRepoSelected = (repo)=> {
// 		console.log('GitHubModal.handleRepoSelected()', repo);

		const { selectedRepo } = this.state;
		this.setState({ selectedRepo : (!selectedRepo || selectedRepo.id !== repo.id) ? repo : null });
	};

	handleSubmit = ()=> {
// 		console.log('GitHubModal.handleSubmit()');

		const { username, email, avatar, selectedRepo, accessToken } = this.state;
		this.setState({
			step       : 2,
			submitting : true
		}, ()=> {
			axios.post(API_ENDPT_URL, {
				action  : 'GITHUB_REGISTER',
				payload : { username, email,
					access_token : accessToken,
					filename     : avatar,
					repo_name    : selectedRepo.fullName,
					repo_url     : selectedRepo.url,
					invite_id    : (this.props.invite) ? this.props.invite.id : 0
				}
			}).then((response) => {
				console.log('GITHUB_REGISTER', response.data);
				const status = parseInt(response.data.status, 16);

				if (status === 0x11) {
					const { user } = response.data;
					trackEvent('github', 'success');
					this.setState({ submitting : false }, ()=> {
						this.onRegistered(user);
					});
				}

			}).catch((error)=> {
			});
		});
	};

	onRegistered = (user)=> {
		console.log('GitHubModal.onRegistered()', user);
		cookie.save('user_id', user.id, { path : '/' });
		this.props.updateUserProfile(user);

		const { redirectURI } = this.props;
		const { upload } = this.state;

		this.handleComplete(true);
		this.props.onSubmitted(true);

		if (redirectURI && upload) {
			this.props.updateDeeplink({ uploadID : upload.id });
			this.props.onPage(redirectURI);
		}
	};


	render() {
		console.log('GitHubModal.render()', this.props, this.state);

		const { step, accessToken, repos, selectedRepo, outro } = this.state;
		const title = (step === 0) ? 'Connect with GitHub' : (step === 1) ? 'Available Repositories' : 'Registering Account';

		return (
			<BaseOverlay
				tracking={`github/${URIs.firstComponent()}`}
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
						{(step === 0) && (<GitHubAuthForm
							accessToken={accessToken}
							onCancel={this.handleCancel}
							onChange={(event)=> this.setState({ accessToken : event.target.value })}
							onSubmit={this.handleAuthRequest}
						/>)}

						{(step === 1) && (<>
							<GitHubRepoList
								repos={repos}
								selectedRepo={selectedRepo}
								onRepoClick={this.handleRepoSelected}
								onSubmit={this.handleSubmit}
							/>
						</>)}
					</div>
				</div>
			</BaseOverlay>);
	}
}

const mapDispatchToProps = (dispatch)=> {
	return ({
		setRedirectURI    : (url)=> dispatch(setRedirectURI(url)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});

};

const mapStateToProps = (state, ownProps)=> {
	return ({
		invite      : state.invite,
		redirectURI : state.redirectURI
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(GitHubModal);
