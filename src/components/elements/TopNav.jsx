
import React, { Component } from 'react';
import './TopNav.css';

import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import ContentModal from '../elements/ContentModal';
import TopNavProfile from './TopNavProfile';
import TopNavRate from './TopNavRate';

import { GITHUB_ROADMAP } from '../../consts/uris';
import { convertURISlug, isUserLoggedIn } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';
import { updateNavigation } from '../../redux/actions';

import deLogo from '../../assets/images/logo-designengine.svg';
import sketchIcon from '../../assets/images/icons/ico-sketch.png';
import figmaIcon from '../../assets/images/icons/ico-figma.png';
import photoshopIcon from '../../assets/images/icons/ico-photoshop.png';
import xdIcon from '../../assets/images/icons/ico-xd.png';


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateNavigation  : (navIDs)=> dispatch(updateNavigation(navIDs))
	});
};


const TopNavDemoIcon = (props)=> {
// 	console.log('TopNav.TopNavDemoIcon()', props);

	const { title, image } = props;
	return (<div className="top-nav-demo-icon" onClick={()=> props.onClick()}>
		<img src={image} className="top-nav-demo-icon-image" alt={title} />
	</div>);
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
			}],
			demos     : [{
				title   : 'Sketch',
				image   : sketchIcon,
				enabled : true,
				url     : '/1/account'
			}, {
				title   : 'Figma',
				image   : figmaIcon,
				enabled : false,
				url     : '/1/account'
			}, {
				title   : 'Adobe XD',
				image   : xdIcon,
				enabled : false,
				url     : '/1/account'
			}, {
				title   : 'Photoshop',
				image   : photoshopIcon,
				enabled : false,
				url     : '/1/account'
			}],
			demoTitle : '',
			demoModal : false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('TopNav.componentDidUpdate()', prevProps, this.props, this.state);
	}

	handleDemo = (ind)=> {
		const demo = this.state.demos[ind];
		trackEvent('demo', convertURISlug(demo.title));

		if (demo.enabled) {
			this.props.updateNavigation({
				uploadID   : demo.url.substr(1).split('/').shift(),
				pageID     : 0,
				artboardID : 0
			});
			this.props.onPage(`${window.location.pathname}${demo.url}`);

		} else {
			this.setState({
				demoTitle : demo.title,
				demoModal : true
			});
		}
	};

	handleDemoModal = ()=> {
		this.setState({ demoModal : false });
		window.open(GITHUB_ROADMAP);
	};

	handleLink = (url)=> {
		this.props.updateNavigation({
			uploadID   : 0,
			pageID     : 0,
			artboardID : 0
		});
		this.props.onPage(url);
	};

	handleScore = (score)=> {
		console.log('TopNav.handleScore()', score);
		trackEvent('rate', 'score', null, score);
		this.props.onScore(score);
	};

	render() {
		console.log('TopNav.render()', this.props, this.state);

		const { pathname } = window.location;
		const { sections, demos, demoTitle, demoModal } = this.state;

		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row flexGrow={4} horizontal="start" vertical="center">
					<img onClick={()=> this.handleLink('')} src={deLogo} className="top-nav-logo" alt="Design Engine" />
					{(sections.map((section, i)=> <div key={i} className={(pathname.includes(section.url)) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage(section.url)}>{section.title}</div>))}
					<TopNavRate selected={(pathname.includes('/rate-this'))} onPage={this.handleLink} onScore={this.handleScore} />
				</Row></div>

				<div className="top-nav-column top-nav-column-middle">
					<Row flexGrow={2} horizontal="end" vertical="center">
						Demo:
						{demos.map((demo, i)=> (<TopNavDemoIcon key={i}
							title={demo.title}
							image={demo.image}
							onClick={()=> this.handleDemo(i)} />
						))}
					</Row>
				</div>
				<div className="top-nav-column top-nav-column-right">
					<Row flexGrow={1} horizontal="end" vertical="center">
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
					</Row>
				</div>
				{(demoModal) && (<ContentModal
					type={`demo/${convertURISlug(demoTitle)}`}
					title="Coming Soon"
					closeable={true}
					onComplete={()=> this.setState({ demoModal : false })}>
						{demoTitle} demo coming soon, check out our <span className="page-link" onClick={()=> this.handleDemoModal()}>roadmap</span>!
				</ContentModal>)}
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(TopNav);
