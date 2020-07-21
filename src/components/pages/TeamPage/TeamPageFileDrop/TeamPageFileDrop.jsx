
import React, { Component } from 'react';
import './TeamPageFileDrop.css';

import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import { FilePond, registerPlugin } from 'react-filepond';
import { connect } from 'react-redux';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import './post-styles.css';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

class TeamPageFileDrop extends Component {
	constructor(props) {
		super(props);

		this.state = {
      commentContent : '',
      loading        : false,
      codeComment    : false,
      richComment    : false,
      imageComment   : null,
      imageComment    : null,
      url             : null,
      files          : []
		};
	}

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }

	componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }


  handleInit() {
    console.log('FilePond instance has initialised');
  };

  handleClearComment = (event)=> {
    console.log('%s.handleClearComment()', this.constructor.name, { event });
    this.setState({
      commentContent : '',
      loading        : false,
      richComment    : false,
      imageComment   : null
    });
  };

  handleCode = (event)=> {
    console.log('%s.handleCode()', this.constructor.name, { event });
    this.setState({ codeComment : !this.state.codeComment });

  };

  handleFilesCleared = (event)=> {
    console.log('%s.handleFilesCleared(event)', this.constructor.name, { event });
    this.setState({ files : [] });
  }

  handleFileInit = (file)=> {
    console.log('%s.handleFileInit(file)', this.constructor.name, { file });
  };


  // processes the first file
  handleFileAdd = (file)=> {
    console.log('%s.handleFileAdd(file)', this.constructor.name, { file });
    // File has been processed
  };

  handleFileProgress = (file, progress)=> {
    console.log('%s.handleFileProgress(file, progress)', this.constructor.name, { file, progress });
  };

  handleFileProcessStart = (file)=> {
    console.log('%s.handleFileProcessStart(file)', this.constructor.name, { file });
  };

  handleFileProcessProgress = (file, progress)=> {
    console.log('%s.handleFileProcessProgress(file, progress)', this.constructor.name, { file, progress });
  };

  handleProcessedFile = (error, file)=> {
    console.log('%s.handleProcessedFile(error, output)', this.constructor.name, { error, file });
  };

  handleProcessedFiles = ()=> {
    console.log('%shandleProcessedFiles()', this.constructor.name, {  });
  };

  handleFileRemoved = (error, output)=> {
    console.log('%s.handleFileRemoved(error, output)', this.constructor.name, { error, output });
  };

  // // processes the first file
  handleFileWarning = (error, file, status)=> {
    console.log('%s.handleFileWarning(error, file, status)', this.constructor.name, { error, file, status });
    // File has been processed
  };

  // processes the first file
  handleFileError = (error, file, status) => {
    console.log('%s.handleFileError(error, file, status)', this.constructor.name, { error, file, status });
    // File has been processed
  };

  handleFilesUpdated = (fileItems)=> {
    console.log('%s.handleFilesUpdated(fileItems)', this.constructor.name, { fileItems });
    this.setState({ files : fileItems.map(({ file })=> (file)) }, ()=> {
      this.props.onClose();
    });
  }

  /* handleFilePond = ()=> {
    console.log('%s.()', this.constructor.name, { ,  });
  }; */





	render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state, files : this.state.files.length });


    const { team, profile, hidden } = this.props;
    const { files } = this.state;

		return (<div className="team-page-file-drop" data-hidden={(hidden && files.length === 0)}><div onClick={this.handleFilesCleared}>
      <FilePond
        files={files}
        allowMultiple={true}
        allowImagePreview={true}
        onupdatefiles={this.handleFilesUpdated}
        labelIdle={(files.length === 0) ? 'Drag &amp; Drop your files or <span class="filepond--label-action">Browse</span>' : ''}
      />
    </div></div>);
	}
}

const mapDispatchToProps = (dispatch)=> {
  return ({
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    profile : state.user.profile,
    team    : state.teams.team
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(TeamPageFileDrop);