import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';
import './Dropdown.css';

class DropdownMultiple extends Component{
	constructor(props) {
		super(props);

		this.state = {
			listOpen    : false,
			headerTitle : this.props.title
		};
	}

	static getDerivedStateFromProps(nextProps) {
		const count = nextProps.list.filter(function(a) { return a.selected; }).length;

		if (count === 0) {
			return ({ headerTitle : nextProps.title });

		} else if (count === 1) {
			return ({ headerTitle : `${count} ${nextProps.titleHelper}` });

		} else if (count > 1) {
			return ({ headerTitle : `${count} ${nextProps.titleHelper}s` });
		}
	}

	handleClickOutside() {
		this.setState({ listOpen : false });
	}

	toggleList() {
		this.setState(prevState => ({
			listOpen : !prevState.listOpen
		}));
	}

	render() {
		const {list, toggleItem} = this.props;
		const {listOpen, headerTitle} = this.state;

		return (
			<div className="dd-wrapper">
				<div className="dd-header" onClick={() => this.toggleList()}>
					<div className="dd-header-title">{headerTitle}</div>
					{listOpen
						? <FontAwesome name="angle-up" />
						: <FontAwesome name="angle-down" />
					}
				</div>
				{listOpen && <ul className="dd-list">
					{list.map((item, i) => (
						<li className="dd-list-item" key={i} onClick={() => toggleItem(item.id, i, item.key)}>
							<span style={{width:'20px',height:'20px',marginRight:'6px',backgroundImage:'linear-gradient(to right, #'+item.gradient+' , #'+item.hex+')'}}>&nbsp;&nbsp;</span>
							{item.title} {item.selected && <FontAwesome name="check"/>}
						</li>
					))}
				</ul>}
			</div>
		)
	}

}

export default onClickOutside(DropdownMultiple);