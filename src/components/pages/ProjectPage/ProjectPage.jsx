
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

    const { playground, match } = this.props;

    if (playground) {
      const { buildID, title, projectSlug, device } = playground;
    }


    return (<BasePage { ...this.props } className="project-page">
      {(!playground) && (<div>Project page loading...</div>)}
      {(playground) && (<div>
        <div>Title: {playground.title}</div>
        <div>Device: {playground.device.title}</div>
        <div style={{
          width : '100%',
          marginTop : '50px',
          padding : '20px',
          border : '1px dotted #ff00ff',
          fontWeight : 'bold'
        }}>GRID GOES HERE</div>
      </div>)}
    </BasePage>);
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    setPlayground : (payload)=> dispatch(setPlayground(payload)),
  };
};

const mapStateToProps = (state, ownProps)=> {
  return {
    comment    : state.comments.comment,
    profile    : state.user.profile,
    playground : state.builds.playground
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectPage));
