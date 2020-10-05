
import React, { Component } from 'react';
import './ProjectViewOverlay.css';

import FontAwesome from 'react-fontawesome';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';

import BaseComment from '../../../iterables/BaseComment';
import BasePopover from '../../../overlays/BasePopover';
import { setComment, setComponent, makeComment } from '../../../../redux/actions';


class ProjectViewOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cursor        : true,
      mousePosition : {
        x : 0,
        y : 0
      },
      comment : {
        text   : '',
        bubble : false,
        position : {
          x : 0,
          y : 0
        }
      }
    };
  }

  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    window.onmousemove = (event)=> {
      // console.log('%s.onMouseMove()', this.constructor.name, { event, path : ([...event.path].shift().type) });

      const { cursor } = this.state;
      const { clientX : x, clientY : y, path } = event;

      if (!cursor) {
        this.setState({
          mousePosition : { x, y },
          // cursor        : ([...path].shift().type === 'submit')
        });
      }
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  handleAddComment = (event=null)=> {
    console.log('handleAddComment()', { parentElement : event.target.parentElement, event : event.target.parentElement.parentElement });

    const { top, left } = event.target.parentElement.parentElement.style;
    const position = {
      x : Math.max(10, (left.replace('px', '') << 0) + 0),
      y : Math.max(10, (top.replace('px', '') << 0) + 5)
    };

    const { comment } = this.state;
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

  handleCommentMenu = (event)=> {
    console.log('%s.handleCommentMenu()', this.constructor.name, { event });

    const { clientX : x, clientY : y } = event;

    this.setState({
      cursor  : true,
      comment : {
        text   : '',
        bubble : true,
        position : { x, y }
      }
    });
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
    const { comment, cursor, mousePosition } = this.state;

    return (<div className="project-view-overlay">
      {/* <div className="header-wrapper"><ProjectViewHeader textContent={(!comment.bubble) ? comment.text : ''} onTextChange={this.handleAddCommentText} onSubmit={this.handleAddComment} onCancel={this.onClose} /></div> */}
      <div className="content-wrapper"><KeyboardEventHandler handleKeys={['enter', 'esc']} handleFocusableElements onKeyEvent={(key, event)=> this.handleKeyPress(event, key)} />
        <img src={[...component.images].pop()} alt={component.title} />
        <div className="comments-wrapper">
          {(component.comments.filter(({ types })=> (types.includes('op'))).map((comment, i)=> (<ProjectViewComment key={i} ind={(i+1)} comment={comment} activeComment={this.props.comment} onClick={this.handleCommentMarkerClick} onClose={()=> this.props.setComment(null)} />)))}
        </div>
      </div>

      {(comment.bubble) && (<AddCommentBubble comment={comment} onTextChange={this.handleAddCommentText} onSubmit={this.handleAddComment} onCancel={()=> this.setState({ comment : { ...comment, text : '', bubble : false }})} />)}
      {(!cursor) && (<CommentPinCursor x={mousePosition.x} y={mousePosition.y} onPinClick={this.handleCommentMenu} />)}

      <div className="cursor-wrapper">
        <button onClick={(event)=> this.setState({ cursor : !this.state.cursor })}>Marker</button>
      </div>

    </div>);
  }
}


const CommentPinCursor = (props)=> {
  // console.log('CommentPinCursor()', { ...props });

  const { x, y } = props;
  const style = {
    top  : `${y - 30}px`,
    left : `${x - 9}px`
  };

  return (<div className="comment-pin-cursor" onClick={props.onPinClick} style={style}>
    <FontAwesome name="map-marker-alt" />
  </div>);
};


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

const AddCommentBubble = (props)=> {
  // console.log('AddCommentBubble()', { props });

  const { comment } = props;
  const { position } = comment;

  const style = (position) ? {
    top  : `${position.y - 5}px`,
    left : `${position.x - 0}px`
  } : {
    top  : '10px',
    left : '10px'
  };


  return (<div className="add-comment-bubble" style={style}>
    <div className="form-wrapper">
      <input type="text" className="comment-txt" placeholder="Add Comment" value={comment.text} onChange={props.onTextChange} autoFocus />
    </div>
    <div className="button-wrapper button-wrapper-row">
      <button disabled={(comment.text.length === 0)} onClick={props.onSubmit}>Submit</button>
      <button className="cancel-button" onClick={props.onCancel}>Cancel</button>
    </div>
  </div>);
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