
import React, { Component } from 'react';
import './Dropdown.css';

import onClickOutside from "react-onclickoutside";
import { Column, Row } from 'simple-flexbox';


class Dropdown extends Component{
	constructor(props) {
		super(props);

		this.state = {
			listOpen    : false,
			headerTitle : this.props.title
		};
	}
	componentDidUpdate(prevProps) {
		if (this.props.title !== prevProps.title) {
			this.setState({ headerTitle : this.props.title });
		}
	}

	handleClickOutside(e) {
		this.setState({ listOpen : false })
	}

	selectItem = (title, id, stateKey)=> {
		this.setState({
			headerTitle : title,
			listOpen    : false
		}, this.props.resetThenSet(id, stateKey))
	};

	toggleList = ()=> {
		this.setState(prevState => ({
			listOpen : !prevState.listOpen
		}))
	};

	render() {
		const { list } = this.props;
		const { listOpen, headerTitle } = this.state;

		const items = list.map((item, i)=> {
			let thumbImage = null;
			if (item.title.match(/ios/i)) {
				thumbImage = '/images/icon-ios12.png';

			} else if (item.title.match(/material/i)) {
				thumbImage = '/images/icon-material.png';

			} else if (item.title.match(/android/i)) {
				thumbImage = '/images/icon-android.png';

			} else if (item.title.match(/upload/i)) {
				thumbImage = '/images/plus-square.png';
			}

			return (
				<li className="dd-list-item" key={i} onClick={() => this.selectItem(item.title, i, item.key)}><Row>
					{(thumbImage) && (<Column flexGrow={1} horizontal="start" vertical="center"><img src={thumbImage} style={{width:'20px',height:'20px',marginRight:'8px'}} alt={item.title} /></Column>)}
					<Column flexGrow={666} horizontal="start" vertical="center">{item.title}</Column>
					{/*<Column flexGrow={150} horizontal="start" vertical="center">{item.selected && <FontAwesome name="check"/>}</Column>*/}
				</Row></li>
			);
		});

		return (
			<div className="dd-wrapper">
				<div className="dd-header" onClick={this.toggleList}>
					<div className="dd-header-title">{headerTitle}</div>
					<img src="/images/dropdown-arrow.svg" alt="Arrow" />
					{/*{listOpen*/}
						{/*? <FontAwesome name="angle-up" />*/}
						{/*: <FontAwesome name="angle-down" />*/}
					{/*}*/}
				</div>
				{listOpen && <ul className="dd-list">
					{items}
				</ul>}
			</div>
		)
	}
}

export default onClickOutside(Dropdown);