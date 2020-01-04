
import React, { Component } from 'react';
import './PlaygroundProcessingOverlay.css';

import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import { componentsFromTypeGroup } from '../../pages/PlaygroundPage/utils/lookup';
import { Modals } from '../../../consts/uris';


const UPD_PROPS = [
  'playground',
  'typeGroup'
];



class PlaygroundProcessingOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      outro      : false,
      status     : null,
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
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props.profile, prevState, this.state, snapshot);
		console.log('%s.componentDidUpdate()', this.constructor.name, JSON.stringify({ prevProps : Object.fromEntries(Object.entries(prevProps).filter(([key])=>UPD_PROPS.includes(key))), props : Object.fromEntries(Object.entries(this.props).filter(([key])=>UPD_PROPS.includes(key)))}, null, 2));

    const { playground, typeGroup } = this.props;
    const { total } = this.state;

    if (playground && typeGroup) {
      const components = componentsFromTypeGroup(playground.components, typeGroup);

      if (!prevProps.playground && !prevProps.typeGroup) {
        console.log(':::::::::: NO PREV :::::::::::::::');
        if (this.state.total === -1) {
          this.setState({ total : components.length });
        }
      }

      const processed = components.filter(({ image, html, styles, rootStyles }) => (html && styles && rootStyles));
      console.log("REFORMED LIST", components, processed, this.state.total);

      if (processed.length > prevState.processed) {
        this.setState({ processed : processed.length });
      }

      if (components.length === 0 && this.props.outro && !prevProps.outro) {
        this.setState({ outro : false }, ()=> {
        });
      }
    }
  }

  handleComplete = ()=> {
		console.log('%s.handleComplete()', this.constructor.name, this.state);
//     this.setState({ outro : false }, ()=> {
//       this.props.onComplete();
//     });
  };


  render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);

    return (<BaseOverlay
      tracking={Modals.PROCESSING}
      outro={false}
      closeable={false}
      title={null}
      onComplete={this.handleComplete}>

      <div className="playground-processing-overlay">
        <div className="base-overlay-content-wrapper">
          <div className="base-overlay-loader-wrapper">
            <div className="base-overlay-loader">
              <FontAwesome name="circle-notch" className="base-overlay-loader-spinner" size="3x" spin />
            </div>
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
