
import React, { Component } from 'react';
import './ProjectViewOverlay.css';

import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Menu, MenuProvider } from 'react-contexify';
import { connect } from 'react-redux';

import BaseComment from '../../../iterables/BaseComment';
import BasePopover from '../../../overlays/BasePopover';
import { setComment, setComponent, makeComment } from '../../../../redux/actions';


class ProjectViewOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment : {
        text   : '',
        bubble : false
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
    console.log('handleAddComment()', { parentElement : event.target.parentElement, event : event.target.parentElement.parentElement.parentElement });

    const { top, left } = event.target.parentElement.parentElement.parentElement.style;
    const position = {
      x : Math.max(10, (left.replace('px', '') << 0) + 5),
      y : Math.max(10, (top.replace('px', '') << 0) - 115)
    }

    const { profile, component } = this.props;
    const { comment } = this.state;

    console.log('handleAddComment()', { position });

    if (comment.text.length > 0) {
      this.props.makeComment({ position,
        content : comment.text,
        format  : 'text'
      });

      this.setState({
        comment : { text : '' }
      });
    }
  };

  handleAddCommentText = (event)=> {
    console.log('handleAddCommentText()', { event });
    const { comment } = this.state;

    this.setState({
      comment : { ...comment,
        text : event.target.value
      }
    });
  };

  handleCommentMarkerClick = (comment)=> {
    console.log('handleCommentMarkerClick()', { comment });

    this.props.setComment(comment);
  };

  handleKeyPress = (event, key)=> {
    console.log('handleKeyPress()', { event, key });

    if (key === 'esc') {
      this.onClose();

    } else {
      this.handleAddComment(event);
    }
  };

  onClose = ()=> {
    console.log('%s.onClose()', this.constructor.name);

    this.setState({
      activeComment : null,
      comment : {
        text : ''
      }
    }, ()=> {
      this.props.setComponent(null);
      this.props.setComment(null);
    });
  };

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { component } = this.props;
    const { comment } = this.state;

    return (<div className="project-view-overlay">
      {/* <div className="header-wrapper"><ProjectViewHeader textContent={(!comment.bubble) ? comment.text : ''} onTextChange={this.handleAddCommentText} onSubmit={this.handleAddComment} onCancel={this.onClose} /></div> */}
      <div className="content-wrapper"><KeyboardEventHandler handleKeys={['enter', 'esc']} handleFocusableElements onKeyEvent={(key, event)=> this.handleKeyPress(event, key)} />
        <img src={[...component.images].pop()} alt={component.title} />
        <MenuProvider id="project-view-menu" className="menu-provider">
          <div className="comments-wrapper">
            {(component.comments.filter(({ types })=> (types.includes('op'))).map((comment, i)=> (<ProjectViewComment key={i} ind={(i+1)} comment={comment} activeComment={this.props.comment} onClick={this.handleCommentMarkerClick} onClose={()=> this.props.setComment(null)} />)))}
          </div>
        </MenuProvider>
      </div>

      <AddCommentMenu comment={comment} onToggle={(visible)=> this.setState({ comment : { ...comment, bubble : visible }})} onTextChange={this.handleAddCommentText} onSubmit={this.handleAddComment} onCancel={()=> this.setState({ comment : { ...comment, text : '' }})} />
    </div>);
  }
}

const ProjectViewComment = (props)=> {
  console.log('ProjectViewComment()', { props });

  const { ind, comment, activeComment } = props;
  const { position } = comment;

  const payload = {
    fixed    : false,
    position : {
      x : 15,
      y : -10
    }
    // position : { ...position,
    //   x : position.x + 30,
    //   y : position.y + 0
    // }
  };

  const style = (position) ? {
    top  : `${position.y}px`,
    left : `${position.x}px`
  } : {
    top  : '10px',
    left : '10px'
  };

  return (<div className="project-view-comment" style={style}>
    {(activeComment && activeComment.id === comment.id) && (<BasePopover outro={false} payload={payload} onOutroComplete={()=> props.onClose(comment)}>
      <div className="project-view-comment-bubble">
        <BaseComment ind={ind} comment={comment} onDelete={props.onDelete} />
      </div>
    </BasePopover>)}
    <div className="project-view-comment-marker" onClick={()=> props.onClick(comment)}><div>{ind}</div></div>
  </div>);
};

const ProjectViewHeader = (props)=> {
  console.log('ProjectViewHeader()', { props });

  const { textContent } = props;
  return (<div className="project-view-header">
    <input type="text" className="comment-txt" placeholder="Type or paste…" value={textContent} onChange={props.onTextChange} />
    <div className="button-wrapper button-wrapper-col">
      <button type="submit" disabled={textContent.length === 0} onClick={props.onSubmit}>Comment</button>
      <button className="cancel-button" onClick={props.onCancel}>Cancel</button>
    </div>
  </div>);
}


const AddCommentMenu = (props)=> {
  console.log('AddCommentMenu()', { props });

  const { comment } = props;
  return (<Menu onShown={()=> props.onToggle(true)} onHidden={()=>props.onToggle(false)} id="project-view-menu" className="add-comment-menu">
    <div className="form-wrapper">
      <input type="text" className="comment-txt" placeholder="Add Comment" value={comment.text} onChange={props.onTextChange} autoFocus />
    </div>
    <div className="button-wrapper button-wrapper-row">
      <button disabled={(comment.text.length === 0)} onClick={props.onSubmit}>Submit</button>
      <button className="cancel-button" onClick={props.onCancel}>Cancel</button>
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
    comment   : state.builds.comment,
    component : state.builds.component,
    profile   : state.user.profile,
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectViewOverlay);