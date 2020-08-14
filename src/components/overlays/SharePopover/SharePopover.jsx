import React, { Component } from 'react';
import './SharePopover.css';

import axios from 'axios';
import { Browsers, Strings } from 'lang-js-utils';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';

import BasePopover from '../BasePopover';
import { POPUP_TYPE_OK } from '../PopupNotification';

import { API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';

const POSITION = {
  fixed    : false,
  position : {
    x : -195,
    y : 5
  }
};

class SharePopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url   : null,
      outro : false
    };
  }

  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
    this.onPathname();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
    this.onPathname();
  }

  handleClipboardCopy = (text=null)=> {
    console.log('%s.handleClipboardCopy()', this.constructor.name, { props : this.props, text });

    trackEvent('button', `copy-share-url`);
    this.setState({ outro : true }, ()=> {
      this.props.onPopup({
        type     : POPUP_TYPE_OK,
        content  : 'Project URL has been copied to your clipboard',
        delay    : 125,
        duration : 3333
      });
    });
  };

  // handleEmailChange = (event)=> {
  //   // console.log('%s.handleEmailChange()', this.constructor.name);

  //   const email = event.target.value;
  //   const emailValid = Strings.isEmail(email);
  //   this.setState({ email, emailValid });
  // };

  handleSubmit = (event)=> {
    // console.log('%s.handleSubmit()', this.constructor.name);
    event.preventDefault();

    const { email, emailValid } = this.state;
    if (email.length > 0 && emailValid) {
      trackEvent('button', `send-invite`);
      const { profile, team, playground, component } = this.props;

      axios.post(API_ENDPT_URL, {
        action  : 'SHARE_LINK',
        payload : { email,
          playground_id : playground.id,
          component_id  : component.id,
          user_id       : profile.id,
          team_id       : team.id,
          uri           : window.location.href
        }
      }).then((response)=> {
        console.log('SHARE_LINK', response.data);
        const success = parseInt(response.data.success, 16);

        this.setState({ outro : true });
        this.props.onPopup({
          type    : POPUP_TYPE_OK,
          content : (success) ? `Sent <span class="txt-bold">${window.location.href}</span> to <span class="txt-bold">${email}</span>.` : 'Failed to send share link, try again.',
          delay    : 125,
          duration : 3333
        });
      }).catch((error)=> {});

    } else {
      this.setState({ emailValid : false });
    }
  };

  onPathname = ()=> {
    console.log('%s.onPathname()', this.constructor.name);

    const { pathname } = this.props;
    if (pathname && (this.state.url === null)) {
      const url = `${window.location.protocol}//${window.location.hostname}${pathname}`;
      this.setState({ url });
    }
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state, browser : Browsers });

    const { url, outro } = this.state;
    return (<BasePopover outro={outro} payload={POSITION} onOutroComplete={this.props.onClose}>
      <div className="share-popover">
        <CopyToClipboard text={url} onCopy={()=> this.handleClipboardCopy(url)}>
          <div className="copy-wrapper">
            {/* <div className="url" data-copied={Browsers.clipboardText() !== null}>{url}</div> */}
            <div className="url" data-copied={false}>{url}</div>
            <button>Copy</button>
          </div>
        </CopyToClipboard>
        <button className="cancel-button" onClick={(event)=> this.setState({ outro : true })}>Cancel</button>
      </div>
    </BasePopover>);
  }
}


const mapStateToProps = (state, ownProps)=> {
  return {
    profile  : state.user.profile,
    team     : state.teams.team,
    comment  : state.comments.comment,
    pathname : state.router.location.pathname
  };
};


export default connect(mapStateToProps)(SharePopover);
