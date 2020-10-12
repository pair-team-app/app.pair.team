import React, { Component } from 'react';
import './TopNav.css';

import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';

import { CommentSortTypes, CommentFilterTypes } from './';
import UserSettings, { SettingsMenuItemTypes} from './UserSettings';
import { RoutePaths } from '../../helpers/Routes';
import SharePopover from '../../overlays/SharePopover';
import { Modals } from '../../../consts/uris';
import { setCommentsSortFilter, setCommentsFormatFilter, setCommentsDoneFilter, toggleTheme } from '../../../redux/actions';


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

		// const { hash } = window.location;
		// if (hash === '#share' && !this.state.popover) {
		// 	this.setState({ popover : true });
		// }
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
// console.log('%s.componentDidUpdate()', this.constructor.name, { left : shareLink.offsetLeft, top : shareLink.offsetTop });

		const { pathname } = this.props;
		// const { pathname, hash } = this.props;
		// if ((hash === '#share') && !this.state.popover) {
		// 	this.setState({ popover : true });
		// }

		// if (hash !== '#share' && this.state.popover) {
		// 	this.setState({ popover : false });
		// }

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

		if (filter === CommentFilterTypes.DONE) {
			this.props.setCommentsDoneFilter({ filter : !doneFilter });

		} else {
			this.props.setCommentsFormatFilter({ filter : (formatFilter === filter) ? CommentFilterTypes.NONE : filter });
		}
	};

	render() {
		// console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { darkThemed, profile, invite, sort, formatFilter, doneFilter } = this.props;
		const { popover, matchPaths } = this.state;

		return (<div className="top-nav">
			{/* <div className="col breadcrumb-wrapper">{this.buildBreadcrumbs().map((breadcrumb)=> (breadcrumb))}</div> */}
			<div className="col col-left"><div className="page-header-wrapper">
				{(matchPaths.team && !matchPaths.project) && (<TeamPageHeader sort={sort} formatFilter={formatFilter} doneFilter={doneFilter} onSortClick={this.handleTeamCommentsSort} onFilterClick={this.handleTeamCommentsFilter} />)}
				{(matchPaths.create) && (<TopNavPageTitle title="Create" />)}
				{(matchPaths.project) && (<TopNavPageTitle title="Project" />)}
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

	const { title } = props;
	return (<div className="top-nav-page-title">{title}</div>);
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
	console.log('TeamPageHeader()', { props });

	const { sort, formatFilter, doneFilter } = props;
	const { DATE, SCORE } = CommentSortTypes;
	const { ISSUES, BUGS, DONE } = CommentFilterTypes;

	return (<div className="team-page-header page-header">
		<div className="link-wrapper">
			<div className="nav-link nav-link-sort" data-selected={sort === DATE} onClick={()=> props.onSortClick(DATE)}>New</div>
			<div className="nav-link nav-link-sort" data-selected={sort === SCORE} onClick={()=> props.onSortClick(SCORE)}>Top</div>
			<div className="nav-link nav-link-filter" data-selected={formatFilter === ISSUES} onClick={()=> props.onFilterClick(ISSUES)}>Issues</div>
			<div className="nav-link nav-link-filter" data-selected={formatFilter === BUGS} onClick={()=> props.onFilterClick(BUGS)}>Bugs</div>
			<div className="nav-link nav-link-filter" data-selected={doneFilter} onClick={()=> props.onFilterClick(DONE)}>Done</div>
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
