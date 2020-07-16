
import React, { Component } from 'react';
import './LeftNav.css';

import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import ContentExpander from '../../iterables/ContentExpander';
import { Pages, TEAM_DEFAULT_AVATAR} from '../../../consts/uris';
import { fetchBuildPlaygrounds, setPlayground, setTeam, toggleCreateTeam } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';


class LeftNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      builds : null,
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    const { playgrounds } = this.props;
    const { builds } = this.state;

    if (playgrounds && !builds) {
      this.onPopulateBuildTree();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { playgrounds } = this.props;
    const { builds } = this.state;

    if (playgrounds && (!builds || prevProps.playgrounds !== playgrounds)) {
      this.onPopulateBuildTree();
    }
  }

  handleBuildClick = (build)=> {
    console.log('%s.handleBuildClick()', this.constructor.name, { build });

    const { builds } = this.state;
    build.expanded = !build.expanded;
    this.setState({ builds : builds.map((item)=> ((item.id === build.id) ? build : item))});
  };

  handleCreateTeam = ()=> {
    // console.log('%s.handleCreateTeam()', this.constructor.name);
    this.props.toggleCreateTeam(true);
  }

  handleDeviceRenderClick = (deviceRender)=> {
    console.log('%s.handleDeviceRenderClick()', this.constructor.name, { deviceRender });

    const { buildID, title } = deviceRender;
    trackEvent('nav', 'device', title);
    this.props.setPlayground(deviceRender);
    // this.props.fetchBuildPlaygrounds({ buildID });
  };

  handleTeamClick = (team)=> {
    console.log('%s.handleTeamClick()', this.constructor.name, { team });

    this.setState({ builds : null }, ()=> {
      this.props.setTeam(team);
      // if (this.props.playground) {
        this.props.setPlayground(null);
      // }
    });
  }


  onPopulateBuildTree = ()=> {
    console.log('%s.onPopulateBuildTree()', this.constructor.name, { playgrounds : this.props.playgrounds, playground : this.props.playground });

    const { playgrounds, playground } = this.props;
    const buildIDs = [ ...new Set([ ...playgrounds.map(({ buildID })=> (buildID))])];

    // console.log('%s.onPopulateBuildTree()', this.constructor.name, { playgrounds, buildIDs });

    const builds = buildIDs.map((id)=> ({ id,
      title    : [ ...playgrounds.filter(({ buildID })=> (buildID === id))].pop().title,
      expanded : (playground !== null && playground.buildID === id),
      selected : (playground !== null && playground.buildID === id),
      renders  : playgrounds.filter(({ buildID })=> (buildID === id))
    }));

    this.setState({ builds });
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { teams, team, invite, profile } = this.props;
    const { builds } = this.state;

    return (<div className="left-nav">
      <LeftNavHeader { ...this.props } />
      {(profile && !teams && !invite) && (<div className="loading">Loading…</div>)}
      {(teams) && (<div className="tree-wrapper">
        <div className="teams-wrapper">
          <div className="items-wrapper">
            {teams.map((team, i)=> (
              <LeftNavTeam
                key={i}
                team={team}
                onClick={this.handleTeamClick}
              />
            ))}
          </div>
          {(profile && profile.state >= 2) && (<div className="create-team" onClick={this.handleCreateTeam}>Create Team</div>)}
        </div>
        {(!builds) ? (<div className="loading">Loading…</div>)
        : (<div className="builds-wrapper">
          <div className="header">Projects</div>
          <div className="items-wrapper">
            {builds.map((build, i)=> (
              <LeftNavBuild
                key={i}
                build={build}
                onBuildClick={this.handleBuildClick}
                onDeviceRenderClick={this.handleDeviceRenderClick}
              />
            ))}
          </div>
        </div>)}
      </div>)}
    </div>);
  }
}


const LeftNavBuild = (props)=> {
  // console.log('LeftNavBuild()', { props });

  const { build } = props;
	const { id, title, expanded, selected, renders } = build;

	return (<ContentExpander
    className="left-nav-build"
    expanded={expanded}
		title={<div className="title-wrapper" onClick={()=> props.onBuildClick(build)} data-id={id} data-expanded={expanded} data-selected={selected}>
			<div className="arrow-wrapper"><FontAwesome name="caret-right" /></div>
			<div className="title">{title} [{id}]</div>
		</div>}

		content={<div className="item-wrapper">
      {(renders.map((deviceRender, i)=> {
        const { id, device, selected } = deviceRender;
        const { title } = device;
        return (<div key={i} className="device-render" onClick={()=> props.onDeviceRenderClick(deviceRender)} data-id={id} data-selected={selected}>{Strings.truncate(title, 19)}</div>);
      }))}
		</div>}
	/>);
}


const LeftNavHeader = (props)=> {
  // console.log('LeftNavHeader()', { props });

  const { team } = props;
  const { logo, title } = team || { logo : null, title : '' };
  return (<div className="left-nav-header">
    {(team) && (<NavLink to={`${Pages.TEAM}/${team.slug}`} className="title">
      <img src={TEAM_DEFAULT_AVATAR} alt="Logo" />
      {title}
    </NavLink>)}
  </div>);
};


const LeftNavTeam = (props)=> {
	// console.log('LeftNavTeam()', { props });

	const { team } = props;
	const { id, title, selected } = team;
	return (<div className="left-nav-team" onClick={()=> props.onClick(team)} data-id={id} data-selected={selected}>{title} [{id}]</div>);
}


const mapStateToProps = (state, ownProps)=> {
  return {
    invite      : state.teams.invite,
    team        : state.teams.team,
    teams       : state.teams.teams,
    playgrounds : state.builds.playgrounds,
    playground  : state.builds.playground,
    profile     : state.user.profile
  };
};

const mapDispatchToProps = (dispatch)=> {
  return {
    fetchBuildPlaygrounds : (payload)=> dispatch(fetchBuildPlaygrounds(payload)),
    setPlayground         : (payload)=> dispatch(setPlayground(payload)),
    setTeam               : (payload)=> dispatch(setTeam(payload)),
    toggleCreateTeam      : (payload)=> dispatch(toggleCreateTeam(payload))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LeftNav);
