
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
      total      : -1
    };
  }

  componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

    const { playground, typeGroup } = this.props;
    if (playground && typeGroup) {
      this.setState({ total : componentsFromTypeGroup(playground.components, typeGroup).length });
    }
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state }, snapshot);
// 		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps : Object.fromEntries(Object.entries(prevProps).filter(([key])=>UPD_PROPS.includes(key))), props : Object.fromEntries(Object.entries(this.props).filter(([key])=>UPD_PROPS.includes(key))) });

    const { playground, typeGroup } = this.props;
    const { outro, total } = this.state;

    if (playground && typeGroup) {
      const components = componentsFromTypeGroup(playground.components, typeGroup);

      if (typeGroup !== !prevProps.typeGroup) {
        if (total === -1) {
          console.log(':::::::::: NO PREV :::::::::::::::');
          this.setState({ total : components.length });
        }
      }

      const processed = components.filter(({ html, styles, rootStyles }) => (html && styles && rootStyles));
      console.log("REFORMED LIST", { components, prcMap : components.map(({ html, styles, rootStyles }) => ({ html, styles, rootStyles })), processed, total : this.state.total });

      if (processed.length !== this.state.processed) {
        this.setState({ processed : processed.length });
      }

      if (processed.length === total && !outro) {
        this.setState({ outro : true });
      }
    }
  }

  handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name, this.state);
    this.props.onComplete();
  };


  render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

    const { playground } = this.props;
    const { outro } = this.state;

    return (<BaseOverlay
      tracking={Modals.PROCESSING}
      outro={outro}
      closeable={false}
      title={null}
      type={OVERLAY_TYPE_POSITION_OFFSET}
      offset={{ x : 63, y : -63 }}
      delay={75 + ((!playground << 0) * 250)}
      onComplete={this.handleComplete}>
        <div className="playground-processing-overlay">
          <div className="base-overlay-loader-wrapper">
            <div className="base-overlay-loader">
              <FontAwesome name="circle-notch" className="base-overlay-loader-spinner" size="3x" spin />
            </div>
          </div>
        </div>
    </BaseOverlay>);
  }
}


const mapStateToProps = (state, ownProps)=> {
  return ({
    playground : state.playground,
    typeGroup  : state.typeGroup,
  });
};



export default withRouter(connect(mapStateToProps)(PlaygroundProcessingOverlay));
