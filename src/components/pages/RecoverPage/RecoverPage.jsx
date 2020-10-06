
import React, { Component } from 'react';
import './RecoverPage.css';

import axios from 'axios';
import { push } from 'connected-react-router';
import { Strings } from 'lang-js-utils';
import ReactPasswordStrength from 'react-password-strength';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';

import BasePage from '../BasePage';
import { RoutePaths } from '../../helpers/Routes';
import DummyForm from '../../forms/DummyForm';
import { API_ENDPT_URL, Pages, Modals } from '../../../consts/uris';
import { updateUserProfile } from '../../../redux/actions';


class RecoverPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
      password      : '',
			password2     : '',
			passMsg       : null,
			passScore     : 0,
			passwordValid : true
    };
  }
  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  handlePassChange = (password, score)=> {
    console.log('%s.handlePassChange()', this.constructor.name, { password, score });

    this.setState({ password,
      passMsg   : null,
      passScore : score
    });
  };

  handlePass2Change = (event)=> {
    console.log('%s.handlePass2Change()', this.constructor.name, { event });
    this.setState({ password2 : event.target.value })
  };

  handleSubmit = (event)=> {
    console.log('%s.handleSubmit()', this.constructor.name, { props : this.props, state : this.state });

    event.preventDefault();

    const { password, password2, passScore } = this.state;
    const passwordValid = (password.length >= 5 && password === password2 && passScore >= 1);

    if (passwordValid) {
      const recoverMatch = matchPath(window.location.pathname, {
        path   : RoutePaths.RECOVER,
        exact  : false,
        strict : false
      });

      const { userID } = recoverMatch.params;

			axios.post(API_ENDPT_URL, {
				action  : 'RESET_PASSWORD',
				payload : { password,
					user_id : userID
				}
			}).then((response)=> {
        console.log('RESET_PASSWORD', response.data);
        this.props.push(`${Pages.TEAM}${Modals.LOGIN}`);

			}).catch((error)=> {
				console.log('RESET_PASSWORD -- ERROR', { error : error.config.data });
			});
		}
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    return (<BasePage { ...this.props } className="create-team-page">
      <RecoverForm { ...this.state}
        onPassChange={this.handlePassChange}
        onPass2Change={this.handlePass2Change}
        onSubmit={this.handleSubmit}
      />
    </BasePage>);
  }
}


const RecoverForm = (props)=> {
  console.log('RecoverForm()', { props });

  const { password, password2, passMsg, passScore, passwordValid } = props;
  return (<div className="recover-form">
    <form>
      <DummyForm />

      <ReactPasswordStrength
        className="react-password-strength"
        // style={{ display : 'none' }}
        minLength={5}
        minScore={1}
        scoreWords={['weak', 'okay', 'good', 'strong', 'stronger']}
        changeCallback={({ password, score })=> props.onPassChange(password, score)}
        inputProps={{
          placeholder  : 'Enter New Password',
          autoComplete : 'new-password'
        }}
      />

      {(passMsg)
        ? (<input type="email" placeholder="Confirm Password" value={passMsg} onChange={props.onPass2Change} autoComplete="off" required />)
        : (<input type="password" placeholder="Confirm Password" value={password2} onChange={props.onPass2Change} autoComplete="off" />)
      }

      <div className="button-wrapper button-wrapper-row">
        <button type="submit" disabled={(password.length < 5 || password2.length < 5 || passScore < 1 || !passwordValid || password !== password2)} onClick={props.onSubmit}>Submit</button>
      </div>
    </form>
  </div>);
};


export default connect(null, { push })(RecoverPage);
