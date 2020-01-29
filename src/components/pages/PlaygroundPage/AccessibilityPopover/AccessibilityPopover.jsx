import React, { Component } from "react";
import "./AccessibilityPopover.css";

import { Strings } from "lang-js-utils";
import CopyToClipboard from "react-copy-to-clipboard";
import { connect } from "react-redux";

import BasePopover from "../../../overlays/BasePopover";
import { API_ENDPT_URL } from "../../../../consts/uris";
import { trackEvent } from "../../../../utils/tracking";
import { POPUP_TYPE_OK } from "../../../overlays/PopupNotification";

class AccessibilityPopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      outro: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);
  }

  handleEmailChange = event => {
    // 		console.log('%s.handleEmailChange()', this.constructor.name);

    const email = event.target.value;
    const emailValid = Strings.isEmail(email);
    this.setState({ email, emailValid });
  };

  render() {
    //    		console.log('%s.render()', this.constructor.name, this.props, this.state);

    const { email, emailValid, outro } = this.state;
    
    return (
      <BasePopover
        outro={outro}
        payload={payload}
        onOutroComplete={this.props.onClose}
      >
        <div className="accessibility-popover">
          <div className="accessibility-popover-tree-wrapper">
            
          </div>
        </div>
      </BasePopover>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    profile: state.userProfile,
    playground: state.playground,
    component: state.component
  };
};

export default connect(mapStateToProps)(AccessibilityPopover);
