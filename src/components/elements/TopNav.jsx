
import React, { Component } from 'react';
import './TopNav.css';

import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import TopNavProfile from './TopNavProfile';
import TopNavRate from './TopNavRate';

import { isUserLoggedIn } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';
import { updateDeeplink } from '../../redux/actions';
import deLogo from '../../assets/images/logos/logo-designengine.svg';


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateDeeplink  : (navIDs)=> dispatch(updateDeeplink(navIDs))
	});
};


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			sections  : [{
				title : 'Free Inspect',
				url   : '/inspect'
			}, {
				title : 'Free Parts',
				url   : '/parts'
			}]
		};
	}


	handleLink = (url)=> {
		this.props.updateDeeplink(null);
		this.props.onPage(url);
	};

	handleScore = (score)=> {
// 		console.log('TopNav.handleScore()', score);
		trackEvent('rate', 'score', null, score);
		this.props.onScore(score);
	};

	render() {
// 		console.log('TopNav.render()', this.props, this.state);

		const { pathname } = window.location;
		const { sections } = this.state;

		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row vertical="center" style={{ height : '100%' }}>
					<img onClick={()=> this.handleLink('')} src={deLogo} className="top-nav-logo" alt="Design Engine" />
					{(sections.map((section, i)=> <div key={i} className={(pathname.includes(section.url)) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage(section.url)}>{section.title}</div>))}
					<TopNavRate selected={(pathname.includes('/rate-this'))} onPage={this.handleLink} onScore={this.handleScore} />
				</Row></div>

				<div className="top-nav-column top-nav-column-right">
					{(!isUserLoggedIn())
						? (<>
								<button className="top-nav-button adjacent-button" onClick={()=> this.props.onPage('register')}>Sign Up</button>
								<button className="top-nav-button" onClick={()=> this.props.onPage('login')}>Login</button>
							</>)
						: (<Row vertical="center">
								<TopNavProfile
									onPage={this.props.onPage}
									onLogout={this.props.onLogout}
								/>
						</Row>)}
				</div>
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(TopNav);
