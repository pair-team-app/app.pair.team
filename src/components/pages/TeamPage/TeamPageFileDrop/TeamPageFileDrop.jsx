
import React, { Component } from 'react';
import './TeamPageFileDrop.css';

import FilepondPluginFilePoster from 'filepond-plugin-file-poster';
import FilepondPluginFileMetadata from 'filepond-plugin-file-metadata';
import FilepondPluginImageCrop from 'filepond-plugin-image-crop';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilepondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageTransform from 'filepond-plugin-image-transform';
import { FilePond, registerPlugin } from 'react-filepond';
import { connect } from 'react-redux';

import { CDN_UPLOAD_URL } from '../../../../consts/uris';
import { trackEvent } from '../../../../utils/tracking';
import btnClear from '../../../../assets/images/ui/btn-clear.svg';
import btnCode from '../../../../assets/images/ui/btn-code.svg';


// import 'filepond/dist/filepond.min.css';
// import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css'


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

    registerPlugin(FilepondPluginFileMetadata, FilepondPluginFilePoster, FilepondPluginImageCrop, FilepondPluginImageEdit, FilepondPluginImageExifOrientation, FilepondPluginImagePreview, FilepondPluginImageTransform);
  }

	componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }


  handleInit() {
    console.log('FilePond instance has initialised', this.pond);
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
    this.setState({ files : fileItems.map(({ file })=> (file)) });
  }

  /* handleFilePond = ()=> {
    console.log('%s.()', this.constructor.name, { ,  });
  }; */



	render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });


    const { team, profile } = this.props;
		return (<div className="team-page-file-drop">
      <div>
        <FilePond
          server={{
            url : `${CDN_UPLOAD_URL}/${profile.id}/${team.id}`,
            process: (fieldName, file, metadata, load) => {
              console.log('%s.server.process(fieldName, file, metadata, load)', this.constructor.name, { fieldName, file, metadata, load, url : `${CDN_UPLOAD_URL}/${profile.id}/${team.id}` });

              // simulates uploading a file
              setTimeout(() => {
                  load(Date.now())
              }, 1500);

              /*
              url : './process',
              method: 'POST',

              headers: { 'Content-Type' : 'application/json', },
              */
          },
          load: (source, load) => {
            console.log('%s.server.load(source, load)', this.constructor.name, { source, load });

              // simulates loading a file from the server
              fetch(source).then(res => res.blob()).then(load);
          }
          }}
          // ref={ref => (this.pond = ref)}
          files={this.state.files}
          className="file-pond-wrapper"
          allowMultiple={true}
          maxFiles={3}
          // allowImagePreview={true}
          // allowBrowse={true}
          // allowDrop={true}
          allowPaste={true}
          // allowReorder={false}
          // allowReplace={true}
          // allowRevert={true}
          // appendTo={filePondAttach}
          // itemInsertLocation="after"
          instantUpload={true}
          labelIdle=""
          iconRemove={btnClear}
          labelFileProcessingComplete="Add comment to this…"
          labelTapToUndo=""
          //oninit={this.handleInit}
          onwarning={this.handleFileWarning}
          onerror={this.handleFileError}
          oninitfile={this.handleFileInit}
          onaddfile={this.handleFileAdd}
          onaddfileprogress={this.handleFileProgress}
          onprocessfilestart={this.handleFileProcessStart}
          onprocessfileprogress={this.handleFileProcessProgress}
          onprocessfile={this.handleProcessedFile}
          onprocessfiles={this.handleProcessedFiles}
          onremovefile={this.handleFileRemoved}
          onupdatefiles={this.handleFilesUpdated}

          // onupdatefiles={(fileItems)=> {
          //   console.log('%s.onupdatefiles()', this.constructor.name, { fileItems });
          //   this.setState({ files: fileItems.map(fileItem => fileItem.file) });
          // }}
        />
        </div>
		</div>);
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