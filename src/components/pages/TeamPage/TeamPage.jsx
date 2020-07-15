
import React, { Component } from 'react';
import './TeamPage.css';

import axios from 'axios';
import FilepondPluginFilePoster from 'filepond-plugin-file-poster';
import FilepondPluginFileMetadata from 'filepond-plugin-file-metadata';
import FilepondPluginImageCrop from 'filepond-plugin-image-crop';
import FilepondPluginImageEdit from 'filepond-plugin-image-edit';
import FilepondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilepondPluginImagePreview from 'filepond-plugin-image-preview';
import FilepondPluginImageTransform from 'filepond-plugin-image-transform';
import { Strings } from 'lang-js-utils';
import TextareaAutosize from 'react-autosize-textarea';
import { FilePond, registerPlugin } from 'react-filepond';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BasePage from '../BasePage';
import CreateTeamForm from '../../forms/CreateTeamForm';
import TeamPageCommentsPanel from './TeamPageCommentsPanel';
import { SORT_BY_DATE, SORT_BY_SCORE } from './TeamPageHeader';
import { SettingsMenuItemTypes } from '../../sections/TopNav/UserSettings';
import { TEAM_TIMESTAMP } from '../../../consts/formats';
import { ENTER_KEY } from '../../../consts/key-codes';
import { Modals, API_ENDPT_URL, CDN_UPLOAD_URL } from '../../../consts/uris';
import { fetchTeamComments, makeComment, makeTeam, makeTeamRule, modifyTeam, setComment, setPlayground, setTypeGroup, toggleCreateTeam } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import btnClear from '../../../assets/images/ui/btn-clear.svg';
import btnCode from '../../../assets/images/ui/btn-code.svg';

// import 'filepond/dist/filepond.min.css';
// import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css'


class TeamPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topSort         : [ ],
      commentContent  : '',
      codeComment     : false,
      teamDescription : '',
      ruleContent     : '',
      ruleInput       : false,
      sort            : SORT_BY_SCORE,
      fetching        : false,
      loading         : false,
      share           : false,
      files:          [  ],
      richComment     : false,
      url             : null,
      imageComment    : null
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    const { playground } = this.props;
    if (playground) {
      this.props.setPlayground(null);
    }

    // Register the plugins
    registerPlugin(FilepondPluginFileMetadata, FilepondPluginFilePoster, FilepondPluginImageCrop, FilepondPluginImageEdit, FilepondPluginImageExifOrientation, FilepondPluginImagePreview, FilepondPluginImageTransform);
    // document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { team, comments } = this.props;
    const { teamDescription, fetching, topSort } = this.state;


    if (fetching) {
      if ((comments.filter(({ content })=> (content === null)).length === 0)) {
        this.setState({ fetching : false });
      }

    } else {
      if (comments.filter(({ content })=> (content === null)).length > 0) {
        this.setState({ fetching : true });
      }
    }

    if (topSort.length !== comments.length) {
      this.setState({ topSort : comments.sort((i, ii)=> ((i.score > ii.score) ? -1 : (i.score < ii.score) ? 1 : 0)).map(({ id })=> (id)) });
    }

    if (prevProps.team !== team && team && teamDescription !== team.description) {
      this.setState({ teamDescription : team.description });
    }
  }

  componentWillUnmount() {
		// console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });

		document.removeEventListener('keydown', this.handleKeyDown);
	}

  handleInit() {
    console.log('FilePond instance has initialised', this.pond);
  }

  handleAddComment = (event)=> {
    // console.log('%s.handleAddComment()', this.constructor.name, { event, props : this.props, state : this.state });
    trackEvent('button', 'add-comment');

    event.preventDefault();
    event.stopPropagation();

    const { commentContent } = this.state;
    this.props.makeComment({
      comment  : null,
			content  : commentContent,
      position : null
		});

    this.setState({ commentContent : '' });
  };

  handleAddRule = (event)=> {
    // console.log('%s.handleAddRule()', this.constructor.name, event);
    trackEvent('button', 'add-rule');

    event.preventDefault();
    event.stopPropagation();

    const { ruleContent } = this.state;
    this.props.makeTeamRule({ title : ruleContent });
    this.setState({
      ruleInput   : false
      // ruleContent : ''
    });
  }

  handleClearComment = (event)=> {
    console.log('%s.handleClearComment()', this.constructor.name, { event });
    this.setState({
      commentContent : '',
      loading        : false,
      richComment    : false,
      imageComment   : null
    });
  }

  handleCode = (event)=> {
    console.log('%s.handleCode()', this.constructor.name, { event });
    this.setState({ codeComment : !this.state.codeComment });

  }

  handleKeyDown = (event)=> {
    // console.log('%s.handleKeyDown()', this.constructor.name, event);

    const { ruleInput, commentContent, teamDescription, ruleContent } = this.state;
    if (event.keyCode === ENTER_KEY) {
      if (commentContent.length > 0) {
        this.handleAddComment(event);
      }

      if (teamDescription.length > 0) {
        this.handleUpdateTeamDescription(event);
      }

      if (ruleContent.length > 0 && ruleInput) {
        this.handleAddRule(event);
      }
    }
  }

  handleNavGroupItemClick = (typeGroup)=> {
    // console.log('%s.handleNavGroupItemClick()', this.constructor.name, { typeGroup });
  };

  handlePlaygroundClick = (playground, typeGroup)=> {
    // console.log('%s.handlePlaygroundClick()', this.constructor.name, { playground, typeGroup });

    this.props.setPlayground(playground);
    this.props.setTypeGroup(typeGroup);
  };

  handleRuleInput = (event)=> {
    // console.log('%s.handleRuleInput()', this.constructor.name, event);
    trackEvent('button', 'add-rule');

    this.setState({
      ruleContent : '',
      ruleInput   : true
    });
  }

  handleSettingsItem = (itemType)=> {
    //console.log('%s.handleSettingsItem()', this.constructor.name, itemType);

    if (itemType === SettingsMenuItemTypes.DELETE_ACCT) {
      this.props.onModal(Modals.DISABLE);

    } else if (itemType === SettingsMenuItemTypes.PROFILE) {
      this.props.onModal(Modals.PROFILE);
    }
  };

  handleSortClick = (sort)=> {
    // console.log('%s.handleSortClick()', this.constructor.name, sort);

    this.setState({ sort }, ()=> {
      if (sort === SORT_BY_SCORE) {
        this.onReloadComments();
      }
    });
  }

  handleTextChange = (event)=> {
    // console.log('%s.handleTextChange()', this.constructor.name, event);

    const commentContent = event.target.value;
    const richComment = (/https?:\/\//i.test(commentContent));

    this.setState({ commentContent, richComment,
      parsing      : richComment,
      imageComment : null
    }, ()=> {
      if (richComment) {
        const url = commentContent.match(/https?:\/\/.+ ?/i).shift().split(' ').shift();
        // if (url !== this.state.url) {
          this.setState({ url }, ()=> {
            axios.post(API_ENDPT_URL, {
              action  : 'SCREENSHOT_URL',
              payload : { url }
            }).then((response)=> {
              const { image } = response.data;
              console.log('SCREENSHOT_URL', { data : response.data });
              this.setState({
                parsing      : false,
                imageComment : image.cdn
               });
            });
          });
        // }
      }
    });
  };

  handleUpdateTeamDescription = (event)=> {
    // console.log('%s.handleUpdateTeamDescription()', this.constructor.name, event);
    trackEvent('button', 'update-team');

    event.preventDefault();
    event.stopPropagation();

    const { teamDescription } = this.state;
    this.props.modifyTeam({ description : teamDescription });
  }

  handleCreateTeamSubmit = ({ title, description, rules, invites })=> {
    console.log('%s.handleCreateTeamSubmit()', this.constructor.name, { title, description, rules, invites });
    this.props.makeTeam({ title, description, rules, invites });

    setTimeout(()=> {
      this.props.toggleCreateTeam(false);
    }, 1250);
  };

  onReloadComments = (refresh=true)=> {
    // console.log('%s.onReloadComments()', this.constructor.name, { refresh });

    const { team } = this.props;
    const { topSort } = this.state;

    this.setState({
      fetching : true,
      topSort  : (refresh) ? [] : topSort
    }, ()=> {
      // this.props.fetchTeamComments({ team });
    });
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
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile, team, comments, createTeam } = this.props;
    const { commentContent, teamDescription, ruleContent, ruleInput, fetching, loading, share, sort, topSort, files, richComment, imageComment, codeComment } = this.state;


    const cdnHeaders = {
      'Content-Type' : 'multipart/form-data',
      'Accept'       : 'application/json'
    };

    return (<BasePage { ...this.props } className="team-page">
      {(profile && team) && (<>
        {/* <TeamPageHeader
          sort={sort}
          popover={share}
          onSortClick={this.handleSortClick}
          onPopup={this.props.onPopup}
          onSharePopoverClose={()=> this.setState({ share : false })}
          onSettingsItem={this.handleSettingsItem}
          onLogout={this.props.onLogout}
        /> */}

        {(!createTeam) ? (<div>
          <div className="comments-wrapper" data-fetching={fetching} data-empty={comments.length === 0}>
            <div>
              {(files.length === 0) && (<TeamPageAddComment
                loading={loading}
                codeComment={codeComment}
                commentContent={commentContent}
                imageComment={imageComment}
                onClear={this.handleClearComment}
                onCode={this.handleCode}
                onTextChange={this.handleTextChange}
                onSubmit={this.handleAddComment}
              />)}

              {(!richComment) && (<FilePond
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
              />)}

              <div className="empty-comments">No Activity</div>

              <TeamPageCommentsPanel
                profile={profile}
                comments={(sort === SORT_BY_DATE) ? comments.sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)) : topSort.map((commentID)=> (comments.find(({ id })=> (id === commentID)) || null)).filter((comment)=> (comment !== null))}
                fetching={fetching}
                sort={sort}
              />
            </div>
          </div>
          <div className="team-wrapper" data-fetching={fetching}>
            <div className="about-wrapper">
              <div className="header">About</div>
              <div className="content"><textarea placeholder="Enter Text to Describe you team" value={teamDescription} onChange={(event)=> this.setState({ teamDescription : event.target.value })}></textarea></div>
              <div className="footer">
                <div>{team.members.length} {Strings.pluralize('member', team.members.length)}</div>
                <div className="timestamp">CREATED {team.added.format(TEAM_TIMESTAMP)}</div>
              </div>
            </div>
            <div className="rules-wrapper">
              <div className="header"><span>Rules</span></div>
              {(team) && (<div className="content">
                {(team.rules.map((rule, i)=> {
                  return (<TeamPageTeamRule
                    key={i}
                    ind={i+1}
                    rule={rule}
                  />);
                }))}
              </div>)}
              <div className="footer" data-input={ruleInput}>
                <button className="quiet-button" onClick={this.handleRuleInput}>+</button>
                <input type="text" placeholder="" value={ruleContent} onChange={(event)=> this.setState({ ruleContent : event.target.value })} />
              </div>
            </div>
          </div>
        </div>) : (<div>
          <CreateTeamForm onCancel={()=> this.props.toggleCreateTeam(false)} onSubmit={this.handleCreateTeamSubmit} />
        </div>)}
      </>)}
    </BasePage>);
  }
}

