import React, { Component } from 'react';
import './UploadHeader.css';

import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import { sendToSlack } from '../../utils/funcs';
import uploadIcon from '../../images/icons/ico-upload.png';


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


class UploadHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			profile : {
				id       : 0,
				username : ''
			}
		};
	}

	onDrop = (files)=> {
		console.log('UploadHeader.onDrop()', files);

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
					content  : (file.name.split('.').pop() === 'xd') ? 'Adobe XD Support Coming Soon!' : 'Only Sketch files are support at this time.',
					duration : 1500
				});
			}
		}
	};

	render() {
		console.log('UploadHeader.render()', this.props, this.state);

		//const title = 'Turn any Sketch file into an organized System of Fonts, Colors, Symbols, Views & more. (Drag & Drop)';
		const { title } = this.props;

		return (<div className="upload-header-wrapper">
			<Dropzone className="upload-header-dz" onDrop={this.onDrop.bind(this)}>
				<div>
					<Row horizontal="center"><img className="upload-header-upload-icon" src={uploadIcon} alt="Upload" /></Row>
					<Row horizontal="center">{title}</Row>
				</div>
			</Dropzone>
		</div>);
	}
}

export default connect(mapStateToProps)(UploadHeader);
