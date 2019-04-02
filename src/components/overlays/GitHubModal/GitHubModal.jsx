
import React, { Component } from 'react';
import './GitHubModal.css';

import axios from 'axios';
import qs from 'qs';
import { Column, Row } from 'simple-flexbox';

import BaseOverlay from '../BaseOverlay';
import { API_ENDPT_URL } from './../../../consts/uris';
import { URLs } from './../../../utils/lang';
import { trackEvent } from './../../../utils/tracking';



const GitHubAuthForm = (props)=> {
	console.log('GitHubModal.GitHubAuthForm()', props);

	return (<div className="github-form">

	</div>);
};



class GitHubModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step       : 0,
			oauthToken : null,
			repoURL    : null,
			authed     : false,
			outro      : false,
			submitting : false
		};
	}

	componentDidMount() {
// 		console.log('GitHubModal.componentDidMount()', this.props, this.state);

// 		const { profile } = this.props;
// 		this.setState({ sources, devs });
	}

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

	handleAuth = ()=> {
		console.log('GitHubModal.handleAuth()');

		this.setState({ authed : true });
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

	render() {
// 		console.log('GitHubModal.render()', this.props, this.state);

		const { step, outro } = this.state;
		const title = (step === 0) ? 'Login To GitHub' : 'Choose Yer Repo';

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


					</div>
				</div>
			</BaseOverlay>);
	}
}

export default GitHubModal;
