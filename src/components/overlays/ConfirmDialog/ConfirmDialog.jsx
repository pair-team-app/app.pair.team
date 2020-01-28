
import React, { Component } from 'react';
import './ConfirmDialog.css'

import BaseOverlay from '../BaseOverlay';
import pairLogo from '../../../assets/images/logos/logo-pairurl-310.png';

class ConfirmDialog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ok    : false,
			outro : false
		};
	}

  componentDidUpdate(prevProps, prevState, snapshot) {
 console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, this.state);
// 		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps : prevProps.outro, props : this.props.outro });
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
		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { tracking, buttons, closeable, filled, title, children } = this.props;
		const { outro } = this.state;

		return (<BaseOverlay
			tracking={tracking}
			outro={outro}
			filled={filled}
			closeable={closeable}
			title={title}
			onComplete={this.handleComplete}>
			<div className="confirm-dialog">
				<div className="base-overlay-header-wrapper">
          <img className="base-overlay-header-logo" src={pairLogo} alt="Logo" />
        </div>
				<div className="confirm-dialog-content">
					{children}
					{(buttons && buttons.length > 0) && (<div className="confirm-dialog-footer-wrapper">
						<button onClick={()=> this.handleClick(true)}>{(buttons) ? buttons[0] : 'OK'}</button>
						<div className="base-overlay-footer-wrapper form-disclaimer">
							<div onClick={()=> this.handleClick(false)}>Logout</div>
						</div>
					</div>)}
				</div>
			</div>
		</BaseOverlay>);
	}
}

export default (ConfirmDialog);
