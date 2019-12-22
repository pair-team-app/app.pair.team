
import React, { Component } from 'react';
import './PlaygroundHeader.css';

import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import SharePopover from '../SharePopover';
import UserSettings from './UserSettings';
import { BreadcrumbTypes } from './';
import { Pages } from '../../../../consts/uris';
import { toggleTheme } from '../../../../redux/actions';


class PlaygroundHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
		};

		this.shareLink = React.createRef();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

 		const { popover } = this.props;
 		if (popover && !prevProps.popover && !this.state.popover) {
 			this.setState({ popover });
	  }
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.shareLink = null;
	}


	handleBreadcrumbClick = (event, type, payload)=> {
    console.log('%s.handleBreadcrumbClick()', this.constructor.name, event, type, payload);

    event.preventDefault();
//     this.props.onBreadCrumbClick({ type, payload });
	};


	handlePopoverClose = ()=> {
//		console.log('%s.handlePopoverClose()', this.constructor.name);

		this.props.onSharePopoverClose();
		this.setState({ popover : false })
	};


	buildbreadcrumbs = ()=> {
//     console.log('%s.buildbreadcrumbs()', this.constructor.name, this.props);
    const { match, playground, typeGroup, component, comment, accessibility } = this.props;
    const { teamSlug, buildID, projectSlug, playgroundID, componentsSlug, componentID, commentID } = match.params;

    let path = `${Pages.PLAYGROUND}/${teamSlug}/${projectSlug}/${buildID}/${playgroundID}`;
    const segments = [
			{ type : BreadcrumbTypes.PLAYGROUND, title : projectSlug, path : projectSlug, payload : playground },
      (typeGroup && componentsSlug) ? { type : BreadcrumbTypes.TYPE_GROUP, title : Strings.capitalize(typeGroup.key), path : componentsSlug, payload : typeGroup } : null,
      (component && componentID) ? { type : BreadcrumbTypes.COMPONENT, title : component.title, path : componentID, payload : component } : null,
      (accessibility) ? { type : BreadcrumbTypes.ACCESSIBILITY, title : 'accessibility' , path : 'accessibility', payload : null } : null,
      (window.location.pathname.includes('/comments')) ? { type : BreadcrumbTypes.COMMENTS, title : 'comments', path : 'comments', payload : null } : null,
      (comment && commentID) ? { type : BreadcrumbTypes.COMMENT, title : commentID, path : commentID, payload : comment } : null
    ].filter((segment)=> (segment !== null));

    const breadcrumbs = [];
    Object.keys(segments).forEach((key, i)=> {
			breadcrumbs.push(<PlayGroundHeaderBreadcrumb
				key={i}
				ind={i}
				tot={Object.keys(segments).length - 1}
				path={`${path}/${segments[key].path}`}
				segment={segments[key]}
				onClick={this.handleBreadcrumbClick}
			/>);
		});

    return (breadcrumbs);
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state, (this.shareLink) ? { left : this.shareLink.offsetLeft, top : this.shareLink.offsetTop } : null);

		const { darkThemed, playground } = this.props;
		const { popover } = this.state;

		return (<div className="playground-header">
			<div className="playground-header-col playground-header-breadcrumb-wrapper">{this.buildbreadcrumbs().map((breadcrumb)=> (breadcrumb))}</div>
			{/*<div className="playground-header-col playground-header-breadcrumb-wrapper">BREADCRUMBS</div>*/}
			<div className="playground-header-col playground-header-col-middle">
        <input type="checkbox" checked={darkThemed} value={darkThemed} onChange={this.props.toggleTheme} />
			</div>
			<div className="playground-header-col playground-header-col-right">
				<div className="playground-header-link" onClick={()=> this.setState({ popover : !this.state.popover })} ref={(element)=> { this.shareLink = element; }}>Share</div>
				<UserSettings onMenuItem={this.props.onSettingsItem} onLogout={this.props.onLogout} />
			</div>

			{(popover) && (<SharePopover
				playground={playground}
				position={{ x : this.shareLink.offsetLeft, y : this.shareLink.offsetTop }}
				onPopup={this.props.onPopup}
				onClose={this.handlePopoverClose} />)}
		</div>);
	}
}


const PlayGroundHeaderBreadcrumb = (props)=> {
//   console.log('PlayGroundHeaderBreadcrumb()', props);
  
  const { ind, tot, segment } = props;
  const { type, title, payload } = segment;
  
  return ((ind < tot) 
		? (<><div className="playground-header-breadcrumb" data-last="false" onClick={(event)=> props.onClick(event, type, payload)}>{title}</div>&nbsp;&gt;&nbsp;</>)
		: (<div className="playground-header-breadcrumb" data-last="true">{title}</div>)
	);
};




const mapDispatchToProps = (dispatch)=> {
  return ({
    toggleTheme : ()=> dispatch(toggleTheme())
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    darkThemed : state.darkThemed,
		playground : state.playground,
		typeGroup  : state.typeGroup,
		component  : state.component,
		comment    : state.comment
	});
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaygroundHeader));
