
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom'

import SideNav from './components/elements/SideNav';
import TopNav from './components/elements/TopNav';
import BottomNav from './components/elements/BottomNav';
import AddOnsPage from './components/pages/AddOnsPage';
import APIPage from './components/pages/APIPage';
import ExplorePage from './components/pages/ExplorePage';
import HomePage from './components/pages/HomePage';
import InspectorPage from './components/pages/InspectorPage';
import InviteTeamPage from './components/pages/InviteTeamPage';
import LoginPage from './components/pages/LoginPage';
import MissionPage from './components/pages/MissionPage';
import ProfilePage from './components/pages/ProfilePage';
import PrivacyPage from './components/pages/PrivacyPage';
import RecoverPage from './components/pages/RecoverPage';
import RegisterPage from './components/pages/RegisterPage';
import Status404Page from './components/pages/Status404Page';
import TermsPage from './components/pages/TermsPage';
import UploadPage from './components/pages/UploadPage';

import StripeOverlay from './components/elements/StripeOverlay';

import { fetchUserProfile, updateUserProfile } from './redux/actions';
import { idsFromPath, urlSlugTitle } from './utils/funcs';
import { initTracker, trackEvent } from './utils/tracking';

const wrapper = React.createRef();


const mapStateToProps = (state)=> {
	return ({ profile : state.userProfile });
};

