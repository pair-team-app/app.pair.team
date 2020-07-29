
import { INVITE_LOADED, SET_TEAM, SET_TEAM_COMMENTS_SORT, TEAM_COMMENTS_LOADED, TEAMS_LOADED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_UPDATED, COMMENT_ADDED, COMMENT_UPDATED } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';

const initialState = {
  teams      : [],
  sort       : 'SORT_BY_DATE',
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
    const { team, invite } = action.payload;
    return (Object.assign({}, state, { team, invite }));

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

  } else if (type === COMMENT_ADDED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === COMMENT_UPDATED) {
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

  } else if (type === SET_TEAM_COMMENTS_SORT) {
    const { sort } = payload;
    return (Object.assign({}, state, { sort }));

  } else if (type === '@@router/LOCATION_CHANGE') {
    const { teams, team } = payload;

    if (teams && team) {
      return (Object.assign({}, state, { teams, team }));

    } else {
      return (state);
    }

  } else {
    return (state);
  }

}

