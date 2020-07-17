
import React, { Component } from 'react';
import './ProjectPage.css';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BasePage from '../BasePage';
import { setComponent, setPlayground } from '../../../redux/actions';



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

  handleGridItemClick = (component)=> {
    console.log('handleGridItemClick()', { component });

    this.props.setComponent(component);
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
          {(!component) && (<ProjectViewsGrid components={playground.components} onGridItemClick={this.handleGridItemClick} />)}
          {(component) && (<ProjectViewItem components={component} />)}
        </div>
      </div>)}
    </BasePage>);
  }
}


const ProjectViewsGrid = (props)=> {
  console.log('ProjectViewsGrid()', props);

  const { components } = props;
  return (<div className="project-views-grid">
    {components.map((component, i)=> (<div key={i} className="view-grid-item" onClick={()=> props.onGridItemClick(component)}>
      <img src={null} alt="" />
    </div>))}
  </div>);
}


const ProjectViewItem = (props)=> {
  console.log('ProjectViewItem()', props);

  const { components } = props;
  return (<div className="project-view-item">
    <img src={null} alt="" />
  </div>);
}


const mapDispatchToProps = (dispatch)=> {
  return {
    setComponent  : (payload)=> dispatch(setComponent(payload)),
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
