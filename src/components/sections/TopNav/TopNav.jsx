import React, { Component } from 'react';
import './TopNav.css';

import { push } from 'connected-react-router';
import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';

import { CommentSortTypes, CommentFilterTypes } from './';
import UserSettings, { SettingsMenuItemTypes} from './UserSettings';
import { RoutePaths } from '../../helpers/Routes';
import SharePopover from '../../overlays/SharePopover';
import { Modals, Pages } from '../../../consts/uris';
import { setCommentsSortFilter, setCommentsFormatFilter, setCommentsDoneFilter, toggleTheme } from '../../../redux/actions';


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover    : false,
			matchPaths : {
				team    : null,
				create  : null,
				project : null,
				recover : null
			}
		};
	}

	componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

		const { pathname } = this.props;
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
			}),
			profile : matchPath(pathname, {
				path   : RoutePaths.PROFILE,
				exact  : false,
				strict : false
			}),
			recover : matchPath(pathname, {
				path   : RoutePaths.RECOVER,
				exact  : false,
				strict : false
			}),
			invite  : matchPath(pathname, {
				path   : RoutePaths.INVITE,
				exact  : false,
				strict : false
			})
		};

		this.setState({ matchPaths });
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

		const { pathname } = this.props;
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
			}),
			profile : matchPath(pathname, {
				path   : RoutePaths.PROFILE,
				exact  : false,
				strict : false
			}),
			recover : matchPath(pathname, {
				path   : RoutePaths.RECOVER,
				exact  : false,
				strict : false
			}),
			invite  : matchPath(pathname, {
				path   : RoutePaths.INVITE,
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


	handleDeviceChange = (event)=> {
		console.log('%s.handleDeviceChange()', this.constructor.name, { event : event.target });
	};

	handleSettingsItem = (itemType)=> {
    console.log('%s.handleSettingsItem()', this.constructor.name, { itemType });

    if (itemType === SettingsMenuItemTypes.DELETE_ACCT) {
      this.props.onModal(Modals.DISABLE);

    } else if (itemType === SettingsMenuItemTypes.PROFILE) {
      this.props.push(Pages.PROFILE);
    }
	};

	handlePopoverToggle = ()=> {
		console.log('%s.handlePopoverToggle()', this.constructor.name);

		this.setState({ popover : true });
		// if (window.location.hash !== Popovers.SHARE) {
		// 	this.props.push(`${window.location.pathname}${Popovers.SHARE}`);
		// }
	};

	handlePopoverClose = ()=> {
		console.log('%s.handlePopoverClose()', this.constructor.name);

		// if (window.location.hash === Popovers.SHARE) {
		// 	this.props.push(window.location.pathname);
		// }

		this.setState({ popover : false });
	};

	handleTeamCommentsSort = (sort)=> {
		console.log('%s.handleTeamCommentsSort()', this.constructor.name, { sort });
		this.props.setCommentsSortFilter({ sort });
	};

	handleTeamCommentsFilter = (filter)=> {
		console.log('%s.handleTeamCommentsFilter()', this.constructor.name, { filter });

		const { formatFilter, doneFilter } = this.props;

		// if (filter === CommentFilterTypes.DONE) {
		// 	this.props.setCommentsDoneFilter({ filter : !doneFilter });

		// } else {
			this.props.setCommentsFormatFilter({ filter : (formatFilter === filter) ? CommentFilterTypes.NONE : filter });
		// }
	};

	render() {
		console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { darkThemed, profile, invite, team, sort, formatFilter, doneFilter } = this.props;
		const { popover, matchPaths } = this.state;

		return (<div className="top-nav">
			{/* <div className="col breadcrumb-wrapper">{this.buildBreadcrumbs().map((breadcrumb)=> (breadcrumb))}</div> */}
			<div className="col col-left"><div className="page-header-wrapper">
				{(matchPaths.team && !matchPaths.project) && (<TeamPageHeader team={team} sort={sort} formatFilter={formatFilter} doneFilter={doneFilter} onSortClick={this.handleTeamCommentsSort} onFilterClick={this.handleTeamCommentsFilter} />)}
				{(matchPaths.create) && (<TopNavPageTitle>Create Channel</TopNavPageTitle>)}
				{(matchPaths.project) && (<TopNavPageTitle>Project</TopNavPageTitle>)}
				{(matchPaths.profile) && (<TopNavPageTitle>Profile</TopNavPageTitle>)}
				{(matchPaths.recover) && (<TopNavPageTitle>Reset Password</TopNavPageTitle>)}
				{(matchPaths.invite && team) && (<TopNavPageTitle>Invite to # {Strings.capitalize(team.title)}</TopNavPageTitle>)}
			</div></div>
			<div className="col col-mid">
        <input type="checkbox" checked={darkThemed} value={darkThemed} onChange={this.props.toggleTheme} />
			</div>
			<div className="col col-right">
				{(profile && !invite) && (<div className="link-wrapper">
					<TopNavShareLink popover={popover} onClick={this.handlePopoverToggle} onPopup={this.props.onPopup} onPopoverClose={this.handlePopoverClose} />
					<UserSettings onMenuItem={this.handleSettingsItem} onLogout={this.props.onLogout} />
				</div>)}
			</div>
		</div>);
	}
}

const TopNavPageTitle = (props)=> {
	console.log('TopNavPageTitle()', { props });

	const { children } = props;
	return (<div className="top-nav-page-title">{children}</div>);
};


const TopNavShareLink = (props)=> {
//   console.log('TopNavShareLink()', { props });

  const { popover } = props;
	return (<div className="top-nav-share-link nav-link" onClick={props.onClick}>
		Share
		{(popover) && (<SharePopover onPopup={props.onPopup} onClose={props.onPopoverClose} />)}
	</div>);
};


const TeamPageHeader = (props)=> {
	const { team, sort, formatFilter, doneFilter } = props;
	const { DATE, SCORE } = CommentSortTypes;
	const { NONE, ISSUES, BUGS, REQUESTS, DONE } = CommentFilterTypes;



	const formatTotals = {
		none     : (team) ? team.comments.filter(({ format, state })=> (state !== DONE)).length : 0,
		issues   : (team) ? team.comments.filter(({ format, state })=> (format === ISSUES && state !== DONE)).length : 0,
		bugs     : (team) ? team.comments.filter(({ format, state })=> (format === BUGS && state !== DONE)).length : 0,
		requests : (team) ? team.comments.filter(({ format, state })=> (format === REQUESTS && state !== DONE)).length : 0,
		done     : (team) ? team.comments.filter(({ format, state })=> (state === DONE)).length : 0
	};

	const sortTotal = (team) ? ((formatFilter === ISSUES) ? formatTotals.issues : (formatFilter === BUGS) ? formatTotals.bugs : (formatFilter === REQUESTS) ? formatTotals.requests : (formatFilter === DONE) ? formatTotals.none + formatTotals.done : formatTotals.none) : 0;

	console.log('TeamPageHeader()', { formatTotals, sortTotal });

	return (<div className="team-page-header page-header">
		<div className="col col-left">
			<div className="nav-link nav-link-sort" data-selected={sort === DATE} onClick={()=> props.onSortClick(DATE)}>New ({sortTotal})</div>
			<div className="nav-link nav-link-sort" data-selected={sort === SCORE} onClick={()=> props.onSortClick(SCORE)}>Top ({sortTotal})</div>
		</div>
		<div className="col col-mid"></div>
		<div className="col col-right">
			{/* <div className="nav-link nav-link-filter" data-selected={formatFilter === NONE} onClick={()=> props.onFilterClick(NONE)}><FontAwesome name="check" className="filter-check" />All ({formatTotals.none})</div> */}
			<div className="nav-link nav-link-filter" data-selected={formatFilter === NONE} onClick={()=> props.onFilterClick(NONE)}>All ({formatTotals.none})</div>
			<div className="nav-link nav-link-filter" data-selected={formatFilter === ISSUES} onClick={()=> props.onFilterClick(ISSUES)}>Issues ({formatTotals.issues})</div>
			<div className="nav-link nav-link-filter" data-selected={formatFilter === BUGS} onClick={()=> props.onFilterClick(BUGS)}>Bugs ({formatTotals.bugs})</div>
			<div className="nav-link nav-link-filter" data-selected={formatFilter === REQUESTS} onClick={()=> props.onFilterClick(REQUESTS)}>Requests ({formatTotals.requests})</div>
			<div className="nav-link nav-link-filter" data-selected={formatFilter === DONE} onClick={()=> props.onFilterClick(DONE)}>Done ({formatTotals.done})</div>
		</div>
	</div>);
};


const mapDispatchToProps = (dispatch)=> {
  return ({
		setCommentsSortFilter   : (payload)=> dispatch(setCommentsSortFilter(payload)),
		setCommentsFormatFilter : (payload)=> dispatch(setCommentsFormatFilter(payload)),
		setCommentsDoneFilter   : (payload)=> dispatch(setCommentsDoneFilter(payload)),
		toggleTheme             : ()=> dispatch(toggleTheme()),
		push                    : (payload)=> dispatch(push(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    darkThemed   : state.darkThemed,
		team         : state.teams.team,
		invite       : state.teams.invite,
		profile      : state.user.profile,
		sort         : state.comments.sort,
		formatFilter : state.comments.filters.format,
		doneFilter   : state.comments.filters.done,
		hash         : state.router.location.hash,
		pathname     : state.router.location.pathname
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(TopNav);
