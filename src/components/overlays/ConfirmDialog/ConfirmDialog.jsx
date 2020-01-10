
import React, { Component } from 'react';
import './ConfirmDialog.css'

import BaseOverlay from '../BaseOverlay';


class ConfirmDialog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ok    : false,
			outro : false
		};
	}

	handleClick = (ok)=> {
// 		console.log('%s.handleClick()', this.constructor.name, ok);

		this.setState({ ok,
			outro : true
		});
	};

	handleComplete = ()=> {
// 		console.log('%s.handleComplete()', this.constructor.name);

		const { onConfirmed, onComplete } = this.props;
		const { ok } = this.state;
		if (ok && onConfirmed) {
			onConfirmed();
		}

		if (onComplete) {
      onComplete(ok);
    }
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { tracking, buttons, blocking, title, children } = this.props;
		const { outro } = this.state;

		return (<BaseOverlay
			tracking={tracking}
			outro={outro}
			closeable={!blocking}
			title={title}
			onComplete={this.handleComplete}>
			<div className="confirm-dialog">
				<div className="confirm-dialog-content">
					{children}
					<div className="button-wrapper-col confirm-dialog-button-wrapper">
						<button className="quiet-button" onClick={()=> this.handleClick(false)}>{(buttons) ? buttons[0] : 'Cancel'}</button>
						<button onClick={()=> this.handleClick(true)}>{(buttons) ? buttons[1] : 'OK'}</button>
					</div>
				</div>
			</div>
		</BaseOverlay>);
	}
}

export default (ConfirmDialog);
