
import React, { Component } from 'react';
import './ImageOverlay.css';

import FontAwesome from 'react-fontawesome';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { connect } from 'react-redux';

import BaseComment from '../../iterables/BaseComment';
import BasePopover from '../BasePopover';
import { setComment, setComponent, makeComment, setCommentImage } from '../../../redux/actions';


class ImageOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cursor        : true,
      mousePosition : {
        x : 0,
        y : 0
      },
      activeComment : null,
      comment       : {
        text     : '',
        bubble   : false,
        position : {
          x : 0,
          y : 0
        }
      }
    };
  }

  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
    // window.addEventListener('onmousemove', this.onMouseMove);

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

  componentWillUnmount() {
    console.log('%s.componentWillUnmount()', this.constructor.name, { props : this.props, state : this.state });
    // window.removeEventListener('onmousemove', this.onMouseMove);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { comment } = this.props;
    if (comment && prevProps.comment && comment.replies.length !== prevProps.comment.replies.length) {
      this.setState({ activeComment : [ ...comment.replies].pop() });
    }
  }

  handleAddComment = (event=null)=> {
    console.log('%s.handleAddComment()', this.constructor.name, { parent : event.target.parentElement, event : event.target.parentElement.parentElement, props : this.props, state : this.state });

    const { top, left } = event.target.parentElement.parentElement.style;
    const position = {
      x : Math.max(10, (left.replace('px', '') << 0) - 10),
      y : Math.max(10, (top.replace('px', '') << 0) - 5)
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
    console.log('%s.handleAddCommentText()', this.constructor.name, { event });
    const { comment } = this.state;

    this.setState({
      comment : { ...comment,
        text : event.target.value
    }});
  };

  handleCommentMarkerClick = (comment)=> {
    console.log('%s.handleCommentMarkerClick()', this.constructor.name, { comment });

    this.setState({ activeComment : comment });
    // this.props.setComment(comment);
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
    console.log('%s.handleKeyPress()', this.constructor.name, { event, key });

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
      this.props.setCommentImage(false);
      // this.props.setComment(null);
    });
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
    const { activeComment, comment, cursor, mousePosition } = this.state;

    return (<div className="image-overlay" data-cursor={cursor}>
      {/* <div className="header-wrapper"><ImageOverlayHeader textContent={(!comment.bubble) ? comment.text : ''} onTextChange={this.handleAddCommentText} onSubmit={this.handleAddComment} onCancel={this.onClose} /></div> */}
      <div className="content-wrapper" data-cursor={cursor}><KeyboardEventHandler handleKeys={['enter', 'esc']} handleFocusableElements onKeyEvent={(key, event)=> this.handleKeyPress(event, key)} />
        <img src={this.props.comment.image} alt={this.props.comment.image} />
        <div className="comments-wrapper">
          {(this.props.comment.replies.map((comment, i)=> (<ImageCommentReply key={i} ind={(i+1)} comment={comment} activeComment={activeComment} onClick={this.handleCommentMarkerClick} onClose={()=>null} />)))}
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


const ImageCommentReply = (props)=> {
  // console.log('ImageCommentReply()', { ...props });

  const { ind, comment, activeComment } = props;
  const { position } = comment;

  const payload = {
    fixed    : false,
    position : {
      x : 15,
      y : -10
    }
  };

  const style = (position) ? {
    top  : `${position.y + 10}px`,
    left : `${position.x + 10}px`
  } : {
    top  : '10px',
    left : '10px'
  };

  return (<div className="image-comment-reply" style={style}>
    {(activeComment && activeComment.id === comment.id) && (<BasePopover outro={false} payload={payload} onOutroComplete={()=> props.onClose(comment)}>
      <div className="comment-bubble">
        <BaseComment ind={ind} comment={comment} onDelete={props.onDelete} />
      </div>
    </BasePopover>)}
    <div className="comment-marker" onClick={()=> props.onClick(comment)}><div>{ind}</div></div>
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
    makeComment     : (payload)=> dispatch(makeComment(payload)),
    setComment      : (payload)=> dispatch(setComment(payload)),
    setComponent    : (payload)=> dispatch(setComponent(payload)),
    setCommentImage : (payload)=> dispatch(setCommentImage(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    comment : state.teams.comment,
    profile : state.user.profile,
    team    : state.teams.team
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageOverlay);
