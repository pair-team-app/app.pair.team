
import React, { Component } from 'react';
import './ConfirmDialog.css'

import ContentModal from './ContentModal';
import { URLs } from '../../../utils/lang';


class ConfirmDialog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ok    : false,
			outro : false
		};

		this.wrapper = null;
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

		return (
			<div className="confirm-dialog-wrapper" ref={(element)=> { this.wrapper = element; }}>
				<ContentModal
					tracking={`${tracking}/${URLs.firstComponent()}`}
					outro={outro}
					closeable={true}
					title={title}
					onComplete={this.handleComplete}>
					{message}
					<div className="content-modal-button-wrapper confirm-dialog-button-wrapper">
						<button className="content-modal-button aux-button adjacent-button" onClick={()=> this.handleClick(false)}>Cancel</button>
						<button className="content-modal-button" onClick={()=> this.handleClick(true)}>OK</button>
					</div>
				</ContentModal>
			</div>
		);
	}
}

export default ConfirmDialog;
