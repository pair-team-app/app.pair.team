
import React, { Component } from 'react';
import './TeamPageFileDrop.css';

import axios from 'axios';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { FilePond, registerPlugin } from 'react-filepond';
import { connect } from 'react-redux';

import { CDN_UPLOAD_URL } from '../../../../consts/uris';
import { makeComment } from '../../../../redux/actions';

import 'filepond/dist/filepond.min.css';
import './post-styles.css';


registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginFileEncode, FilePondPluginFileValidateType);


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
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }


  handleInit() {
    console.log('FilePond instance has initialised');
  };

  handleCode = (event)=> {
    console.log('%s.handleCode()', this.constructor.name, { event });
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
      this.props.onClose();
    });
  }


  handleFileAdd = (error, file)=> {
    console.log('%s.handleFileAdd(file)', this.constructor.name, { error, image : this.state.image, file : file.fileType });
    this.onUploadFile(file.filename, file.getFileEncodeDataURL());
  };

  handleFileInit = (file)=> {
    console.log('%s.handleFileInit(file)', this.constructor.name, { image : this.state.image, file });
  };

  handleFilesUpdated = (fileItems)=> {
    console.log('%s.handleFilesUpdated(fileItems)', this.constructor.name, { fileItems });
    this.setState({ files : fileItems.map(({ file })=> (file)) });
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
      this.setState({ image : cdn }, ()=> {
        this.props.onImageData({ filename, dataURI, cdn });
      });
    });
  };

	render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state, commentInput : (this.commentInput) ? this.commentInput : null });

    const { image, files } = this.state;

    return (<div className="team-page-file-drop" data-file={files.length > 0} data-upload={image !== null}>
      <div className="file-wrapper">
        <FilePond
          files={files}
          acceptedFileTypes={['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/tiff']}
          className="file-pond-wrapper"
          maxFiles={1}
          allowBrowse={true}
          instantUpload={false}
          labelIdle=""
          oninit={this.handleInit}
          oninitfile={this.handleFileInit}
          onaddfile={this.handleFileAdd}
          onupdatefiles={this.handleFilesUpdated}
          ref={(el=> (el) ? this.filePond = el : null)}
        />
      </div>
    </div>);
	}
}


const mapDispatchToProps = (dispatch)=> {
  return ({
    makeComment : (payload)=> dispatch(makeComment(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    profile : state.user.profile,
    team    : state.teams.team
  });
};


export default connect(mapStateToProps, mapDispatchToProps)(TeamPageFileDrop);