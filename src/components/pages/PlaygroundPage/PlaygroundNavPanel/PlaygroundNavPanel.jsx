
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { trackEvent, trackOutbound } from '../../../../utils/tracking';
import NavPanelProject from './NavPanelProject';
import './PlaygroundNavPanel.css';

class PlaygroundNavPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      typegroups: [],
      teamLogo: null
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

    const { playgrounds } = this.props;
    if (playgrounds) {
      this.onPopulateTree();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { playgrounds } = this.props;
    if (playgrounds && playgrounds !== prevProps.playgrounds) {
      this.onPopulateTree();
    }

    // const { component } = this.props;
    // if (
    //   (this.props.typeGroup && this.props.typeGroup !== prevProps.typeGroup) ||
    //   (this.props.typeGroup === prevProps.typeGroup &&
    //     component !== prevProps.component)
    // ) {
    //   const typeGroups = (this.state.typeGroups.map((typeGroup)=> {
    //     const items = (typeGroup.items.map((item)=> ({
    //       ...item,
    //       selected: component && item.id === component.id
    //     })));

    //     return {
    //       ...typeGroup,
    //       items,
    //       selected: typeGroup.id === this.props.typeGroup.id
    //     };
    //   }));

    //   this.setState({ typeGroups });
    // }

    // if (component && component !== prevProps.component) {
    //   const typeGroups = (this.state.typeGroups.map((typeGroup)=> {
    //     const items = (typeGroup.items.map((item)=> ({
    //       ...item,
    //       selected: component && item.id === component.id
    //     })));

    //     return {
    //       ...typeGroup,
    //       items,
    //       selected: typeGroup.id === this.props.typeGroup.id
    //     };
    //   }));

    //   this.setState({ typeGroups });
    // }
  }

  handleProjectClick = (project)=> {
    		console.log('%s.handleProjectClick()', this.constructor.name, project);
    this.props.onPlaygroundClick(project);
  };

  handleTypeGroupClick = (typeGroup)=> {
    // 		console.log('%s.handleTypeGroupClick()', this.constructor.name, typeGroup);
    this.props.onTypeGroupClick(typeGroup);
  };

  handleTypeItemClick = (typeGroup, typeItem)=> {
    // 		console.log('%s.handleTypeItemClick()', this.constructor.name, typeGroup, typeItem);
    this.props.onTypeItemClick(typeGroup, typeItem);
  };

  onPopulateTree = ()=> {
    // console.log('%s.onPopulateTree()', this.constructor.name, { props : this.props });

    const { componentTypes, playgrounds, playground, component } = this.props;

    const projects = playgrounds.map((playground)=> {
      const { typeGroups } = playground;

      return ({ ...playground });

      // return ({ ...playground,
      //   typeGroups : playground.typeGroups.map((typeGroup)=> ({ ...typeGroup,
      //     selected : false//(this.props.typeGroup && typeGroup.id === this.props.typeGroup.id)
      // }))});

    });

    // 		const favicon = playground.team.

    this.setState({ projects });
  };

  render() {
    		// console.log('%s.render()', <this className="constructor n">                                                                                                                                                                                                                      </this>ame, { props : this.props, state : this.state });

    const { team, playgrounds, typeGroup } = this.props;
    const { typeGroups, projects } = this.state;


    const handleURL = (event, url)=> {
// 		console.log('%s.handleURL()', this.constructor.name, event, url);

		if (event) {
			event.preventDefault();
		}

		trackOutbound(url, ()=> {
			window.open(url);
		});

		window.open(url);
	};

    return (
      <div className="playground-nav-panel">
        {team && <PlaygroundNavPanelHeader team={team} />}
        <div className="link-wrapper">
          <NavLink to={`/app/${team.title}/ask`} className="nav-panel-link">Ask</NavLink>
          <NavLink to="https://www.npmjs.com/package/design-engine-playground" className="nav-panel-link" target="_blank" onClick={(event)=> handleURL(event, 'https://www.npmjs.com/package/design-engine-playground')}>Install</NavLink>
        </div>
        {playgrounds && (
          <div className="projects-wrapper">
            <div className="projects-wrapper-header">Projects</div>
            <div className="projects-item-wrapper">
              {projects.map((project, i)=> (
                <NavPanelProject 
                  key={i} 
                  project={project} 
                  typeGroup={typeGroup} 
                  onProjectClick={this.handleProjectClick} onTypeGroupClick={this.props.onTypeGroupClick} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const PlaygroundNavPanelHeader = (props)=> {
  // 	console.log('PlaygroundNavPanelHeader()', props);

  const handleClick = (event)=> {
    //  console.log('%s.handleClick()', 'PlaygroundNavPanelHeader');
    event.preventDefault();

    const { domain } = props.team;
    const url = `http://${domain}`;

    trackEvent('team-name', domain);
    trackOutbound(url, ()=> {
      // 			window.open(url);
      // 			props.onClick(event);
    });

    window.open(url);
  };

  const { team } = props;
  // console.log('PlaygroundNavPanelHeader()', props);

  return (
    <div className="playground-nav-panel-header">
      <NavLink to={`/app/${team.title}/ask`} className="playground-nav-panel-header-title">
        <img src={team.image} alt="Team Logo" />
        {team.title}
      </NavLink>
    </div>
  );
};

const mapStateToProps = (state, ownProps)=> {
  return {
    componentTypes: state.componentTypes,
    team: state.team,
    playgrounds: state.playgrounds,
    playground: state.playground,
    typeGroup: state.typeGroup,
    component: state.component
  };
};

export default connect(mapStateToProps)(PlaygroundNavPanel);
