
import React, { Component } from 'react';
import './TeamPageFileDrop.css';

import axios from 'axios';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { URIs } from 'lang-js-utils';
import TextareaAutosize from 'react-autosize-textarea';
import { FilePond, registerPlugin } from 'react-filepond';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';

import { CodeFormAccessory, FormAccessoryAlignment } from '../../../forms/FormAccessories';
import { ENTER_KEY } from '../../../../consts/key-codes';
import { API_ENDPT_URL, CDN_FILEPOND_URL } from '../../../../consts/uris';
import { createComment, makeComment } from '../../../../redux/actions';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import './post-styles.css';


registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);


class TeamPageFileDrop extends Component {
	constructor(props) {
		super(props);

		this.state = {
      text     : '',
      image    : null,
      loading  : false,
      uploaded : false,
      url      : false,
      code     : false,
      intro    : true,
      files    : []
    };

    this.commentInput = React.createRef();
  }

  dataURIFile = (dataURI, filename)=> {
    console.log('%s.dataURIFile()', this.constructor.name, {dataURI, filename });

    fetch(dataURI).then((res)=>(res.arrayBuffer())).then((res)=> {
      const file = new File([res], filename, { type : 'image/png' });
      this.setState({ files : [ ...this.state.files, file] });
    });
  };

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }

	componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { preComment, pathname, hash } = this.props;
    const { text, url, files, image } = this.state;

    if (preComment) {
      const isURL = /https?:\/\//i.test(preComment);

      if (preComment !== prevProps.preComment && preComment !== ' ') {
        this.commentInput.focus();

        if (files.length > 0 || image !== null) {
          this.props.onContent();
        }

        if (isURL !== url) {
          this.setState({ url : isURL }, ()=> {
            if (isURL) {
              this.onFetchScreenshot(preComment);
            }
          });
        }
      }

    } else {
      if (prevProps.preComment) {
        this.handleResetContent();
      }
    }

    /*
    if (preComment && !prevProps.preComment) {
      this.commentInput.focus();

      if (/https?:\/\//i.test(preComment)) {
        this.setState({ url : true });
        this.onFetchScreenshot(preComment);
      }

    } else if (preComment && prevProps.preComment) {
      if (text !== preComment) {
        this.setState({ text : preComment });
      }
    }

    if (!preComment && prevProps.preComment) {
      this.setState({ text : '' });

    } else {
      // if (preComment && text !== preComment) {
      //   this.setState({ text : preComment });
      // }
    }
    */
  }

  componentWillUnmount() {
    console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });

    this.commentInput = null;
  }


  handleInit() {
    console.log('FilePond instance has initialised');
  };

  handleCode = (event)=> {
    // console.log('%s.handleCode()', this.constructor.name, { event });
    this.setState({ code : !this.state.code });
  };

  handleResetContent = (event)=> {
    console.log('%s.handleResetContent(event)', this.constructor.name, { event });
    this.setState({
      text     : '',
      image    : null,
      loading  : false,
      uploaded : false,
      url      : false,
      code     : false,
      intro    : true,
      files    : []
    }, ()=> {
      this.props.createComment(null);
      this.props.onClose();
    });
  }

  handleFileInit = (file)=> {
    console.log('%s.handleFileInit(file)', this.constructor.name, { file });
    // this.props.createComment('≈');
  };


  // processes the first file
  handleFileAdd = (error, file)=> {
    console.log('%s.handleFileAdd(file)', this.constructor.name, { error, file });
    // File has been processed
  };

  handleFileProgress = (file, progress)=> {
    console.log('%s.handleFileProgress(file, progress)', this.constructor.name, { file, progress });
  };

  handleFileProcessStart = (file)=> {
    console.log('%s.handleFileProcessStart(file)', this.constructor.name, { file });
    this.setState({
      loading  : true,
      uploaded : false
    }, ()=> {
        this.props.onContent();
    });
  };

  handleFileProcessProgress = (file, progress)=> {
    console.log('%s.handleFileProcessProgress(file, progress)', this.constructor.name, { file, progress });
  };

  handleProcessedFile = (error, file)=> {
    console.log('%s.handleProcessedFile(error, output)', this.constructor.name, { error, file });
    this.setState({
      loading  : false,
      uploaded : true
    });
  };

  handleProcessedFiles = ()=> {
    console.log('%s.handleProcessedFiles()', this.constructor.name);
  };

  handleFileRemoved = (error, output)=> {
    console.log('%s.handleFileRemoved(error, output)', this.constructor.name, { error, output });
    this.handleResetContent();
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
      // this.props.onClose();
    });
  }


  /* handleFilePond = ()=> {
    console.log('%s.()', this.constructor.name, { ,  });
  }; */


  handleFieldFocus = (event)=> {
    console.log('%s.handleFieldFocus(event)', this.constructor.name, { event : event.target.value, props : this.props, state : this.state });

    // const { preComment } = this.props;
    const { intro } = this.state;
    const { target } = event;

    if (intro) {
      this.setState({
        intro : false,
        text  : target.value
      });
    }


  };

  handleKeyPress = (event, key)=> {
    console.log('%s.handleKeyPress(event, key)_____', this.constructor.name, { event, key });

    const { preComment } = this.props;
    const { files } = this.state;
    const { keyCode, target } = event;

    if (key === 'esc') {
      this.handleResetContent();

    } else if ((key === 'meta' || key === 'ctrl') && keyCode === ENTER_KEY) {
      if (preComment.length > 0 || files.length > 0) {
        target.blur();
        this.handleSubmit();
      }
    }
  };

  handleTextChange = (event)=> {
    console.log('%s.handleTextChange(event)', this.constructor.name, { event : event.target.value, props : this.props, state : this.state });

    const { preComment } = this.props;
    const { intro, text } = this.state;
    const { target } = event;

    if (!intro) {
      this.props.createComment(target.value);
    }
  }

  handleSubmit = (event=null)=> {
    console.log('%s.handleSubmit(event)', this.constructor.name, { event });

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const { preComment, comment } = this.props;
    const { image, code } = this.state;
    this.props.makeComment({ image,
      comment  : comment,
			content  : preComment,
      position : (comment) ? comment.position : null,
      format   : (code) ? 'code' : 'text'
    });

    this.handleResetContent();
  };

  onFetchScreenshot = (text)=> {
    console.log('%s.onFetchScreenshot(text)', this.constructor.name, { text });

    const url = text.match(/https?:\/\/.+ ?/i).shift().split(' ').shift();
    axios.post(API_ENDPT_URL, {
      action  : 'SCREENSHOT_URL',
      payload : { url }
    }).then((response)=> {
      const { image } = response.data;
      console.log('SCREENSHOT_URL', { data : response.data });
      this.setState({
        image : image.cdn
      }, ()=> {
        this.dataURIFile(image.data, URIs.lastComponent(image.src));
      });
    });
  };


	render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { dragging, preComment } = this.props;
    const { url, code, uploaded, image, files, text, focused } = this.state;

    // const cdnHeaders = {
    //   'Content-Type' : 'multipart/form-data',
    //   'Accept'       : 'application/json'
    // };

		return (<div className="team-page-file-drop" data-dragging={(dragging)} data-latent={(!dragging && files.length === 0 && !preComment)}>
      <div>

        <div className="input-wrapper" data-hidden={(files.length === 0 && preComment === null)}>
          {/* <KeyboardEventHandler isDisabled={(files.length === 0 && preComment === null)} handleFocusableElements={true} handleKeys={['ctrl', 'meta', 'enter', 'esc']} onKeyEvent={(key, event)=> this.handleKeyPress(event, key)} /> */}
          {/* <KeyboardEventHandler isDisabled={(files.length === 0 && preComment === null)} handleKeys={['ctrl', 'meta', 'enter', 'esc']} onKeyEvent={(key, event)=> this.handleKeyPress(event, key)}> */}
            <TextareaAutosize id="comment-txtarea" className="comment-txtarea" placeholder={(url) ? 'Add a comment to this url…' : 'Add a comment to this image…'} value={(!url) ? (preComment || '') : ''} onFocusCapture={this.handleFieldFocus} onChange={this.handleTextChange} ref={(el)=> (el) ? this.commentInput = el : null} data-code={(code)} />
          {/* </KeyboardEventHandler> */}
          {(preComment) && (<CodeFormAccessory align={FormAccessoryAlignment.BOTTOM} onClick={this.handleCode} />)}
        </div>

        <div className="file-wrapper" data-file={(files.length > 0 || image !== null)} data-uploaded={uploaded} data-hidden={false}>
          <div className="filename-wrapper">{files.map(({ filename }, i)=> (
            <div key={i} className="filename">{filename}</div>
          ))}</div>

          <FilePond
            server={{
              url     : CDN_FILEPOND_URL,
              process : {
                url : './index.php'
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
        <div className="url-wrapper" data-hidden={!url}>{preComment}</div>
        <div className="button-wrapper button-wrapper-col">
          <button type="submit" disabled={text.length === 0 && files.length === 0} onClick={this.handleSubmit}>Comment</button>
          <button className="cancel-button" onClick={this.handleResetContent}>Cancel</button>
        </div>
      </div>
    </div>);
	}
}


const mapDispatchToProps = (dispatch)=> {
  return ({
    createComment : (payload)=> dispatch(createComment(payload)),
    makeComment   : (payload)=> dispatch(makeComment(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    hash       : state.router.location.hash,
    pathname   : state.router.location.pathname,
    preComment : state.comments.preComment,
    comment    : state.comments.comment
  });
};


export default connect(mapStateToProps, mapDispatchToProps)(TeamPageFileDrop);