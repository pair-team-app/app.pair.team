
import React, { Component } from 'react';
import './ConfirmDialog.css'

import { URIs } from 'lang-js-utils';

import BaseOverlay from '../BaseOverlay';


class ConfirmDialog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ok    : false,
			outro : false
		};
	}

	componentDidMount() {
// 		console.log('ConfirmDialog.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('ConfirmDialog.componentDidUpdate()', prevProps, this.props, prevState, this.state, snapshot);
	}


	handleClick = (ok)=> {
// 		console.log('ConfirmDialog.handleClick()', ok);

		this.setState({ ok,
			outro : true
		});
	};

	handleComplete = ()=> {
// 		console.log('ConfirmDialog.handleComplete()');

		const { ok } = this.state;
		this.props.onComplete(ok);
	};


	render() {
// 		console.log('ConfirmDialog.render()', this.props, this.state);

		const { tracking, title, message } = this.props;
		const { outro } = this.state;

		return (<BaseOverlay
			tracking={`${tracking}/${URIs.firstComponent()}`}
			outro={outro}
			closeable={true}
			title={title}
			onComplete={this.handleComplete}>
			<div className="confirm-dialog-content">
				{message}
				<div className="base-overlay-button-wrapper confirm-dialog-button-wrapper">
					<button className="base-overlay-button confirm-dialog-aux-button adjacent-button" onClick={()=> this.handleClick(false)}>Cancel</button>
					<button className="base-overlay-button" onClick={()=> this.handleClick(true)}>OK</button>
				</div>
			</div>
		</BaseOverlay>);
	}
}

export default ConfirmDialog;
