
import React, { Component } from 'react';
import './ProjectOverlay.css';

import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Menu, Item, MenuProvider } from 'react-contexify';
import { connect } from 'react-redux';

import { setComment, setComponent } from '../../../redux/actions';


class ProjectOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  handleAddComment = (event)=> {
    console.log('handleAddComment()', { event });
  }

  handleCommentMarkerClick = (comment)=> {
    console.log('handleCommentMarkerClick()', { comment });
    this.props.setComment(comment);
  };

  handleKeyPress = (event, key)=> {
    console.log('handleKeyPress()', { event, key });

    this.props.setComment(null);
    this.props.setComponent(null);
  };

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { component } = this.props;
    return (<div className="project-overlay">
      <div className="header-wrapper">HEADER</div>
      <div className="content-wrapper"><KeyboardEventHandler handleKeys={['esc']} onKeyEvent={(key, event)=> this.handleKeyPress(event, key)} />
        <img src={component.images.pop()} alt={component.title} />
        <MenuProvider id="menu_id" className="menu-provider">
          <div className="comments-wrapper">
            {(component.comments.filter(({ types })=> (types.includes('op'))).map((comment, i)=> (<ProjectViewCommentMarker key={i} ind={(i+1)} comment={comment} onClick={this.handleCommentMarkerClick} />)))}
          </div>
        </MenuProvider>
      </div>

      <AddCommentMenu onClick={({ event, props })=> console.log('MenuClick', { event, props })} onSubmit={this.handleAddComment} />
    </div>);
  }
}


const ProjectViewCommentMarker = (props)=> {
  // console.log('ProjectViewCommentMarker()', { props });

  const { comment, ind } = props;
  const { position } = comment;
  return (<div className="project-view-comment-marker" onClick={()=> props.onClick(comment)} style={(position) ? {
    top  : `${position.y}px`,
    left : `${position.x}px`
  } : {
    top  : '100px',
    left : '100px'
  }}>
    <div>{ind}</div>
  </div>);
};

const AddCommentMenu = (props)=> {
  console.log('AddCommentMenu()', { props });

  return (<Menu id="menu_id" className="add-comment-menu">
    <div className="form-wrapper">
      <input type="text" className="comment-txt" placeholder="Add Comment" autoFocus />
    </div>
    <div className="button-wrapper button-wrapper-row">
      <button onClick={props.onSubmit}>Submit</button>
      <button className="cancel-button">Cancel</button>
    </div>
  </Menu>);
};


const mapDispatchToProps = (dispatch)=> {
  return ({
    setComment   : (payload)=> dispatch(setComment(payload)),
    setComponent : (payload)=> dispatch(setComponent(payload)),
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
