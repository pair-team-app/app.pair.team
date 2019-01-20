
import React, { Component } from 'react';
import './TopNav.css';

import { connect } from 'react-redux';
// import Popover from 'react-tiny-popover';
import { Row } from 'simple-flexbox';

import TopNavProfile from './TopNavProfile';
import { isUserLoggedIn } from '../../utils/funcs';
import { updateNavigation } from '../../redux/actions';
import logo from '../../assets/images/logo-designengine.svg';
import sketchIcon from '../../assets/images/icons/ico-sketch.png';
import figmaIcon from '../../assets/images/icons/ico-figma.png';
import photoshopIcon from '../../assets/images/icons/ico-photoshop.png';
import xdIcon from '../../assets/images/icons/ico-xd.png';



const TopNavDemo = (props)=> {
// 	console.log('TopNav.TopNavDemo()', props);

	const { enabled, title, image } = props;
	const className = (enabled) ? 'top-nav-demo' : 'top-nav-demo top-nav-demo-disabled';

	return (<div className={className} onClick={()=> (enabled) ? props.onClick() : null} >
		<img src={image} className="top-nav-demo-image" alt={title} />

		{/*<Popover isOpen={popover} position={'bottom'} content={(*/}
			{/*<div>{title}</div>*/}
		{/*)}><div onClick={()=> props.onPopover()}>WTF</div></Popover>*/}
		{/*<img src={image} className="top-nav-icon-image" alt={title} onClick={()=> (enabled) ? props.onClick() : null} />*/}
	</div>);
};


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateNavigation  : (navIDs)=> dispatch(updateNavigation(navIDs))
	});
};


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover  : false,
			sections : [{
				title : 'Free Inspect',
				url   : '/inspect'
			}, {
				title : 'Free Parts',
				url   : '/parts'
			}, {
				title : 'Rate This',
				url   : '/rate-this'
			}],
			demos    : [{
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
				title   : 'XD',
				image   : xdIcon,
				enabled : false,
				url     : '/1/account'
			}, {
				title   : 'Photoshop',
				image   : photoshopIcon,
				enabled : false,
				url     : '/1/account'
			}]
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('TopNav.componentDidUpdate()', prevProps, this.props, this.state);
	}

	handleDemo = (url)=> {
		this.props.updateNavigation({
			uploadID   : url.substr(1).split('/').shift(),
			pageID     : 0,
			artboardID : 0
		});
		this.props.onPage(`${window.location.pathname}${url}`);
	};

	handleLink = (url)=> {
		this.props.updateNavigation({
			uploadID   : 0,
			pageID     : 0,
			artboardID : 0
		});
		this.props.onPage(url);
	};

	render() {
		console.log('TopNav.render()', this.props, this.state);

		const { pathname } = window.location;
		const { sections, demos, popover } = this.state;

		return (
			<div className="top-nav-wrapper">
				<div className="top-nav-column top-nav-column-left"><Row flexGrow={4} horizontal="start" vertical="center">
					<img onClick={()=> this.handleLink('')} src={logo} className="top-nav-logo" alt="Design Engine" />
					{(sections.map((section, i)=> <div key={i} className={(pathname.includes(section.url)) ? 'top-nav-link top-nav-link-selected' : 'top-nav-link'} onClick={()=> this.props.onPage(section.url)}>{section.title}</div>))}
				</Row></div>

				<div className="top-nav-column top-nav-column-middle">
					<Row flexGrow={2} horizontal="end" vertical="center">
						{demos.map((demo, i)=> (<TopNavDemo key={i}
							title={demo.title}
							image={demo.image}
							enabled={demo.enabled}
							popover={popover}
							onClick={()=> this.handleDemo(demo.url)} />
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
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(TopNav);
