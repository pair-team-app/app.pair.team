
import React, { Component } from 'react';
import './RecoverModal.css';

import { goBack } from 'connected-react-router';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import RecoverForm from '../../forms/RecoverForm';
import PageNavLink from '../../iterables/PageNavLink';
import { Modals } from '../../../consts/uris';


class RecoverModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro    : false,
			outroURI : Modals.LOGIN
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
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

	handleModal = (uri)=> {
		console.log('%s.handleModal()', this.constructor.name, { uri });
		this.setState({
			outro    : true,
			outroURI : uri
		});
	};


	render() {
// console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={Modals.RECOVER}
				outro={outro}
				filled={true}
				closeable={false}
				delay={125}
				onComplete={this.handleComplete}>

				<div className="recover-modal">
          <div className="link-wrapper">
						<span>Looking for <PageNavLink to={Modals.REGISTER} onClick={this.handleModal}>Sign Up</PageNavLink> or <PageNavLink to={Modals.LOGIN} onClick={this.handleModal}>Login</PageNavLink>?</span>
					</div>

					<div className="form-wrapper">
						<RecoverForm onCancel={this.props.goBack} onSubmitted={(event)=> { event.preventDefault(); this.handleComplete(); }} />
					</div>
				</div>
			</BaseOverlay>);
	}
}

export default connect(null, { goBack })(RecoverModal);
