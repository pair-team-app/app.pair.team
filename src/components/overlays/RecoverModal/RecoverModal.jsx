
import React, { Component } from 'react';
import './RecoverModal.css';

import { goBack } from 'connected-react-router';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import RecoverForm from '../../forms/RecoverForm';
import PageNavLink from '../../iterables/PageNavLink';
import { Modals, TERMS_PAGE } from '../../../consts/uris';


class RecoverModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro     : false,
			outroURI  : Modals.LOGIN,
			submitted : false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

	handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name);

		const { outroURI } = this.state;
		this.setState({ outro : false }, ()=> {
			this.props.onComplete();

			if (outroURI) {
				this.props.onModal(outroURI, true, false);
			}
		});
	};

	handleModal = (event, uri)=> {
		console.log('%s.handleModal()', this.constructor.name, { event, uri });
		this.setState({
			outro    : true,
			outroURI : uri
		});
	};

	handleSubmitted = (event)=> {
		console.log('%s.handleSubmitted()', this.constructor.name);

		// event.preventDefault();
		this.setState({ submitted : true });
	};

	handleResend = (event)=> {
		console.log('%s.handleResend()', this.constructor.name);

		this.setState({ submitted : false });
	}

	render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { outro, submitted } = this.state;
		return (
			<BaseOverlay
				tracking={Modals.RECOVER}
				outro={outro}
				filled={true}
				closeable={false}
				title="Forgot Password"
				delay={125}
				onComplete={this.handleComplete}>
					<div className="recover-modal">
						<div className="link-wrapper">
							<span>Looking for <PageNavLink to={Modals.REGISTER} onClick={this.handleModal}>Sign Up</PageNavLink> or <PageNavLink to={Modals.LOGIN} onClick={this.handleModal}>Login</PageNavLink>?</span>
						</div>

						<div className="form-wrapper">
							<RecoverForm submitted={submitted} onCancel={this.props.goBack} onSubmitted={this.handleSubmitted} onResend={this.handleResend} />
						</div>
						<div className="footer-wrapper form-disclaimer">
							<PageNavLink to={TERMS_PAGE} target="_blank">Terms of Service</PageNavLink>
							<div className="status" data-submitted={submitted}>Email sent.</div>
						</div>
					</div>
			</BaseOverlay>);
	}
}

export default connect(null, { goBack })(RecoverModal);