function mapDispatchToProps(dispatch) {
	return ({
		fetchUserProfile  : ()=> dispatch(fetchUserProfile()),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
}


class App extends Component {
	constructor(props) {
		super(props);

		const pathIDs = idsFromPath();

		this.state = {
			userID       : 0,
			uploadID     : pathIDs.uploadID,
			pageID       : pathIDs.pageID,
			artboardID   : pathIDs.artboardID,
			sliceID      : pathIDs.sliceID,
			overlayAlert : null,
			processing   : false
		};
	}

	componentDidMount() {
		if (typeof cookie.load('user_id') === 'undefined') {
			cookie.save('user_id', '-1', { path : '/' });

		} else {
			this.props.fetchUserProfile();
		}

		initTracker();
		trackEvent('load');

		const { uploadID, pageID } = this.state;
		if (window.location.pathname.includes('/artboard/')) {
			if (uploadID === 0) {
				let formData = new FormData();
				formData.append('action', 'PAGE');
				formData.append('page_id', pageID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('PAGE', response.data);
						this.setState({ uploadID : response.data.page.upload_id });
					}).catch((error) => {
				});
			}

			this.handleAddPageView(pageID);
		}
	}

	handleAddPageView = (pageID)=> {
		let formData = new FormData();
		formData.append('action', 'ADD_VIEW');
		formData.append('page_id', pageID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('ADD_VIEW', response.data);
			}).catch((error) => {
		});
	};

	handleArtboardClicked = (artboard)=> {
		console.log('App.handleArtboardClicked()', artboard);
		this.handleAddPageView(artboard.pageID);

		this.props.history.push('/artboard/' + artboard.uploadID + '/' + artboard.pageID + '/' + artboard.id + '/' + urlSlugTitle(artboard.title));
		this.setState({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});
		wrapper.current.scrollTo(0, 0);
	};

	handleAddOns = ()=> {
		console.log('App.handleAddOns()');
// 		this.setState({ overlayAlert: 'download' });
	};

	handleHomeReset = ()=> {
		wrapper.current.scrollTo(0, 0);

		this.setState({
			uploadID   : 0,
			pageID     : 0,
			artboardID : 0
		});

		this.props.history.push('/');
	};

	handleLogout = ()=> {
		cookie.save('user_id', '-1', { path : '/' });

		this.props.updateUserProfile(null);
		window.location.href = '/';
	};

	handleOverlay = (overlayType, buttonType)=> {
		console.log('App.handleOverlay()', overlayType, buttonType);
		this.setState({ overlayAlert : null });
		if (overlayType === 'register') {
			if (buttonType === 'submit') {
				window.location.reload();
			}

		} else if (overlayType === 'upload') {
			if (buttonType === 'background') {
				window.location.reload();

			} else if (buttonType === 'complete') {
				window.location.reload();
			}
		}
	};

	handlePage = (url)=> {
		console.log('App.handlePage()', url);

		const { pathname } = window.location;
		if (wrapper.current) {
			wrapper.current.scrollTo(0, 0);
		}

		if (url === '//') {
			this.props.history.goBack();

		} else if (url === '') {
			this.setState({
				uploadID   : 0,
				pageID     : 0,
				artboardID : 0
			});

			if (pathname === '/') {
				window.location.href = '/';

			} else {
				this.props.history.push('/');
			}

		} else {
			if (pathname === '/' + url) {
				window.location.href = '/' + url;

			} else {
				this.props.history.push('/' + url);
			}
		}
	};

	handleProcess = (state)=> {
		wrapper.current.scrollTo(0, 0);
		this.setState({ processing : (state === 0) });
	};

	handleSideNavUploadItem = (upload)=> {
		console.log('App.handleSideNavUploadItem()', upload);

		if (upload.selected && this.state.uploadID !== upload.id) {
			this.setState({
				uploadID   : upload.id,
				pageID     : 0,
				artboardID : 0
			});

			this.handlePage('proj/' + upload.id + '/' + urlSlugTitle(upload.title));
		}
	};

	handleSideNavPageItem = (page)=> {
		console.log('App.handleSideNavPageItem()', page);

		if (page.selected) {
			let formData = new FormData();
			formData.append('action', 'ARTBOARDS');
			formData.append('upload_id', this.state.uploadID);
			formData.append('page_id', page.id);
			formData.append('slices', '0');
			formData.append('offset', '0');
			formData.append('length', '-1');
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('ARTBOARDS', response.data);

					const artboard = response.data.artboards[0];
					this.handleAddPageView(page.id);
					this.props.history.push('/artboard/' + page.uploadID + '/' + page.id + '/' + artboard.id + '/' + urlSlugTitle(artboard.title));
					this.setState({
						uploadID   : page.uploadID,
						pageID     : page.id,
						artboardID : artboard.id
					});
				}).catch((error) => {
			});

		} else {
			this.setState({ pageID : 0 });
		}
	};

	handleSideNavArtboardItem = (artboard)=> {
		console.log('App.handleSideNavArtboardItem()', artboard);

		this.handleAddPageView(artboard.pageID);
		this.props.history.push('/artboard/' + artboard.uploadID + '/' + artboard.pageID + '/' + artboard.id + '/' + urlSlugTitle(artboard.title));
		this.setState({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});
	};

	handleSideNavSliceItem = (obj)=> {
		console.log('App.handleSideNavSliceItem()', obj);
// 		this.props.history.push('/artboard/' + this.state.pageID + '/' + this.state.artboardID + '/' + obj.id);
// 		this.setState({ sliceID : obj.id });
	};


	render() {
  	console.log('App.render()', this.props, this.state);

  	const { uploadID, pageID, artboardID, sliceID } = this.state;
  	const { processing } = this.state;

  	return (
    	<div className="site-wrapper">
		    {(/chrom(e|ium)/.test(navigator.userAgent.toLowerCase()))
			    ? (<div>
				    <TopNav
					    onHome={()=> this.handleHomeReset()}
					    onPage={(url)=> this.handlePage(url)}
					    onLogout={()=> this.handleLogout()}
				    />

				    <SideNav
					    userID={(this.props.profile) ? this.props.profile.id : 0}
					    uploadID={uploadID}
					    pageID={pageID}
					    artboardID={artboardID}
					    sliceID={sliceID}
					    processing={processing}
					    onUploadItem={(obj)=> this.handleSideNavUploadItem(obj)}
					    onPageItem={(obj)=> this.handleSideNavPageItem(obj)}
					    onArtboardItem={(obj)=> this.handleSideNavArtboardItem(obj)}
					    onSliceItem={(obj)=> this.handleSideNavSliceItem(obj)}
					    onLogout={()=> this.handleLogout()}
					    onUpload={()=> this.handlePage('upload')}
					    onPage={(url)=> this.handlePage(url)}
				    />

				    <div className="content-wrapper" ref={wrapper}>
					    <Switch>
						    <Route exact path="/" render={()=> <HomePage uploadID={uploadID} pageID={pageID} onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} />} />
					      <Route exact path="/add-ons" render={()=> <AddOnsPage onPage={(url)=> this.handlePage(url)} />} />
					      <Route exact path="/api" render={()=> <APIPage onPage={(url)=> this.handlePage(url)} onLogout={()=> this.handleLogout()} />} />
						    <Route exact path="/artboard/:uploadID/:pageID/:artboardID/:artboardSlug" render={(props)=> <InspectorPage {...props} onPage={(url)=> this.handlePage(url)} />} />
						    <Route exact path="/explore" render={()=> <ExplorePage onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} />} />
						    <Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={(url)=> this.handlePage(url)} />} />
						    <Route exact path="/login" render={()=> <LoginPage onPage={(url)=> this.handlePage(url)} />} />
					      <Route exact path="/mission" render={()=> <MissionPage />} />
						    <Route exact path="/new" render={()=> <UploadPage onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} onProcess={(state)=> this.handleProcess(state)} />} />
					      <Route exact path="/profile" render={()=> <ProfilePage onPage={(url)=> this.handlePage(url)} />} />
					      <Route exact path="/privacy" render={()=> <PrivacyPage />} />
						    <Route path="/proj/" render={()=> <HomePage uploadID={uploadID} pageID={pageID} onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} />} />
						    <Route exact path="/recover" render={()=> <RecoverPage onPage={(url)=> this.handlePage(url)} />} />
						    <Route exact path="/recover/password" render={()=> <RecoverPage onPage={(url)=> this.handlePage(url)} />} />
						    <Route exact path="/register" render={()=> <RegisterPage onPage={(url)=> this.handlePage(url)} />} />
					      <Route exact path="/terms" render={()=> <TermsPage />} />
					      <Route render={()=> <Status404Page />} />
					    </Switch>

					    <BottomNav wrapperHeight={(wrapper.current) ? wrapper.current.clientHeight : 0} onPage={(url)=> this.handlePage(url)} onLogout={()=> this.handleLogout()} />
				    </div>

				    {(this.state.overlayAlert === 'payment') && (
					    <StripeOverlay onClick={(buttonType)=> this.handleOverlay('download', buttonType)} />
				    )}
				    </div>)
			    : (<div className="unsupported-browser">
				      This site best viewed in Chrome.
			      </div>)}
	    </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
