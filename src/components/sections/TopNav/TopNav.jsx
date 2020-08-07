import React, { Component } from 'react';
import './TopNav.css';

import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Strings } from 'lang-js-utils';
import { matchPath, withRouter } from 'react-router-dom';

import { BreadcrumbTypes, CommentSortTypes } from './';
import UserSettings, { SettingsMenuItemTypes} from './UserSettings';
import { RoutePaths } from '../../helpers/Routes';
import SharePopover from '../../overlays/SharePopover';
import { Modals, Pages } from '../../../consts/uris';
import { setTeamCommentsSort, toggleTheme } from '../../../redux/actions';


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover    : false,
			matchPaths : {
				team    : null,
				create  : null,
				project : null
			}
		};
	}

	componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

		const { hash } = this.props;
		if (hash === '#share' && !this.state.popover) {
			this.setState({ popover : true });
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
// console.log('%s.componentDidUpdate()', this.constructor.name, { left : shareLink.offsetLeft, top : shareLink.offsetTop });

		const { pathname, hash } = this.props;

		if ((hash === '#share') && !this.state.popover) {
			this.setState({ popover : true });
		}

		if (hash !== '#share' && this.state.popover) {
			this.setState({ popover : false });
		}

		const matchPaths = {
			team    : matchPath(pathname, {
				path   : RoutePaths.TEAM,
				exact  : false,
				strict : false
			}),
			create  : matchPath(pathname, {
				path   : RoutePaths.CREATE,
				exact  : false,
				strict : false
			}),
			project : matchPath(pathname, {
				path   : RoutePaths.PROJECT,
				exact  : false,
				strict : false
			})
		};

		if (matchPaths !== this.state.matchPaths && this.state.matchPaths === prevState.matchPaths) {
			this.setState({ matchPaths });
		}
	}

	componentWillUnmount() {
// console.log('%s.componentWillUnmount()', this.constructor.name);
	}


	handleBreadcrumbClick = ({ event, type, payload })=> {
 		console.log('%s.handleBreadcrumbClick()', this.constructor.name, { event, type, payload });

    event.preventDefault();
    this.props.onBreadCrumbClick({ type, payload });
	};

	handleDeviceChange = (event)=> {
		console.log('%s.handleDeviceChange()', this.constructor.name, { event : event.target });
	};

	handleSettingsItem = (itemType)=> {
    console.log('%s.handleSettingsItem()', this.constructor.name, { itemType });

    if (itemType === SettingsMenuItemTypes.DELETE_ACCT) {
      this.props.onModal(Modals.DISABLE);

    } else if (itemType === SettingsMenuItemTypes.PROFILE) {
      this.props.onModal(Modals.PROFILE);
    }
	};

	handlePopoverToggle = ()=> {
		console.log('%s.handlePopoverToggle()', this.constructor.name);
		this.props.push(`${window.location.pathname}#share`);
	};

	handlePopoverClose = ()=> {
		console.log('%s.handlePopoverClose()', this.constructor.name);

		this.props.push(window.location.pathname.replace('#share', ''));
		this.setState({ popover : false });
	};

	handleTeamCommentsSort = (sort)=> {
		console.log('%s.handleTeamCommentsSort()', this.constructor.name, { sort });
		this.props.setTeamCommentsSort({ sort });
	};

	buildBreadcrumbs = ()=> {
    // console.log('%s.buildBreadcrumbs()', this.constructor.name, this.props, { matchPath : this.props.matchPath, match : this.props.match });

    const { matchPath, playground, typeGroup, component, comment, location } = this.props;
    const { teamSlug, buildID, projectSlug, deviceSlug, typeGroupSlug, componentID, commentID } = matchPath.params;

		let path = `${Pages.PROJECT}/${teamSlug}/${projectSlug}/${buildID}`;

		const segments = [
			{ type : BreadcrumbTypes.DEVICE, title : deviceSlug, path : deviceSlug, payload : playground },
      (typeGroup && typeGroupSlug) ? { type : BreadcrumbTypes.TYPE_GROUP, title : Strings.capitalize(typeGroup.key), path : typeGroupSlug, payload : typeGroup } : null,
      (typeGroup && component && componentID) ? { type : BreadcrumbTypes.COMPONENT, title : component.title, path : componentID, payload : component } : null,
      //(accessibility) ? { type : BreadcrumbTypes.ACCESSIBILITY, title : 'accessibility' , path : 'accessibility', payload : null } : null,
      (component && location.pathname.includes('/comments')) ? { type : BreadcrumbTypes.COMMENTS, title : 'comments', path : 'comments', payload : null } : null,
      (component && comment && commentID) ? { type : BreadcrumbTypes.COMMENT, title : commentID, path : commentID, payload : comment } : null
    ].filter((segment)=> (segment !== null));


    const breadcrumbs = [];
    Object.keys(segments).forEach((key, i)=> {
			breadcrumbs.push(<TopNavBreadcrumb
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
		// console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { darkThemed, profile, invite, teamSort } = this.props;
		const { popover, matchPaths } = this.state;

		return (<div className="top-nav">
			{/* <div className="col breadcrumb-wrapper">{this.buildBreadcrumbs().map((breadcrumb)=> (breadcrumb))}</div> */}
			<div className="col col-left"><div className="page-header-wrapper">
				{(matchPaths.team && !matchPaths.project) && (<TeamPageHeader sort={teamSort} onSortClick={this.handleTeamCommentsSort} />)}
				{(matchPaths.create) && (<CreateTeamPageHeader />)}
				{(matchPaths.project) && (<ProjectPageHeader />)}
			</div></div>
			<div className="col col-middle">
        <input type="checkbox" checked={darkThemed} value={darkThemed} onChange={this.props.toggleTheme} />
			</div>
			<div className="col col-right">
				{(profile && !invite) && (<div className="link-wrapper">
					<TopNavInviteLink onModal={this.props.onModal} />
					<TopNavShareLink popover={popover} onClick={this.handlePopoverToggle} onPopup={this.props.onPopup} onPopoverClose={this.handlePopoverClose} />
					<UserSettings onMenuItem={this.handleSettingsItem} onLogout={this.props.onLogout} />
				</div>)}
			</div>
		</div>);
	}
}


const TopNavBreadcrumb = (props)=> {
//   console.log('TopNavBreadcrumb()', { props });

  const { ind, tot, segment } = props;
  const { type, title, payload } = segment;

  return ((ind < tot)
		? (<><div className="top-nav-breadcrumb" onClick={(event)=> (ind > 0 && ind < tot) ? props.onClick({ event, type, payload }) : null}>{title}</div>&nbsp;&gt;&nbsp;</>)
		: (<div className="top-nav-breadcrumb">{title}</div>)
	);
};

const TopNavInviteLink = (props)=> {
	//   console.log('TopNavInviteLink()', { props });

		return (<div className="top-nav-invite-link">
			<div className="nav-link" onClick={()=> props.onModal(Modals.INVITE)}>Invite</div>
		</div>);
	};

const TopNavShareLink = (props)=> {
//   console.log('TopNavShareLink()', { props });

  const { popover } = props;
	return (<div className="top-nav-share-link">
    <div className="nav-link" onClick={props.onClick}>Share</div>
    {(popover) && (<SharePopover onPopup={props.onPopup} onClose={props.onPopoverClose} />)}
	</div>);
};


const CreateTeamPageHeader = (props)=> {
	// console.log('CreateTeamPageHeader()', { props });

	return (<div className="create-team-page-header">
		<div className="title">Create Pair</div>
	</div>);
};

const TeamPageHeader = (props)=> {
	// console.log('TeamPageHeader()', { props });

	const { sort } = props;
	const { DATE, SCORE } = CommentSortTypes;

	return (<div className="team-page-header">
		<div className="sort-by-wrapper">
			<div className="sort-by-link" data-selected={sort === SCORE} onClick={()=> props.onSortClick(SCORE)}>Top</div>
			<div className="sort-by-link" data-selected={sort === DATE} onClick={()=> props.onSortClick(DATE)}>New</div>
		</div>
	</div>);
};

const ProjectPageHeader = (props)=> {
	return (<div className="project-page-header">Project</div>);
};


const mapDispatchToProps = (dispatch)=> {
  return ({
		setTeamCommentsSort : (payload)=> dispatch(setTeamCommentsSort(payload)),
		toggleTheme         : ()=> dispatch(toggleTheme()),
		push                : (payload)=> dispatch(push(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    darkThemed  : state.darkThemed,
		devices     : state.builds.devices,
		invite      : state.teams.invite,
		playgrounds : state.builds.playgrounds,
		playground  : state.builds.playground,
		profile     : state.user.profile,
		team        : state.teams.team,
		teamSort    : state.teams.sort,
		typeGroup   : state.typeGroup,
		component   : state.builds.component,
		comment     : state.comments.comment,
		matchPath   : state.matchPath,
		hash        : state.router.location.hash,
		pathname    : state.router.location.pathname
	});
};


// export default connect(mapStateToProps, mapDispatchToProps)(TopNav);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopNav));
