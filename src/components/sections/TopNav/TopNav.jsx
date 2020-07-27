import React, { Component } from 'react';
import './TopNav.css';

import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Strings } from 'lang-js-utils';
import { NavLink, withRouter } from 'react-router-dom';

import { BreadcrumbTypes } from './';
import UserSettings, { SettingsMenuItemTypes} from './UserSettings';
import SharePopover from '../../overlays/SharePopover';
import { Modals, Pages } from '../../../consts/uris';
import { setTeamCommentsSort, toggleTheme } from '../../../redux/actions';
import { trackOutbound } from '../../../utils/tracking';
import TeamPageHeader from './TeamPageHeader';


class TopNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
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
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
// console.log('%s.componentDidUpdate()', this.constructor.name, { left : shareLink.offsetLeft, top : shareLink.offsetTop });

		 const { hash } = this.props;
		if ((hash === '#share') && !this.state.popover) {
			this.setState({ popover : true });
		}

		if (hash !== '#share' && this.state.popover) {
			this.setState({ popover : false });
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
		console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

		const { darkThemed, playground, profile, invite, team, teamSort } = this.props;
		const { popover } = this.state;


		const handleURL = (event, url)=> {
// console.log('%s.handleURL()', this.constructor.name, event, url);

      event.preventDefault();
      trackOutbound(url);
	  };

		// console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state, deviceIDs });

		return (<div className="top-nav">
			{/* <div className="col breadcrumb-wrapper">{this.buildBreadcrumbs().map((breadcrumb)=> (breadcrumb))}</div> */}
			{(team && !playground) && (<div className="col col-left">
				<TeamPageHeader sort={teamSort} onSortClick={this.handleTeamCommentsSort} />
			</div>)}
			<div className="col col-middle">
        <input type="checkbox" checked={darkThemed} value={darkThemed} onChange={this.props.toggleTheme} />
			</div>
			<div className="col col-right">
				<NavLink to="https://www.notion.so/pairurl/Blog-f8fd5939357442bca1ff97c3117d1ecb" className="top-nav-link" target="_blank" onClick={(event)=> handleURL(event, 'https://www.notion.so/pairurl/Blog-f8fd5939357442bca1ff97c3117d1ecb')}>Blog</NavLink>
        <NavLink to="https://spectrum.chat/pair" className="top-nav-link" target="_blank" onClick={(event)=> handleURL(event, 'https://spectrum.chat/pair')}>Support</NavLink>
				<TopNavShareLink popover={popover} playground={playground} onClick={this.handlePopoverToggle} onPopup={this.props.onPopup} onPopoverClose={this.handlePopoverClose} />
				{(profile && !invite) && (<UserSettings onMenuItem={this.handleSettingsItem} onLogout={this.props.onLogout} />)}
				{(profile && !invite) && (<div className="" onClick={()=> this.props.onModal(Modals.INVITE)}>invite</div>)}
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


const TopNavShareLink = (props)=> {
//   console.log('TopNavShareLink()', { props });

  const { popover, playground } = props;
	return (<div className="top-nav-share-link">
    <div className="nav-link" onClick={props.onClick}>Share</div>

    {(popover) && (<SharePopover playground={playground} onPopup={props.onPopup} onClose={props.onPopoverClose} />)}
	</div>);
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
		hash        : state.router.location.hash
	});
};


// export default connect(mapStateToProps, mapDispatchToProps)(TopNav);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopNav));
