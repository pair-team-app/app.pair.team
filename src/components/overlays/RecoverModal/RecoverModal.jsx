
import React, { Component } from 'react';
import './RecoverModal.css';

import { NavLink } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import RecoverForm from '../../forms/RecoverForm';
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
					<div className="form-wrapper">
						<RecoverForm onSubmitted={(event)=> { event.preventDefault(); this.handleComplete(); }} />
					</div>

					<div className="footer-wrapper form-disclaimer">
						<NavLink to="#" onClick={()=> this.handleModal(Modals.REGISTER)}>Don't have an account? Sign Up</NavLink>
						<NavLink to="#" onClick={()=> this.handleModal(Modals.LOGIN)}>Already have an Account? Login</NavLink>
					</div>
				</div>
			</BaseOverlay>);
	}
}


export default (RecoverModal);
