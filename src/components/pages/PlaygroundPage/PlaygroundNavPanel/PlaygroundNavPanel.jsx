import { grabFavicon } from "favicongrab";
import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import { TEAM_DEFAULT_AVATAR } from "../../../../consts/uris";
import { trackEvent, trackOutbound } from "../../../../utils/tracking";
import NavPanelTypeGroup from "./NavPanelTypeGroup";
import "./PlaygroundNavPanel.css";

class PlaygroundNavPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      typeGroups: [],
      teamLogo: null
    };
  }

  componentDidMount() {
    		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

    const { playground } = this.props;
    if (playground) {
      this.onPopulateTree();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

    const { playground } = this.props;
    if (playground && playground !== prevProps.playground) {
      this.onPopulateTree();
    }

    const { component } = this.props;
    if (
      (this.props.typeGroup && this.props.typeGroup !== prevProps.typeGroup) ||
      (this.props.typeGroup === prevProps.typeGroup &&
        component !== prevProps.component)
    ) {
      const typeGroups = this.state.typeGroups.map(typeGroup => {
        const items = typeGroup.items.map(item => ({
          ...item,
          selected: component && item.id === component.id
        }));

        return {
          ...typeGroup,
          items,
          selected: typeGroup.id === this.props.typeGroup.id
        };
      });

      this.setState({ typeGroups });
    }

    if (component && component !== prevProps.component) {
      const typeGroups = this.state.typeGroups.map(typeGroup => {
        const items = typeGroup.items.map(item => ({
          ...item,
          selected: component && item.id === component.id
        }));

        return {
          ...typeGroup,
          items,
          selected: typeGroup.id === this.props.typeGroup.id
        };
      });

      this.setState({ typeGroups });
    }
  }

  handleTypeGroupClick = typeGroup => {
    // 		console.log('%s.handleTypeGroupClick()', this.constructor.name, typeGroup);
    this.props.onTypeGroupClick(typeGroup);
  };

  handleTypeItemClick = (typeGroup, typeItem) => {
    // 		console.log('%s.handleTypeItemClick()', this.constructor.name, typeGroup, typeItem);
    this.props.onTypeItemClick(typeGroup, typeItem);
  };

  onPopulateTree = () => {
    		console.log('%s.onPopulateTree()', this.constructor.name, { props : this.props });

    const { componentTypes, playground, component } = this.props;
    const typeIDs = playground.components.map(({ typeID }) => typeID);

    const typeGroups = componentTypes
      .filter(({ id }) => typeIDs.includes(id))
      .map(typeGroup => {
        const items = playground.components
          .filter(({ typeID }) => typeID === typeGroup.id)
          .map(item => ({
            ...item,
            selected: component && item.id === component.id
          }));

        return {
          ...typeGroup,
          items,
          selected:
            this.props.typeGroup &&
            (typeGroup.id === this.props.typeGroup.id ||
              items.map(({ selected }) => selected).includes(true))
        };
      });

    // 		const favicon = playground.team.

    this.setState({ typeGroups });
  };

  render() {
    		console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { team, playground } = this.props;
    const { typeGroups, teamLogo } = this.state;

    if (!teamLogo) {
      if (playground) {
        grabFavicon(
          team.domain === "pairurl.com"
            ? "dev.pairurl.com"
            : `http://${team.domain}`
        ).then(response => {
          const icons = response.icons
            ? response.icons
                .filter(({ sizes }) => sizes)
                .map(icon => ({
                  ...icon,
                  size: icon.sizes.split("x").pop() << 0
                }))
                .sort((i, ii) =>
                  i.size < ii.size ? -1 : i.size > ii.size ? 1 : 0
                )
            : [];

          const teamLogo = icons.length > 0 ? icons.pop().src : null;
          this.setState({ teamLogo });
        });
      } else {
        const teamLogo = team.image || TEAM_DEFAULT_AVATAR;
        this.setState({ teamLogo });
      }
    }

    return (
      <div className="playground-nav-panel">
        {playground && <PlaygroundNavPanelHeader team={team} />}
        {playground && (
          <div className="playground-nav-panel-component-type-wrapper">
            {typeGroups.map((typeGroup, i) => (
              <NavPanelTypeGroup
                key={i}
                typeGroup={typeGroup}
                onTypeGroupClick={this.handleTypeGroupClick}
                onTypeItemClick={this.handleTypeItemClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

const PlaygroundNavPanelHeader = props => {
  // 	console.log('PlaygroundNavPanelHeader()', props);

  const handleClick = event => {
    //  console.log('%s.handleClick()', 'PlaygroundNavPanelHeader');
    event.preventDefault();

    const { domain } = props.team;
    const url = `http://${domain}`;

    trackEvent("team-name", domain);
    trackOutbound(url, () => {
      // 			window.open(url);
      // 			props.onClick(event);
    });

    window.open(url);
  };

  const { team } = props;
  // console.log("PlaygroundNavPanelHeader()", props);

  return (
    <div className="playground-nav-panel-header">
      <img
        className="playground-nav-panel-header-logo"
        src={team.image}
        alt="Team Logo"
      />
      <NavLink
        to={`http://${team.domain}`}
        target="_blank"
        className="playground-nav-panel-header-title"
        onClick={event => handleClick(event)}
      >
        {team.title}
      </NavLink>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  return {
    componentTypes: state.componentTypes,
    team: state.team,
    playground: state.playground,
    typeGroup: state.typeGroup,
    component: state.component
  };
};

export default connect(mapStateToProps)(PlaygroundNavPanel);
