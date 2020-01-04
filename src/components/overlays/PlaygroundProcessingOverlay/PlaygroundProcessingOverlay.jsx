
import React, { Component } from 'react';
import './PlaygroundProcessingOverlay.css';

import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import { POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import { componentsFromTypeGroup } from '../../pages/PlaygroundPage/utils/lookup';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


const PROPS = [
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
      total      : 0
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
		console.log('%s.componentDidUpdate()//////////', this.constructor.name, JSON.stringify({ prevProps : Object.fromEntries(
        Object.entries(prevProps).filter(
          ([key, val])=>PROPS.includes(key)
        )
      ), props : Object.fromEntries(
        Object.entries(this.props).filter(
          ([key, val])=>PROPS.includes(key)
        )
      )}, null, 2));



    const filtered = Object.fromEntries(
      Object.entries(prevProps).filter(
        ([key, val])=>PROPS.includes(key)
      )
    );



    const { playground, typeGroup } = this.props;
    const { total } = this.state;

    if (playground && typeGroup) {
      if (!prevProps.playground && !prevProps.typeGroup) {
        console.log(':::::::::: NO PREV :::::::::::::::')
      }


      const components = componentsFromTypeGroup(playground.components, typeGroup).filter(({ image, root_styles, styles, html, rootStyles }) => (html && styles && rootStyles));
      console.log("REFORMED LIST", components, processed, this.state.total);

      const { processed } = this.state;
      if (processed !== prevState.processed) {
        this.setState({ processed : components.length });
      }

      if (components.length === 0 && this.props.outro && !prevProps.outro) {
        this.setState({ outro : false }, ()=> {
        });
      }


//       if (total === components.length && !this.state.outro) {
//         this.setState({ outro : true }, ()=> {
//         });
//       }
    }
  }

  handleComplete = ()=> {
// 		console.log('%s.handleComplete()', this.constructor.name, this.state);

//     this.props.onPopup({
//       type    : POPUP_TYPE_OK,
//       content : 'Profile updated.',
//       delay   : 125
//       });
//
//     this.setState({ outro : false }, ()=> {
//       this.props.onComplete();
//     });
  };


  render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);
		const { typeGroup } = this.props;
    const { outro, processed, total } = this.state;
    return (<BaseOverlay
      tracking={Modals.PROCESSING}
      outro={false}
      closeable={false}
      title={null}
      onComplete={this.handleComplete}>

      <div className="playground-processing-overlay">
        <div className="playground-processing-overlay-header-wrapper"><h4>Processing Pair URL Data</h4></div>
        <div className="playground-processing-overlay-content-wrapper">
          {`Processing ${total} ${Strings.pluralize((typeGroup) ? typeGroup.title : 'component', total)}…`}
          <div className="playground-processing-overlay-loader-wrapper">
            <div className="playground-processing-overlay-loader">
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
    playground     : state.playground,
    typeGroup      : state.typeGroup,
    componentTypes : state.componentTypes,
    pathname       : state.pathname
  });
};



export default withRouter(connect(mapStateToProps)(PlaygroundProcessingOverlay));
