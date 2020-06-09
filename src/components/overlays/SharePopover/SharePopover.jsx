import axios from 'axios';
import { Strings } from 'lang-js-utils';
import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import { API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';
import BasePopover from '../BasePopover';
import { POPUP_TYPE_OK } from '../PopupNotification';
import './SharePopover.css';



class SharePopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email      : '',
      emailValid : false,
      outro      : false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);
    // console.log('%s.componentDidUpdate()', this.constructor.name, this.props);
    // 		const { position } = this.props;
    // 		if (position !== this.state.position) {
    // 			this.setState({ position });
    // 		}
  }

  handleClipboardCopy = (text)=> {
    console.log('%s.handleClipboardCopy()', this.constructor.name, { props : this.props, text });

    trackEvent('button', `copy-share-url`);
    		this.setState({ outro : true });

    this.setState({ outro : true }, ()=> {
      this.props.onPopup({
        type     : POPUP_TYPE_OK,
        content  : 'Project URL has been copied to your clipboard',
        delay    : 125,
        duration : 3333
      });
    });
  };

  handleEmailChange = (event)=> {
    // console.log('%s.handleEmailChange()', this.constructor.name);

    const email = event.target.value;
    const emailValid = Strings.isEmail(email);
    this.setState({ email, emailValid });
  };

  handleSubmit = (event)=> {
    // console.log('%s.handleSubmit()', this.constructor.name);
    event.preventDefault();

    const { email, emailValid } = this.state;
    if (email.length > 0 && emailValid) {
      trackEvent('button', `send-invite`);
      const { profile, team, playground, component } = this.props;

      axios
        .post(API_ENDPT_URL, {
          action  : 'SHARE_LINK',
          payload : { email,
            playground_id : playground.id,
            component_id  : component.id,
            user_id       : profile.id,
            team_id       : team.id,
            uri           : window.location.href
          }
        })
        .then((response)=> {
          console.log('SHARE_LINK', response.data);
          const success = parseInt(response.data.success, 16);

          this.setState({ outro : true });
          this.props.onPopup({
            type    : POPUP_TYPE_OK,
            content : (success) ? `Sent <span class="txt-bold">${window.location.href}</span> to <span class="txt-bold">${email}</span>.` : 'Failed to send share link, try again.',
            delay    : 125,
            duration : 3333
          });
        })
        .catch((error)=> {});
    } else {
      this.setState({ emailValid : false });
    }
  };

  render() {
    // console.log('%s.render()', this.constructor.name, this.props, this.state);

    const { playground, typeGroup, component, comment } = this.props;
    const { email, emailValid, outro } = this.state;
    const payload = {
      fixed    : false,
      position : {
        x : -310,
        y : 18
      },
      offset   : null
    };

    const shareURL = (comment) ? comment.uri : (component) ? component.uri : (typeGroup) ? typeGroup.url : (playground ) ? playground.uri : '/404';

    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state, shareURL });

    return (<BasePopover outro={outro} payload={payload} onOutroComplete={this.props.onClose}>
      <div className="share-popover">
        <CopyToClipboard text={window.location.href} onCopy={()=> this.handleClipboardCopy(window.location.href)}>
          <div className="share-popover-url">{window.location.href}</div>
        </CopyToClipboard>

        <div className="share-popover-form-wrapper">
          <form onSubmit={this.handleSubmit}>
            <input type="text" value={email} placeholder="Enter Email Address" onChange={(event)=> this.handleEmailChange(event)} autoFocus />
            <button disabled={!emailValid} type="submit" onClick={this.handleSubmit}>Submit</button>
            <CopyToClipboard text={window.location.href} onCopy={()=> this.handleClipboardCopy(window.location.href)}>
              <button>Copy URL</button>
            </CopyToClipboard>
          </form>
        </div>
      </div>
    </BasePopover>);
  }
}

const mapStateToProps = (state, ownProps)=> {
  return {
    profile    : state.userProfile,
    team       : state.team,
    playground : state.playground,
    typeGroup  : state.typeGroup,
    component  : state.component,
    comment    : state.comment
  };
};

export default connect(mapStateToProps)(SharePopover);
