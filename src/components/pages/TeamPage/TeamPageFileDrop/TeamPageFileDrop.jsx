
import React, { Component } from 'react';
import './TeamPageFileDrop.css';

import FilepondPluginFilePoster from 'filepond-plugin-file-poster';
import FilepondPluginFileMetadata from 'filepond-plugin-file-metadata';
import FilepondPluginImageCrop from 'filepond-plugin-image-crop';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilepondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageTransform from 'filepond-plugin-image-transform';
import { connect } from 'react-redux';


class TeamPageFileDrop extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
	}

	render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		return (<div className="team-page-file-drop">
		</div>);
	}
}

const mapDispatchToProps = (dispatch)=> {
  return ({
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    darkThemed : state.darkThemed,
		devices    : state.devices,
		playground : state.playground,
		typeGroup  : state.typeGroup,
		component  : state.component,
		comment    : state.comment
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(TeamPageFileDrop);