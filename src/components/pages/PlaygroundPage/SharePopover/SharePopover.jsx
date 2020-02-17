import React, { Component } from 'react';
import './SharePopover.css';

import axios from 'axios';
import { Strings } from 'lang-js-utils';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';

import BasePopover from '../../../overlays/BasePopover';
import { API_ENDPT_URL } from '../../../../consts/uris';
import { trackEvent } from '../../../../utils/tracking';
import { POPUP_TYPE_OK } from '../../../overlays/PopupNotification';

class SharePopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      emailValid: false,
      outro: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);
    // 		console.log('%s.componentDidUpdate()', this.constructor.name, this.props);
    // 		const { position } = this.props;
    // 		if (position !== this.state.position) {
    // 			this.setState({ position });
    // 		}
  }

  handleClipboardCopy = () => {
    // 		console.log('%s.handleClipboardCopy()', this.constructor.name, this.props);

    trackEvent('button', `copy-share-url`);
    // 		this.setState({ outro : true });

    this.setState({ outro: true }, () => {
      this.props.onPopup({
        type: POPUP_TYPE_OK,
        content: `Pair URL has been copied to your clipboard!`,
        delay: 125,
        duration: 3333
      });
    });
  };

  handleEmailChange = event => {
    // 		console.log('%s.handleEmailChange()', this.constructor.name);

    const email = event.target.value;
    const emailValid = Strings.isEmail(email);
    this.setState({ email, emailValid });
  };

  handleSubmit = event => {
    // 		console.log('%s.handleSubmit()', this.constructor.name);
    event.preventDefault();

    const { email, emailValid } = this.state;
    if (email.length > 0 && emailValid) {
      trackEvent('button', `send-invite`);
      const { profile, playground, component } = this.props;

      axios
        .post(API_ENDPT_URL, {
          action: 'SHARE_LINK',
          payload: {
            email,
            playground_id: playground.id,
            component_id: component.id,
            user_id: profile.id
          }
        })
        .then(response => {
          console.log('SHARE_LINK', response.data);
          const success = parseInt(response.data.success, 16);

          this.setState({ outro: true });
          this.props.onPopup({
            type: POPUP_TYPE_OK,
            content: success
              ? `Sent <span class="txt-bold">${window.location.href}</span> to <span class="txt-bold">${email}</span>.`
              : `Failed to send share link, try again.`,
            delay: 125,
            duration: 3333
          });
        })
        .catch(error => {});
    } else {
      this.setState({ emailValid: false });
    }
  };

  render() {
    // 		console.log('%s.render()', this.constructor.name, this.props, this.state);

    const { email, emailValid, outro } = this.state;
    const payload = {
      fixed: false,
      position: {
        x: -210,
        y: 18
      },
      offset : null
      // offset: {
      //   right: -50,
      //   top: 22
      // }
    };

    return (
      <BasePopover
        outro={outro}
        payload={payload}
        onOutroComplete={this.props.onClose}
      >
        <div className="share-popover">
          <CopyToClipboard
            text={window.location.href}
            onCopy={this.handleClipboardCopy}
          >
            <div className="share-popover-url">{window.location.href}</div>
          </CopyToClipboard>
          <div className="share-popover-form-wrapper">
            <form onSubmit={this.handleSubmit}>
              <input
                type="text"
                value={email}
                placeholder="Enter Email Address"
                onChange={event => this.handleEmailChange(event)}
              />
              <button
                disabled={!emailValid}
                type="submit"
                onClick={this.handleSubmit}
              >
                Send Email
              </button>
              <CopyToClipboard
                text={window.location.href}
                onCopy={this.handleClipboardCopy}
              >
                <button
                  disabled={false}
                  onClick={event => event.preventDefault()}
                >
                  Copy URL
                </button>
              </CopyToClipboard>
            </form>
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

export default connect(mapStateToProps)(SharePopover);
