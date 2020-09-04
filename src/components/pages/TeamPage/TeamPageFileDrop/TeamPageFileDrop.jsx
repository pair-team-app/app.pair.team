
import React, { Component } from 'react';
import './TeamPageFileDrop.css';

import axios from 'axios';
import { push } from 'connected-react-router';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { URIs } from 'lang-js-utils';
// import TextareaAutosize from 'react-autosize-textarea';
import { FilePond, registerPlugin } from 'react-filepond';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import ReactQuill from 'react-quill';
import { connect } from 'react-redux';

import { CodeFormAccessory, FormAccessoryAlignment } from '../../../forms/FormAccessories';
import { ENTER_KEY } from '../../../../consts/key-codes';
import { API_ENDPT_URL, CDN_FILEPOND_URL, CDN_UPLOAD_URL, Modals } from '../../../../consts/uris';
import { createComment, makeComment } from '../../../../redux/actions';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'react-quill/dist/quill.snow.css';
// import 'react-quill/dist/quill.bubble.css';
// import 'react-quill/dist/quill.core.css';
import './post-styles.css';


registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileEncode);


// const extractURLs = (val)=> {
//   const matches = val.match(new RegExp('(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:/\\S*)?', 'ig'));
//   if (!matches) {
//     return ([]);
//   }

//   return (matches.filter((value, index)=> (matches.indexOf(value) === index)));
// };


