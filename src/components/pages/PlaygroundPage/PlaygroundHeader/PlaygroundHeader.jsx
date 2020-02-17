
import { Strings } from 'lang-js-utils';
import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { NavLink, withRouter } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Pages } from '../../../../consts/uris';
import { toggleTheme } from '../../../../redux/actions';
import SharePopover from '../SharePopover';
import { BreadcrumbTypes } from './';
import './PlaygroundHeader.css';
import UserSettings from './UserSettings';



class PlaygroundHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);
// 		console.log('%s.componentDidUpdate()', this.constructor.name, { left : shareLink.offsetLeft, top : shareLink.offsetTop });

 		const { popover } = this.props;
 		if (popover && !prevProps.popover && !this.state.popover) {
 			this.setState({ popover });
	  }
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
	}


	handleBreadcrumbClick = ({ event, type, payload })=> {
//  console.log('%s.handleBreadcrumbClick()', this.constructor.name, { event, type, payload });

    event.preventDefault();
    this.props.onBreadCrumbClick({ type, payload });
	};


	handlePopoverClose = ()=> {
//		console.log('%s.handlePopoverClose()', this.constructor.name);

		this.props.onSharePopoverClose();
		this.setState({ popover : false });
	};


	buildBreadcrumbs = ()=> {
    console.log('%s.buildBreadcrumbs()', this.constructor.name, this.props, { match : this.props.match });

    const { match, playground, typeGroup, component, comment, accessibility, location } = this.props;
    const { teamSlug, buildID, projectSlug, deviceSlug, typeGroupSlug, componentID, commentID } = match.params;

    let path = `${Pages.PLAYGROUND}/${teamSlug}/${projectSlug}/${buildID}/${deviceSlug}`;
    const segments = [
			{ type : BreadcrumbTypes.PLAYGROUND, title : projectSlug, path : projectSlug, payload : playground },
      (typeGroup && typeGroupSlug) ? { type : BreadcrumbTypes.TYPE_GROUP, title : Strings.capitalize(typeGroup.key), path : typeGroupSlug, payload : typeGroup } : null,
      (component && componentID) ? { type : BreadcrumbTypes.COMPONENT, title : component.title, path : componentID, payload : component } : null,
      (accessibility) ? { type : BreadcrumbTypes.ACCESSIBILITY, title : 'accessibility' , path : 'accessibility', payload : null } : null,
      (location.pathname.includes('/comments')) ? { type : BreadcrumbTypes.COMMENTS, title : 'comments', path : 'comments', payload : null } : null,
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
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { darkThemed, playground } = this.props;
		const { popover } = this.state;

		return (<div className="playground-header">
			<div className="playground-header-col playground-header-breadcrumb-wrapper">{this.buildBreadcrumbs().map((breadcrumb)=> (breadcrumb))}</div>
			<div className="playground-header-col playground-header-col-middle">
        <input type="checkbox" checked={darkThemed} value={darkThemed} onChange={this.props.toggleTheme} />
			</div>
			<div className="playground-header-col playground-header-col-right">
				<PlaygroundShareLink popover={popover} playground={playground} onClick={()=> this.setState({ popover : !this.state.popover })} onPopup={this.props.onPopup} onPopoverClose={this.handlePopoverClose} />
				<UserSettings onMenuItem={this.props.onSettingsItem} onLogout={this.props.onLogout} />
			</div>
		</div>);
	}
}


const PlayGroundHeaderBreadcrumb = (props)=> {
//   console.log('PlayGroundHeaderBreadcrumb()', props);
  
  const { ind, tot, segment } = props;
  const { type, title, payload } = segment;
  
  return ((ind < tot) 
		? (<><div className="playground-header-breadcrumb" data-last="false" onClick={(event)=> props.onClick({ event, type, payload })}>{title}</div>&nbsp;&gt;&nbsp;</>)
		: (<div className="playground-header-breadcrumb" data-last="true">{title}</div>)
	);
};


const PlaygroundShareLink = (props)=> {
//   console.log('PlaygroundShareLink()', props);

  const { popover, playground } = props;
	return (<div className="playground-share-link">
    <div className="playground-header-link" onClick={props.onClick}>Share</div>

    {(popover) && (<SharePopover
      playground={playground}
      onPopup={props.onPopup}
      onClose={props.onPopoverClose} />)}
	</div>);
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


// export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundHeader);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaygroundHeader));
