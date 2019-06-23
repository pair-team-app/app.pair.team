
import React, { Component } from 'react';
import './DocumentsPage.css';

import axios from 'axios/index';
import qs from 'qs';
import { connect } from 'react-redux';
import { Row, Column } from 'simple-flexbox';

import BasePage from '../BasePage';
import PageHeader from '../../sections/PageHeader';
import { API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


const DocumentsList = (props)=> {
	//console.log('DocumentsPage.DocumentsList()', props);

	const { documents } = props;
	return (<div className="documents-list">
		<PageHeader title={`Design Documents (${documents.length})`} />
		<Column className="documents-list-item-wrapper">
			{documents.map((document, i)=> {
				return (<Row key={i}>
					<DocumentListItem
						document={document}
						onClick={()=> props.onDocumentClick(document)}
					/>
				</Row>);
			})}
		</Column>
	</div>);
};


const DocumentListItem = (props)=> {
	//console.log('DocumentsPage.DocumentListItem()', props);

	const { document } = props;
	return (<div className="document-list-item">
		<div className="document-list-item-image-wrapper">
			<img src={document.imgURL} className="document-list-item-image" alt={document.title} />
		</div>
		<div className="document-list-item-details-wrapper">
			{document.title}<br />
			{document.added}
		</div>
	</div>);
};


const DocumentContent = (props)=> {
	//console.log('DocumentsPage.DocumentContent()', props);

	const { document } = props;
	return (<div className="document-content">
		<PageHeader title="Design Document Details" />
		<DocumentListItem document={document} />
		<div className="document-contributors-wrapper">
			{document.contributors.map((contributor, i)=> {
				return (<DocumentContributorItem key={i} contributor={contributor} />);
			})}
		</div>
	</div>);
};


const DocumentContributorItem = (props)=> {
	//console.log('DocumentsPage.DocumentContributorItem()', props);

	const { contributor } = props;
	return (<div className="document-contributor-item">
		{contributor.name}<br />
		{contributor.duration}<br />
		{contributor.comments.length}
	</div>);
};


class DocumentsPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			documentID : null,
			document   : null,
			documents  : []
		};
	}

	componentDidMount() {
		console.log('DocumentsPage.componentDidMount()', this.props, this.state);

		const { documentID } = this.props.match.params;
		if (documentID) {
			this.onFetchDocument(documentID);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('DocumentsPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		const { documentID } = this.props.match.params;
		if (!prevProps.match.params.documentID && documentID) {
			this.onFetchDocument(documentID);
		}
	}

	handleDocumentClick = (document)=> {
		console.log('DocumentsPage.handleDocumentClick()', document);
		this.props.onPage(`/documents/${document.id}`);
	};

	onFetchDocument = (documentID)=> {
		console.log('DocumentsPage.onFetchDocument()', documentID);
		axios.post(API_ENDPT_URL, qs.stringify({
			action      : 'DOCUMENT',
			document_id : documentID

		})).then((response) => {
			console.log('DOCUMENT', response.data);

			const { document } = response.data;
			if (document) {
				this.setState({ documentID, document });

			} else {
				this.props.onPage('/documents');
			}

		}).catch((error)=> {
		});
	};

	render() {
// 		console.log('DocumentsPage.render()', this.props, this.state);

		const { document, documents } = this.state;

		return (
			<BasePage className="documents-page-wrapper">
				{(document)
					? (<DocumentContent
							document={document}
						/>)

					: (<DocumentsList
							documents={documents}
							onDocumentClick={(document)=> this.handleDocumentClick(document)}
						/>
				)}
			</BasePage>
		);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};


export default connect(mapStateToProps)(DocumentsPage);
