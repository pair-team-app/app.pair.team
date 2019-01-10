
import React, { Component } from 'react';
import './ArtboardGrid.css';

import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';
import { isUserLoggedIn, sendToSlack } from '../../utils/funcs';
import uploadIcon from '../../images/icons/ico-upload.png';


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


const LoggedInHeader = (props)=> {
// 	console.log('ArtboardGrid.LoggedInHeader()', props);

	return (<div className="artboard-grid-header-content-wrapper">
		<h3>Start a new Design Project</h3>
		<h4>Turn any Design File into an organized System of Fonts, Colors, Symbols, Views &amp; More.</h4>
		<div>
			<button onClick={()=> props.onPage('new')}>New Project</button>
		</div>
	</div>);
};

const LoggedOutHeader = (props)=> {
// 	console.log('ArtboardGrid.LoggedOutHeader()', props);

	return (<div className="artboard-grid-header-content-wrapper">
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


	onDrop = (files)=> {
		console.log('ArtboardGrid.onDrop()', files);

		const { id, email } = (this.props.profile) ? this.props.profile : this.state.profile;
		if (files.length > 0) {
			const file = files.pop();

			if (file.name.split('.').pop() === 'sketch') {
				if (file.size < 100 * (1024 * 1024)) {
					this.props.onFile(file);

				} else {
					sendToSlack('*[' + id + ']* *' + email + '* uploaded oversized file (' + Math.round(file.size * (1 / (1024 * 1024))) + 'MB) "_' + file.name + '_"');
					this.props.onPopup({
						type     : 'ERROR',
						content  : 'File size must be under 100MB.',
						duration : 500
					});
				}

			} else {
				sendToSlack('*[' + id + ']* *' + email + '* uploaded incompatible file "_' + file.name + '_"');
				this.props.onPopup({
					type     : 'ERROR',
					content  : (files[0].name.split('.').pop() === 'xd') ? 'Adobe XD Support Coming Soon!' : 'Only Sketch files are support at this time.',
					duration : 1500
				});
			}
		}
	};


	render() {
		console.log('ArtboardGrid.render()', this.props, this.state);

		const { fetching, total, title, artboards } = this.props;

		const titleStyle = (!title) ? { color : '#ffffff' } : null;
		const btnClass = (artboards && (artboards.length === parseInt(total, 10))) ? 'fat-button is-hidden' : (fetching) ? 'fat-button button-disabled' : 'fat-button';
		const btnCaption = (fetching) ? 'Loading…' : 'More';

		return (<div className="artboard-grid">
			<div className="artboard-grid-header-dz-wrapper">
				<div className="upload-progress-bar-wrapper">
					{(0===1) && (<div className="upload-progress-bar" />)}
				</div>
				<Dropzone className="artboard-grid-header-dz" onDrop={this.onDrop.bind(this)}>
					<div>
						<Row horizontal="center"><img className="artboard-grid-header-upload-icon" src={uploadIcon} alt="Upload" /></Row>
						<Row horizontal="center">Turn any Sketch file into an organized System of Fonts, Colors, Symbols, Views &amp; more. (Drag &amp; Drop)</Row>
					</div>
				</Dropzone>
			</div>

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
