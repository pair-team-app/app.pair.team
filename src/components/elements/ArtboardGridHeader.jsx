
import React, { Component } from 'react';
import './ArtboardGridHeader.css';

import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import { isUserLoggedIn, sendToSlack } from '../../utils/funcs';
import uploadIcon from '../../images/upload.png';


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


const LoggedInHeader = (props)=> {
// 	console.log('ArtboardGridHeader.LoggedInHeader()', props);

	return (<div className="artboard-grid-header-content-wrapper">
		<h3>Start a new Design Project</h3>
		<h4>Turn any Design File into an organized System of Fonts, Colors, Symbols, Views &amp; More.</h4>
		<div>
			<button onClick={()=> props.onPage('new')}>New Project</button>
		</div>
	</div>);
};

const LoggedOutHeader = (props)=> {
// 	console.log('ArtboardGridHeader.LoggedOutHeader()', props);

	return (<div className="artboard-grid-header-content-wrapper">
		<h3>Sign up or Login</h3>
		<h4>Start handing off &amp; understanding new Design Projects faster with your team.</h4>
		<div>
			<button className="adjacent-button" onClick={()=> props.onPage('register')}>Sign up</button>
			<button onClick={()=> props.onPage('login')}>Login</button>
		</div>
	</div>);
};


class ArtboardGridHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			profile : {
				id    : 0,
				email : ''
			}
		};
	}

	onDrop(files) {
		console.log('ArtboardGridHeader.onDrop()', files);

		const { id, email } = (this.props.profile) ? this.props.profile : this.state.profile;
		if (files.length > 0) {
			const file = files.pop();

			if (file.name.split('.').pop() === 'sketch') {
				if (file.size < 100 * (1024 * 1024)) {
					this.props.onFile(file);

				} else {
					sendToSlack('*[' + id + ']* *' + email + '* uploaded oversized file (' + Math.round(file.size * (1 / (1024 * 1024))) + 'MB) "_' + file.name + '_"');
					this.props.onPopup({
						type     : 'ERROR',
						content  : 'File size must be under 100MB.',
						duration : 500
					});
				}

			} else {
				sendToSlack('*[' + id + ']* *' + email + '* uploaded incompatible file "_' + file.name + '_"');
				this.props.onPopup({
					type     : 'ERROR',
					content  : (files[0].name.split('.').pop() === 'xd') ? 'Adobe XD Support Coming Soon!' : 'Only Sketch files are support at this time.',
					duration : 1500
				});
			}
		}
	}

	render() {
		console.log('ArtboardGridHeader.render()', this.props, this.state);

		const { percent } = this.state;
		const progressStyle = { width : percent + '%' };

		return (<div className="artboard-grid-header">
			<div className="artboard-grid-header-dz-wrapper">
				<div className="upload-progress-bar-wrapper">
					<div className="upload-progress-bar" style={progressStyle} />
				</div>
				<Dropzone className="artboard-grid-header-dz" onDrop={this.onDrop.bind(this)}>
					<div>
						<Row horizontal="center"><img className="artboard-grid-header-upload-icon" src={uploadIcon} alt="Upload" /></Row>
						<Row horizontal="center">Turn any Sketch file into an organized System of Fonts, Colors, Symbols, Views &amp; more. (Drag &amp; Drop)</Row>
					</div>
				</Dropzone>
			</div>

			{(isUserLoggedIn())
				? <LoggedInHeader onPage={this.props.onPage} />
				: <LoggedOutHeader onPage={this.props.onPage} />}
		</div>);
	}
}

export default connect(mapStateToProps)(ArtboardGridHeader);