const TeamPageAddComment = (props)=> {
  // console.log('TeamPageAddComment()', { props });

  const { loading, codeComment, commentContent, imageComment } = props;
  const isURL = (/https?:\/\//i.test(props.commentContent));

  return (<div className="team-page-add-comment" data-loading={loading}><form>
    <div className="content-wrapper">
      {(commentContent.length > 0) && (<div>
        <img src={btnClear} className="clear-btn" onClick={props.onClear} alt="Clear" />
        <img src={btnCode} className="code-btn" onClick={props.onCode} alt="Code" />
      </div>)}
      {(isURL)
      ? (<div className="rich-content">
          <div className="image-wrapper"><img src={imageComment} alt="" /></div>
          <TextareaAutosize className="comment-txt" placeholder="Add a comment to this image…" value={commentContent} onChange={props.onTextChange} data-code={codeComment} />
        </div>)
      : (<TextareaAutosize className="comment-txt" placeholder="Text, Paste or Drag to ask you team anything…" value={commentContent} onChange={props.onTextChange} data-code={codeComment} />)
    }</div>
    <button type="submit" disabled={commentContent.length === 0} onClick={props.onSubmit}>Submit</button>
  </form></div>);
};


const TeamPageTeamRule = (props)=> {
  // console.log('TeamPageTeamRule()', props);

  const { ind, rule } = props;
  return (<div className="team-page-team-rule">
    {ind}. {rule.title} {rule.content}
  </div>);
};


const mapDispatchToProps = (dispatch)=> {
  return {
    fetchTeamComments : (payload)=> dispatch(fetchTeamComments(payload)),
    makeComment       : (payload)=> dispatch(makeComment(payload)),
    makeTeam          : (payload)=> dispatch(makeTeam(payload)),
    makeTeamRule      : (payload)=> dispatch(makeTeamRule(payload)),
    modifyTeam        : (payload)=> dispatch(modifyTeam(payload)),
    setPlayground     : (payload)=> dispatch(setPlayground(payload)),
    setTypeGroup      : (payload)=> dispatch(setTypeGroup(payload)),
    setComment        : (payload)=> dispatch(setComment(payload)),
    toggleCreateTeam  : (payload)=> dispatch(toggleCreateTeam(payload))
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    comment    : state.comments.comment,
    createTeam : state.teams.createTeam,
    profile    : state.user.profile,
    team       : state.teams.team,
    comments   : state.comments.comments,
    playground : state.playground
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamPage));
