
import React, { Component } from 'react';
import './ProjectPage.css';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BasePage from '../BasePage';
import BaseComment from '../../iterables/BaseComment';
import { setComment, setComponent, setPlayground } from '../../../redux/actions';



class ProjectPage extends Component {
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

  handleGridItemClick = (component)=> {
    console.log('handleGridItemClick()', { component });
    this.props.setComponent(component);
  };

  handleViewClick = (event)=> {
    console.log('handleViewClick()', { event });

    const { component } = this.props;
    this.props.setComment(null);
    this.props.setComponent(component);
  };

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { playground, match, component, params } = this.props;

    if (playground) {
      const { buildID, title, projectSlug, device } = playground;
    }

    return (<BasePage { ...this.props } className="project-page" data-comments={(window.location.href.includes('/comments'))}>
      {(!playground) && (<div>Project page loading...</div>)}
      {(playground && Object.keys(playground).length > 1) && (<div className="view-wrapper" data-grid={(component === null)}>
        {(!component) && (<ProjectViewsGrid components={playground.components} onGridItemClick={this.handleGridItemClick} />)}
        {(component) && (<div className="view-item-wrapper">
          <ProjectViewItem components={component} onClick={this.handleViewClick} />
          <div className="view-item-comments-wrapper">
            {(component.comments.map((comment, i)=> (<ProjectViewCommentMarker key={i} ind={(i+1)} comment={comment} onClick={this.handleCommentMarkerClick} />)))}
          </div>
        </div>)}
      </div>)}
      {(playground && component) && (<ProjectPageCommentsList comments={component.comments} />)}
      {(playground) && (<ProjectPageFooter component={component} />)}
    </BasePage>);
  }
}


const ProjectPageFooter = (props)=> {
  console.log('ProjectPageFooter()', props);

  const { component } = props;
  return (<div className="project-page-footer">
    Project {(component) ? 'Details' : 'Views'} Footer
  </div>);
};


const ProjectViewsGrid = (props)=> {
  console.log('ProjectViewsGrid()', props);

  const { components } = props;
  return (<div className="project-views-grid">
    {components.map((component, i)=> (<div key={i} className="view-grid-item" onClick={()=> props.onGridItemClick(component)}>
      <img src={null} alt="" />
    </div>))}
  </div>);
}


const ProjectPageCommentsList = (props)=> {
  console.log('ProjectPageCommentsList()', props);

  const { comments } = props;
  return (<div className="project-page-comments-list" data-collapsed={(!window.location.href.includes('/comments'))}>
    <div className="item-wrapper">
      {([ ...comments, ...comments, ...comments].map((comment, i)=> (<ProjectPageCommentsListComment key={i} comment={comment} />)))}
    </div>
  </div>);
}

const ProjectPageCommentsListComment = (props)=> {
  console.log('ProjectPageCommentsListComment()', props);

  const { comment } = props;
  return (<div className="project-page-comments-list-comment">
    [{comment.id}] {comment.content} - @{comment.author.username}
  </div>);
}


const ProjectViewItem = (props)=> {
  console.log('ProjectViewItem()', props);

  const { components } = props;
  return (<div className="project-view-item" onClick={props.onClick}>
    <img src={null} alt="" />
  </div>);
}

const ProjectViewCommentMarker = (props)=> {
  console.log('ProjectViewCommentMarker()', props);

  const { comment, ind } = props;
  return (<div className="project-view-comment-marker" onClick={()=> props.onClick(comment)} style={{
    top  : '100px',
    left : '100px'
  }}>
    <div>{ind}</div>
  </div>);
};

const mapDispatchToProps = (dispatch)=> {
  return {
    setComment    : (payload)=> dispatch(setComment(payload)),
    setComponent  : (payload)=> dispatch(setComponent(payload)),
    setPlayground : (payload)=> dispatch(setPlayground(payload)),
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    comment    : state.comments.comment,
    params     : state.path,
    component  : state.builds.component,
    profile    : state.user.profile,
    playground : state.builds.playground
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectPage));
