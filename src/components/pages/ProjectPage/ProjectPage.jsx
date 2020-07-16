
import React, { Component } from 'react';
import './ProjectPage.css';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BasePage from '../BasePage';
import { setPlayground } from '../../../redux/actions';



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

  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { playground, match, component } = this.props;

    if (playground) {
      const { buildID, title, projectSlug, device } = playground;
    }

    return (<BasePage { ...this.props } className="project-page">
      {(!playground) && (<div>Project page loading...</div>)}
      {(playground && Object.keys(playground).length > 1) && (<div>
        <div>Title: {playground.title}</div>
        <div>Device: {playground.device.title}</div>
        <div className="content-wrapper" data-grid={(component === null)}>
          <ProjectViewsGrid components={playground.components} />
        </div>
      </div>)}
    </BasePage>);
  }
}


const ProjectViewsGrid = (props)=> {
  console.log('ProjectViewsGrid()', props);

  const { components } = props;
  return (<div className="project-views-grid">
    {components.map((component, i)=> (<div key={i} className="view-grid-item">
      <img src={null} alt="" />
    </div>))}
  </div>);
}





const mapDispatchToProps = (dispatch)=> {
  return {
    setPlayground : (payload)=> dispatch(setPlayground(payload)),
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    comment    : state.comments.comment,
    component  : state.builds.component,
    profile    : state.user.profile,
    playground : state.builds.playground
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectPage));
