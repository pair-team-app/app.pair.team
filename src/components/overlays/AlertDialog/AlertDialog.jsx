
import React, { Component } from 'react';
import './AlertDialog.css'

import BaseOverlay from '../BaseOverlay';


class AlertDialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		}
	}

	handleClose = (event)=> {
// 		console.log('%s.handleClick()', this.constructor.name);
		event.preventDefault();
		this.setState({ outro : true });
	};

	render() {
		const { tracking, title, children } = this.props;
		const { outro } = this.state;

		return (<BaseOverlay
			tracking={tracking}
			outro={outro}
			closeable={true}
			filled={true}
			title={title}
			onComplete={this.props.onComplete}>
			<div className="alert-dialog">
				<div className="alert-dialog-content">{children}</div>
				<div className="alert-dialog-button-wrapper">
					<button onClick={this.handleClose}>OK</button>
				</div>
			</div>
		</BaseOverlay>);
	}
}


export default (AlertDialog);
