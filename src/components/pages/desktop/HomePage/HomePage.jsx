
import React, { Component } from 'react';
import './HomePage.css';

import { connect } from 'react-redux';

import BaseDesktopPage from '../BaseDesktopPage';
import UploadHeader from '../../../navs/UploadHeader';

import { addFileUpload } from '../../../../redux/actions';
import { Strings, URIs } from '../../../../utils/lang';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			fileDialog : false
		};
	}

	handleFile = (file)=> {
// 		console.log('HomePage.handleFile()', file);

		this.props.addFileUpload(file);
		this.props.onPage(`new/${URIs.lastComponent()}`);
	};

	render() {
// 		console.log('HomePage.render()', this.props, this.state);

		const { fileDialog } = this.state;
		return (
			<BaseDesktopPage className="home-page-wrapper">
				<UploadHeader
					section={URIs.lastComponent()}
					title={`${(URIs.lastComponent().includes('edit')) ? 'Upload a design file to Edit' : `Upload any design for ${Strings.capitalize(URIs.lastComponent())}`}`}
					subtitle="Drag & drop any design file here"
					uploading={false}
					fileDialog={fileDialog}
					onFile={this.handleFile}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />
			</BaseDesktopPage>
		);
	}
}


const mapDispatchToProps = (dispatch)=> {
	return ({
		addFileUpload : (file)=> dispatch(addFileUpload(file))
	});
};


export default connect(null, mapDispatchToProps)(HomePage);
