
import React, { Component } from 'react';
import './HomeExpo.css';

import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import { sendToSlack } from '../../utils/funcs';
import uploadIcon from "../../images/upload.png";


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


class HomeExpo extends Component {
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
		console.log('HomeExpo.onDrop()', files);

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
		console.log('HomeExpo.render()', this.props, this.state);

		const { percent } = this.state;
		const progressStyle = { width : percent + '%' };

		return (
			<div className="home-expo">
				<div className="upload-progress-bar-wrapper">
					<div className="upload-progress-bar" style={progressStyle} />
				</div>
				<Dropzone className="home-expo-dz-wrapper" onDrop={this.onDrop.bind(this)}>
					<div>
						<Row horizontal="center"><img className="home-expo-upload-icon" src={uploadIcon} alt="Upload" /></Row>
						<Row horizontal="center">Drag &amp; Upload to turn any sketch file into an organized system of fonts, colors, symbols, views, and more.</Row>
					</div>
				</Dropzone>
			</div>
		);
	}
}

export default connect(mapStateToProps)(HomeExpo);
