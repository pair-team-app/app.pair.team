
import { INVITE_LOADED, SET_TEAM, TEAM_COMMENTS_LOADED, TEAMS_LOADED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_UPDATED, TOGGLE_CREATE_TEAM } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';

const initialState = {
  teams      : [],
  team       : null,
  createTeam : false
};


const logFormat = (state, action, meta='')=> {
  const { type, payload } = action;
  console.log(LOG_REDUCER_PREFIX, `REDUCER[teams] >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
};

export default function comments(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === INVITE_LOADED) {
    const { team } = action.payload;
    return (Object.assign({}, state, { team }));

  } else if (type === TEAM_COMMENTS_LOADED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  }  else if (type === TEAM_RULES_UPDATED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === TEAMS_LOADED) {
    const { team, teams } = payload;
    return (Object.assign({}, state, { team, teams }));

  } else if (type === TEAM_UPDATED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === TEAM_LOGO_LOADED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === SET_TEAM) {
    const { teams, team } = payload;
    return (Object.assign({}, state, { teams, team }));
    // return ({ ...state, teams, team });
    // state.teams = teams;
    // return (state);

  } else if (type === TOGGLE_CREATE_TEAM) {
    return (Object.assign({}, state, { createTeam : (typeof action.payload === 'boolean') ? action.payload : !state.createTeam }));

  } else {
    return (state);
  }

}

