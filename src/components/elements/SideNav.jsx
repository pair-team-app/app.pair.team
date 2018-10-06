
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
			<div style={{margin:'25px 0 0 25px'}}>
				{items}
			</div>
		);
	}
}

export default SideNav;
