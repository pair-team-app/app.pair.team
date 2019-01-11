
import React, { Component } from 'react';
import './ArtboardGrid.css';

import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';
import { isUserLoggedIn } from '../../utils/funcs';


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


const LoggedInHeader = (props)=> {
// 	console.log('ArtboardGrid.LoggedInHeader()', props);

	return (<div className="artboard-grid-header-wrapper">
		<h3>Start a new Design Project</h3>
		<h4>Turn any Design File into an organized System of Fonts, Colors, Symbols, Views &amp; More.</h4>
		<div>
			<button onClick={()=> props.onPage('new')}>New Project</button>
		</div>
	</div>);
};

const LoggedOutHeader = (props)=> {
// 	console.log('ArtboardGrid.LoggedOutHeader()', props);

	return (<div className="artboard-grid-header-wrapper">
		<h3>Sign up or Login</h3>
		<h4>Start handing off &amp; understanding new Design Projects faster with your team.</h4>
		<div>
			<button className="adjacent-button" onClick={()=> props.onPage('register')}>Sign up</button>
			<button onClick={()=> props.onPage('login')}>Login</button>
		</div>
	</div>);
};


class ArtboardGrid extends Component {
	constructor(props) {
		super(props);

		this.state = {
			profile : {
				id       : 0,
				username : ''
			}
		};
	}

	render() {
		console.log('ArtboardGrid.render()', this.props, this.state);

		const { fetching, total, title, artboards } = this.props;

		const titleStyle = (!title) ? { color : '#ffffff' } : null;
		const btnClass = (artboards && (artboards.length === parseInt(total, 10))) ? 'fat-button is-hidden' : (fetching) ? 'fat-button button-disabled' : 'fat-button';
		const btnCaption = (fetching) ? 'Loading…' : 'More';

		return (<div className="artboard-grid">
			{(isUserLoggedIn())
				? <LoggedInHeader onPage={this.props.onPage} />
				: <LoggedOutHeader onPage={this.props.onPage} />}

			<Row style={titleStyle}><h3>{(!fetching && artboards.length === 0) ? '' : title}</h3></Row>
			{(isUserLoggedIn() && artboards.length > 0) && (
				<Row horizontal="space-around" className="artboard-grid-item-wrapper" style={{ flexWrap : 'wrap' }}>
					{(artboards) && artboards.map((artboard, i) => {
						return (
							<Column key={i}>
								<ArtboardItem
									title={artboard.title}
									image={artboard.filename}
									avatar={artboard.system.avatar}
									onClick={()=> this.props.onClick(artboard)} />
							</Column>
						);
					})}
				</Row>
			)}
			{(artboards.length > 0) && (<Row horizontal="center"><button className={btnClass} onClick={()=> (!fetching) ? this.props.onLoadNext() : null}>{btnCaption}</button></Row>)}
		</div>);
	}
}

export default connect(mapStateToProps)(ArtboardGrid);
