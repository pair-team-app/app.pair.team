
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { trackEvent, trackOutbound } from '../../../../utils/tracking';
import NavPanelBuild from './NavPanelBuild';
import './PlaygroundNavPanel.css';

class PlaygroundNavPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      builds : [],
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

    const { playgrounds } = this.props;
    const { builds } = this.state;

    if (playgrounds && (playgrounds.length !== builds.map(({ playgrounds })=> (playgrounds)).flat().length)) {
      this.onPopulateTree();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

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

  handleTypeItemClick = (typeGroup, typeItem)=> {
    // 		console.log('%s.handleTypeItemClick()', this.constructor.name, typeGroup, typeItem);
    this.props.onTypeItemClick(typeGroup, typeItem);
  };

  onPopulateTree = ()=> {
    // console.log('%s.onPopulateTree()', this.constructor.name, { props : this.props });

    const { playgrounds, playground } = this.props;
    const buildIDs = [ ...new Set([ ...playgrounds.map(({ buildID })=> (buildID))])];
    const builds = buildIDs.map((id)=> ({ id,
      title       : [ ...playgrounds].pop().title,
      expanded    : (playground !== null && playground.buildID === id),
      selected    : (playground !== null && playground.buildID === id),
      playgrounds : playgrounds.filter(({ buildID })=> (buildID === id)),
      added       : [ ...playgrounds].pop().added
    }));

    this.setState({ builds });
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { team, playgrounds, typeGroup } = this.props;
    const { builds } = this.state;

    const handleURL = (event, url)=> {
// 		console.log('%s.handleURL()', this.constructor.name, event, url);

      event.preventDefault();
      trackOutbound(url);
	  };

    return (<div className="playground-nav-panel">
      {(team) && (<PlaygroundNavPanelHeader team={team} />)}
      <div className="link-wrapper">
        <NavLink to={`/app/${team.slug}/ask`} className="nav-panel-link">Ask</NavLink>
        <NavLink to="https://www.npmjs.com/package/design-engine-playground" className="nav-panel-link" target="_blank" onClick={(event)=> handleURL(event, 'https://www.npmjs.com/package/design-engine-playground')}>Install</NavLink>
      </div>
      
      {(playgrounds) && (<div className="builds-wrapper">
        <div className="builds-wrapper-header">Projects</div>
        <div className="builds-item-wrapper">
          {builds.map((build, i)=> (
            <NavPanelBuild 
              key={i} 
              build={build}
              typeGroup={typeGroup} 
              onBuildClick={this.handleBuildClick} 
              onTypeGroupClick={(typeGroup)=> this.handleTypeGroupClick(build, typeGroup)} />
          ))}
        </div>
      </div>)}
    </div>);
  }
}

const PlaygroundNavPanelHeader = (props)=> {
  // 	console.log('PlaygroundNavPanelHeader()', props);

  const { team } = props;
  const { image, title } = team;
  return (<div className="playground-nav-panel-header">
    <NavLink to={`/app/${team.slug}/ask`} className="playground-nav-panel-header-title">
      <img src={image} alt="Team Logo" />
      {title}
    </NavLink>
  </div>);
};

const mapStateToProps = (state, ownProps)=> {
  return {
    team        : state.team,
    playgrounds : state.playgrounds,
    playground  : state.playground,
    typeGroup   : state.typeGroup,
    component   : state.component,
  };
};

export default connect(mapStateToProps)(PlaygroundNavPanel);
