
import React, { Component } from 'react';
import './ProjectPage.css';

import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';

import BasePage from '../BasePage';
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

    const { playground, component } = this.props;
    return (<BasePage { ...this.props } className="project-page" data-comments={(window.location.href.includes('/comments'))}>
      {(!playground) && (<div>Project page loading...</div>)}
      {(playground && Object.keys(playground).length > 1) && (<div className="view-wrapper" data-grid={(component === null)}>
        {(!component) && (<ProjectViewsGrid components={playground.components} onGridItemClick={this.handleGridItemClick} />)}
      </div>)}
    </BasePage>);
  }
}

const ProjectViewsGrid = (props)=> {
  console.log('ProjectViewsGrid()', { props });

  const { components } = props;
  return (<div className="project-views-grid">
    {components.map((component, i)=> (<div key={i} className="view-grid-item" onClick={()=> props.onGridItemClick(component)}>
      <img src={[...component.images].shift()} alt={component.title} />
    </div>))}
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
    comment    : state.builds.comment,
    params     : state.path,
    component  : state.builds.component,
    profile    : state.user.profile,
    playground : state.builds.playground
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage);
