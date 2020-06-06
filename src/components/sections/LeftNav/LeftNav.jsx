
import { Strings } from 'lang-js-utils';
import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { setTeam } from '../../../redux/actions';
import { trackEvent, trackOutbound } from '../../../utils/tracking';
import BaseContentExpander from '../../iterables/BaseContentExpander';
import './LeftNav.css';


class LeftNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      builds : [],
    };
  }

  componentDidMount() {
    console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    const { playgrounds } = this.props;
    const { builds } = this.state;

    if (playgrounds && (playgrounds.length !== builds.map(({ playgrounds })=> (playgrounds)).flat().length)) {
      this.onPopulateTree();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { playgrounds, playground } = this.props;
    const { builds } = this.state;

    if (playgrounds && (playgrounds.length !== builds.map(({ playgrounds })=> (playgrounds)).flat().length || prevProps.playground !== playground)) {
      this.onPopulateTree();
    }
  }

  handleBuildClick = (build)=> {
    console.log('%s.handleBuildClick()', this.constructor.name, { build });

    build.expanded = !build.expanded;

    const { builds } = this.state;
    this.setState({ builds : builds.map((item)=> ((item.id === build.id) ? build : item))});
  };

  handleCreateTeam = ()=> {
    console.log('%s.handleCreateTeam()', this.constructor.name);
    window.alert('Create Team Modal');
  }

  handleTeamClick = (team)=> {
    console.log('%s.handleTeamClick()', this.constructor.name, {team });

    this.props.setTeam({ ...this.props.team, 
      selected : true
    });
  }

  handleTypeGroupClick = (build, typeGroup)=> {
    console.log('%s.handleTypeGroupClick()', this.constructor.name, { build, typeGroup });

    trackEvent('nav', 'type-group', typeGroup.title);

    build.selected = true;
    const playgrounds = build.playgrounds.filter(({ typeGroups })=> (typeGroups.includes(typeGroup)));
    const playground = (this.props.playground && playgrounds.find(({ deviceID })=> (deviceID === this.props.playground.deviceID))) || [ ...playgrounds].shift();

    const { builds } = this.state;
    this.setState({ builds : builds.map((item)=> ((item.id !== build.id) ? { ...item, 
      expanded : false,
      selected : false 
    } : build))}, ()=> {
      if (!this.props.playground || playground.id !== this.props.playground.id) {
        this.props.onPlaygroundClick(playground, typeGroup);
      }
      
      this.props.onTypeGroupClick(typeGroup);
    });
  };

  onPopulateTree = ()=> {
    // console.log('%s.onPopulateTree()', this.constructor.name);

    const { playgrounds, playground } = this.props;
    const buildIDs = [ ...new Set([ ...playgrounds.map(({ buildID })=> (buildID))])];

    console.log('%s.onPopulateTree()', this.constructor.name, { playgrounds, buildIDs });

    const builds = buildIDs.map((id)=> ({ id,
      title       : [ ...playgrounds.filter(({ buildID })=> (buildID === id))].pop().title,
      expanded    : (playground !== null && playground.buildID === id),
      selected    : (playground !== null && playground.buildID === id),
      playgrounds : playgrounds.filter(({ buildID })=> (buildID === id)),
      added       : [ ...playgrounds].pop().added
    }));

    this.setState({ builds });
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { menu, teams, playgrounds, typeGroup } = this.props;
    const { builds } = this.state;

    const handleURL = (event, url)=> {
// 		

      event.preventDefault();
      trackOutbound(url);
	  };

    return (<div className="left-nav" data-menu={menu}>
      <LeftNavHeader />
      {(!teams) ? (<div className="loading">Loading…</div>)
      : (<div className="tree-wrapper">
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
            <div className="create-team" onClick={this.handleCreateTeam}>Create Team</div>
          </div>
          {(playgrounds) && (<div className="builds-wrapper">
            <div className="header">Projects</div>
            <div className="items-wrapper">
              {[ ...builds, ...builds].map((build, i)=> (
                <LeftNavBuild 
                  key={i} 
                  build={build}
                  typeGroup={typeGroup} 
                  onBuildClick={this.handleBuildClick} 
                  onTypeGroupClick={(typeGroup)=> this.handleTypeGroupClick(build, typeGroup)} 
                />
              ))}
            </div>
          </div>)}
      </div>)}
    </div>);
  }
}

const LeftNavHeader = (props)=> {
  // console.log('LeftNavHeader()', { props });

  //const { team } = props;
  //const { logo, title } = team;
  return (<div className="left-nav-header">
    <NavLink to={`/app/\${team.slug}/ask`} className="title">
      <img src={null} alt="Logo" />
      {'{title}'}
    </NavLink>
  </div>);
};


const LeftNavTeam = (props)=> {
	// console.log('LeftNavBuildTypeGroup()', { props });

	const { team } = props;
	const { id, title, selected } = team;
	return (<div className="left-nav-team" onClick={()=> props.onClick(team)} data-id={id} data-selected={selected}>{title}</div>);
}

const LeftNavBuild = (props)=> {
  // console.log('LeftNavBuildTypeGroup()', { props });

  const { build } = props;
	const { id, title, expanded, selected, playgrounds } = build;
	const typeGroups = [ ...new Set([ ...playgrounds.map(({ typeGroups })=> (typeGroups)).flat()])];

	// 

	return (<BaseContentExpander className="left-nav-build" open={build.expanded}
		title={<div className="title-wrapper" onClick={()=> props.onBuildClick(build)} data-id={id} data-expanded={expanded} data-selected={selected}>
			<div className="arrow-wrapper" data-expanded={expanded}><FontAwesome name="caret-right" /></div>
			{/* <div className="left-nav-build-title">{title} ({added.format(BUILD_TIMESTAMP)})</div> */}
			<div className="title">{title}</div>
		</div>}

		content={<div className="item-wrapper">
			{(typeGroups.map((typeGroup, i)=> (<LeftNavBuildTypeGroup 
				key={i} 
				typeGroup={typeGroup} 
				selected={(selected && props.typeGroup && props.typeGroup.id === typeGroup.id)} 
				onClick={()=> props.onTypeGroupClick(typeGroup)} />)))}
		</div>}
	/>);
}

const LeftNavBuildTypeGroup = (props)=> {
	// console.log('LeftNavBuildTypeGroup()', { props });

	const { typeGroup, selected } = props;
	const { title } = typeGroup;
	return (<div className="left-nav-build-type-group" onClick={props.onClick} data-id={typeGroup.id} data-selected={selected}>{Strings.truncate(title, 19)}</div>);
};

const mapStateToProps = (state, ownProps)=> {
  return {
    team        : state.team,
    teams       : state.teams,
    playgrounds : state.playgrounds,
    playground  : state.playground,
    typeGroup   : state.typeGroup,
    component   : state.component,
  };
};

const mapDispatchToProps = (dispatch)=> {
  return {
    setTeam : (payload)=> dispatch(setTeam(payload))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LeftNav);
