
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

import { fetchUserProfile, updateNavigation, updateUserProfile } from './redux/actions';
import { buildInspectorPath, className, idsFromPath, isExplorePage, isInspectorPage, scrollOrigin, buildProjectPath } from './utils/funcs';
import { initTracker, trackEvent } from './utils/tracking';

const wrapper = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		navigation : state.navigation,
		profile    : state.userProfile
	});
};

function mapDispatchToProps(dispatch) {
	return ({
		fetchUserProfile  : ()=> dispatch(fetchUserProfile()),
		updateNavigation  : (navIDs)=> dispatch(updateNavigation(navIDs)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
}


class App extends Component {
	constructor(props) {
		super(props);

// 		const pathIDs = idsFromPath();
		this.state = {
			userID       : 0,
// 			uploadID     : pathIDs.uploadID,
// 			pageID       : pathIDs.pageID,
// 			artboardID   : pathIDs.artboardID,
// 			sliceID      : pathIDs.sliceID,
			overlayAlert : null,
			processing   : false
		};
	}

	componentDidMount() {
		if (typeof cookie.load('user_id') === 'undefined') {
			cookie.save('user_id', '0', { path : '/' });

		} else {
			this.props.fetchUserProfile();
		}

		initTracker(cookie.load('user_id'));
		trackEvent('site', 'load');

		const { uploadID, pageID, artboardID, sliceID } = idsFromPath();
		this.props.updateNavigation({ uploadID, pageID, artboardID, sliceID });

		//const { uploadID, pageID } = this.state;
		if (isInspectorPage() && uploadID === 0) {
			let formData = new FormData();
			formData.append('action', 'PAGE');
			formData.append('page_id', pageID);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('PAGE', response.data);
					this.handleAddPageView(pageID);
// 					this.setState({ uploadID : response.data.page.upload_id });

					this.props.updateNavigation({ uploadID : response.data.page.upload_id });
				}).catch((error) => {
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('App.componentDidUpdate()', prevProps, this.props, prevState);

// 		const pathIDs = idsFromPath();
// 		if (isInspectorPage() && (this.state.uploadID !== pathIDs.uploadID || this.state.pageID !== pathIDs.pageID || this.state.artboardID !== pathIDs.artboardID || this.state.sliceID !== pathIDs.sliceID)) {
// 			const { uploadID, pageID, artboardID, sliceID } = pathIDs;
// 			this.props.updateNavigation({ uploadID, pageID, artboardID, sliceID });
// 			this.setState({ uploadID, pageID, artboardID, sliceID });
// 		}

		if (prevProps.navigation !== this.props.navigation) {
// 			const { uploadID, pageID, artboardID, sliceID } = this.props;
// 			this.props.updateNavigation({ uploadID, pageID, artboardID, sliceID });
// 			this.setState({ uploadID, pageID, artboardID, sliceID });
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

		this.handlePage(buildInspectorPath(artboard.uploadID, artboard.pageID, artboard.id, artboard.title).substring(1));
// 		this.props.history.push('/page/' + artboard.uploadID + '/' + artboard.pageID + '/' + artboard.id + '/' + convertURLSlug(artboard.title));
		this.props.updateNavigation({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});

// 		this.setState({
// 			uploadID   : artboard.uploadID,
// 			pageID     : artboard.pageID,
// 			artboardID : artboard.id
// 		});

		scrollOrigin(wrapper.current);
	};

	handleAddOns = ()=> {
		console.log('App.handleAddOns()');
// 		this.setState({ overlayAlert: 'download' });
	};

	handleHomeReset = ()=> {
		scrollOrigin(wrapper.current);

		this.props.updateNavigation({
			uploadID   : 0,
			pageID     : 0,
			artboardID : 0
		});
		// 			this.setState({
// 				uploadID   : 0,
// 				pageID     : 0,
// 				artboardID : 0
// 			});

		this.props.history.push('/');
	};

	handleLogout = ()=> {
		cookie.save('user_id', '0', { path : '/' });

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
		url = url.substring((url.charAt(0) === '/') ? 1 : 0);

		const { pathname } = window.location;

		if (pathname.split('/')[1] !== url.split('/')[0]) {
			scrollOrigin(wrapper.current);
		}

		if (url === '<<') {
			this.props.history.goBack();

		} else if (url === '') {
			this.props.updateNavigation({
				uploadID   : 0,
				pageID     : 0,
				artboardID : 0
			});
// 			this.setState({
// 				uploadID   : 0,
// 				pageID     : 0,
// 				artboardID : 0
// 			});

			if (pathname === '/') {
				window.location.href = '/';

			} else {
				this.props.history.push('/');
			}

		} else {
			this.props.history.push('/' + url);
// 			if (pathname === '/' + url) {
// 				window.location.href = '/' + url;
//
// 			} else {
// 				this.props.history.push('/' + url);
// 			}
		}
	};

	handleProcess = (processing)=> {
		scrollOrigin(wrapper.current);
		this.setState({ processing });
	};

	handleSideNavUploadItem = (upload)=> {
		console.log('App.handleSideNavUploadItem()', upload);

		if (upload.selected && this.props.navigation.uploadID !== upload.id) {
			this.props.updateNavigation({
				uploadID   : upload.id,
				pageID     : 0,
				artboardID : 0
			});

// 			this.setState({
// 				uploadID   : upload.id,
// 				pageID     : 0,
// 				artboardID : 0
// 			});
		}

		if (upload.selected && !isInspectorPage() && !isExplorePage()) {
			this.handlePage(buildProjectPath(upload.id, upload.title));
// 			this.handlePage('proj/' + upload.id + '/' + convertURLSlug(upload.title));
		}
	};

	handleSideNavCategoryItem = (category)=> {
		console.log('App.handleSideNavCategoryItem()', category);

		if (category.selected) {
			let formData = new FormData();
			formData.append('action', 'UPLOAD');
			formData.append('upload_id', this.props.navigation.uploadID);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('UPLOAD', response.data);
					const { id, title } = response.data.upload;

					if (!isInspectorPage() && !isExplorePage()) {
// 						this.handlePage('proj/' + id + '/' + convertURLSlug(title) + '/' + category.title.toLowerCase());
						this.handlePage(buildProjectPath(id, title) + '/' + category.title.toLowerCase());
					}
				}).catch((error) => {
			});
		}

		//this.handlePage(window.location.pathname.substring(1).replace(/\/[\w\-]+$/, '/' + category.title.toLowerCase()));
	};

	handleSideNavPageItem = (page)=> {
		console.log('App.handleSideNavPageItem()', page);

		if (page.selected) {
			let formData = new FormData();
			formData.append('action', 'ARTBOARDS');
			formData.append('upload_id', this.props.navigation.uploadID);
			formData.append('page_id', page.id);
			formData.append('slices', '0');
			formData.append('offset', '0');
			formData.append('length', '1');
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log(className(this) + '=/> ARTBOARDS', response.data);

					const artboard = response.data.artboards.pop();
					this.handleAddPageView(page.id);
					this.handlePage(buildInspectorPath(page.uploadID, page.id, artboard.id, artboard.title));
// 					this.props.history.push('/page/' + page.uploadID + '/' + page.id + '/' + artboard.id + '/' + convertURLSlug(artboard.title));
					this.props.updateNavigation({
						uploadID   : page.uploadID,
						pageID     : page.id,
						artboardID : artboard.id
					});

// 					this.setState({
// 						uploadID   : page.uploadID,
// 						pageID     : page.id,
// 						artboardID : artboard.id
// 					});
				}).catch((error) => {
			});

		} else {
			this.props.updateNavigation({ pageID : 0 });
// 			this.setState({ pageID : 0 });
		}
	};

	handleSideNavContributorItem = (contributor)=> {
		console.log('App.handleSideNavContributorItem()', contributor);
	};

	handleSideNavArtboardItem = (artboard)=> {
		console.log('App.handleSideNavArtboardItem()', artboard);

		this.handleAddPageView(artboard.pageID);

// 		this.props.history.push('/page/' + artboard.uploadID + '/' + artboard.pageID + '/' + artboard.id + '/' + convertURLSlug(artboard.title));
		this.handlePage(buildInspectorPath(artboard.uploadID, artboard.pageID, artboard.id, artboard.title));

		this.props.updateNavigation({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});
// 		this.setState({
// 			uploadID   : artboard.uploadID,
// 			pageID     : artboard.pageID,
// 			artboardID : artboard.id
// 		});
	};


	render() {
  	console.log('App.render()', this.props, this.state);

  	const { uploadID } = this.props.navigation;
//   	const { uploadID, pageID } = (this.props.navigation) ? this.props.navigation : {
// 		  uploadID : 0,
// 		  pageID : 0,
// 		  artboardID : 0,
// 		  sliceID : 0
// 	  };
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
					    path={this.props.location.pathname}
					    processing={processing}
					    onUploadItem={(upload)=> this.handleSideNavUploadItem(upload)}
					    onCategoryItem={(category)=> this.handleSideNavCategoryItem(category)}
					    onPageItem={(page)=> this.handleSideNavPageItem(page)}
					    onContributorItem={(contributor)=> this.handleSideNavContributorItem(contributor)}
					    onArtboardItem={(artboard)=> this.handleSideNavArtboardItem(artboard)}
					    onLogout={()=> this.handleLogout()}
					    onUpload={()=> this.handlePage('upload')}
					    onPage={(url)=> this.handlePage(url)}
				    />

				    <div className="content-wrapper" ref={wrapper}>
					    <Switch>
						    <Route exact path="/" render={()=> <HomePage uploadID={0} pageID={0} onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} />} />
					      <Route exact path="/add-ons" render={()=> <AddOnsPage onPage={(url)=> this.handlePage(url)} />} />
					      <Route exact path="/api" render={()=> <APIPage onPage={(url)=> this.handlePage(url)} onLogout={()=> this.handleLogout()} />} />
						    <Route exact path="/artboard/:uploadID/:pageID/:artboardID/:artboardSlug" render={(props)=> <InspectorPage {...props} onPage={(url)=> this.handlePage(url)} />} />
						    <Route exact path="/explore" render={()=> <ExplorePage onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} />} />
						    <Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={(url)=> this.handlePage(url)} />} />
						    <Route exact path="/login" render={()=> <LoginPage onPage={(url)=> this.handlePage(url)} />} />
					      <Route exact path="/mission" render={()=> <MissionPage />} />
						    <Route exact path="/new" render={()=> <UploadPage onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} onProcess={(processing)=> this.handleProcess(processing)} />} />
						    <Route exact path="/page/:uploadID/:pageID/:artboardID/:artboardSlug" render={(props)=> <InspectorPage {...props} onPage={(url)=> this.handlePage(url)} />} />
					      <Route exact path="/profile" render={()=> <ProfilePage onPage={(url)=> this.handlePage(url)} />} />
					      <Route exact path="/privacy" render={()=> <PrivacyPage />} />
						    {/*<Route path="/proj/" render={()=> <HomePage uploadID={uploadID} pageID={pageID} onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} />} />*/}
						    <Route path="/proj/:uploadID/:uploadSlug" render={(props)=> <HomePage {...props} onPage={(url)=> this.handlePage(url)} onArtboardClicked={(artboard)=> this.handleArtboardClicked(artboard)} />} />
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
