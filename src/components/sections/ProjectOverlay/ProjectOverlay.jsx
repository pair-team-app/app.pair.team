
import React, { Component } from 'react';
import './ProjectOverlay.css';

import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Menu, Item, MenuProvider } from 'react-contexify';
import { connect } from 'react-redux';

import BaseComment from '../../iterables/BaseComment';
import BasePopover from '../../overlays/BasePopover';
import { setComment, setComponent, makeComment } from '../../../redux/actions';


class ProjectOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment : {
        text : ''
      }
    };
  }

  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  handleAddComment = (event=null)=> {
    // console.log('handleAddComment()', { event : event.target.parentElement.parentElement.parentElement });

    const { top, left } = event.target.parentElement.parentElement.parentElement.style;
    const position = {
      x : (left.replace('px', '') << 0) - 10,
      y : (top.replace('px', '') << 0) - 120
    }

    const { profile, component } = this.props;
    const { comment } = this.state;

    console.log('handleAddComment()', { position });

    if (comment.text.length > 0) {
      this.props.makeComment({ position,
        comment      : null,
        content      : comment.text,
        user_id      : profile.id,
        team_id      : 0,
        component_id : component.id,
        format       : 'text'
      });
    }
  };

  handleAddCommentText = (text)=> {
    console.log('handleAddCommentText()', { text });
    const { comment } = this.state;

    this.setState({ comment : { ...comment, text }})
  };

  handleCommentMarkerClick = (comment)=> {
    console.log('handleCommentMarkerClick()', { comment });

    this.props.setComment(comment);
  };

  handleKeyPress = (event, key)=> {
    console.log('handleKeyPress()', { event, key });

    if (key === 'esc') {
      this.props.setComment(null);
      this.props.setComponent(null);

    } else {
      this.handleAddComment(event);
    }
  };

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { component } = this.props;
    const { comment } = this.state;

    return (<div className="project-overlay">
      <div className="header-wrapper">HEADER</div>
      <div className="content-wrapper"><KeyboardEventHandler handleKeys={['enter', 'esc']} handleFocusableElements onKeyEvent={(key, event)=> this.handleKeyPress(event, key)} />
        <img src={component.images.pop()} alt={component.title} />
        <MenuProvider id="menu_id" className="menu-provider">
          <div className="comments-wrapper">
            {(component.comments.filter(({ types })=> (types.includes('op'))).map((comment, i)=> (<ProjectViewCommentMarker key={i} ind={(i+1)} comment={comment} activeComment={this.props.comment} onClick={this.handleCommentMarkerClick} />)))}
          </div>
        </MenuProvider>
      </div>

      <AddCommentMenu comment={comment} onTextChange={this.handleAddCommentText} onSubmit={this.handleAddComment} onClick={({ event, props })=> console.log('MenuClick', { event, props })} />
    </div>);
  }
}


const ProjectViewCommentMarker = (props)=> {
  // console.log('ProjectViewCommentMarker()', { props });

  const { comment, ind, activeComment } = props;
  const { position } = comment;
  return (<div className="project-view-comment-marker" onClick={()=> props.onClick(comment)} style={(position) ? {
    top  : `${position.y}px`,
    left : `${position.x}px`
  } : {
    top  : '10px',
    left : '10px'
  }}>
    <div>{ind}</div>
    {/* {(activeComment && activeComment.id === comment.id) && (<ProjectViewComment ind={ind} comment={comment} onClose={()=>null} />)} */}
    {(activeComment && activeComment.id === comment.id) && (<BaseComment ind={ind} comment={comment} onDelete={props.onDelete} />)}
  </div>);
};

const ProjectViewComment = (props)=> {
  // console.log('ProjectViewComment()', { props });

  const { ind, comment, outro } = props;
  const payload = {
    fixed    : false,
    position : {
      x : 1,
      y : 1
    }
  };

  return (<BasePopover outro={false} payload={payload} onOutroComplete={()=> props.onClose(comment)}>
    <div className="playground-comment-popover">
      <BaseComment ind={ind} comment={comment} onDelete={props.onDelete} />
    </div>
  </BasePopover>);
};


const AddCommentMenu = (props)=> {
  console.log('AddCommentMenu()', { props });

  const { comment } = props;
  return (<Menu id="menu_id" className="add-comment-menu">
    <div className="form-wrapper">
      <input type="text" className="comment-txt" placeholder="Add Comment" value={comment.text} onChange={(event)=> props.onTextChange(event.target.value)} autoFocus />
    </div>
    <div className="button-wrapper button-wrapper-row">
      <button disabled={(comment.text.length === 0)} onClick={props.onSubmit}>Submit</button>
      <button className="cancel-button">Cancel</button>
    </div>
  </Menu>);
};

const mapDispatchToProps = (dispatch)=> {
  return ({
    makeComment  : (payload)=> dispatch(makeComment(payload)),
    setComment   : (payload)=> dispatch(setComment(payload)),
    setComponent : (payload)=> dispatch(setComponent(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    comment   : state.comments.comment,
    component : state.builds.component,
    profile   : state.user.profile,
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectOverlay);
