
import React, { Component } from 'react';
import './PlaygroundProcessingOverlay.css';

import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay, { OVERLAY_TYPE_POSITION_OFFSET } from '../../../overlays/BaseOverlay';
import { componentsFromTypeGroup } from '../utils/lookup';
import { Modals } from '../../../../consts/uris';


// const UPD_PROPS = [
//   'playground',
//   'typeGroup'
// ];


class PlaygroundProcessingOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      outro      : false,
      processed  : 0,
      total      : -1,
      completed  : false
    };
  }

  componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

    const {root, playground, typeGroup } = this.props;
    if (!root) {
      if (playground && typeGroup) {
        const components = componentsFromTypeGroup(playground.components, typeGroup);
        const processed = components.filter(({ html, styles, rootStyles }) => (html && styles && rootStyles)).length;

        if (components.length === processed){
          this.setState({ outro : true });
        }
      }
    }
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state }, snapshot);
// 		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps : Object.fromEntries(Object.entries(prevProps).filter(([key])=>UPD_PROPS.includes(key))), props : Object.fromEntries(Object.entries(this.props).filter(([key])=>UPD_PROPS.includes(key))) });

    const { playground, typeGroup, root, outro } = this.props;
    const { total, completed } = this.state;

    if (root) {
      if (outro && !this.state.outro) {
        this.setState({ outro : true });
      }

    } else {
      if (playground && typeGroup) {
        const components = componentsFromTypeGroup(playground.components, typeGroup);
        const processed = components.filter(({ html, styles, rootStyles }) => (html && styles && rootStyles)).length;

        console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state, root, outro, typeGroup : typeGroup.id, total, processed : this.state.processed, components : componentsFromTypeGroup(playground.components, typeGroup)});

        const resetState = ()=> {
          this.setState({
            outro     : false,
            processed : 0,
            total     : components.length,
            completed : false
          }, ()=> {
            console.log("RESET LIST", { components : components.map(({ html, styles, rootStyles }) => ({ html, styles, rootStyles })), processed : components.filter(({ html, styles, rootStyles }) => (html && styles && rootStyles)), total : this.state.total });
          });
        };

//       console.log('%s.componentDidUpdate()', this.constructor.name, { root, outro, typeGroup, total, prevTotal : prevState.total, completed });
//       if (typeGroup !== !prevProps.typeGroup && (total === -1 || total !== prevState.total)) {
//         if (total !== components.length || prevProps.typeGroup !== typeGroup) {


        if (total !== components.length) {
          console.log(':::::::::: NO PREV :::::::::::::::');
           resetState();


        } else {
          console.log("ACT LIST", { components : components.map(({ html, styles, rootStyles }) => ({ html, styles, rootStyles })), processed : components.filter(({ html, styles, rootStyles }) => (html && styles && rootStyles)), total : this.state.total });
        }

        if (processed > this.state.processed) {
          console.log("INC LIST", { components : components.map(({ html, styles, rootStyles }) => ({ html, styles, rootStyles })), processed : components.filter(({ html, styles, rootStyles }) => (html && styles && rootStyles)), total : this.state.total });
          this.setState({ processed });
        }

        if (processed === total && !this.state.outro) {
          console.log("DONE LIST", { components : components.map(({ html, styles, rootStyles }) => ({ html, styles, rootStyles })), processed : components.filter(({ html, styles, rootStyles }) => (html && styles && rootStyles)), total : this.state.total });
          this.setState({ outro : true });
        }

        if (processed === total && this.state.outro && !completed) {
          this.handleComplete();
          this.setState({
            outro     : false,
            completed : true
          });
        }
      }
    }
  }

  handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name, this.state);
    this.setState({
      outro     : false,
//       processed : 0,
//       total     : -1,
      completed : true
    }, ()=> {
      this.props.onComplete();
    });
  };


  render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);

    const { playground, root } = this.props;
    const { outro, completed } = this.state;

    return ((!completed) ? (<BaseOverlay
      tracking={(root) ? Modals.SITE : Modals.PROCESSING}
      outro={outro}
      blocking={root}
      closeable={false}
      title={null}
      type={OVERLAY_TYPE_POSITION_OFFSET}
      offset={{ x : 63, y : -63 }}
      delay={75 + ((!playground << 0) * 250)}
      onComplete={this.handleComplete}>
        <div className="playground-processing-overlay" data-blocking={root}>
          <div className="base-overlay-loader-wrapper">
            <div className="base-overlay-loader">
              <FontAwesome name="circle-notch" className="base-overlay-loader-spinner" size="3x" spin />
            </div>
          </div>
        </div>
    </BaseOverlay>) : (null));
  }
}


const mapStateToProps = (state, ownProps)=> {
  return ({
    playground : state.playground,
    typeGroup  : state.typeGroup,
  });
};



export default withRouter(connect(mapStateToProps)(PlaygroundProcessingOverlay));
