
import React, { Component } from 'react';
import './TeamPageFileDrop.css';

import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import TextareaAutosize from 'react-autosize-textarea';
import { FilePond, registerPlugin } from 'react-filepond';
import { connect } from 'react-redux';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import './post-styles.css';

import { CDN_UPLOAD_URL } from '../../../../consts/uris';
import btnClear from '../../../../assets/images/ui/btn-clear.svg';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

class TeamPageFileDrop extends Component {
	constructor(props) {
		super(props);

		this.state = {
      content : {
        text  : '',
        image : null,
      },
      loading : false,
      url     : false,
      code    : false,
      files   : []
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
    const { content, files } = this.state;

		return (<div className="team-page-file-drop" data-hidden={(hidden && files.length === 0)}>
      <AddContentCloseButton onCloseClick={this.handleFilesCleared} />
      <div>
        <TeamPageAddContent files={files} content={content} onSubmit={this.handleSubmit} />
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
          files={files}
          className="file-pond-wrapper"
          allowMultiple={true}
          maxFiles={3}
          allowReorder={false}
          allowReplace={true}
          allowRevert={true}
          // appendTo={filePondAttach}
          itemInsertLocation="after"
          instantUpload={true}
          labelIdle=""
          // iconRemove={null}
          labelFileProcessingComplete=""
          labelTapToUndo=""
          oninit={this.handleInit}
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


const AddContentCloseButton = (props)=> {
  console.log('AddContentCloseButton()', props);

  return (<button className="quiet-button glyph-button" onClick={props.onCloseClick}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#EAEAEA"/>
      <rect x="9.63623" y="11.0503" width="2" height="16" transform="rotate(-45 9.63623 11.0503)" fill="white"/>
      <rect x="20.9502" y="9.63599" width="2" height="16" transform="rotate(45 20.9502 9.63599)" fill="white"/>
    </svg>
  </button>);
};


const TeamPageAddContent = (props)=> {
  console.log('TeamPageAddContent()', props);

  const { files, content } = props;
  const { text, url, image, code } = content;

  return (<div className="team-page-add-content"><form>
    <div className="content-wrapper">
      {(url || image) && (<div className="rich-content">
        {(image) && (<div className="image-wrapper"><img src={image} alt="" /></div>)}
      </div>)}
      <TextareaAutosize className="comment-txt" placeholder={`Add a comment to this${(url) ? ' url' : (image || files.length > 0) ? ' image' : ''}…`} value={text} onChange={props.onTextChange} data-code={code} />
    </div>
    <button type="submit" disabled={files.length === 0} onClick={props.onSubmit}>Submit</button>
  </form></div>);
};

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