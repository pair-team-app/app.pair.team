
import React, { Component } from 'react';
import './LeftNav.css';

import { push } from 'connected-react-router';
import { Strings } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import { CommentFilterTypes } from '../TopNav';
import ContentExpander from '../../iterables/ContentExpander';
import { NPM_DE_PLAYGROUND, Pages } from '../../../consts/uris';
import { fetchBuildPlaygrounds, setComponent, setPlayground, setTeam, removeTeam } from '../../../redux/actions';
import { trackEvent, trackOutbound } from '../../../utils/tracking';

class LeftNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      builds : null,
      loading : 0x00
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { playgrounds } = this.props;
    const { builds } = this.state;

    // if (playgrounds && (!builds || prevProps.playgrounds !== playgrounds)) {
    if (!builds && playgrounds && prevProps.playgrounds !== playgrounds) {
    // if (!builds && playgrounds || (playgrounds && prevProps.playgrounds !== playgrounds)) {
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
    console.log('%s.handleCreateTeam()', this.constructor.name, { props : this.props });

    this.setState({ builds : null }, ()=> {
      this.props.setTeam(null);
      this.props.push(Pages.CREATE);
    });
  };

  handleDeviceRenderClick = (deviceRender)=> {
    console.log('%s.handleDeviceRenderClick()', this.constructor.name, { deviceRender });

    // const { buildID, title } = deviceRender;
    const { title } = deviceRender;
    trackEvent('nav', 'device', title);
    this.props.setPlayground(deviceRender);
    this.props.setComponent(null);
    // this.props.fetchBuildPlaygrounds({ buildID });
  };

  handleTeamClick = (team)=> {
    console.log('%s.handleTeamClick()', this.constructor.name, { team });

    this.setState({ builds : null }, ()=> {
      this.props.setTeam(team);
      this.props.setPlayground(null);
    });
  };

  handleDeleteTeam = (team)=> {
    console.log('%s.handleDeleteTeam()', this.constructor.name, { team });

    this.props.removeTeam({ team });
  };

  handleInstallClick = (event)=> {
    console.log('%s.handleInstallClick()', this.constructor.name, { event });

    trackOutbound(NPM_DE_PLAYGROUND);
    window.open(NPM_DE_PLAYGROUND, '_blank')
  };


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
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { teams, profile, formatFilter } = this.props;
    const { builds } = this.state;

    return (<div className="left-nav">
      {(profile) && (<div className="header">{Strings.capitalize(profile.email.split('@').pop().split('.').slice(0, -1).shift())}</div>)}
      <div className="content">
        <button disabled={(!profile || !profile.validated)} onClick={this.handleCreateTeam}>Create Channel</button>
        <div className="teams-wrapper" data-loading={!teams}>
          <div className="loading">Loading…</div>
          {(teams && teams.length === 0) && (<div className="header">No Channel Builds</div>)}

          {(teams) && (<div className="row">
            {teams.map((team, i)=> (
              <LeftNavTeam
                key={i}
                team={team}
                done={(formatFilter === CommentFilterTypes.DONE)}
                onClick={this.handleTeamClick}
                onDelete={this.handleDeleteTeam}
              />
            ))}
          </div>)}
        </div>

        {(teams && teams.length > 0) && (<div className="builds-wrapper" data-loading={(!builds && window.location.pathname !== Pages.CREATE)}>
          <div className="loading">No Channel Builds</div>
          {(builds || window.location.pathname === Pages.CREATE) && (<div className="header">{(window.location.pathname === Pages.CREATE || builds.length === 0) ? 'No ' : ''}Channel Builds</div>)}
          {(builds) && (<div className="row">
            {builds.map((build, i)=> (
              <LeftNavBuild
                key={i}
                build={build}
                onBuildClick={this.handleBuildClick}
                onDeviceRenderClick={this.handleDeviceRenderClick}
              />
            ))}
          </div>)}
        </div>)}

        {(profile && !profile.validated) && (<div className="verify-wrapper">Verify your email first</div>)}
      </div>
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
			{/* <div className="arrow-wrapper"><FontAwesome name="caret-right" /></div> */}
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


const LeftNavTeam = (props)=> {
	// console.log('LeftNavTeam()', { props });

	const { team, done } = props;
	const { id, title, selected } = team;
	return (<div className="left-nav-team" data-id={id} data-selected={selected}>
    <div className="title" onClick={()=> props.onClick(team)}># {Strings.capitalize(title, true)} ({(done && selected) ? team.comments.filter(({ state })=> (state === CommentFilterTypes.DONE )).length : team.comments.filter(({ state })=> (state !== CommentFilterTypes.DONE )).length})</div>
    <FontAwesome name="minus-circle" className="delete" onClick={()=> props.onDelete(team)} />
  </div>);
};


const mapStateToProps = (state, ownProps)=> {
  return ({
    team         : state.teams.team,
    teams        : state.teams.teams,
    playgrounds  : state.builds.playgrounds,
    playground   : state.builds.playground,
    profile      : state.user.profile,
    formatFilter : state.comments.filters.format
  });
};

const mapDispatchToProps = (dispatch)=> {
  return ({
    fetchBuildPlaygrounds : (payload)=> dispatch(fetchBuildPlaygrounds(payload)),
    setComponent          : (payload)=> dispatch(setComponent(payload)),
    setPlayground         : (payload)=> dispatch(setPlayground(payload)),
    setTeam               : (payload)=> dispatch(setTeam(payload)),
    removeTeam            : (payload)=> dispatch(removeTeam(payload)),
    push                  : (payload)=> dispatch(push(payload))
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(LeftNav);
