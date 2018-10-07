
import React, { Component } from 'react';
import './SideNav.css'

import SideNavItem from './SideNavItem';

class SideNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			items : [
				{
					id          : 1,
					title       : 'Item 1',
					description : '',
					selected    : false
				}, {
					id          : 2,
					title       : 'Item 2',
					description : '',
					selected    : false
				}, {
					id          : 3,
					title       : 'Item 3',
					description : '',
					selected    : false
				}
			]
		};
	}

	handleNavItem = (ind) => {
		let items = [...this.state.items];
		items.forEach(item => item.selected = false);
		items[ind].selected = true;

		this.setState({ items : items });
		this.props.onNavItem(items[ind]);
	};

	componentDidMount() {
	}

	render() {
		const items = (this.props.url === '/manifesto') ? [] : this.state.items.map((item, i, arr) => {
			return (
					<SideNavItem
						key={i}
						title={item.title}
						description={item.description}
						selected={item.selected}
						onClick={()=> this.handleNavItem(i)} />
			);
		});

		return (
			<div className="side-nav-wrapper">
				<div className="side-nav-link-wrapper">
					<div className="side-nav-top-wrapper">{items}</div>
					<div className="side-nav-bottom-wrapper">
						<div className="nav-link"><a href="https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA" target="_blank" rel="noopener noreferrer">Slack</a></div>
						<div className="nav-link"><a href="https://spectrum.chat/designengine" target="_blank" rel="noopener noreferrer">Spectrum</a></div>
						<div className="nav-link"><a href={'/manifesto'}>Manifesto</a></div>
						<div className="nav-link"><a href={'/terms'}>Terms of Service</a></div>
						<div className="nav-link"><a href={'/privacy'}>Privacy Policy</a></div>
						<div className="copyright">&copy; {new Date().getFullYear()} Design Engine AI</div>
					</div>
				</div>
			</div>
		);
	}
}

export default SideNav;
