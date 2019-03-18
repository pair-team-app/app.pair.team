
import React, { Component } from 'react';
import './TopNavMenu.css';

import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';
import { Row } from 'simple-flexbox';

import { trackEvent } from '../../../utils/tracking';


class TopNavMenu extends Component {
	constructor(props) {
		super(props);

		this.state = {
			bubble : false
		};
	}

	handleClickOutside(event) {
// 		console.log('TopNavMenu.handleClickOutside()', event.target);

		this.setState({ bubble : false });
	}

	handleLinkClick = (url)=> {
// 		console.log('TopNavMenu.handleLinkClick()', url);

		trackEvent('top-nav', url.toLowerCase());
		this.setState({ bubble : false });
		this.props.onPage(`${url}`);
	};

	render() {
// 		console.log('TopNavMenu.render()', this.props, this.state);

		const { pathname, sections } = this.props;
		const { bubble } = this.state;

		const faName = (bubble) ? 'caret-up' : 'caret-down';
		const titleClass = `top-nav-menu-title${(bubble) ? ' top-nav-menu-title-selected' : ''}`;
		const bubbleClass = `top-nav-menu-bubble-wrapper ${(bubble) ? 'top-nav-menu-intro' : 'top-nav-menu-outro'}`;

		return (<div className="top-nav-menu-wrapper">
			<Row vertical="center">
				<FontAwesome name={faName} className="top-nav-menu-arrow" onClick={()=> this.setState({ bubble : !bubble })} />
				<div className={titleClass} onClick={()=> this.setState({ bubble : !bubble })}>Menu</div>
			</Row>

			{(bubble) && (<div className={bubbleClass}>
				{(sections.map((section, i)=> (
					<div key={i} className={`top-nav-link${(pathname.includes(section.url)) ? ' top-nav-link-selected' : ''} top-nav-menu-link`} onClick={()=> this.handleLinkClick(section.url)}>{section.title}</div>
				)))}
			</div>)}
		</div>);
	}
}

export default onClickOutside(TopNavMenu);