class TeamPageFileDrop extends Component {
	constructor(props) {
		super(props);

		this.state = {
      text    : '',
      image   : null,
      loading : false,
      url     : false,
      code    : false,
      intro   : true,
      files   : []
    };

    this.commentInput = React.createRef();
    this.filePond = React.createRef();
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

    // const { preComment, pathname, hash } = this.props;
    // const { text, url, files, image } = this.state;

    const { preComment } = this.props;
    const { url, files, image } = this.state;

    if (files.length > 0) {
      if (!window.location.href.includes(Modals.FILE_DROP)) {
        this.props.push(`${window.location.pathname}${Modals.FILE_DROP}`);
      }
    }

    if (preComment) {
      const urls = URIs.extractURLs(preComment);

      if (preComment !== prevProps.preComment && preComment !== ' ') {
        this.commentInput.focus();

        if (files.length > 0 || image !== null) {
          this.props.onContent();
        }

        if ([...urls].shift() !== url && !url) {
          this.setState({ url : [...urls].shift() }, ()=> {
            if (urls.length > 0) {
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
      text    : '',
      image   : null,
      loading : false,
      url     : false,
      code    : false,
      intro   : true,
      files   : []
    }, ()=> {
      this.props.createComment(null);
      this.props.onClose();
    });
  }


  handleFileAdd = (error, file)=> {
    console.log('%s.handleFileAdd(file)', this.constructor.name, { error, image : this.state.image, file : file.getFileEncodeDataURL() });

    const { image } = this.state;
    if (!image) {
      this.onUploadFile(file.filename, file.getFileEncodeDataURL());
    }
  };

  handleFileInit = (file)=> {
    console.log('%s.handleFileInit(file)', this.constructor.name, { image : this.state.image, file });
  };

  handleFileProgress = (file, progress)=> {
    console.log('%s.handleFileProgress(file, progress)', this.constructor.name, { file, progress });
  };

  handleFileProcessStart = (file)=> {
    console.log('%s.handleFileProcessStart(file)', this.constructor.name, { file });
    this.setState({ loading : true }, ()=> {
      this.props.onContent();
    });
  };

  handleFileProcessProgress = (file, progress)=> {
    console.log('%s.handleFileProcessProgress(file, progress)', this.constructor.name, { file, progress });
  };

  handleProcessedFile = (error, file)=> {
    console.log('%s.handleProcessedFile(error, output)', this.constructor.name, { error, file });
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
      this.props.onContent();
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

  handleChange = (value)=> {
    this.setState({ text : value });
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

  handleTextChange = (value)=> {
    console.log('%s.handleTextChange(event)', this.constructor.name, { value, props : this.props, state : this.state });

    // const { preComment } = this.props;
    // const { intro, text } = this.state;
    const { intro } = this.state;
    // const { target } = event;

    if (value === '<p><br></p>') {
      this.handleResetContent();
    }

    if (!intro) {
      this.props.createComment(value);
    }
  }

  handleSubmit = (event=null)=> {
    console.log('%s.handleSubmit(event)', this.constructor.name, { event });

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const { preComment, comment } = this.props;
    const { image, code, url } = this.state;
    this.props.makeComment({ image,
      link     : (url || null),
      comment  : comment,
			content  : preComment,
      position : (comment) ? comment.position : null,
      format   : (code) ? 'code' : 'text'
    });



    this.handleResetContent();
  };

  onFetchScreenshot = (text)=> {
    console.log('%s.onFetchScreenshot(text)', this.constructor.name, { text });

    // const url = text.match(/https?:\/\/.+ ?/i).shift().split(' ').shift();
    const url = URIs.extractURLs(text).shift();
    axios.post(API_ENDPT_URL, {
      action  : 'SCREENSHOT_URL',
      payload : { url }
    }).then((response)=> {
      const { image } = response.data;
      console.log('SCREENSHOT_URL', { data : response.data });
      this.setState({ url,
        image : image.cdn,
      }, ()=> {
        this.dataURIFile(image.data, URIs.lastComponent(image.src));
      });
    });
  };

  onUploadFile = (filename, dataURI)=> {
    console.log('%s.onUploadFile(filenme, dataURI)', this.constructor.name, { filename, dataURI });

    const { profile, team } = this.props;
    axios.post(CDN_UPLOAD_URL, {
      action  : 'ADD_FILE',
      payload : { filename,
        rel_path : `${team.id}/${profile.id}`,
        data_uri : dataURI
      }
    }).then((response)=> {
      const { cdn } = response.data;
      console.log('ADD_FILE', { data : response.data });
      this.setState({ image : cdn });
    });
  };

	render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { dragging, preComment } = this.props;
    const { url, code, image, files, text } = this.state;

    // const cdnHeaders = {
    //   'Content-Type' : 'multipart/form-data',
    //   'Accept'       : 'application/json'
    // };

    const toolbar = [
      ['bold', 'italic', 'underline', 'strike'],
      ['link', 'code-block'],
      ['clean']
    ];

		return (<div className="team-page-file-drop" data-dragging={(dragging)} data-latent={(!dragging && files.length === 0 && !preComment)}>
      <div>
        <div className="input-wrapper" data-hidden={(files.length === 0 && !preComment)}>
          <KeyboardEventHandler isDisabled={(files.length === 0 && !preComment)} handleFocusableElements handleKeys={['ctrl', 'meta', 'enter', 'esc']} onKeyEvent={(key, event)=> this.handleKeyPress(event, key)}>
            {/* <ReactQuill theme="bubble" modules={{ toolbar }} placeholder={(url) ? 'Add a comment to this url…' : (image !== null) ? 'Add a comment to this image…' : 'Add a comment…'} value={(!url) ? (preComment || '') : preComment.replace(url, '')} onFocusCapture={this.handleFieldFocus} onChange={this.handleTextChange} ref={(el)=> (el) ? this.commentInput = el : null} data-code={(code)} /> */}
            <ReactQuill placeholder={(url) ? 'Add a comment to this url…' : (image !== null) ? 'Add a comment to this image…' : 'Add a comment…'} value={(!url) ? (preComment || '') : (preComment) ? preComment.replace(url, '') : ''} onFocusCapture={this.handleFieldFocus} onChange={this.handleTextChange} ref={(el)=> (el) ? this.commentInput = el : null} data-code={(code)} />
          </KeyboardEventHandler>
          {/* {(preComment) && (<CodeFormAccessory align={FormAccessoryAlignment.BOTTOM} onClick={this.handleCode} />)} */}
        </div>

        <div className="file-wrapper" data-file={(files.length > 0 || image !== null)} data-file={(files.length > 0)} data-hidden={false}>
          <div className="filename-wrapper">{files.map(({ filename }, i)=> (
            <div key={i} className="filename">{filename}</div>
          ))}</div>

          <FilePond
            server={{
              url     : CDN_FILEPOND_URL,
              process : {
                url     : './index.php',
                onload  : (response) => console.log('___________', 'onload', { response }),
                onerror : (response) => console.log('___________', 'onerror', response.data),
                ondata  : (formData) => console.log('___________', 'ondata', { formData })
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
            instantUpload={false}
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

            imagePreviewHeight={122}
            imagePreviewTransparencyIndicator="grid"

            // onupdatefiles={(fileItems)=> {
            //   console.log('%s.onupdatefiles()', this.constructor.name, { fileItems });
            //   this.setState({ files: fileItems.map(fileItem => fileItem.file) });
            // }}

            ref={(el=> (el) ? this.filePond = el : null)}
          />
        </div>
        <div className="url-wrapper" data-hidden={!url} dangerouslySetInnerHTML={{ __html : `<a href="${url}" target="_blank">${url}</a>`}}></div>
        <div className="button-wrapper button-wrapper-col">
          <button type="submit" disabled={text.length === 0 && !image} onClick={this.handleSubmit}>Comment</button>
          <button className="cancel-button" onClick={this.handleResetContent}>Cancel</button>
        </div>
      </div>
    </div>);
	}
}


const mapDispatchToProps = (dispatch)=> {
  return ({
    createComment : (payload)=> dispatch(createComment(payload)),
    makeComment   : (payload)=> dispatch(makeComment(payload)),
    push          : (payload)=> dispatch(push(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    hash       : state.router.location.hash,
    pathname   : state.router.location.pathname,
    preComment : state.comments.preComment,
    comment    : state.comments.comment,
    profile    : state.user.profile,
    team       : state.teams.team
  });
};


export default connect(mapStateToProps, mapDispatchToProps)(TeamPageFileDrop);