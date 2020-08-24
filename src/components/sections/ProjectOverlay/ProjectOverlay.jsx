
import React, { Component } from 'react';
import './ProjectOverlay.css';

import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';

import { setComment, setComponent, setPlayground } from '../../../redux/actions';



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

  handleCommentMarkerClick = (comment)=> {
    console.log('handleCommentMarkerClick()', { comment });
    this.props.setComment(comment);
  };

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { playground, component } = this.props;
    return (<div className="project-overlay">
      <div className="header-wrapper">HEADER</div>
      <div className="content-wrapper">
        <div className="comments-wrapper">
          {(component.comments.map((comment, i)=> (<ProjectViewCommentMarker key={i} ind={(i+1)} comment={comment} onClick={this.handleCommentMarkerClick} />)))}
        </div>
      </div>
    </div>);
  }
}


const ProjectViewCommentMarker = (props)=> {
  console.log('ProjectViewCommentMarker()', { props });

  const { comment, ind } = props;
  return (<div className="project-view-comment-marker" onClick={()=> props.onClick(comment)} style={{
    top  : '100px',
    left : '100px'
  }}>
    <div>{ind}</div>
  </div>);
};

const mapDispatchToProps = (dispatch)=> {
  return ({
    setComment    : (payload)=> dispatch(setComment(payload)),
    setComponent  : (payload)=> dispatch(setComponent(payload)),
    setPlayground : (payload)=> dispatch(setPlayground(payload)),
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    comment    : state.comments.comment,
    params     : state.path,
    component  : state.builds.component,
    profile    : state.user.profile,
    playground : state.builds.playground
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectOverlay);
